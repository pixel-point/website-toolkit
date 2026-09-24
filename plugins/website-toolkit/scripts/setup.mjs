#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import {
  cliInfo,
  inventory,
  parseJson,
  planPlugins,
  projectInfo,
  requirements,
  run,
  toolkitHome,
  versionAtLeast,
} from "./lib.mjs";

const usage = `Website Toolkit setup (Node 22+)
  node setup.mjs doctor --host codex|claude [--host-bin PATH] [--project PATH]
  node setup.mjs install|update --host codex|claude --apply [--project PATH]
      [--only website-toolkit,siteos,prime] [--source LOCAL_MARKETPLACE] [--with-cli]
  node setup.mjs cli-install [--only siteos,prime] --apply
  node setup.mjs cli siteos|prime -- <provider arguments>
Doctor and install/update without --apply do not write. Authentication is a separate guided step.`;

function parse(argv) {
  const [mode = "doctor", ...rest] = argv;
  if (mode === "--help" || mode === "help") return { mode: "help" };
  if (mode === "cli")
    return { mode, cli: rest[0], args: rest.slice(rest[1] === "--" ? 2 : 1) };
  if (!["doctor", "install", "update", "cli-install"].includes(mode))
    throw new Error("Unknown command. Use --help.");
  const options = {
    mode,
    apply: false,
    withCli: false,
    project: process.cwd(),
  };
  const keys = {
    "--host": "host",
    "--host-bin": "hostBin",
    "--project": "project",
    "--only": "only",
    "--source": "source",
  };
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === "--apply") options.apply = true;
    else if (rest[i] === "--with-cli") options.withCli = true;
    else if (keys[rest[i]] && rest[i + 1] && !rest[i + 1].startsWith("--"))
      options[keys[rest[i]]] = rest[++i];
    else throw new Error(`Unsupported or incomplete option: ${rest[i]}`);
  }
  if (mode !== "cli-install" && !["codex", "claude"].includes(options.host))
    throw new Error("Choose --host codex or --host claude explicitly.");
  options.hostBin ||= options.host;
  options.project = path.resolve(options.project);
  if (!existsSync(options.project))
    throw new Error("Project directory does not exist.");
  if (options.only) {
    options.only = options.only.split(",");
    const allowed =
      mode === "cli-install"
        ? Object.keys(requirements.clis)
        : requirements.plugins.map((p) => p.name);
    if (options.only.some((p) => !allowed.includes(p)))
      throw new Error("Unsupported --only selection.");
  }
  if (options.source) {
    const manifest = path.join(
      path.resolve(options.source),
      ".agents/plugins/marketplace.json",
    );
    const value = JSON.parse(readFileSync(manifest, "utf8"));
    if (
      value.name !== "website-toolkit" ||
      !value.plugins?.some((p) => p.name === "website-toolkit")
    )
      throw new Error("Local source must be Website Toolkit marketplace.");
  }
  return options;
}

function installCli(names, home, apply, update = false) {
  const report = [];
  for (const name of names) {
    const current = cliInfo(name, home),
      spec = requirements.clis[name];
    if (current.compatible && !update) {
      report.push({
        name,
        status: "already_installed",
        version: current.version,
      });
      continue;
    }
    if (!apply) {
      report.push({
        name,
        status: "installation_planned",
        package: spec.package,
      });
      continue;
    }
    const cache = path.join(home, "npm-cache");
    mkdirSync(cache, { recursive: true, mode: 0o700 });
    const version = parseJson(
      run("npm", ["--cache", cache, "view", spec.package, "version", "--json"]),
      `${name} package lookup`,
    );
    if (!versionAtLeast(version, spec.minimumVersion))
      throw new Error(
        `${name} registry version does not meet the required contract.`,
      );
    const result = run(
      "npm",
      [
        "--cache",
        cache,
        "install",
        "--prefix",
        path.join(home, "tools", name),
        "--no-audit",
        "--no-fund",
        "--ignore-scripts",
        "--save-exact",
        `${spec.package}@${version}`,
      ],
      { timeout: 180_000 },
    );
    if (!result.ok)
      throw new Error(
        `${name} installation failed; rerun doctor. No system package manager configuration was changed.`,
      );
    const installed = cliInfo(name, home);
    if (!installed.compatible || installed.version !== version)
      throw new Error(`${name} installation readback failed.`);
    const check = run(process.execPath, [installed.executable, "--help"]);
    if (!check.ok)
      throw new Error(`${name} installed but --help failed. It is not ready.`);
    report.push({ name, status: "installed", version });
  }
  return report;
}

function checkpoint(home, options, state, completed) {
  const key = createHash("sha256")
    .update(`${options.host}\0${options.project}`)
    .digest("hex")
    .slice(0, 20);
  const directory = path.join(home, "checkpoints");
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const file = path.join(directory, `${key}.json`);
  const ownIds = new Set(
    requirements.plugins.map((p) => `${p.name}@${p.marketplace}`),
  );
  const record = {
    schemaVersion: 1,
    host: options.host,
    project: options.project,
    checkedAt: new Date().toISOString(),
    completedActions: completed,
    plugins: state.plugins.filter((p) => ownIds.has(p.id)),
    nextStep: completed.length
      ? "reload_then_verify_provider_access"
      : "verify_provider_access",
    providerAccess: "not_verified",
  };
  writeFileSync(`${file}.tmp`, JSON.stringify(record, null, 2) + "\n", {
    mode: 0o600,
  });
  renameSync(`${file}.tmp`, file);
  return file;
}

try {
  const o = parse(process.argv.slice(2));
  if (o.mode === "help") {
    console.log(usage);
    process.exit(0);
  }
  if (+process.versions.node.split(".")[0] < 22)
    throw new Error(
      "Node.js 22+ is required. Follow the setup reference to install it.",
    );
  const home = toolkitHome();
  if (o.mode === "cli") {
    const info = cliInfo(o.cli, home);
    if (!info.compatible)
      throw new Error(
        "Managed CLI is missing or outdated. Run cli-install first.",
      );
    // Never record or echo provider arguments: an auth command can contain a one-time token.
    const result = spawnSync(process.execPath, [info.executable, ...o.args], {
      stdio: "inherit",
    });
    process.exit(result.status ?? 1);
  }
  if (o.apply && process.platform === "win32")
    throw new Error(
      "Automatic Windows installation is not validated in this release. Follow setup.md with supported host commands.",
    );
  if (o.mode === "cli-install") {
    console.log(
      JSON.stringify(
        {
          clis: installCli(o.only || ["siteos", "prime"], home, o.apply),
          providerAccess: "not_verified",
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }
  const state = inventory(o.host, o.hostBin, run, o.project);
  const plan = planPlugins({
    ...o,
    state,
    mode: o.mode === "update" ? "update" : "install",
  });
  const report = {
    host: o.host,
    project: projectInfo(o.project),
    plugins: state.plugins.filter((p) =>
      requirements.plugins.some((r) => p.id === `${r.name}@${r.marketplace}`),
    ),
    clis: ["siteos", "prime"].map((n) => {
      const { executable, ...info } = cliInfo(n, home);
      return info;
    }),
    ...plan,
    providerAccess: "not_verified",
    nextStep:
      "Follow the skill setup reference for OAuth, account and project verification.",
  };
  if (o.mode === "doctor" || !o.apply) {
    console.log(JSON.stringify(report, null, 2));
    process.exit(plan.blockers.length ? 2 : 0);
  }
  const completed = [];
  for (const action of plan.actions) {
    const result = run(action.command, action.args, {
      cwd: o.project,
      timeout: 180_000,
    });
    if (!result.ok) {
      const observed = inventory(o.host, o.hostBin, run, o.project);
      const file = checkpoint(home, o, observed, completed);
      throw new Error(
        `${action.id} did not complete successfully. Inspect current inventory before retrying. Progress: ${file}`,
      );
    }
    completed.push(action.id);
    // Resume trusts fresh inventory, not this checkpoint; successful exit alone is insufficient.
    checkpoint(
      home,
      o,
      inventory(o.host, o.hostBin, run, o.project),
      completed,
    );
  }
  const observed = inventory(o.host, o.hostBin, run, o.project);
  const remaining = planPlugins({ ...o, state: observed, mode: "install" });
  report.plugins = observed.plugins.filter((p) =>
    requirements.plugins.some((r) => p.id === `${r.name}@${r.marketplace}`),
  );
  report.completedActions = completed;
  report.checkpoint = checkpoint(home, o, observed, completed);
  report.remainingActions = remaining.actions;
  if (o.withCli)
    report.cliInstall = installCli(
      ["siteos", "prime"],
      home,
      true,
      o.mode === "update",
    );
  report.nextStep = completed.length
    ? "Start a new session (or supported plugin reload), invoke website and verify provider sign-in and project access."
    : "Invoke website to verify provider sign-in and project access.";
  console.log(JSON.stringify(report, null, 2));
  if (
    plan.blockers.length ||
    remaining.blockers.length ||
    remaining.actions.length
  )
    process.exitCode = 2;
} catch (error) {
  console.error(
    JSON.stringify({ status: "needs_attention", message: error.message }),
  );
  process.exitCode = 1;
}
