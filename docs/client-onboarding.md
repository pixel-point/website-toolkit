# Client onboarding: Codex and a local website

The RevenueCat client guide presents one host: Codex. It starts before plugin
installation, with OpenAI's current desktop download page and selecting a local
website folder. The general-purpose toolkit still supports Codex and Claude Code.

## Current delivery

The guide's single setup prompt delegates these actions to the coding assistant:

1. Obtain the authorized existing website repository and preserve existing local work.
2. Read the website's instructions, install its runtime and dependencies.
3. Install independent Website Toolkit, SiteOS, Prime and Sanity plugins as needed.
4. Sign in through each provider's supported flow and select existing resources.
5. Retrieve approved local settings, using Vercel Development when appropriate.
6. Start the website and verify actual content in a local browser preview.

The client installs/opens the desktop application, selects a folder, pastes the prompt
and completes account confirmations. The documentation website copies the prompt; it
does not execute local setup or receive credentials. A button must describe that actual
action, not claim that installation or account access is already complete.

GitHub appears as an access step, not a manual Git tutorial. Vercel settings stay in
private Git-ignored files; the assistant reports missing key names without exposing
values. The website team's secure settings handoff is available when the client does
not have Vercel access. Do not fall back to Production or imply that Sanity plugin
OAuth authenticates the website renderer.

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
