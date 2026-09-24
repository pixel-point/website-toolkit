import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const plugin = path.join(root, "plugins/website-toolkit");
const json = (p) => JSON.parse(readFileSync(path.join(root, p), "utf8"));
const codex = json("plugins/website-toolkit/.codex-plugin/plugin.json");
const claude = json("plugins/website-toolkit/.claude-plugin/plugin.json");
assert.equal(codex.name, "website-toolkit");
assert.equal(claude.name, codex.name);
assert.equal(claude.version, codex.version);
assert.equal(json("package.json").version, codex.version);
assert(
  !existsSync(path.join(plugin, "project.json")),
  "Do not distribute a client profile",
);
assert(
  !existsSync(path.join(root, ".website-toolkit")),
  "Do not publish project-local context",
);
assert.deepEqual(
  Object.keys(json("plugins/website-toolkit/.mcp.json").mcpServers),
  ["sanity"],
);
assert.deepEqual(json("plugins/website-toolkit/.mcp.json").mcpServers.sanity, {
  type: "http",
  url: "https://mcp.sanity.io",
});
assert.deepEqual(readdirSync(path.join(plugin, "skills")), ["website"]);
for (const file of [
  ".agents/plugins/marketplace.json",
  ".claude-plugin/marketplace.json",
]) {
  const market = json(file);
  assert.equal(market.name, "website-toolkit");
  assert.equal(market.plugins.length, 1);
  assert.equal(market.plugins[0].name, "website-toolkit");
  const source =
    typeof market.plugins[0].source === "string"
      ? market.plugins[0].source
      : market.plugins[0].source.path;
  assert.equal(path.resolve(root, source), plugin);
}
function walk(directory) {
  for (const item of readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name);
    assert(
      !item.isSymbolicLink(),
      `Archive must not depend on symlinks: ${file}`,
    );
    if (item.isDirectory()) walk(file);
    else if (file.endsWith(".md")) {
      const text = readFileSync(file, "utf8");
      assert(!text.includes("[TODO:"), `Unfinished scaffold: ${file}`);
      for (const match of text.matchAll(/\]\(([^\s)]+)\)/g)) {
        if (/^[a-z]+:|^#/.test(match[1])) continue;
        assert(
          existsSync(path.resolve(path.dirname(file), match[1].split("#")[0])),
          `Broken reference ${match[1]} in ${file}`,
        );
      }
    }
  }
}
walk(plugin);
const skill = readFileSync(
  path.join(plugin, "skills/website/SKILL.md"),
  "utf8",
);
assert.match(skill, /^---\nname: website\ndescription: .+\n---\n/);
console.log(
  "Package structure, host manifests, independent-provider boundary and references: passed.",
);
