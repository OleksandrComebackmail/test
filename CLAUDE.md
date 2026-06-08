# CLAUDE.md

<changelog>
- At the end of each task, append a one-bullet-per-logical-change entry to
  `.claude/docs/CHANGELOG.md` under today's date heading (`## YYYY-MM-DD`),
  newest date on top. Append only — never edit existing entries.
- Tag each bullet `[Feat]/[Fix]/[Refactor]/[Test]/[Chore]/[Docs]` and end it with
  `(@<git user.name>)`. Get the name via `git config user.name`.
- This is the LOCAL work-log only. NEVER touch the root `CHANGELOG.md` — that file
  is owned by release-please and is generated from merged PRs, grouped by version.
- Write all changelog content in English.
</changelog>
