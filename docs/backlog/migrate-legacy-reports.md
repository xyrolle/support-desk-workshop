# Migrate the legacy reports module

Needs: `v2/base`. Run it after chapter 1: orientation quest 5 is about this module.

## User story

As a developer on the team, I want the volume report written like the rest of the API, so
that nobody copies raw SQL and UTC-only dates into new code again, without changing a
single number the ops team's spreadsheet reads.

## Acceptance checks

- [ ] `apps/api/src/modules/reports/reports.test.ts` passes **without any change** (the
      safety net): same route, same query parameters, same snake_case JSON, same numbers,
      same error messages.
- [ ] The report uses a repository with the Drizzle query builder; no SQL strings, no
      `$client`, no `as` casts. The response has a zod schema in `packages/shared`.
- [ ] The route validates `from` and `to` with `validate("query", ...)` and a shared schema,
      keeping the existing messages ("from must be a date written as YYYY-MM-DD.", ...).
- [ ] Days are still whole UTC days (the spreadsheet expects them); the helpers it needs
      live in `lib/dates.ts` with tests, and `legacy-dates.ts` (with its test) is deleted.
- [ ] "Today" comes from the request's clock, not `new Date()`.
- [ ] `formatTicketRef()` is deleted; `ticketRef()` from `@support-desk/shared` replaces it.
- [ ] The legacy section of `AGENTS.md` and `.cursor/rules/legacy-reports.mdc` are removed,
      and `docs/hosts/00-orient-answers.md` notes that quest 5 no longer applies.

## Out of scope

Moving the report to the project's time zone (it would change the numbers: a separate
decision with the ops team), new metrics, a UI for the report.

## Likely files

- `apps/api/src/modules/reports/*`, `apps/api/src/lib/dates.ts` (+ tests),
  `packages/shared/src/reports.ts` (new), `AGENTS.md`, `.cursor/rules/legacy-reports.mdc`

## Watch for

- Editing `reports.test.ts` to make it pass: the point is that it does not change.
- Switching to the project's time zone "while at it": the numbers change.
- Averages computed differently in JavaScript than SQLite's `avg()` (rounding to one
  decimal must stay the same).
