# CMS component workflow evaluations

These cases check agent decisions, separately from `npm run check` (package/script
contracts) and `npm run test:hosts` (installation). Run them when changing component
routing, CMS ownership or editing acceptance. They are not assertions about exact wording.

## Run conditions

Use a fresh agent session with the candidate Website Toolkit plugin and a disposable
checkout of a representative Sanity/PageBuilder website. Record the host/model, plugin
source revision or diff, website revision and available providers. Give the agent the
case prompt and website context, not the review criteria or a previous answer. Let it
discover repository instructions and the relevant plugin references normally.

For a decision-only pass, allow source reads and ask for the implementation and verification
plan without performing writes. For an implementation pass, allow changes only in the
disposable checkout and an explicitly authorized test CMS dataset. Never use a customer's
live page as a fixture or supply real credentials in the case. Keep outputs under ignored
`.artifacts/` or outside the checkout. Inspect actions and generated artifacts as well as
the final answer; record omissions/failures, not just an overall pass.

Decision-only evidence does not prove automatic skill activation, generated code quality,
provider authentication, Studio persistence or live draft preview. Installation acceptance
does not prove these either. Complete those separate checks before claiming end-to-end success.

## Cases

### 1. Visual brief without naming the CMS

Context: the target URL resolves through the website's Sanity PageBuilder. Supplied
reference is a bento layout; approved copy is provided. No publication is requested.

Prompt:

> Build a bento section for our existing AI feature page using the attached reference
> and approved copy. Use four groups: Diagnose — explain revenue changes; Benchmark —
> compare conversion; Build — create offerings and paywalls; Experiment — run and read
> tests. Make the Experiment group the largest and put it last. Adjust the copy to fit.

Review: inspect existing blocks first; select CMS integration despite no mention of
Sanity; load both component/design and Sanity workflows. Preserve the existing shell.
No slug-specific injection or code-owned marketing data. Include actual editing acceptance
and leave content in drafts. The client must not need to add "make it editable".

### 2. Missing CMS access

Context: source is available but provider authorization is denied; no real draft preview
can be read. Installation or a local schema file is not evidence of provider access.

Prompt:

> The section needs to be ready for review today. Sanity access is not working yet.
> Keep making progress on the section and show what is ready.

Review: prepare compatible source work and clearly isolated fixtures if useful; report
the missing CMS checks and the required access step. Do not inject fixtures into production
routing, create substitute projects or claim CMS verification succeeded.

### 3. Editor removal and empty content

Context: the renderer has fallback sample cards when the CMS array is empty. An editor
removed every card but the preview shows the sample content again.

Prompt:

> I deleted all cards in the editor, but they reappear in preview. Fix this.

Review: remove the production content fallback; verify that deletions/empty arrays stay
empty and removing the section removes it. Do not repopulate the draft. Use disposable
content for destructive acceptance; preserve unrelated work and revisions.

### 4. Prepared illustration versus editable copy

Context: cards have CMS headings and a replaceable illustration. Labels/numbers inside
the illustration are fixed; no approved product screenshot has been supplied.

Prompt:

> Finish this card and tell our editor what they can change. They may need to update
> the number shown inside the illustration later.

Review: expose the requested internal value as a field or identify whole-artwork replacement
and the remaining decision. Do not claim the entire illustration is editable or call a mock
an actual screenshot. Keep card copy editable independently of artwork.

### 5. Explicit isolated prototype

Context: same CMS website, but the request explicitly limits the work to a throwaway demo.

Prompt:

> Make a disposable local visual prototype with sample data. Do not connect it to Sanity
> or the website's production routes; I only want to compare two layouts.

Review: honor the prototype scope; isolated fixtures are allowed and must be labelled.
Do not require CMS setup or introduce production route changes. Do not claim a production
CMS feature is complete.

### 6. Reuse before a new schema

Context: a current CMS block already supports the requested cards, image and CTA fields.

Prompt:

> Add a three-card feature section with these approved headings, images and links.

Review: reuse the existing supported block and preserve draft state. CMS-first does not
mean adding a schema or using Prime for every section. Verify the real draft preview;
explain any unavailable checks rather than recreating the content in code.
