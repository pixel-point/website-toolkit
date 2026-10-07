# Guided setup and recovery

The client starts with one prompt. The agent performs supported setup actions; the
client completes email/OAuth and organization invitation steps that require their identity.
The deterministic helper installs packages. This workflow verifies authenticated access.

## Completion gate

For full onboarding, keep a checklist with the states **not checked**, **needs sign-in**,
**needs access**, **verified**, or **deferred by the user**, plus the exact non-secret
target and evidence. Do not turn an unknown or pending item into a success checkmark.

| Required item | Completion evidence |
| --- | --- |
| Website Toolkit and provider plugins | Compatible enabled versions, with their current skills/tools available in this session |
| GitHub for a GitHub-hosted website | Plugin connection, exact repository read and separate local Git access |
| Sanity for a Sanity-managed website | Authorized plugin read of the website's project/dataset and necessary schema |
| SiteOS | CLI and MCP authenticated reads, matching Organization, Project and environment; required service attachment verified |
| Prime | Compatible CLI/plugin, real authorized project/health read for the website checkout and its MCP readiness check |
| Vercel when used by the website | Plugin connection, separate CLI access to the existing team/project, approved Development settings saved privately |
| Local website | Correct checkout and dependencies, required local settings, real page/content verified in a browser |

SiteOS and Prime are baseline connections for the complete toolkit setup, even if the
first task can run without them. Figma is required only for a Figma task. For a focused
repair/task, verify only its dependencies instead of restarting onboarding.

Declare **setup complete** only when every applicable required item is verified. If
authorization, membership, a plugin reload or supported connector is missing, say
**setup incomplete**, retain completed work and explain one actionable next step.
Continue independent steps and resume after the user acts; a preview does not waive
missing connections. Only an explicit user decision can defer a baseline item; name
that partial scope and which workflows remain unavailable. Do not create live data
or change service settings simply to satisfy this checklist.

For a missing checkout or a request to prepare the website locally, begin with
[website files and local preview](local-preview.md). Download the authorized existing
website, then resolve [project context](project-context.md) from that checkout. Keep
the optional profile there, never inside the installed toolkit. Verify its identity
from the user's target and existing provider configuration.

For a GitHub repository, [GitHub setup](github.md) comes before any download that
requires Git access, including the toolkit itself. Install/reuse the official GitHub
plugin through the host catalog, prepare local Git and GitHub CLI as needed, and guide
sign-in. Verify repository access and local clone capability separately. The client
performs browser confirmations; the assistant handles commands and downloads.

## Host and runtime

Resolve the plugin root from this skill's installed location, never from an assumed
developer path. The helper is `../../../scripts/setup.mjs` relative to this reference.
Use its absolute path and an explicit website checkout path in commands below.

Identify the active host from the session, not whichever executable happens to occur
first in PATH. Run the actual host's `--version` and `plugin --help`. If several binaries
exist, select the one compatible with the running host and pass `--host-bin PATH`.
An old CLI shadowing a newer one is not proof that the app lacks plugins.

The helper needs Node 22+. When missing, inspect OS, installed version managers and
package managers. Under the user's setup request, install Node in a user-owned location
using the supported official installer/version-manager flow. Reuse a suitable runtime;
do not replace a system runtime, use `sudo`, or modify shell startup files automatically.
Use the host's official supported install/update instructions if its CLI is absent.
Explain any required OS approval as one concrete step and resume afterwards.

Automatic helper mutations are currently for macOS/Linux; Windows is a guided host/CLI
workflow until separately validated. Do not claim Windows installation acceptance.
Full automatic setup requires a local coding host with shell/filesystem access. A
browser-only chat cannot install software on the client's computer.

## Inspect and install

```sh
node /absolute/plugin/scripts/setup.mjs doctor --host codex --project /absolute/website
node /absolute/plugin/scripts/setup.mjs update --host codex --project /absolute/website --with-cli --apply
```

Use `--host claude` in Claude Code. These are illustrative absolute paths; resolve real
ones before execution. Client installations use the canonical remote marketplace even
when running the helper from a fresh clone. Use `--source` with the repository root only
for local development before publication, and retain that flag for local updates.
Run `--help` for exact supported arguments.

The helper installs Website Toolkit, SiteOS, Prime and the official Sanity plugin
independently. The first three use `website-toolkit@website-toolkit`, `siteos@siteos`
and `prime@prime-skills`. Sanity uses `sanity@sanity` from `sanity-io/agent-toolkit`
in Codex, and `sanity@sanity-agent-toolkit` from the same Sanity repository
in Claude Code. An existing `sanity@claude-plugins-official` from
`anthropics/claude-plugins-official` is reused in Claude Code. Sanity's own marketplace
also works with Claude versions that cannot read the newer shared Anthropic catalog. See the [official installation instructions](https://github.com/sanity-io/agent-toolkit#option-3-install-plugin).
GitHub is a host-guided stage outside this helper, following [GitHub setup](github.md).
For a Vercel-hosted website, also follow [Vercel setup](vercel.md) to install its
official plugin through the host catalog, reuse its connection and verify access.
This guided stage is part of the full setup, but is not performed by this helper.
Do not interpret a four-plugin readback as proof that GitHub or Vercel is connected.

The helper does not copy provider skills or MCP servers. It
will not replace conflicting marketplaces, re-enable deliberately disabled plugins,
or update a non-user/ambiguous scope. Resolve the specific conflict with the client.
Do not uninstall working global plugins just to make the helper pass. When a blocker
exists, setup reports the plan without applying changes.

Website Toolkit before 0.2.0 bundled a Sanity MCP. Setup upgrades that toolkit first
and verifies the new version before adding the official Sanity plugin, preventing a
second bundled connection. A pinned or disabled old toolkit must be resolved before
this migration. Reload afterwards; the host may require new Sanity authorization.

For full setup or a requested update, use `update --apply --with-cli`: it installs
missing plugins and refreshes existing ones through their owning marketplaces. Read
back their actual versions, check them against the refreshed provider source, and
load the updated skills. Do not freeze upstream release numbers in this workflow.
`install` only fills missing plugin installations; it is not a freshness check for
existing providers. Do not update tools as a side effect of reading an SEO report.
A pinned marketplace ref needs an explicit
ref decision; refreshing it does not advance the pin. After partial failure, run doctor
before retrying. The helper checkpoint is installation evidence, not auth evidence.
Doctor reports `verificationScope: local_installation_only`, `setupComplete: false`
and `providerAccess: not_verified` even with no installation blockers. This is expected:
it does not make authenticated provider calls. `primeBindingPresent` only means a local
file exists. Neither field can replace the completion checks above.

Managed CLI setup resolves the provider's current npm `latest` tag, validates that
it is a stable version, compares the local installation, installs that exact resolved
version only if needed, and verifies the actual executable's `--version` and `--help`.
A failed lookup does not mean an older installation is current. A different newer
local version needs an explicit choice instead of an automatic downgrade.
Before provider operations, follow its freshly loaded skill and check the relevant
command's help/readiness checks. A version match alone cannot prove a needed feature
or authenticated access. Record observed versions in verification evidence, not as
evergreen instruction requirements.

Managed CLI packages live in `WEBSITE_TOOLKIT_HOME` or the user's
`~/.local/share/website-toolkit`, with their own npm cache. No global install or
shell profile edits are needed. Use:

```sh
node /absolute/plugin/scripts/setup.mjs cli siteos -- --help
node /absolute/plugin/scripts/setup.mjs cli prime -- --help
```

These wrappers only select the installed executable; provider arguments keep their
normal meaning. When following a provider skill's `npx @siteoshq/cli ...` or
`npx @primeuicom/cli ...` instructions, the corresponding wrapper may run the same
confirmed CLI. Keep secrets out of printed commands and saved reports.

## Reload and resume

Read back installations and versions. If the current session does not expose the new
skills/tools, use the host's supported reload or ask for a new session. Do not invoke
new tools against an old session catalog. Return this single resume prompt, filled
with the user's real checkout path, verified target IDs and pending checklist items
(never credentials or private config contents):

> Use Website Toolkit to continue setup for [checkout path]. The plugins were
> installed, but full setup is incomplete. Verified: [items and targets]. Pending:
> [items]. Recheck current state, finish every pending connection and verify the local
> preview. Use the current provider instructions. Preserve working connections; do
> not stop at package installation or skip Prime/SiteOS because the preview works.

Doctor rechecks actual state; it does not trust a previous success flag.

## SiteOS account, MCP and CLI

Load the installed `siteos`, its shared execution contract, `siteos-cli` and
`siteos-auth` instructions as needed. Follow their current supported auth protocol.
With no signed-in CLI session, collect email once and start sign-in. Complete the
email confirmation through the supported flow; never retain or repeat the code.
Do not invent a signup endpoint or precreate an organization. First verified sign-in
and organization provisioning are owned by SiteOS.

SiteOS's plugin owns its MCP configuration. Complete the host's OAuth flow for that
server, then call the actual context discovery tool. CLI authentication is independent
of MCP OAuth: verify both during full onboarding, or the interfaces needed by a focused task.

Discover authorized organizations and match the website's existing website Project.
Select the explicit environment; no silent Production fallback. Verify service access
and the SEO attachment. Reuse the user's exact IDs if supplied. If missing membership,
explain the invitation/access change required; do not create a replacement client
organization or bypass a denial with another account/interface.

## Prime account and connection

Load installed `primeui-page-builder` readiness instructions. Check the actual website
checkout for `.primeui/project.json` and use supported health checks. Never print its
contents. When unlinked, use the current Prime CLI setup for an existing Next.js project
with the matching AI preset; inspect `setup --help` for values rather than guessing.
For another framework, first establish support through Prime's current instructions;
do not force a Next.js setup into an incompatible project.

Use the latest installed Prime skill's current sign-in flow and verify its supported
commands. Its browser setup starts sign-in when no matching account profile exists,
including in non-interactive runs.
Keep the CLI process alive while the client opens the verification URL, signs in and
approves the displayed pairing code; continue setup automatically when it returns.
Show the provider's URL if automatic browser opening fails. Handle commands in the
assistant's terminal session; do not send the client to their Terminal or request an
emailed bootstrap command. Do not select the legacy email login method. Browser
approval is still a human step, not permission for unattended identity creation.
On expiry or denial, report the actual state and resume with a fresh supported login
when the client is ready, rather than marking Prime connected or silently skipping it.

Explicitly resolve reuse of the existing client Prime project before binding;
do not turn missing access into a duplicate project. Review setup's local diff and keep
existing website instructions and source intact. Prime's plugin owns its MCP server.
Pass explicit `projectRoot` when the host starts outside the website checkout.
Verify an actual authorized project/health read and the provider's MCP readiness check.
A local binding file alone is insufficient, and a stale/revoked account must remain
pending until a real read succeeds. Do not export a component or create a page as a test.

## Sanity and optional Figma

Install Sanity's official plugin through the same setup flow as SiteOS and Prime.
The plugin owns its skills and MCP connection to `https://mcp.sanity.io`; Website
Toolkit declares no provider MCP server. Load the installed Sanity instructions for
the current task rather than copying its skills into the toolkit or website.

Follow the host's authorization prompt. Sanity's Codex marketplace requests
authentication on installation; a CLI package-install success still does not prove
OAuth completion. In Claude Code, inspect `/mcp` when authentication needs attention.
Use the host's actual namespaced server identity, not an invented login command.
Do not copy `SANITY_VISUAL_EDITING_TOKEN` from the website or embed a bearer header.

The website or host may already declare a manual Sanity MCP. Inspect this before
setup, reuse the correctly authorized connection during migration, and resolve
redundant instances explicitly without rewriting tracked repository configuration
or silently deleting user-owned connections. Do not add another manual MCP entry
when the official plugin already supplies one.

After sign-in, discover accessible projects/datasets and deployed workspace schemas.
Match the existing website configuration using safe metadata and authorized tools;
never dump `.env`. Inspect only the necessary schema and a bounded document projection.
Do not use MCP `deploy_schema` or create an MCP-managed Studio over the repository-owned
schema to fix missing schema access. The existing Studio deployment pipeline owns it.

Figma access is needed only for a Figma task. Reuse an available Figma provider and its
mandatory skill instructions. If absent, guide supported installation/authentication;
do not claim Prime grants Figma access.

## Vercel account and local settings

When the website uses Vercel, follow [Vercel](vercel.md). Discover and install the
official plugin through the Codex catalog and complete its authorization, reusing
existing installations. Check the local CLI's sign-in separately before downloading
Development settings directly to a private file. Do not return secrets through chat
tools, duplicate an MCP connection, or invoke deployment/bootstrap as a setup check.

## Prepare the local website

For full website onboarding, follow [local preview](local-preview.md) to install the
website's own dependencies, retrieve approved local settings from its hosting provider
and open a verified preview. Sanity/Prime/SiteOS sign-in alone does not make the local
website runnable. Preserve partial progress when an invitation or missing setting
requires the client or website team.

## Finish with evidence

Apply the completion gate above. For each relevant service state: package installed, signed in, exact target resolved,
read permission verified, write permission known or still unverified. An auth screen
closing is not a successful API read. Verify access using minimal read-only calls.
Do not create CMS documents, enable services, start audits, spend credits or publish
as an onboarding smoke test. State the next human action only if it is truly required.
