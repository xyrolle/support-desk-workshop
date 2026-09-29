# 06 · Weekly summary script

## User story

As a team lead, I want a weekly Markdown summary of each project's tickets, so that a
Cursor Automation can post it to the team every Monday morning.

## Acceptance criteria

- [ ] `npm run report:weekly` prints the summary as Markdown to stdout and exits with 0.
- [ ] Options: `--as-of YYYY-MM-DD` (default: today) and `--out <file>` (write to a file
      instead of stdout). Arguments are parsed with `node:util` `parseArgs` and validated
      with zod; a bad date prints the usage and exits with 1.
- [ ] It covers only the projects the demo user can see (use `listAccessibleProjects()`),
      so Internal Tools is never in the report.
- [ ] The report starts with `# Weekly summary: week ending <as-of>` and has one section
      per project with:
  - ticket counts per status,
  - tickets closed in the last 7 days (status `closed`, `updatedAt` within the week),
  - blocked tickets with id, title and assignee,
  - urgent tickets that are not closed,
  - the number of unassigned tickets that are not closed.
- [ ] Deterministic: the same data and `--as-of` always produce identical output.
- [ ] A test seeds the in-memory database with `TEST_REFERENCE_DATE` and checks the Checkout
      section: 13 open, 7 in progress, 4 blocked, 6 closed; closed this week `CHK-114` and
      `CHK-125`; blocked `CHK-105`, `CHK-112`, `CHK-119`, `CHK-129`; urgent and not closed
      `CHK-101` and `CHK-112`.
- [ ] The Markdown building is a pure function (data in, string out), separate from the
      command-line entry point that reads the database and arguments.

## Out of scope

Sending the report anywhere (the Automation does that), charts, per-person summaries,
comparisons with previous weeks.

## Likely files

- `apps/api/src/reports/weekly-summary.ts` (pure function) and `weekly-summary.test.ts`
- `apps/api/src/reports/print-weekly-summary.ts` (command-line entry point)
- `apps/api/src/modules/tickets/tickets.repository.ts`: a query for all tickets in a project
- `apps/api/package.json` and root `package.json`: `report:weekly` script
