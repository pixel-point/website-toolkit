# Client onboarding: Codex and a local website

The RevenueCat client guide presents one host: Codex. It starts before plugin
installation, with OpenAI's current desktop download page and selecting a local
website folder. The general-purpose toolkit still supports Codex and Claude Code.

## Current delivery

The guide's single setup prompt delegates these actions to the coding assistant:

1. Connect the official GitHub plugin through the Codex catalog, prepare missing Git
   and GitHub CLI tools, guide browser sign-in and verify local Git access. Obtain the
   authorized existing website repository and preserve existing local work.
2. Read the website's instructions, install its runtime and dependencies.
3. Install/update independent Website Toolkit, SiteOS, Prime and Sanity plugins from
   their current official sources. Resolve CLI `latest`, verify the actual executable
   and required commands, then load the updated provider instructions.
   For this Vercel-hosted website, install the official Vercel plugin through the Codex
   catalog as another guided step in the same conversation, reusing any existing connection.
4. Sign in through each provider's current supported flow and verify existing resources.
   Prime uses browser approval; keep the login process alive
   and resume after approval. Do not send the client an emailed Terminal command.
   SiteOS CLI and MCP sign-in are independent; verify both against the same target.
5. Retrieve approved local settings, using Vercel Development when appropriate.
6. Start the website and verify actual content in a local browser preview.

Keep these items as a completion checklist. A required pending connection means setup
is incomplete, even with a working preview. Only the user can defer a baseline provider;
report that as partial setup. Preserve verified targets and pending actions in the resume
message after a host reload. The helper checks local installation, not authenticated access.

The client installs/opens the desktop application, selects a folder, pastes the prompt
and completes account confirmations. The documentation website copies the prompt; it
does not execute local setup or receive credentials. A button must describe that actual
action, not claim that installation or account access is already complete.

GitHub appears as an assisted connection step, not a manual Git tutorial. The agent
handles plugin/local tool installation, credential integration and cloning. The client
completes account confirmations and any invitation or organization approval. A plugin
connection does not by itself authenticate local Git; reuse the installed plugin
workflow or supported GitHub CLI browser sign-in. These guided steps are outside the
four-plugin helper.

Vercel settings stay in private Git-ignored files; the assistant reports missing key names without exposing
values. The website team's secure settings handoff is available when the client does
not have Vercel access. Do not fall back to Production or imply that Sanity plugin
OAuth authenticates the website renderer.

Vercel plugin authorization and local CLI sign-in are separate. The assistant explains
an additional sign-in when needed, then exports settings directly to the local file
with the CLI. It must not request secret values in an MCP response. The helper's
four-plugin checkpoint does not verify the separate Vercel catalog installation.

## Proposed next step: SiteOS repository connection

This is a proposal for separate SiteOS work, not an implemented dependency of onboarding.

A useful first slice would bind an explicitly selected GitHub repository and default
working branch to the existing SiteOS website Project. A “Prepare in Codex” action could
provide a project-specific setup prompt containing verified non-secret repository,
website and provider context. Use a supported native handoff only when the selected
Codex host actually exposes it; a copyable prompt is the working baseline today.

That connection can remove repeated repository selection. It does not by itself give
local Git credentials, filesystem access, Vercel secret access or permission to publish.
Codex remains responsible for preparing the local checkout and running the preview.
Vercel remains the source of environment settings; do not turn a repository integration
into a general secret-export service.

If scoped clone authorization, pull requests or environment bootstrap are later added,
review the provider permissions, organization/project access, revocation and local
handoff as their own contracts. Keep GitHub credentials with SiteOS Integrations and
website identity/bindings with Projects, rather than creating a second website authority
inside the toolkit. Do not add this unimplemented future flow to the client's Quick start.

## Verification boundary

The guide and workflow can be validated through package checks, build and browser
interaction. A clean-computer acceptance with the client's GitHub/Vercel memberships,
Development settings, provider consent and actual local website preview is a separate
account-dependent verification. Documentation changes alone do not establish it.
