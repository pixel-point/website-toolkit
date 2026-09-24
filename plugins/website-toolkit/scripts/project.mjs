import { existsSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";

export const profilePath = ".website-toolkit/project.json";
const fields = [
  "schemaVersion",
  "name",
  "website",
  "repositories",
  "providers",
  "sourcePaths",
];
const providerFields = {
  siteos: ["origin", "organizationId", "projectId", "environment"],
  sanity: ["projectId", "dataset", "workspace"],
  prime: ["projectId"],
};
const object = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const plainText = (value) =>
  typeof value === "string" &&
  value.length > 0 &&
  value.length <= 300 &&
  !/[\r\n\0]/.test(value);
const origin = (value) => {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return (
      ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash
    );
  } catch {
    return false;
  }
};

export function repositoryIdentity(value) {
  if (typeof value !== "string") return null;
  const input = value
    .trim()
    .replace(/\/$/, "")
    .replace(/\.git$/, "");
  if (/^[\w.-]+\/[\w.-]+$/.test(input))
    return `github.com/${input}`.toLowerCase();
  const ssh = /^git@([\w.-]+):([\w./-]+)$/.exec(input);
  if (ssh) return `${ssh[1]}/${ssh[2]}`.toLowerCase();
  try {
    const url = new URL(input);
    if (
      !["https:", "ssh:"].includes(url.protocol) ||
      url.password ||
      url.search ||
      url.hash ||
      (url.username && !(url.protocol === "ssh:" && url.username === "git")) ||
      !/^\/[\w.-]+(?:\/[\w.-]+)+$/.test(url.pathname)
    )
      return null;
    return `${url.host}${url.pathname}`.toLowerCase();
  } catch {
    return null;
  }
}

function inside(root, target) {
  return target === root || target.startsWith(root + path.sep);
}

export function readProjectProfile(project) {
  const root = realpathSync(project);
  const file = path.join(root, profilePath);
  if (!existsSync(file)) return { status: "missing" };
  try {
    if (!inside(root, realpathSync(file))) throw new Error();
    const profile = JSON.parse(readFileSync(file, "utf8"));
    if (
      !object(profile) ||
      profile.schemaVersion !== 1 ||
      Object.keys(profile).some((key) => !fields.includes(key))
    )
      throw new Error();
    if (profile.name !== undefined && !plainText(profile.name))
      throw new Error();
    if (
      profile.website !== undefined &&
      profile.website !== null &&
      !origin(profile.website)
    )
      throw new Error();
    if (
      profile.repositories !== undefined &&
      (!Array.isArray(profile.repositories) ||
        profile.repositories.some((repo) => !repositoryIdentity(repo)))
    )
      throw new Error();
    if (profile.providers !== undefined) {
      if (!object(profile.providers)) throw new Error();
      for (const [provider, values] of Object.entries(profile.providers)) {
        if (!Object.hasOwn(providerFields, provider) || !object(values))
          throw new Error();
        for (const [key, value] of Object.entries(values)) {
          if (
            !providerFields[provider].includes(key) ||
            (value !== null &&
              !(key === "origin" ? origin(value) : plainText(value)))
          )
            throw new Error();
        }
      }
    }
    if (profile.sourcePaths !== undefined) {
      if (!object(profile.sourcePaths)) throw new Error();
      for (const [key, value] of Object.entries(profile.sourcePaths)) {
        if (
          !/^[a-zA-Z][a-zA-Z0-9]*$/.test(key) ||
          !plainText(value) ||
          path.isAbsolute(value) ||
          value.includes("\\") ||
          /^[a-zA-Z]:/.test(value) ||
          value.split("/").includes("..")
        )
          throw new Error();
        const target = path.resolve(root, value);
        if (
          !inside(root, target) ||
          (existsSync(target) && !inside(root, realpathSync(target)))
        )
          throw new Error();
      }
    }
    return { status: "valid", profile };
  } catch {
    // Never echo invalid profile values: they could contain credentials.
    return {
      status: "invalid",
      problem:
        "Check project profile fields, URLs and repository-relative source paths.",
    };
  }
}
