import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  rmSync,
  writeFileSync,
  existsSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { installCli } from "../plugins/website-toolkit/scripts/managed-cli.mjs";

function fixture(t, installedVersion) {
  const home = mkdtempSync(path.join(os.tmpdir(), "toolkit-cli-latest-"));
  t.after(() => rmSync(home, { recursive: true, force: true }));
  const root = path.join(home, "tools/prime/node_modules/@primeuicom/cli");
  const writePackage = (version) => {
    mkdirSync(root, { recursive: true });
    writeFileSync(
      path.join(root, "package.json"),
      JSON.stringify({
        name: "@primeuicom/cli",
        version,
        bin: { primeui: "./cli.mjs" },
      }),
    );
    writeFileSync(path.join(root, "cli.mjs"), "");
  };
  if (installedVersion) writePackage(installedVersion);
  const state = {
    latest: "6.0.0",
    installedVersion,
    calls: [],
    lookupFails: false,
    versionMismatch: false,
    helpFails: false,
  };
  const runner = (command, args) => {
    state.calls.push({ command, args });
    if (command === "npm" && args.includes("view")) {
      assert(args.includes("@primeuicom/cli@latest"));
      return { ok: !state.lookupFails, stdout: JSON.stringify(state.latest) };
    }
    if (command === "npm" && args.includes("install")) {
      const selected = args.at(-1).slice("@primeuicom/cli@".length);
      assert.equal(selected, state.latest);
      state.installedVersion = selected;
      writePackage(selected);
      return { ok: true, stdout: "" };
    }
    assert.equal(command, process.execPath);
    assert.equal(args[0], path.join(root, "cli.mjs"));
    return {
      ok: !(state.helpFails && args[1] === "--help"),
      stdout:
        args[1] === "--version"
          ? state.versionMismatch
            ? "0.0.0"
            : state.installedVersion
          : "provider help",
    };
  };
  return {
    home,
    state,
    runner,
    installCount: () =>
      state.calls.filter((c) => c.args.includes("install")).length,
  };
}

test("setup follows a changing latest tag without changing a Toolkit version floor", (t) => {
  const f = fixture(t, "5.0.0");
  assert.equal(
    installCli(["prime"], f.home, true, f.runner)[0].version,
    "6.0.0",
  );
  assert.equal(f.installCount(), 1);
  assert.equal(
    installCli(["prime"], f.home, true, f.runner)[0].status,
    "already_current",
  );
  assert.equal(f.installCount(), 1);
  f.state.latest = "7.2.1";
  const result = installCli(["prime"], f.home, true, f.runner)[0];
  assert.equal(result.version, "7.2.1");
  assert.equal(result.latestVersion, "7.2.1");
  assert.equal(result.executableVerified, true);
  assert.equal(f.installCount(), 2);
});

test("a failed lookup or non-stable latest does not reuse an older CLI as current", (t) => {
  const f = fixture(t, "5.0.0");
  f.state.lookupFails = true;
  assert.throws(
    () => installCli(["prime"], f.home, true, f.runner),
    /could not be verified/,
  );
  f.state.lookupFails = false;
  for (const value of ["7.0.0-beta.1", null, ["6.0.0"], "not-a-version"]) {
    f.state.latest = value;
    assert.throws(
      () => installCli(["prime"], f.home, true, f.runner),
      /could not be verified/,
    );
  }
  assert.equal(f.installCount(), 0);
});

test("a registry rollback requires an explicit version decision instead of a downgrade", (t) => {
  const f = fixture(t, "8.0.0");
  assert.throws(
    () => installCli(["prime"], f.home, true, f.runner),
    /no downgrade/,
  );
  assert.equal(f.installCount(), 0);
});

test("matching package metadata does not hide a broken executable", (t) => {
  const f = fixture(t, "6.0.0");
  f.state.versionMismatch = true;
  assert.throws(
    () => installCli(["prime"], f.home, true, f.runner),
    /executable version/,
  );
  f.state.versionMismatch = false;
  f.state.helpFails = true;
  assert.throws(
    () => installCli(["prime"], f.home, true, f.runner),
    /help failed/,
  );
  assert.equal(f.installCount(), 0);
});

test("dry run does not access npm or write a private cache", (t) => {
  const f = fixture(t);
  const result = installCli(["prime"], f.home, false, () => {
    throw new Error("must not execute");
  });
  assert.equal(result[0].status, "latest_check_planned");
  assert(!existsSync(path.join(f.home, "npm-cache")));
});
