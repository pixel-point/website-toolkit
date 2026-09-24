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
  pluginRequirements,
  repoIdentity,
  toolkitPlugins,
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
function ready(host = "codex") {
  return {
    plugins: pluginRequirements(host).map((p) => ({
      id: `${p.name}@${p.marketplace}`,
      enabled: true,
      version: "1.0.0",
      scope: "user",
    })),
    marketplaces: pluginRequirements(host).map((p) => ({
      name: p.marketplace,
      source: `https://github.com/${p.repository}.git`,
    })),
  };
}

test("new setup installs independent packages in both hosts without a copied provider", () => {
  for (const host of ["codex", "claude"]) {
    const { actions, blockers } = plan(empty, { host, hostBin: host });
    assert.equal(blockers.length, 0);
    assert.equal(actions.length, 8);
    const installs = actions.filter((a) => a.id.startsWith("plugin:"));
    assert.deepEqual(
      installs.map((a) => a.args[2]),
      [
        "website-toolkit@website-toolkit",
        "siteos@siteos",
        "prime@prime-skills",
        host === "codex" ? "sanity@sanity" : "sanity@sanity-agent-toolkit",
      ],
    );
    assert(
      installs.every(
        (a) => a.args[1] === (host === "codex" ? "add" : "install"),
      ),
    );
  }
});

test("repeat install is empty; update refreshes only the four owning sources", () => {
  for (const host of ["codex", "claude"]) {
    const state = ready(host);
    state.plugins.push({ id: "other@team", enabled: true });
    state.marketplaces.push({ name: "team", source: "owner/team" });
    assert.deepEqual(plan(state, { host }), { actions: [], blockers: [] });
    const update = plan(state, { host, mode: "update" });
    assert.equal(update.actions.length, 8);
    assert(!JSON.stringify(update).includes("other@team"));
  }
});

test("conflicting source cannot be hijacked, even when the selector looks correct", () => {
  const state = ready();
  state.marketplaces[1].source = "https://github.com/other/siteos.git";
  const p = plan(state, {
    mode: "update",
    only: ["website-toolkit", "siteos", "prime"],
  });
  assert.equal(p.blockers[0].reason, "marketplace_source_conflict");
  assert(!p.actions.some((a) => a.id.includes("siteos")));
});

test("disabled, project scoped and pinned installations preserve user choices", () => {
  const state = ready();
  state.plugins[0].enabled = false;
  state.plugins[1].scope = "project";
  state.marketplaces[2].ref = "v0.2.0";
  const p = plan(state, {
    mode: "update",
    only: ["website-toolkit", "siteos", "prime"],
  });
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
    ["plugin:sanity"],
  );
});

test("Sanity uses official host sources and reuses the canonical Claude alternative", () => {
  for (const host of ["codex", "claude"]) {
    const result = plan(empty, { host, only: ["sanity"] });
    assert.equal(result.actions[0].args[3], "sanity-io/agent-toolkit");
  }
  const state = ready("claude");
  state.plugins[3].id = "sanity@claude-plugins-official";
  state.marketplaces[3] = {
    name: "claude-plugins-official",
    source: "anthropics/claude-plugins-official",
  };
  assert.deepEqual(plan(state, { host: "claude" }), {
    actions: [],
    blockers: [],
  });
  assert.equal(toolkitPlugins("claude", state).length, 4);
  const update = plan(state, {
    host: "claude",
    mode: "update",
    only: ["sanity"],
  });
  assert.equal(update.actions[1].args[2], "sanity@claude-plugins-official");
  assert(!JSON.stringify(update).includes("sanity-agent-toolkit"));
});

test("unknown or duplicate Sanity sources are not joined by another plugin installation", () => {
  for (const extra of ["sanity@unknown", "sanity@claude-plugins-official"]) {
    const state = ready("claude");
    state.plugins.push({ id: extra, enabled: true, scope: "user" });
    const result = plan(state, { host: "claude", only: ["sanity"] });
    assert.deepEqual(result.actions, []);
    assert.equal(result.blockers[0].reason, "ambiguous_plugin_source");
  }
});

test("legacy Toolkit upgrades before Sanity and cannot bypass a pinned migration", () => {
  for (const host of ["codex", "claude"]) {
    const state = ready(host);
    state.plugins[0].version = "0.1.0";
    state.plugins.pop();
    const result = plan(state, { host });
    assert.deepEqual(
      result.actions.map((a) => a.id),
      ["refresh:website-toolkit", "plugin:website-toolkit", "plugin:sanity"],
    );
    assert.equal(
      result.actions[1].args[1],
      host === "codex" ? "add" : "update",
    );
    assert.equal(
      plan(state, { host, only: ["sanity"] }).blockers[0].reason,
      "toolkit_migration_required",
    );
    state.marketplaces[0].ref = "v0.1.0";
    assert.equal(
      plan(state, { host }).blockers[0].reason,
      "pinned_marketplace",
    );
  }
});

test("apply stops on a blocker or unconfirmed Toolkit migration before installing Sanity", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "website-migration-"));
  try {
    const state = ready();
    state.plugins[0].version = "0.1.0";
    state.plugins.pop();
    const fixture = path.join(root, "inventory.json");
    const log = path.join(root, "mutations.jsonl");
    const binary = path.join(root, "host.mjs");
    writeFileSync(
      binary,
      `#!/usr/bin/env node
import { readFileSync, appendFileSync } from 'node:fs';
const state = JSON.parse(readFileSync(${JSON.stringify(fixture)}, 'utf8'));
const args = process.argv.slice(2);
if (args[1] === 'list') console.log(JSON.stringify({ installed: state.plugins.map(p => ({ ...p, pluginId: p.id })) }));
else if (args[2] === 'list') console.log(JSON.stringify({ marketplaces: state.marketplaces.map(m => ({ ...m, repo: m.source })) }));
else { appendFileSync(${JSON.stringify(log)}, JSON.stringify(args) + '\\n'); console.log('{}'); }
`,
      { mode: 0o700 },
    );
    const execute = () =>
      spawnSync(
        process.execPath,
        [
          path.resolve("plugins/website-toolkit/scripts/setup.mjs"),
          "install",
          "--host",
          "codex",
          "--host-bin",
          binary,
          "--project",
          root,
          "--apply",
        ],
        {
          encoding: "utf8",
          env: {
            ...process.env,
            WEBSITE_TOOLKIT_HOME: path.join(root, "toolkit"),
          },
        },
      );
    state.marketplaces[0].ref = "v0.1.0";
    writeFileSync(fixture, JSON.stringify(state));
    assert.equal(execute().status, 2);
    assert(!existsSync(log));
    delete state.marketplaces[0].ref;
    writeFileSync(fixture, JSON.stringify(state));
    const result = execute();
    assert.equal(result.status, 1);
    assert.match(result.stderr, /upgrade was not confirmed/);
    const mutations = readFileSync(log, "utf8")
      .trim()
      .split("\n")
      .map(JSON.parse);
    assert.deepEqual(
      mutations.map((a) => a[1]),
      ["marketplace", "add"],
    );
    assert(!JSON.stringify(mutations).includes("sanity"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("Codex reloads a local development source without requesting a Git marketplace upgrade", () => {
  const state = ready();
  state.plugins[0].version = "0.1.0";
  state.marketplaces[0].source = "/local/website-toolkit";
  const result = plan(state, {
    source: "/local/website-toolkit",
    only: ["website-toolkit"],
  });
  assert.deepEqual(result.blockers, []);
  assert.deepEqual(
    result.actions.map((a) => a.id),
    ["plugin:website-toolkit"],
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
