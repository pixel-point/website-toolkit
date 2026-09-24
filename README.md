# Website Toolkit

Manage an existing website through AI chat in **Codex and Claude Code**.
One `website` skill coordinates **SiteOS**, **Prime** and **Sanity**, with guided setup,
connection checks and project-specific context. SiteOS, Prime and Sanity stay independently
installed and updated; their skills and MCP servers are never copied into this package.

## Start through chat

Open your website project in your coding assistant and paste:

> Set up Website Toolkit from https://github.com/pixel-point/website-toolkit.
> Read its README and setup instructions, identify whether this session is Codex or
> Claude Code, and check the available runtime and host CLI. Find my existing website
> checkout or help me obtain the authorized repository. Install Website Toolkit and
> missing SiteOS, Prime and Sanity plugins from their own sources, along with the required CLIs.
> Preserve my existing configuration. Read the website's project instructions and
> verify its domain, components and provider context. Guide me through sign-in to
> Sanity, SiteOS and Prime, select the existing projects, and verify access. If a reload
> is needed, save progress and give me one resume prompt. Do not publish content, deploy
> code, create replacement projects or run paid checks during setup. Tell me what is
> ready and the next step for anything missing. Prepare the website's local settings
> from its existing hosting provider (Vercel Development settings when applicable),
> install its dependencies, start its development server and open a verified preview.
> Keep secrets out of chat and Git, preserve existing settings, and explain missing
> access or values without substituting Production secrets.

If this repository or the website source is private, the assistant needs your authorized
Git access to download it. Public plugin distribution does not grant access to website
source, CMS data or service accounts. Email/OAuth confirmations and team invitations
may need your action; the assistant performs supported setup around those steps.

Then ask naturally:

- “Show me the most useful actions from the latest saved SEO report.”
- “Create a draft landing page from this brief using our existing blocks.”
- “Update this page's headline and SEO description and show me a preview.”
- “Build this section from my design. Reuse our components first, then use Prime if needed.”

Website pages use the current project's layout, Header/Footer, fonts, colors, buttons
and components. Prime supplies missing pieces adapted to that design. The toolkit's
standalone setup guide is documentation, not a client website template.

Content starts in drafts unless publication is requested. Code changes, CMS publication
and live deployment are separate outcomes. Paid checks follow the authorized scope.

## Installation commands

After cloning this repository, confirm Node.js 22+ and a host CLI with plugin support.
Use the **website checkout**, not this toolkit repository, as `--project`.

```sh
node plugins/website-toolkit/scripts/setup.mjs doctor --host codex --project /path/to/website
node plugins/website-toolkit/scripts/setup.mjs install --host codex --project /path/to/website --with-cli --apply
```

Use `--host claude` for Claude Code. If PATH selects the wrong host version, pass
`--host-bin /path/to/the/correct/host`. Start a new session or use a supported plugin
reload, then ask the `website` skill to finish sign-in and resource verification.
Installation does not authenticate you or prove access.

The common installer adds four independent plugins: Website Toolkit, SiteOS, Prime
and the [official Sanity plugin](https://github.com/sanity-io/agent-toolkit).
Website Toolkit contributes its orchestrator and setup helpers. Each provider owns
its skills, MCP configuration and authentication flow.

| Plugin | Codex | Claude Code |
| --- | --- | --- |
| Website Toolkit | `website-toolkit@website-toolkit` | `website-toolkit@website-toolkit` |
| SiteOS | `siteos@siteos` | `siteos@siteos` |
| Prime | `prime@prime-skills` | `prime@prime-skills` |
| Sanity | `sanity@sanity` | `sanity@sanity-agent-toolkit` |

Both hosts use Sanity's own `sanity-io/agent-toolkit` repository. An existing Claude
Code installation from `anthropics/claude-plugins-official` is also recognized and
reused. Sanity's plugin provides its MCP connection and skills.
Complete the host's Sanity authorization prompt, then verify access to the existing
website project and dataset. No manual MCP server entry or copied token is needed.

### From a new computer to a local preview

The client guide can focus on Codex: install the desktop app, choose a local folder,
and paste one setup prompt. The assistant handles authorized repository download,
required software, provider plugins, local settings and the preview. GitHub is an
account access step, not a client Git tutorial. The toolkit continues to support both
hosts; the dedicated client documentation may present only the selected host.

For a Vercel-hosted website, retrieve Development settings from the verified existing
project into the repository-supported, Git-ignored environment file. Preserve existing
local values and never show or commit secrets. Missing access or settings requires an
invitation or an approved handoff from the website team. Do not fall back to Production.
The assistant must verify a real page in the browser before calling local setup ready.
See [website files and local preview](plugins/website-toolkit/skills/website/references/local-preview.md).

### Project context

The website owns its context. During setup, the agent can create
`.website-toolkit/project.json` in the website checkout from the bundled
[example](plugins/website-toolkit/project.example.json). It records the domain,
repository identities, non-secret provider IDs and source-path hints. Unresolved IDs
stay null. The profile is optional; verified context from the current task and provider
configuration is still required before operating on client resources.

Keep a local profile out of Git using the website repository's local exclude file.
A team may explicitly track a non-secret profile in its own website repository.
Never place a real client profile or credentials in this toolkit's public distribution.
See [project context](plugins/website-toolkit/skills/website/references/project-context.md).

### Updates and diagnostics

```sh
node plugins/website-toolkit/scripts/setup.mjs update --host codex --project /path/to/website --with-cli --apply
node plugins/website-toolkit/scripts/setup.mjs cli siteos -- --help
node plugins/website-toolkit/scripts/setup.mjs cli prime -- --help
```

Use `--source .` only for local development and retain it on local updates.
Client installations use the canonical remote marketplace, even when the helper runs
from a clone. Doctor and mutation commands without `--apply` do not write.
Setup preserves working installations and reports source conflicts, disabled plugins,
ambiguous scopes and pinned-ref upgrades instead of silently replacing them. Resolve
reported blockers before applying the plan.

Version 0.2.0 moves Sanity MCP ownership to the official Sanity plugin. Setup upgrades
an older Website Toolkit first and verifies the new version before installing Sanity.
Reload the host afterwards and complete Sanity authorization if prompted. Existing
manually configured Sanity servers are inspected by the skill; setup never silently
removes a working connection or rewrites the website's MCP configuration.

Managed CLIs and non-secret checkpoints live under `~/.local/share/website-toolkit`;
override with `WEBSITE_TOOLKIT_HOME`. A separate npm cache avoids global installs,
`sudo` and shell-profile changes. Authentication stays in provider-owned stores.
Normal upstream plugin updates do not require a new Website Toolkit release.

Automatic helper mutations target macOS/Linux; Windows needs guided host commands
until validated. Existing non-Sanity sites can use relevant provider workflows, but the
bundled CMS draft workflow is Sanity-specific and does not migrate another CMS.

## Development and verification

```sh
npm run check
npm run test:hosts
npm run docs:preview
```

No dependency installation is needed for repository checks. Host acceptance installs
plugins into disposable configuration roots, repeats setup and checks the installed
state. It does not sign in, mutate provider data or change your normal installation.
Set `WEBSITE_TOOLKIT_CODEX_BIN` or `WEBSITE_TOOLKIT_CLAUDE_BIN` if needed.
Set `WEBSITE_TOOLKIT_TEST_SOURCE=remote` to verify the published marketplace instead of
the local source. The repository must already be pushed and accessible for that check.

- [Orchestrator](plugins/website-toolkit/skills/website/SKILL.md)
- [Setup and identity](plugins/website-toolkit/skills/website/references/setup.md)
- [Architecture](docs/implementation.md)
- [Acceptance evidence and limits](docs/acceptance.md)
- [Client guide](docs/index.html)

The static guide can be hosted separately. A Git push does not host it or grant client
access; a localhost preview is only visible on the machine running it.
