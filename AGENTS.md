# Website Toolkit plugin

This repository owns one `website` orchestrator for Codex and Claude Code.
SiteOS, Prime, Sanity and Vercel remain independent plugins. Never vendor their skills, MCP servers,
credentials, or private caches here.

- Keep one user-facing skill in `plugins/website-toolkit/skills/website`.
- Put conditional workflows in its references. Do not duplicate provider runbooks.
- `doctor` is read-only. Installation requires an explicit setup/install request.
- Use supported host commands, preserve unrelated installations, and read back changes.
- Account creation is not membership in the website's existing projects.
- Never save tokens, email codes, authorization headers, or `.env` contents in artifacts.
- Keep provider authentication, CMS drafts, publication, paid checks and deployment distinct.
- Keep all client context in the website repository; never distribute an active project profile.
- Avoid hardcoded tenant IDs, a developer's paths, and a permanent copy of the component catalog.
- Run `npm run check`; use `npm run test:hosts` for isolated host acceptance.
- Keep client instructions consistent with actual executable commands. Report acceptance gaps.
- Do not commit, push, publish, or mutate live client data without user authorization.

Node 22+ is the only script runtime. Runtime scripts use the standard library and no
install-time hooks. The client documentation is a standalone static page under `docs/`.
