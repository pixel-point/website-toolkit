# Project-owned context

The installed toolkit is shared across websites. Resolve the user's actual website
checkout on each task; never carry another client's domain, IDs or source paths into it.
Read its root and relevant nested AGENTS.md files, local skills, current implementation
and existing provider configuration. The explicit current task target takes precedence
over saved defaults; verify mismatches before a provider operation.

An optional `.website-toolkit/project.json` at the website root records non-secret
context. Start from `../../../project.example.json` relative to this reference.
The example is only a template, never an active target. The toolkit repository is not
the website. Pass the website root explicitly to `doctor`, `install` and `update`.

The profile has `schemaVersion: 1`, optional `name`, `website`, `repositories`,
`providers` and `sourcePaths` fields. `repositories` contains GitHub `owner/repo`
identifiers or HTTPS/SSH Git URLs. `sourcePaths` maps descriptive keys (such as `header`,
`styles`, `pageSchema`, `renderer`, `locales` or `preview`) to paths relative to the
website root. Discover and verify paths; do not insert an example's structure by habit.
Source paths are hints, not proof that a file or component is current or deployed.

Provider fields:

- SiteOS: `origin`, `organizationId`, `projectId`, `environment`.
- Sanity: `projectId`, `dataset`, `workspace`.
- Prime: `projectId`.

Use null for unresolved values. IDs and names never establish account permission.
Provider tools and their current canonical configuration remain authoritative; this
profile does not replace a Prime binding, SiteOS context or Sanity workspace config.
Unknown providers or fields require an intentional schema change, not arbitrary keys.

During an authorized setup, create or update the profile using already supplied or
verified context. Preserve existing entries and resolve conflicts rather than overwrite.
Keep machine-local profiles out of Git using the website repository's local exclude
file. A team may instead explicitly track a non-secret profile in its own repository.
Never copy a real client profile into the toolkit source or distribution.

Do not put tokens, auth headers, emails, one-time codes, credential-bearing URLs,
`.env` values or absolute machine paths here. Authentication remains in provider-owned
stores. The helper reads the profile without writing and reports metadata only.
Missing or invalid context must not silently select another project or Production.

Without a profile, inspect the existing project and verify the target from the user's
request and supported provider discovery. A profile is optional for installation;
an exact authorized target is required before operating on client resources.
