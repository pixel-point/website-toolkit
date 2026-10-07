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
  planPlugins,
  projectInfo,
  requirements,
  toolkitVersion,
  run,
  toolkitHome,
  toolkitPlugins,
} from "./lib.mjs";
import { installCli } from "./managed-cli.mjs";

const usage = `Website Toolkit setup (Node 22+)
  node setup.mjs doctor --host codex|claude [--host-bin PATH] [--project PATH]
  node setup.mjs install|update --host codex|claude --apply [--project PATH]
      [--only website-toolkit,siteos,prime,sanity] [--source LOCAL_MARKETPLACE] [--with-cli]
  node setup.mjs cli-install [--only siteos,prime] --apply
  node setup.mjs cli siteos|prime -- <provider arguments>
Doctor and install/update without --apply do not write. Authentication is a separate guided step.`;

// This helper observes local installation only, even when every package is present.
// Provider authorization and real website reads belong to the guided setup workflow.
const installationBoundary = {
  verificationScope: "local_installation_only",
  setupComplete: false,
  providerAccess: "not_verified",
};

function cliInventory(home) {
  return ["siteos", "prime"].map((name) => {
    const { executable, ...info } = cliInfo(name, home);
    return info;
  });
}

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

function checkpoint(home, options, state, completed) {
  const key = createHash("sha256")
    .update(`${options.host}\0${options.project}`)
    .digest("hex")
    .slice(0, 20);
  const directory = path.join(home, "checkpoints");
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const file = path.join(directory, `${key}.json`);
  const record = {
    schemaVersion: 1,
    host: options.host,
    project: options.project,
    checkedAt: new Date().toISOString(),
    completedActions: completed,
    plugins: toolkitPlugins(options.host, state),
    nextStep: completed.length
      ? "reload_then_verify_provider_access"
      : "verify_provider_access",
    ...installationBoundary,
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
    if (!info.installed)
      throw new Error(
        "Managed CLI is missing or invalid. Run cli-install first.",
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
          ...installationBoundary,
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
    plugins: toolkitPlugins(o.host, state),
    clis: cliInventory(home),
    ...plan,
    ...installationBoundary,
    nextStep:
      "Follow the skill setup reference for OAuth, account and project verification.",
  };
  if (o.mode === "doctor" || !o.apply || plan.blockers.length) {
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
    const current = inventory(o.host, o.hostBin, run, o.project);
    checkpoint(home, o, current, completed);
    if (action.id === "plugin:website-toolkit") {
      const migration = planPlugins({
        ...o,
        state: current,
        mode: "install",
        only: ["website-toolkit"],
      });
      if (migration.actions.length || migration.blockers.length)
        throw new Error(
          `Website Toolkit upgrade was not confirmed. Refresh its source to version ${toolkitVersion} or later, then rerun setup.`,
        );
    }
  }
  const observed = inventory(o.host, o.hostBin, run, o.project);
  const remaining = planPlugins({ ...o, state: observed, mode: "install" });
  report.plugins = toolkitPlugins(o.host, observed);
  report.blockers = remaining.blockers;
  report.completedActions = completed;
  report.checkpoint = checkpoint(home, o, observed, completed);
  report.remainingActions = remaining.actions;
  if (o.withCli)
    report.cliInstall = installCli(["siteos", "prime"], home, true);
  report.clis = cliInventory(home).map((info) => {
    const checked = report.cliInstall?.find((item) => item.name === info.name);
    return checked
      ? {
          ...info,
          latestVersion: checked.latestVersion,
          executableVerified: checked.executableVerified,
        }
      : info;
  });
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
