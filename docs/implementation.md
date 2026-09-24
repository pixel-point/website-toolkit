# Implementation and acceptance

The approved design is a reusable website orchestrator, independently installed SiteOS
and Prime plugins, and chat-driven setup in Codex and Claude Code. No upstream skills
are copied. Native Claude dependency declarations are optional; the common installer
is the compatibility path and does not require recent dependency resolver features.

1. Package one skill, conditional references, Sanity OAuth MCP, and both marketplaces.
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
