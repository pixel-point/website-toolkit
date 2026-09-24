# GitHub connection and local repository setup

Use before obtaining a GitHub-hosted website, including when the toolkit itself has
not been downloaded yet. A full setup request authorizes installing missing local
prerequisites, initiating sign-in and cloning the specified existing repository.
Perform the technical steps; the client only completes account, OS and access
confirmations that require their identity. Do not turn onboarding into a Git tutorial.

## Connect the plugin first

In Codex, inspect existing plugins and tools, then find **GitHub** in the official
host catalog when missing. Use the exact discovery result and supported installation
action; do not guess a marketplace ID or copy plugin files. Follow the installed
GitHub plugin's current instructions, including any supported local credential bridge.
Guide the client through installation and browser authorization, read back the
connection and inspect the specified repository through an available read tool.
If the host requires a reload, save non-secret progress and provide one resume prompt.

For another host, use an available official GitHub integration and its supported
installation flow. Do not translate Codex catalog references into guessed commands.
The deterministic helper manages Website Toolkit, SiteOS, Prime and Sanity; GitHub
and Vercel are host-guided stages in the same conversation. Its checkpoint does not
verify either catalog connection or local Git credentials.

## Prepare local tools and authentication

1. Inspect the OS, `git --version`, `gh --version` and any working repository access.
   Install missing tools yourself through the current official Git and
   [GitHub CLI installation flow](https://github.com/cli/cli#installation) for that OS.
   Prefer an existing package manager or user-owned install location. Do not bootstrap
   a new system package manager, use `sudo` or replace a working installation silently.
   If an OS installer needs the user, open/explain that one step, then resume. Use
   resolved executable paths when a running Codex process has not refreshed PATH.
2. A connected plugin is not proof that local Git or `gh` can authenticate. Follow any
   documented credential bridge supplied by the installed plugin first. Otherwise
   inspect `gh auth status --hostname github.com` without `--show-token`. Verify the
   selected account and repository with a bounded read. Reuse working credentials;
   never extract a plugin token, borrow a developer's identity or log out other accounts.
3. If local sign-in is missing, run the official browser/device flow. For a new local
   GitHub setup, prefer HTTPS so no SSH key creation/upload is needed:

   ```sh
   gh auth login --hostname github.com --git-protocol https --web
   ```

   Run interactively, explain the browser/device confirmation and resume after it.
   Preserve an existing working SSH setup. Do not ask the client to run commands,
   create a personal access token or paste passwords, tokens or device codes into chat.
   If they need an account, guide them to GitHub's signup; they complete personal
   identity, password and account confirmations themselves.
4. Use the provider's OS credential store. Never use `--insecure-storage`, print
   `gh auth token` or include credentials in clone URLs, config examples or checkpoints.
   If the CLI reports a plaintext-storage fallback, repair the supported credential
   store before calling secure setup complete; do not silently accept that fallback.
5. Check local Git access separately. When HTTPS Git needs the GitHub CLI helper,
   first preserve any working existing credential integration. For a fresh GitHub
   configuration, the supported setup is:

   ```sh
   gh auth setup-git --hostname github.com
   ```

   This narrowly scoped credential configuration is part of the authorized GitHub
   setup. It can write GitHub-specific user Git settings. Do not replace a custom
   helper without resolving the conflict or alter other hosts, commit name/email,
   signing settings or existing remote protocols. Use the installed plugin's supported
   scoped alternative if it provides one. A plugin connection must not be copied as
   a raw credential into Git configuration.

## Verify the repository and obtain the checkout

Use the exact repository from the user or verified project context. With the real
owner/repository and an empty destination resolved, these are supported shapes:

```sh
gh repo view OWNER/REPOSITORY --json nameWithOwner,url,viewerPermission
git ls-remote https://github.com/OWNER/REPOSITORY.git HEAD
gh repo clone https://github.com/OWNER/REPOSITORY.git /absolute/empty/website
```

API visibility, Git transport and write permission are different checks. A successful
public read does not establish permission to push. Setup needs a usable checkout,
not a test commit, push or pull request. A private repository returning not-found
may mean access is missing; do not replace it with a fork or a similarly named repo.

Missing access can require a repository invitation, selection of that repository in
the plugin connection, organization approval for the app, or company SSO. Use the
actual error and [GitHub's authorization guidance](https://docs.github.com/en/apps/oauth-apps/using-oauth-apps/authorizing-oauth-apps)
to identify the necessary action. Explain it in plain language, give the repository
link and a short invitation-request text for the client to share. Do not send that
request to others, grant access, change repository visibility or create a replacement
repository as a workaround. Account creation alone never grants repository access.

Follow [local preview](local-preview.md) to reuse a matching checkout, preserve local
work and choose a suitable destination. Recheck its remote identity and expected
website files, then continue dependencies, local settings and browser preview. Never
clone over unrelated files. A pre-existing checkout is not evidence of current GitHub
access, and successful plugin authorization alone is not evidence of a local clone.

On interruption, report plugin connection, local tool readiness, CLI/Git access and
checkout path separately. Resume from fresh evidence rather than repeating installs
or creating another copy. If local Git works while the plugin awaits approval, keep
preparing the website and clearly leave that connection pending.

Command references: [login](https://cli.github.com/manual/gh_auth_login),
[Git credential helper](https://cli.github.com/manual/gh_auth_setup-git),
[clone](https://cli.github.com/manual/gh_repo_clone).
