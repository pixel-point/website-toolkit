# Acceptance boundaries

Git distribution, documentation hosting and live client acceptance are separate results.
The client guide remains a local static page until separately hosted.

## Onboarding recovery checked on 2026-10-07 (0.2.6)

- The previous setup reference still prescribed Prime's emailed Terminal command.
  It now delegates to the current provider workflow. Full setup refreshes official
  plugin sources and resolves stable npm `latest` for the CLIs, without upstream
  version floors. It cannot silently omit Prime or SiteOS. Exact versions below are
  evidence of this run, not evergreen setup requirements.
- `npm run check` passed all 26 tests. New regressions cover a moving `latest` tag,
  reusing a current installation, registry failures, prerelease rejection, executable
  mismatch, explicit downgrade decisions, provider refresh regardless of version,
  preserving pins, and installation-only verification despite a local Prime binding.
  Doctor remains read-only and does not inspect binding secrets.
- `npm run test:hosts` passed with an explicit Codex 0.160.1 executable from the
  desktop application and Claude Code 2.1.12 in disposable configuration roots.
  Both installed candidate Toolkit 0.2.6, SiteOS 2.64.0, Prime
  0.4.0+codex.20261006012536 and Sanity 1.0.0 as independent enabled plugins;
  repeat installation made no changes and an explicit source refresh passed in
  both hosts. The old Codex 0.104.0 on PATH could not
  enumerate plugins; using the verified host executable resolved that local mismatch.
- A separate disposable managed CLI installation resolved SiteOS 2.40.0 and Prime
  1.6.0 through npm `latest`, confirmed each executable's version and help, then
  checked the registry again and reused both installations on repeat.
  No login session or remote account/project was created. The skill validator passed.
- The separate RevenueCat guide passed targeted formatting, lint, typecheck and
  production build. Its generated search source contains 20 pages; all 20 built
  documentation pages retain noindex. Built Quick start contains the revised setup
  prompt and the Prime recovery link resolves to its generated heading.
- Publication is a separate step from these checks. Package tests and host installs
  do not establish a new client's browser approval,
  SiteOS email confirmation, memberships or authenticated project reads. Those remain
  explicit completion checks in the actual client session, including after a reload.

## CMS component guidance checked on 2026-10-02 (0.2.5)

- Component requests for CMS-managed pages now route through the content workflow even
  when the brief only names a design. Instructions cover route-local components, missing
  access, empty/deleted content, fixed artwork and real editing acceptance.
- An independent read-only agent pass covered all six [workflow cases](../tests/evals/cms-components.md)
  against a RevenueCat website checkout based on `2ff3ba82` plus candidate repository
  instructions. It selected CMS integration for the visual brief, preserved the access
  blocker, rejected fallback sample content, distinguished artwork from fields, honored
  the explicit isolated-prototype exception and reused an already sufficient block.
- Source inspection in that pass identified a persisted-field/query-alias mismatch and
  overbroad translation instructions in the website's local skills. Those instructions
  were corrected; no website runtime or live content was changed.
- A follow-up read-only review confirmed the field mapping, locale scope and Prime
  readiness boundaries are consistent with all six decisions. Package/reference validation
  and all 19 tests passed; the changed skill frontmatter passed the skill validator.
- This is decision-only evidence from an explicitly loaded skill, not proof of automatic
  activation, generated implementation quality or a real Sanity editing session. No provider
  authorization, draft mutation, publication or deployment occurred. Host installation
  scripts are unchanged; installation acceptance was not rerun for these instruction edits.

## GitHub setup guidance verified on 2026-09-24

- Website Toolkit 0.2.3 passed package/reference validation, all 19 existing tests,
  Codex plugin/skill validation and Claude plugin validation. The installer code and
  its four managed plugin sources did not change.
- Codex catalog discovery returned GitHub with a connector/CLI workflow. The new
  reference follows the installed provider instructions, prepares missing Git/CLI tools,
  checks local authentication separately and verifies access before cloning the exact
  existing repository. It preserves working credentials and unrelated Git configuration.
- Login, hostname-scoped credential setup, repository metadata and clone examples were
  checked against official GitHub CLI documentation and local CLI 2.78.0 help. No new
  GitHub installation, OAuth, credential-helper mutation, signup or client clone was run.
- The separate guide passed formatting, lint, typecheck and production build with 14
  indexed articles. Browser review confirmed GitHub navigation, the first-step setup
  prompt, exact copied text and a 390px page without horizontal overflow.
- Fresh-computer installation, plugin/CLI authorization, repository membership and
  organization approval still require the client's actual account. A successful
  documentation build or plugin catalog lookup does not establish that acceptance.

## Vercel setup guidance verified on 2026-09-24

- Website Toolkit 0.2.2 passed package/reference validation, all 19 existing tests,
  the Codex plugin and skill validators, and Claude plugin validation.
- Codex catalog discovery returned the official Vercel plugin. No catalog installation,
  account authorization or environment-variable export was performed on the user's account.
- An isolated direct Git-source attempt with Codex CLI 0.155.0-alpha.16.4 added
  `vercel/vercel-plugin` as a marketplace, but rejected `vercel-plugin@vercel`:
  `plugin.json name vercel does not match marketplace plugin name vercel-plugin`.
  The setup reference therefore routes Vercel through the official Codex catalog.
  It does not vendor a manifest repair or add a failing fifth entry to the helper.
- Vercel installation is a separate guided stage in the same chat. The helper still
  manages four plugins; its checkpoint is not evidence for Vercel or CLI authentication.
  The workflow uses the official CLI to export Development settings directly into a
  private ignored file and keeps decrypted values out of chat-tool responses.
- The separate client guide passed formatting, lint, typecheck and production build
  with 13 indexed articles. Desktop and 390px browser review confirmed an immediately
  visible setup prompt, the `RevenueCat/website` URL, working Vercel navigation and no
  mobile horizontal overflow. After copying in the active browser, clipboard text
  exactly matched the displayed prompt. No separate client application paste was tested.

## Sanity plugin release verified on 2026-09-24

- Website Toolkit 0.2.0 passed package checks and 19 installer/project-context tests.
  These cover official sources, reuse of an existing Sanity plugin, migration ordering,
  pinned/disabled choices and stopping when the old toolkit upgrade is unconfirmed.
- Real installs into disposable configurations passed in Codex CLI
  0.155.0-alpha.16.4 and Claude Code 2.1.12: Website Toolkit 0.2.0,
  SiteOS 2.36.1, Prime 0.2.0+codex.20260904195611 and Sanity 1.0.0
  were four independent enabled plugins. Repeating setup made no changes.
- A separate isolated upgrade from a local legacy 0.1.0 fixture passed in both hosts:
  setup replaced the toolkit before installing Sanity and reported no remaining actions.
  Codex local development sources are re-read without a Git-only marketplace refresh.
- Sanity was installed from `sanity-io/agent-toolkit` in both hosts. Claude's
  installed Sanity plugin supplied `https://mcp.sanity.io`; the installed toolkit
  contained no MCP configuration. A previously installed `sanity@claude-plugins-official`
  is recognized by the planner and covered by unit tests.
- Claude Code 2.1.12 rejected newer entries in the shared Anthropic catalog.
  Using Sanity's own official marketplace avoids that catalog compatibility issue.
- Codex plugin/skill validation and Claude marketplace/plugin validation passed.
- The separate client guide passed formatting, lint, typecheck and production build.
  Browser review confirmed Sanity installation instructions and the updated setup
  prompt for both hosts. OAuth and live CMS access were not part of these tests.

## Earlier 0.1.0 baseline verified on 2026-09-24

- Package checks and 14 installer and project-context tests passed on Node 22+.
- Real installs into disposable configurations passed in Codex CLI 0.144.6 and
  Claude Code 2.1.12: Website Toolkit 0.1.0, SiteOS 2.36.0 and Prime
  0.2.0+codex.20260904195611 remained three independent, enabled plugins.
  Repeating setup performed no installation actions.
- Isolated managed CLI installation passed for `@siteoshq/cli` 2.23.1 and
  `@primeuicom/cli` 1.5.0, including each executable's `--help` check.
  A second installation reused both packages.
- Official Codex plugin and skill validators passed. Claude's packaging validator
  passed for both the marketplace and plugin without warnings.
- The client guide was reviewed in the browser at desktop and 390px phone width.
  Host selection changes the setup prompt; copy buttons display their success state;
  the update FAQ expands. The phone layout has no horizontal overflow.
  The browser automation clipboard API returned no text, so a paste into a separate
  client application has not been verified.

Host acceptance ran on macOS. The Linux CI job runs package and installer checks;
its result must be read from the workflow run for the delivered commit.
Versions are evidence for this run, not a promise of compatibility with future releases.

## Commands

- `npm run check`: package boundaries/references and installer behavior tests.
- `npm run test:hosts`: real independent plugin installs in temporary host configuration
  roots, repeat setup and readback. Reports tested versions in `.artifacts/host-acceptance.json`.
- Official Codex plugin/skill validators and `claude plugin validate .` check packaging.
- `npm run docs:preview`: local client guide; verify host selection and clipboard behavior.

## Not established by local tests

- A new client's email sign-in, OAuth consent, invitations and actual project permissions.
- A live Sanity draft creation/update/concurrency and authenticated Presentation journey.
- A new Prime-backed component deployed through the website Sanity/rendering pipeline.
- Publication, production serving state, paid SiteOS runs, Windows setup or automatic
  compatibility with future provider releases.

Those require the appropriate accounts and separately scoped operations. A successful
package install is not described as full end-to-end client onboarding.
