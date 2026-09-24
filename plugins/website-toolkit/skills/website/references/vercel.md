# Vercel plugin and local settings

Use for a Vercel-hosted website or an explicit Vercel setup request. The provider
remains independently installed and updated; do not copy its skills or MCP server.
Website setup authorizes installation and supported sign-in, not deployment or
creation of replacement projects.

## Install and connect

1. Inspect the host's installed plugins and available Vercel tools first. Reuse an
   existing official Vercel plugin and working connection. Do not add a second MCP
   server or install a second plugin under another name to repair authentication.
2. In Codex, discover **Vercel** through the host's plugin catalog tools. Use the
   exact reference returned by discovery, not a guessed marketplace or saved connector
   ID. Present installation through the host's supported mechanism when available;
   otherwise guide the client to the named catalog entry. The client completes any
   installation and account confirmation. A suggestion is not a completed install.
3. Read back installed/enabled state. If new capabilities require a reload, save
   non-secret progress and give one resume message. Do not reinstall on resume.
4. Follow the installed plugin's instructions and official Vercel authorization.
   Use a small read to verify the user's access to the exact existing team/project,
   matching verified repository/domain context. Missing membership needs an invitation.
5. For other hosts, inspect the provider's current
   [official installation instructions](https://github.com/vercel/vercel-plugin)
   and actual host compatibility. Do not manufacture a plugin manifest or silently
   translate a Codex catalog ID into another host's command.

The deterministic `setup.mjs` helper manages Website Toolkit, SiteOS, Prime and Sanity.
Vercel is a separate, host-guided part of the same chat workflow; its installation and
authentication are not included in the helper's checkpoint or acceptance claim.
On an update request, update Vercel through its owning catalog/installation mechanism.

As checked on 2026-09-24, the Codex catalog lists Vercel. Direct Git marketplace
installation of `vercel-plugin@vercel` from `vercel/vercel-plugin` failed in the
tested Codex CLI because the plugin manifest name was `vercel`, while the marketplace
entry was `vercel-plugin`. Do not put that failing path into the common installer,
patch the upstream package locally, or vendor a corrected copy. Prefer the catalog;
recheck upstream support before changing this installation route.

## Retrieve settings without returning secrets to chat

Plugin/MCP OAuth and Vercel CLI authentication are separate. The connection is useful
for project discovery; do not infer that it supplies a secret-export tool or signs in
the local CLI. Inspect currently available capabilities rather than inventing tools.

Follow [local preview](local-preview.md) for the actual export. Use the official CLI
to write **Development** settings directly into a private Git-ignored local file.
Never request decrypted values in an MCP response, print `.env` contents, put secrets
in command arguments, or copy credentials between the plugin and CLI. Use supported
CLI browser sign-in when needed and explain that one additional action to the client.

Preserve existing settings and verified project linkage. Do not run a general
bootstrap/deploy workflow that provisions services, changes remote settings or
creates a project as part of preparing an existing website locally. If plugin access
is pending, continue independent local preparation and report that connection as
pending; do not say every tool is ready because the CLI export succeeded.

Installation, plugin authorization, CLI authorization, project access, settings
download and a working local page each need their own evidence. No live writes are
needed to verify setup. See the official [MCP guide](https://vercel.com/docs/agent-resources/vercel-mcp)
and [CLI environment guide](https://vercel.com/docs/cli/env) for current provider contracts.
