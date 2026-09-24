# Prepare a website and its local preview

Use this during an explicit first-time setup or local-preview request. The client does
not need to operate Git, package managers or environment files. Carry out supported
local actions and explain only the next sign-in, invitation or missing fact they need
to supply. Setup is incomplete until the actual website can be opened locally, or a
specific blocker and completed steps have been reported.

## Get the existing website

For GitHub repositories, first follow [GitHub setup](github.md): install/reuse the
official host plugin, prepare missing Git/CLI tools, guide browser sign-in and verify
the exact repository plus local Git access. This can happen before downloading the
toolkit. The client does not need to operate GitHub or install command-line tools by hand.

1. Resolve the repository from the user's target or verified website context. The
   toolkit repository and the documentation repository are not the website.
2. Inspect the selected folder and existing Git remote without reading secrets. Reuse
   a matching checkout and preserve its branch and uncommitted work. Do not reset,
   clean or switch branches simply to prepare a preview.
3. If no checkout exists, use the available supported Git/GitHub tooling to clone the
   authorized repository into an empty selected destination. A full setup request
   authorizes this local download. Check Git and the user's authentication first;
   use the official browser/device sign-in when needed. A GitHub MCP connection or
   future SiteOS integration is not proof that local Git can authenticate.
4. Never clone over a non-empty directory or use a ZIP as a substitute for a usable Git
   checkout. If the selected folder is unsuitable, choose a separate empty destination
   within the authorized workspace and explain the exact website folder to open in
   Codex. Reuse a native project-opening action only when actually supported; otherwise
   give one short folder-selection instruction and a resume prompt.
5. Recheck the cloned repository identity. Read AGENTS.md, README, package manifests,
   lockfiles, runtime declarations and relevant local guides before running scripts.
   Do not recursively inspect unrelated repositories or alter unrelated Git settings.
   The narrowly scoped GitHub credential setup in [GitHub setup](github.md) is the
   only user-level Git configuration needed here. Missing repository access needs
   the correct invitation or provider authorization, not a replacement repository.

## Install what the website requires

The toolkit's Node 22+ requirement is separate from the website's own runtime. Discover
and use the website's pinned package manager and compatible runtime. Reuse or install
missing prerequisites through their supported user-level flows; explain any OS-owned
approval as one step. Inspect install/prepare scripts and follow the repository's
instructions. Install dependencies without replacing the lockfile or adding a second
package manager. Then follow [setup](setup.md) for independent provider plugins and
sign-in; plugin OAuth does not populate the website's environment files.

## Retrieve local settings from Vercel when applicable

Use the hosting provider already configured for this website. These Vercel instructions
are conditional, not a universal provider requirement. First follow [Vercel](vercel.md)
to install/reuse the official plugin, authorize its connection and verify the existing
project. The common helper does not install Vercel; the orchestrator handles that
through the host's plugin catalog. Plugin OAuth does not authenticate the local CLI.
Keep exporting secret values on the local CLI path, never in a chat-tool response.
Read its current
[CLI environment documentation](https://vercel.com/docs/cli/env) and command `--help`
when needed. Reuse a compatible CLI, or run the official `vercel` package using the
available package runner. Do not add a hosting SDK to the website for onboarding.

1. Inspect existing Vercel linkage using non-secret project metadata. Verify the exact
   team and project against the website repository/domain and user access. Preserve
   valid linkage. Resolve ambiguity with one focused question, not a guessed project.
2. Use supported `vercel login` when the user is not authenticated. The user completes
   browser authorization. Never ask them to paste a Vercel token into chat.
3. When linkage is absent, run `vercel link` and select the verified **existing** project.
   Never take the create-project path or use unattended defaults that infer a project
   from the folder name. Verify the resulting linkage before retrieving settings.
4. Confirm which local environment filename the framework and repository consume,
   such as `.env.local` for Next.js. Ensure environment files, `.vercel` and any
   temporary private files are ignored by Git before writing sensitive data. Do not
   replace a working settings file. For an existing file, download to a private,
   ignored temporary file and reconcile required keys locally without displaying
   values or overwriting custom settings; resolve genuine conflicts explicitly.
5. For a fresh Next.js settings file, the supported shape is:

   ```sh
   vercel env pull .env.local --environment=development
   ```

   Target **Development** explicitly. Use the existing verified team/project context.
   Do not import Production or Preview as a fallback, modify remote environment
   variables, or create services to make the command pass. If Development values are
   missing, explain which key names or invitation the website team must provide.
6. Keep secrets in private local files with restrictive permissions. Never echo values,
   print `.env`, embed secrets in command arguments, record them in progress artifacts,
   or commit them. Review logs before sharing errors. A team may supply an approved
   local file via its secure handoff instead of granting the client Vercel access.
7. Validate required keys from the current source/example and repository contract,
   including a local website URL where required. Inspect presence and parseability
   without printing values. CMS project/dataset access and local preview credentials
   are separate from Sanity plugin OAuth. Do not invent missing credentials.

For `vercel dev` or `vercel build`, follow the provider's `vercel pull` cache workflow
instead. Prefer the website's own development command when Vercel-specific emulation
is unnecessary. Never run bare `vercel`, `vercel deploy` or publication commands as a
local setup step.

## Start and verify

Use the repository's development command and a free loopback port. Reuse a matching
existing server; do not kill an unrelated process or expose the preview publicly.
Keep the server running for the client and open its actual URL when supported.

Verify a representative website page in the browser, including real content and
required assets. A process saying "ready", an empty placeholder, or installed plugins
alone is insufficient. Check Sanity draft preview separately when requested and
supported; do not create a CMS document or submit a live form as a smoke test.

Report: website folder, preview URL, provider connection status, local settings
readiness and any precise remaining blocker. Keep completed website preparation usable
if an optional provider remains unavailable. On future sessions, inspect readiness and
start the existing preview without repeating the entire onboarding flow.
