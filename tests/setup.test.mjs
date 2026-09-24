import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
  existsSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  cliInfo,
  normalizeInventory,
  planPlugins,
  repoIdentity,
  requirements,
  versionAtLeast,
} from "../plugins/website-toolkit/scripts/lib.mjs";

const empty = { plugins: [], marketplaces: [] };
function plan(state = empty, overrides = {}) {
  return planPlugins({
    host: "codex",
    hostBin: "codex",
    mode: "install",
    state,
    ...overrides,
  });
}
function ready() {
  return {
    plugins: requirements.plugins.map((p) => ({
      id: `${p.name}@${p.marketplace}`,
      enabled: true,
      version: "1.0.0",
      scope: "user",
    })),
    marketplaces: requirements.plugins.map((p) => ({
      name: p.marketplace,
      source: `https://github.com/${p.repository}.git`,
    })),
  };
}

test("new setup installs independent packages in both hosts without a copied provider", () => {
  for (const host of ["codex", "claude"]) {
    const { actions, blockers } = plan(empty, { host, hostBin: host });
    assert.equal(blockers.length, 0);
    assert.equal(actions.length, 6);
    const installs = actions.filter((a) => a.id.startsWith("plugin:"));
    assert.deepEqual(
      installs.map((a) => a.args[2]),
      [
        "website-toolkit@website-toolkit",
        "siteos@siteos",
        "prime@prime-skills",
      ],
    );
    assert(
      installs.every(
        (a) => a.args[1] === (host === "codex" ? "add" : "install"),
      ),
    );
  }
});

test("repeat install is empty; update refreshes only the three owning sources", () => {
  const state = ready();
  state.plugins.push({ id: "other@team", enabled: true });
  state.marketplaces.push({ name: "team", source: "owner/team" });
  assert.deepEqual(plan(state), { actions: [], blockers: [] });
  const update = plan(state, { mode: "update" });
  assert.equal(update.actions.length, 6);
  assert(!JSON.stringify(update).includes("other@team"));
});

test("conflicting source cannot be hijacked, even when the selector looks correct", () => {
  const state = ready();
  state.marketplaces[1].source = "https://github.com/other/siteos.git";
  const p = plan(state, { mode: "update" });
  assert.equal(p.blockers[0].reason, "marketplace_source_conflict");
  assert(!p.actions.some((a) => a.id.includes("siteos")));
});

test("disabled, project scoped and pinned installations preserve user choices", () => {
  const state = ready();
  state.plugins[0].enabled = false;
  state.plugins[1].scope = "project";
  state.marketplaces[2].ref = "v0.2.0";
  const p = plan(state, { mode: "update" });
  assert.equal(p.actions.length, 0);
  assert.deepEqual(
    p.blockers.map((b) => b.reason),
    ["disabled_plugin", "non_user_or_ambiguous_scope", "pinned_marketplace"],
  );
});

test("after interruption, fresh inventory installs only the missing plugin", () => {
  const state = ready();
  state.plugins.pop();
  const p = plan(state);
  assert.deepEqual(
    p.actions.map((a) => a.id),
    ["plugin:prime"],
  );
});

test("inventory adapter rejects unknown shapes and strips unrelated provider metadata", () => {
  const actual = normalizeInventory(
    "codex",
    {
      installed: [
        {
          pluginId: "siteos@siteos",
          enabled: true,
          version: "2.23.1",
          secret: "never-copy",
        },
      ],
    },
    { marketplaces: [] },
  );
  assert(!JSON.stringify(actual).includes("never-copy"));
  assert.throws(
    () => normalizeInventory("claude", { changedShape: [] }, []),
    /Unsupported/,
  );
  assert.equal(
    normalizeInventory(
      "claude",
      [{ id: "prime@prime-skills", scope: "local", enabled: false }],
      [],
    ).plugins[0].scope,
    "local",
  );
});

test("GitHub identity matching is exact and version floors exclude prereleases", () => {
  assert.equal(
    repoIdentity("git@github.com:pixel-point/siteos.git"),
    "pixel-point/siteos",
  );
  assert.equal(repoIdentity("https://attacker.test/pixel-point/siteos"), null);
  assert.equal(
    repoIdentity("https://github.com/pixel-point/siteos-extra.git"),
    "pixel-point/siteos-extra",
  );
  assert(versionAtLeast("2.23.1", "2.22.0"));
  assert(!versionAtLeast("2.21.9", "2.22.0"));
  assert(!versionAtLeast("2.23.1-beta", "2.22.0"));
});

test("managed CLI rejects an executable escaping its package and checks minimum version", () => {
  const home = mkdtempSync(path.join(os.tmpdir(), "website-cli-test-"));
  try {
    const root = path.join(home, "tools/siteos/node_modules/@siteoshq/cli");
    mkdirSync(root, { recursive: true });
    const external = path.join(home, "external.mjs");
    writeFileSync(external, "");
    writeFileSync(
      path.join(root, "package.json"),
      JSON.stringify({
        name: "@siteoshq/cli",
        version: "2.23.1",
        bin: { siteos: external },
      }),
    );
    assert.equal(cliInfo("siteos", home).installed, false);
    writeFileSync(path.join(root, "cli.mjs"), "");
    writeFileSync(
      path.join(root, "package.json"),
      JSON.stringify({
        name: "@siteoshq/cli",
        version: "2.0.0",
        bin: { siteos: "./cli.mjs" },
      }),
    );
    assert.equal(cliInfo("siteos", home).compatible, false);
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test("CLI plan is read-only and rejects unknown arguments before executing a host", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "website-readonly-"));
  const home = path.join(root, "private-state");
  const script = path.resolve("plugins/website-toolkit/scripts/setup.mjs");
  try {
    const result = spawnSync(process.execPath, [script, "cli-install"], {
      encoding: "utf8",
      env: { ...process.env, WEBSITE_TOOLKIT_HOME: home },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(result.stdout).clis.length, 2);
    assert(!existsSync(home));
    const invalid = spawnSync(
      process.execPath,
      [script, "install", "--host", "codex", "--only", "arbitrary", "--apply"],
      { encoding: "utf8" },
    );
    assert.notEqual(invalid.status, 0);
    assert.match(invalid.stderr, /Unsupported --only/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
