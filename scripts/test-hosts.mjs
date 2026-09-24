import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

const repository = path.resolve(import.meta.dirname, "..");
const helper = path.join(
  repository,
  "plugins/website-toolkit/scripts/setup.mjs",
);
const temp = mkdtempSync(
  path.join(os.tmpdir(), "website-toolkit-host-acceptance-"),
);
const evidence = {
  checkedAt: new Date().toISOString(),
  hosts: [],
  source:
    process.env.WEBSITE_TOOLKIT_TEST_SOURCE === "remote" ? "remote" : "local",
  scope:
    "Real isolated marketplace installs and idempotency; no OAuth or provider mutations.",
};
function execute(command, args, env, cwd = temp) {
  const r = spawnSync(command, args, {
    cwd,
    env,
    encoding: "utf8",
    timeout: 180_000,
    maxBuffer: 4 * 1024 * 1024,
  });
  assert.equal(
    r.status,
    0,
    `${command} ${args.slice(0, 3).join(" ")} failed: ${r.stderr?.slice(-1000)}`,
  );
  return r.stdout;
}
try {
  for (const host of ["codex", "claude"]) {
    const configuration = path.join(temp, `${host}-configuration`);
    const home = path.join(temp, `${host}-toolkit`);
    mkdirSync(configuration, { recursive: true });
    // Supported per-host configuration roots, used only by these child processes.
    const env = {
      ...process.env,
      WEBSITE_TOOLKIT_HOME: home,
      ...(host === "codex"
        ? { CODEX_HOME: configuration }
        : { CLAUDE_CONFIG_DIR: configuration }),
    };
    const binary =
      process.env[`WEBSITE_TOOLKIT_${host.toUpperCase()}_BIN`] || host;
    const version = execute(binary, ["--version"], env).trim();
    const args = [
      helper,
      "install",
      "--host",
      host,
      "--host-bin",
      binary,
      ...(evidence.source === "local" ? ["--source", repository] : []),
      "--project",
      temp,
      "--apply",
    ];
    const first = JSON.parse(execute(process.execPath, args, env));
    assert.equal(first.plugins.length, 3);
    assert.equal(first.remainingActions.length, 0);
    assert(first.plugins.every((p) => p.enabled));
    const second = JSON.parse(execute(process.execPath, args, env));
    assert.deepEqual(second.completedActions, []);
    assert.equal(second.providerAccess, "not_verified");
    const cp = JSON.parse(readFileSync(first.checkpoint, "utf8"));
    assert.equal(cp.providerAccess, "not_verified");
    const listed = JSON.parse(
      execute(binary, ["plugin", "list", "--json"], env),
    );
    const installed = host === "codex" ? listed.installed : listed;
    assert.equal(installed.length, 3);
    if (host === "claude") {
      const self = installed.find(
        (p) => p.id === "website-toolkit@website-toolkit",
      );
      assert(self.installPath.startsWith(configuration));
      assert(
        existsSync(path.join(self.installPath, "skills/website/SKILL.md")),
      );
    }
    evidence.hosts.push({
      host,
      version,
      plugins: first.plugins,
      repeatSetup: "no_changes",
    });
    console.log(
      `${host} ${version}: three independent plugins installed; repeat setup made no changes.`,
    );
  }
  mkdirSync(path.join(repository, ".artifacts"), { recursive: true });
  writeFileSync(
    path.join(repository, ".artifacts/host-acceptance.json"),
    JSON.stringify(evidence, null, 2) + "\n",
  );
} finally {
  rmSync(temp, { recursive: true, force: true });
}
