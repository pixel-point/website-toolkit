# Acceptance boundaries

Git distribution, documentation hosting and live client acceptance are separate results.
The client guide remains a local static page until separately hosted.

## Verified locally on 2026-09-24

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
