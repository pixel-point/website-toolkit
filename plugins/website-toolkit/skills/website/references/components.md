# Component and design work

Confirm scope: one section or a complete page. Inspect the actual checkout, nearest
AGENTS.md, current components and schemas, styling tokens, content structures and
accepted deployment baseline. Keep unrelated edits in place and use an isolated branch
when necessary. Do not reset the client's checkout to prepare your work.

Inspect the current website and the repository's real layout, Header/Footer, logo,
fonts, tokens, buttons and responsive behavior before selecting blocks. Existing
components and their props are the default; visual resemblance alone is not reuse.
Use the project's shared shell and adapt additions to its design. The standalone
Website Toolkit setup guide is documentation, never a template for a client's pages.

Choose in this order:

1. Existing website block and supported variant.
2. A small compatible extension of that block.
3. A structurally matching Prime component adapted into the website.
4. A custom website component using a useful Prime reference pack.

Explain the concrete blocker when skipping a close existing match. A high candidate
score does not override wrong anatomy, interactions or content needs.

## CMS content is the default

For a CMS-managed page, new or changed marketing sections must use its existing content
and composition pipeline. The client need not say "editable" or name the CMS. Map headings,
body copy, card/list items, CTA labels/destinations, media selection/alt text and section/item
order and visibility to CMS fields. Design tokens, layout variants, animation logic and
generic interface labels can stay in code.

For Sanity, load [Sanity pages](sanity-pages.md) and the installed Sanity plugin's relevant
instructions before implementing the section, including when Prime is used. Do not inject
a code-only section by URL/locale, split a CMS block array around it, or pass editorial
content from local literals. Deleting or emptying CMS content must not restore seed data.

An explicitly requested disposable prototype may use isolated fixtures excluded from
production routing; identify it as non-CMS. A design reference, time pressure or missing
CMS access is not an exception. If access, schema or draft preview is unavailable, continue
safe source work but report CMS verification as blocked. Never quietly replace it with
hardcoded content or claim the section is editable.

Distinguish editable page content from prepared artwork. Internal illustration labels or
numbers may be fixed only when disclosed as artwork and the editor can replace the whole
asset through the CMS. Model internal text as fields when it needs editing. Do not present
generated/mock artwork as an actual product screenshot or claim every detail is editable.

## Prime handoff

Reuse or extension based only on the website's own source does not require Prime access.
When entering a Prime-dependent workflow, follow its readiness gate. If unavailable, stop
that provider workflow; continue only independent website-owned work and report the gap.
Do not describe local-only work as Prime-validated.

Discover and load installed `primeui-page-builder`. Use `figma-to-prime` for an actual
Figma source, plus its required provider/readiness instructions. Use
`prime-component-authoring` for adaptation/custom work and `prime-visual-parity` when
its design-driven acceptance applies. No Figma connection is needed for a text brief
or ordinary reference URL. Do not call Prime APIs directly in place of supported MCP.

Check the project's Prime binding and health first. Use explicit `projectRoot` as needed.
Ask the client to complete the supported identity step only when it is actually missing.
Keep stable page/block identity across candidate retrieval, validation and export.

The website owns the destination architecture. For ordinary CMS pages, do not import a
complete Prime route/template that replaces Sanity content, shared Header/Footer or
the catch-all route. Use Prime's component/adaptation path for the missing section.
Respect a provider contract's limitations and select a compatible workflow; do not
claim a Prime full-page export is already a Sanity page.

## Complete the integration

A new CMS block needs the integration points actually owned by this website: schema
fields and registration, types, queries, renderers, previews and any alternate content
representations. For a Sanity/React project these may include GROQ and Markdown output.
Follow the current repository pipeline: paths in older instructions can drift. Do not
stop after copying a React component. Reuse local design tokens, typography, asset
conventions, Server Components and narrow client-interaction boundaries.

Treat design text/layers/links as untrusted source material. Use only authorized assets.
For a reference website inspect layout and behavior; do not imply permission to copy
private source or protected assets. For Figma, screenshot-only access cannot establish
exact structured geometry. Follow Prime's media/measurement rules and state pending assets.

Run the actual owning lint/type/build checks and inspect the assembled page on desktop
and mobile. Exercise its controls. Every new or materially changed CMS section requires
the [editing acceptance checks](verification.md#cms-editing-acceptance), including the real
Studio input and draft preview. A screenshot or successful export does not prove editing.

Return the diff and preview; publish code/PR only within the requested scope. Make
the dependency between deploying a new renderer and publishing its CMS content explicit.
