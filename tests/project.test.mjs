import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  symlinkSync,
  readdirSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  readProjectProfile,
  repositoryIdentity,
  profilePath,
} from "../plugins/website-toolkit/scripts/project.mjs";
import { projectInfo } from "../plugins/website-toolkit/scripts/lib.mjs";

function fixture(fn) {
  const root = mkdtempSync(path.join(os.tmpdir(), "website-profile-"));
  try {
    fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
function save(root, profile) {
  mkdirSync(path.join(root, ".website-toolkit"), { recursive: true });
  writeFileSync(path.join(root, profilePath), JSON.stringify(profile));
}
const remote = (value) => () => ({
  ok: true,
  stdout: `origin\t${value} (fetch)\n`,
});

test("an unconfigured website stays unresolved without creating a profile", () =>
  fixture((root) => {
    const info = projectInfo(root, remote("git@github.com:acme/website.git"));
    assert.equal(info.profile.status, "missing");
    assert.equal(info.repositoryMatch, null);
    assert.equal(info.targetAccess, "not_verified");
    assert.deepEqual(readdirSync(root), []);
  }));

test("profile context is isolated per website and a repo match never proves provider access", () =>
  fixture((root) => {
    const first = path.join(root, "first"),
      second = path.join(root, "second");
    save(first, {
      schemaVersion: 1,
      website: "https://example.com",
      repositories: ["acme/website"],
      providers: { sanity: { projectId: "client-specific-id" } },
    });
    save(second, { schemaVersion: 1, repositories: ["another/website"] });
    const runner = remote("https://github.com/acme/website.git");
    const a = projectInfo(first, runner),
      b = projectInfo(second, runner);
    assert.equal(a.repositoryMatch, true);
    assert.equal(b.repositoryMatch, false);
    assert.equal(a.targetAccess, "not_verified");
    assert(!JSON.stringify(a).includes("client-specific-id"));
    assert.equal(
      readProjectProfile(second).profile.repositories[0],
      "another/website",
    );
  }));

test("invalid profiles reject secrets fields and escaping paths without echoing their values", () =>
  fixture((root) => {
    for (const profile of [
      { schemaVersion: 2 },
      { schemaVersion: 1, providers: { sanity: { token: "do-not-echo" } } },
      { schemaVersion: 1, website: "https://user:do-not-echo@example.com" },
      { schemaVersion: 1, website: "https://example.com?token=do-not-echo" },
      { schemaVersion: 1, sourcePaths: { renderer: "../outside.ts" } },
      { schemaVersion: 1, sourcePaths: { renderer: "/outside.ts" } },
      { schemaVersion: 1, sourcePaths: { renderer: "C:\\outside.ts" } },
    ]) {
      save(root, profile);
      const result = readProjectProfile(root);
      assert.equal(result.status, "invalid");
      assert(!JSON.stringify(result).includes("do-not-echo"));
      assert.equal(
        projectInfo(root, remote("acme/website")).repositoryMatch,
        null,
      );
    }
  }));

test("valid source hints may be missing but cannot resolve through an outside symlink", () =>
  fixture((root) => {
    const project = path.join(root, "project");
    save(project, {
      schemaVersion: 1,
      sourcePaths: { renderer: "src/not-deployed.tsx" },
    });
    assert.equal(readProjectProfile(project).status, "valid");
    writeFileSync(path.join(root, "outside.txt"), "");
    symlinkSync(
      path.join(root, "outside.txt"),
      path.join(project, "linked.txt"),
    );
    save(project, {
      schemaVersion: 1,
      sourcePaths: { renderer: "linked.txt" },
    });
    assert.equal(readProjectProfile(project).status, "invalid");
  }));

test("website identities support GitHub and GitLab without accepting URL credentials", () => {
  assert.equal(repositoryIdentity("acme/website"), "github.com/acme/website");
  assert.equal(
    repositoryIdentity("ssh://git@gitlab.com/acme/team/website.git"),
    "gitlab.com/acme/team/website",
  );
  assert.equal(
    repositoryIdentity("git@gitlab.com:acme/team/website.git"),
    "gitlab.com/acme/team/website",
  );
  assert.equal(
    repositoryIdentity("https://gitlab.com/acme/team/website.git"),
    "gitlab.com/acme/team/website",
  );
  assert.equal(
    repositoryIdentity("https://token@example.com/acme/website.git"),
    null,
  );
});
