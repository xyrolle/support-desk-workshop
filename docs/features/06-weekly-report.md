# 06 · Weekly support report

Runs later as a Cursor Automation and headless in CI. The core needs nothing from the other
features; the SLA stretch builds on 03.

## User story

As a support lead, I want a short Markdown report of last week for each of my projects,
so that I can post it in the team channel on Monday without opening a dashboard.

## Acceptance checks

Command

- [ ] `npm run report:weekly -- --as-of 2026-09-29` prints the report for the week ending on
      that day; `--out report.md` writes it to a file instead. Without `--as-of` it uses
      today's date in UTC. An invalid date exits with code 1 and a usage message.
- [ ] It covers the projects the demo user can see, through `auth/policy.ts`, sorted by
      name. Maya's report never mentions Billing.

Contents, per project

- [ ] The week is the 7 days ending on `--as-of`, in the project's time zone: for Checkout
      from 2026-09-22T22:00Z (midnight in Berlin), for Mobile App from 2026-09-23T04:00Z.
      The report is measured at the end of the week, or now if the week has not ended yet.
- [ ] Opened (created in the week), Resolved (`resolvedAt` in the week), the median first
      response over the tickets opened in the week that have one (clock time; the mean of
      the two middle values for an even count, rounded down to the minute), the three most
      used labels on tickets opened in the week (ties by name), and the five oldest
      unresolved tickets with their age in whole days.
- [ ] With the test seed and the clock at `TEST_NOW`:

  | Project        | Opened | Resolved | Median first response |
  | -------------- | ------ | -------- | --------------------- |
  | Checkout       | 26     | 10       | 5h 3m (12 tickets)    |
  | Internal Tools | 17     | 10       | 6h 48m (6 tickets)    |
  | Mobile App     | 22     | 11       | 2h 46m (7 tickets)    |

  Checkout's top labels are Bug (10), Payments (4), Question (4); its oldest open tickets
  are CHK-144 (23 days), CHK-148 (18), CHK-151 (14), CHK-153 (14) and CHK-155 (11).
  Mobile App's top labels are Question (6), App review (3), Bug (3).
- [ ] A project section reads like this (the test compares one full section):

  ```md
  ## Checkout

  Wednesday 23 to Tuesday 29 September 2026, Europe/Berlin

  - Opened 26 · Resolved 10
  - Median first response: 5h 3m (12 tickets)
  - Top labels: Bug (10), Payments (4), Question (4)

  Oldest open tickets:

  - CHK-144 · 23 days · GBP exchange rate not updated since Friday
  - CHK-148 · 18 days · Buy one get one discount goes to the cheaper item?
  - ...
  ```

- [ ] A week without tickets says so ("No tickets opened this week.") instead of printing
      zeros and an empty median.

## Stretch: SLA section, and a file the team can read

- [ ] SLA (needs 03): each section gets "SLA breaches: 11 first responses · 2 resolutions"
      (tickets opened in the week whose first-response clock is breached, and tickets
      resolved in the week whose resolution clock was breached, with 03's module) and the
      median first response in business time next to the clock time. With the test seed:

  | Project        | Breaches (first · resolution) | Median in business time |
  | -------------- | ----------------------------- | ----------------------- |
  | Checkout       | 11 · 2                        | 1h 39m                  |
  | Internal Tools | 9 · 3                         | 3h 54m                  |
  | Mobile App     | 8 · 5                         | 2h 46m                  |

- [ ] Publishing: `--publish docs/reports` writes `docs/reports/2026-09-29.md` and rewrites
      `docs/reports/README.md`, an index of every report in the folder, newest first, one
      line each with the date and the opened and resolved totals. Running it twice for the
      same date replaces the file and keeps one index line. The Automation commits the
      folder, so the team reads the reports on GitHub.
- [ ] Watch for: an index built by appending (duplicates on re-runs); dates in file names
      taken from the clock instead of `--as-of`.

## Out of scope

Posting to Slack (the Automation does that), charts, comparisons with the previous week,
reports for other users.

## Likely files

- `apps/api/src/weekly-report/` (new): `load-weekly-data.ts` (Drizzle, through the
  policy), `build-weekly-report.ts` (pure: data in, Markdown out), `print-weekly-report.ts`
  (the command), tests
- `apps/api/src/lib/dates.ts` (the week's bounds in a time zone, + tests)
- `package.json` and `apps/api/package.json` (`report:weekly`), `AGENTS.md` (the command)

## Watch for

- Copying `modules/reports/`: raw SQL on `$client`, `legacy-dates.ts` (whole UTC days),
  rows cast with `as`, `formatTicketRef()`. It looks like it already does half of the job,
  which is exactly why it is tempting. A reviewer should flag any of it.
- Week boundaries in UTC: Checkout's week starts at 22:00 UTC, Mobile App's at 04:00.
- `new Date()` inside the report instead of `--as-of` and the clock: the tests stop being
  exact and the Monday report changes during the day.
- Reading every project straight from the database: Billing would leak into Maya's report.
- npm's own output mixed into the Markdown when piping: document `npm run --silent`.
