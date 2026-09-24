# Implementation and acceptance

The approved design is a reusable website orchestrator, independently installed GitHub, SiteOS,
Prime, Sanity and conditional Vercel plugins, and chat-driven setup in Codex and Claude Code. No upstream skills
are copied. Native Claude dependency declarations are optional; the common installer
is the compatibility path and does not require recent dependency resolver features.

1. Package one skill, conditional references, provider requirements and both marketplaces.
   Each provider plugin owns its MCP configuration and skills, including Sanity.
2. Implement read-only inventory, source-checked plugin install/update, private CLI
   installation, readback and resumable non-secret installation evidence.
3. Route provider sign-in through each installed provider's current instructions.
   Resolve existing website resources through authorized discovery. No tenant IDs
   or credentials ship in this repository.
4. Document Sanity draft, existing block reuse, Prime-to-Sanity integration, saved SEO
   and verification workflows against current code/schema, not a copied catalog.
5. Validate script behavior and real isolated host installation. Render the client guide.

The installer does not claim to authenticate accounts or prove provider access. Those
steps require the client's account in a new/reloaded session, and are performed by the
skill. Server-side roles remain the permission boundary. This local implementation
must not be described as a production publishing or paid-research acceptance.

GitHub and Vercel use host-guided installation routes within the same setup conversation.
GitHub runs before repository acquisition: discover its official catalog plugin, prepare
missing Git/CLI tools and separately verify plugin authorization, local Git credentials
and repository access. The client does not operate Git or paste tokens. See the
[GitHub workflow](../plugins/website-toolkit/skills/website/references/github.md).

Vercel then uses its separate provider flow.
In Codex, the orchestrator discovers its official catalog entry, guides installation and
authorization, then uses the official CLI for direct-to-file Development settings export.
The deterministic helper still installs four plugins; its checkpoint does not verify
Vercel installation or either Vercel session. See the [Vercel workflow](../plugins/website-toolkit/skills/website/references/vercel.md).

The install prompt requires a pushed commit and access to its source; a public
marketplace removes the GitHub invitation requirement for the toolkit. A local docs preview is not a hosted
client URL. Git push, website hosting and live Sanity draft acceptance are separate steps.

## Project boundary

Website Toolkit owns one `website` skill, provider routing, setup scripts and host
manifests. Website repositories own their domain, design, CMS architecture and optional
`.website-toolkit/project.json`. The package ships only a synthetic example. The
helper inspects this file without writing or printing provider identifiers; the skill
verifies actual access and current implementation before using its hints.

The existing website shell, typography, colors, buttons and component variants remain
the base for new pages. Prime supplies missing pieces through its current workflows.
Sanity-specific guidance is conditional; the toolkit does not replace another CMS.
