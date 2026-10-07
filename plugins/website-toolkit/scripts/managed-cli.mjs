import { mkdirSync } from "node:fs";
import path from "node:path";
import {
  cliInfo,
  isStableVersion,
  requirements,
  run,
  versionAtLeast,
} from "./lib.mjs";

// Resolve latest once, then install that exact version so a moving dist-tag cannot
// change the target between lookup and readback. No provider login is performed.
export function installCli(names, home, apply, runner = run) {
  const report = [];
  for (const name of names) {
    const spec = requirements.clis[name];
    if (!spec) throw new Error("Unknown managed CLI.");
    const current = cliInfo(name, home);
    if (!apply) {
      report.push({
        name,
        package: spec.package,
        status: "latest_check_planned",
        installedVersion: current.version ?? null,
      });
      continue;
    }
    const cache = path.join(home, "npm-cache");
    mkdirSync(cache, { recursive: true, mode: 0o700 });
    const lookup = runner("npm", [
      "--cache",
      cache,
      "view",
      `${spec.package}@latest`,
      "version",
      "--json",
    ]);
    let version;
    try {
      if (lookup.ok) version = JSON.parse(lookup.stdout);
    } catch {
      /* Report no registry proof below. */
    }
    if (!isStableVersion(version))
      throw new Error(
        `${name} latest stable version could not be verified. Keep the existing installation and retry the registry check; do not assume it is current.`,
      );

    const unchanged = current.installed && current.version === version;
    if (
      current.installed &&
      !unchanged &&
      versionAtLeast(current.version, version)
    )
      throw new Error(
        `${name} installed version differs from and is not older than registry latest. Resolve the version selection explicitly; no downgrade was applied.`,
      );
    if (!unchanged) {
      const result = runner(
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
    }
    const installed = cliInfo(name, home);
    if (!installed.installed || installed.version !== version)
      throw new Error(`${name} installation readback failed.`);
    const executableVersion = runner(process.execPath, [
      installed.executable,
      "--version",
    ]);
    if (!executableVersion.ok || executableVersion.stdout.trim() !== version)
      throw new Error(
        `${name} executable version does not match registry latest. Setup is not verified.`,
      );
    const help = runner(process.execPath, [installed.executable, "--help"]);
    if (!help.ok)
      throw new Error(`${name} executable help failed. Setup is not verified.`);
    report.push({
      name,
      status: unchanged ? "already_current" : "installed",
      version,
      latestVersion: version,
      executableVerified: true,
    });
  }
  return report;
}
