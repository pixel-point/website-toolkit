import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  readProjectProfile,
  repositoryIdentity,
  profilePath,
} from "./project.mjs";

export const pluginRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
export const requirements = JSON.parse(
  readFileSync(path.join(pluginRoot, "requirements.json"), "utf8"),
);

export function toolkitHome(env = process.env) {
  return path.resolve(
    env.WEBSITE_TOOLKIT_HOME ||
      path.join(homedir(), ".local", "share", "website-toolkit"),
  );
}

export function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    timeout: 60_000,
    maxBuffer: 4 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });
  return {
    ok: result.status === 0 && !result.error,
    status: result.status,
    stdout: result.stdout || "",
    error: result.error?.code || null,
  };
}

export function parseJson(result, label) {
  if (!result.ok)
    throw new Error(
      `${label} failed. Check the host CLI and its permissions; no settings were replaced.`,
    );
  try {
    return JSON.parse(result.stdout);
  } catch {
    throw new Error(
      `${label} returned unsupported output. Inspect this CLI version before changing configuration.`,
    );
  }
}

export function repoIdentity(value) {
  if (typeof value !== "string") return null;
  const clean = value
    .trim()
    .replace(/^git@github\.com:/, "")
    .replace(/^https:\/\/github\.com\//, "")
    .replace(/^ssh:\/\/git@github\.com\//, "")
    .replace(/\.git$/, "")
    .replace(/\/$/, "");
  return /^[\w.-]+\/[\w.-]+$/.test(clean) ? clean.toLowerCase() : null;
}

export function versionAtLeast(actual, minimum) {
  const a = /^(?:v)?(\d+)\.(\d+)\.(\d+)(?:\+[^\s]+)?$/.exec(actual || "");
  const b = /^(\d+)\.(\d+)\.(\d+)$/.exec(minimum);
  if (!a || !b) return false;
  for (let i = 1; i <= 3; i++) {
    if (+a[i] !== +b[i]) return +a[i] > +b[i];
  }
  return true;
}

export function normalizeInventory(host, pluginPayload, marketPayload) {
  const plugins = host === "codex" ? pluginPayload?.installed : pluginPayload;
  const markets =
    host === "codex" ? marketPayload?.marketplaces : marketPayload;
  if (!Array.isArray(plugins) || !Array.isArray(markets))
    throw new Error("Unsupported host inventory shape. No changes made.");
  return {
    plugins: plugins.map((p) => ({
      id: p.pluginId || p.id,
      version: p.version,
      enabled: p.enabled,
      scope: p.scope || "user",
    })),
    marketplaces: markets.map((m) => ({
      name: m.name,
      source: m.marketplaceSource?.source || m.repo || m.url || m.path || null,
      root: m.root || m.installLocation || null,
      ref: m.marketplaceSource?.ref || m.ref || null,
    })),
  };
}

export function inventory(host, hostBin, runner = run, cwd) {
  const plugins = parseJson(
    runner(hostBin, ["plugin", "list", "--json"], { cwd }),
    "Plugin inventory",
  );
  const markets = parseJson(
    runner(hostBin, ["plugin", "marketplace", "list", "--json"], { cwd }),
    "Marketplace inventory",
  );
  const result = normalizeInventory(host, plugins, markets);
  // A cached Git tag is not advanced by a marketplace refresh. Read only Git metadata.
  for (const market of result.marketplaces) {
    if (!market.ref && market.root) {
      const tag = runner("git", [
        "-C",
        market.root,
        "describe",
        "--tags",
        "--exact-match",
        "HEAD",
      ]);
      const branch = runner("git", [
        "-C",
        market.root,
        "symbolic-ref",
        "--quiet",
        "--short",
        "HEAD",
      ]);
      if (tag.ok && !branch.ok) market.ref = tag.stdout.trim();
    }
  }
  return result;
}

export function planPlugins({ host, hostBin, state, mode, only, source }) {
  const actions = [],
    blockers = [];
  for (const p of requirements.plugins.filter(
    (p) => !only || only.includes(p.name),
  )) {
    const id = `${p.name}@${p.marketplace}`;
    const installed = state.plugins.filter((i) => i.id === id);
    const market = state.marketplaces.find((m) => m.name === p.marketplace);
    const expected =
      p.name === "website-toolkit" && source
        ? path.resolve(source)
        : p.repository;
    const matches =
      market &&
      (repoIdentity(market.source) === repoIdentity(p.repository) ||
        (p.name === "website-toolkit" &&
          source &&
          market.source &&
          path.resolve(market.source) === expected));
    if (market && !matches) {
      blockers.push({
        plugin: p.name,
        reason: "marketplace_source_conflict",
        action: `Resolve the existing ${p.marketplace} marketplace source explicitly; setup will not replace it.`,
      });
      continue;
    }
    if (installed.some((i) => i.enabled !== true)) {
      blockers.push({
        plugin: p.name,
        reason: "disabled_plugin",
        action: "Confirm the plugin should be re-enabled through the host.",
      });
      continue;
    }
    if (installed.length > 1 || installed.some((i) => i.scope !== "user")) {
      blockers.push({
        plugin: p.name,
        reason: "non_user_or_ambiguous_scope",
        action:
          "Inspect the existing project/local/managed scope before updating it.",
      });
      continue;
    }
    if (mode === "update" && market?.ref) {
      blockers.push({
        plugin: p.name,
        reason: "pinned_marketplace",
        action: `Marketplace is at ${market.ref}; choose an explicit upgrade ref through the host first.`,
      });
      continue;
    }
    if (!market)
      actions.push({
        id: `marketplace:${p.marketplace}`,
        command: hostBin,
        args: [
          "plugin",
          "marketplace",
          "add",
          expected,
          ...(host === "codex" ? ["--json"] : []),
        ],
      });
    if (mode === "update" && market)
      actions.push({
        id: `refresh:${p.marketplace}`,
        command: hostBin,
        args: [
          "plugin",
          "marketplace",
          host === "codex" ? "upgrade" : "update",
          p.marketplace,
          ...(host === "codex" ? ["--json"] : []),
        ],
      });
    if (installed.length === 0 || mode === "update")
      actions.push({
        id: `plugin:${p.name}`,
        command: hostBin,
        args:
          host === "codex"
            ? ["plugin", "add", id, "--json"]
            : [
                "plugin",
                installed.length ? "update" : "install",
                id,
                "--scope",
                "user",
              ],
      });
  }
  return { actions, blockers };
}

export function cliInfo(name, home) {
  const spec = requirements.clis[name];
  if (!spec) throw new Error("Unknown CLI. Choose siteos or prime.");
  const packageRoot = path.join(
    home,
    "tools",
    name,
    "node_modules",
    spec.package,
  );
  const manifest = path.join(packageRoot, "package.json");
  if (!existsSync(manifest)) return { name, installed: false };
  try {
    const pkg = JSON.parse(readFileSync(manifest, "utf8"));
    const bin = typeof pkg.bin === "string" ? pkg.bin : pkg.bin?.[spec.bin];
    const target = bin && path.resolve(packageRoot, bin);
    if (
      pkg.name !== spec.package ||
      !target ||
      !existsSync(target) ||
      !realpathSync(target).startsWith(realpathSync(packageRoot) + path.sep)
    )
      throw new Error("Invalid CLI package");
    return {
      name,
      installed: true,
      version: pkg.version,
      compatible: versionAtLeast(pkg.version, spec.minimumVersion),
      executable: target,
    };
  } catch {
    return { name, installed: false, problem: "invalid_local_package" };
  }
}

export function projectInfo(project, runner = run) {
  const result = runner("git", ["-C", project, "remote", "-v"]);
  const repos = result.ok
    ? result.stdout
        .split("\n")
        .map((line) => repositoryIdentity(line.trim().split(/\s+/)[1]))
        .filter(Boolean)
    : [];
  const context = readProjectProfile(project);
  const expected = context.profile?.repositories?.map(repositoryIdentity) || [];
  return {
    path: project,
    profile: {
      path: profilePath,
      status: context.status,
      ...(context.problem ? { problem: context.problem } : {}),
    },
    repositoryMatch: expected.length
      ? repos.some((repo) => expected.includes(repo))
      : null,
    targetAccess: "not_verified",
    primeBindingPresent: existsSync(
      path.join(project, ".primeui", "project.json"),
    ),
    sanityConfigPresent: existsSync(path.join(project, "sanity.config.ts")),
    repositoryMcpConfigPresent: existsSync(path.join(project, ".mcp.json")),
  };
}
