# 03 · SLA clocks

Built in its own worktree, next to 04. Both change the ticket list row and query.

## User story

As a support lead, I want every open ticket to show a live countdown to the promise we made
the customer, counted in our business hours, so that the team answers the tickets that are
about to breach before the ones that can wait.

## Rules

- **Business hours**: Monday to Friday, 09:00 to 18:00 in the project's `timeZone`.
  No holidays. Everything below is counted in business minutes.
- **Targets**, in business hours, by the requester's plan and the ticket's priority
  (first response · resolution):

  | Priority | Enterprise | Pro      | Free     |
  | -------- | ---------- | -------- | -------- |
  | Urgent   | 1 · 9      | 2 · 18   | 4 · 27   |
  | High     | 2 · 27     | 4 · 45   | 8 · 63   |
  | Medium   | 4 · 45     | 8 · 72   | 16 · 90  |
  | Low      | 8 · 90     | 16 · 135 | 32 · 180 |

- **First-response clock**: from `createdAt` to `firstRespondedAt`, or to `resolvedAt` if
  the ticket is resolved without a reply. **Resolution clock**: from `createdAt` to
  `resolvedAt`. Both pause while the ticket is `blocked` (waiting on the customer), using
  the status changes in the activity log.
- Each clock has a `state`: `met` (stopped within target), `breached` (elapsed more than
  the target, stopped or not), `paused` (not stopped, ticket blocked) or `running`.
- **At risk**: an unresolved ticket that is not waiting on the customer, where a running
  clock (the first-response clock only until the first reply) is breached or has at most
  120 business minutes left.

## Acceptance checks

Pure module: `packages/shared/src/sla/` (shared, so the browser can keep the clocks ticking)

- [ ] `businessMinutesBetween(start, end, timeZone)`, with tests (Berlin unless noted):
  - Friday 2026-09-25 16:00 to Monday 11:00 local: 240 (the weekend does not count).
  - Saturday 12:00 to Monday 10:30 local: 90.
  - Friday 2026-10-23 17:00 to Monday 2026-10-26 10:00 local, across the end of summer
    time: 120.
  - America/New_York, Friday 2026-10-30 17:30 to Monday 2026-11-02 09:30 local, across the
    end of daylight saving time: 60.
- [ ] Pausing: opened Monday 09:00, waiting on the customer from 11:00 until Tuesday 14:00,
      measured at Tuesday 15:00: 180 elapsed business minutes.
- [ ] The targets table is data (one lookup), covered by a test per tier.
- [ ] No `Date` local-time methods (`getHours()`, `setDate()`...) and no `new Date()`: local
      times come from Intl (move `zonedParts` from `apps/api/src/lib/dates.ts` into the
      module, and add the conversion from a local time to an instant, with tests), and
      `now` is always a parameter.

API (test seed, clock at `TEST_NOW`)

- [ ] List items and the ticket detail get
      `sla: { measuredAt, firstResponse: Clock, resolution: Clock }`, where
      `Clock = { state, targetMinutes, elapsedMinutes }` measured at `measuredAt`.
  - `CHK-205` (urgent, Enterprise, no reply yet): first response `running`, 35 of 60.
  - `CHK-204` (urgent, Pro, no reply yet): first response `breached`, 162 of 120.
  - `CHK-196` (the Atlas double-charge thread): first response `met` (0 of 60, it came in
    on a Sunday), resolution `breached`, 900 of 540.
  - `CHK-194` (waiting on the customer): resolution `paused`.
- [ ] `?sla=at_risk` on `checkout` returns 17 tickets. It includes `CHK-202` (exactly 120
      minutes left) and `CHK-205`, and never a blocked ticket such as `CHK-194`. It
      combines with the filters and the sort, and `totalItems` is right. Any other `sla`
      value is a 400.

Web: live countdowns

- [ ] Each unresolved row in the list shows a chip for the clock that matters (first
      response until the first reply, then resolution): "2h 14m left", amber under 1 hour
      left, red "Breached 30m ago" once breached, grey "Paused" while waiting on the
      customer. Times are business time.
- [ ] The chips tick: every minute the browser adds the business minutes since
      `measuredAt` to running clocks with the shared module, without a request or a
      reload. A test with fake timers moves "1h 01m left" to "59m left" and turns it amber.
- [ ] The ticket side panel shows both clocks with their targets and the same live chips.
- [ ] "At risk" is a quick filter in the table toolbar, kept in the URL.

## Stretch: a "Breaching soon" view

Needs 01 (saved views).

- [ ] The views' filter schema accepts `sla: "at_risk"`, so `POST /views` with
      `{ "name": "Breaching soon", "filters": { "sla": "at_risk" } }` works and opening it
      lists the 17 at-risk Checkout tickets (15 in Mobile App, 12 in Internal Tools).
- [ ] Every project's sidebar shows a built-in "Breaching soon" view above the user's own,
      with the number of at-risk tickets, refreshed every minute. It cannot be deleted.
- [ ] Watch for: a count computed on the current page only; a built-in view stored in
      the database for every user instead of being derived.

## Out of scope

Holidays, per-project business hours, editing targets, notifications, SLA reports
(feature 06's stretch reuses this module).

## Likely files

- `packages/shared/src/sla/business-hours.ts`, `sla-targets.ts`, `sla-clock.ts`, tests (new)
- `apps/api/src/lib/dates.ts` (zoned helpers move to the shared module)
- `apps/api/src/modules/tickets/tickets.repository.ts`, `tickets.service.ts`,
  `apps/api/src/modules/activity/activity.repository.ts` (status history for a page of tickets)
- `packages/shared/src/tickets.ts`
- `apps/web/src/features/tickets/SlaChip.tsx`, `use-now.ts` (new), the ticket row and the
  side panel

## Watch for

- Fixed UTC offsets: Berlin is UTC+2 until 25 October and UTC+1 after. The DST tests catch
  it; a test that only uses September dates does not.
- `new Date()` inside the SLA code: take `now` as a parameter, so tests are exact.
- Pauses subtracted in wall-clock minutes instead of business minutes.
- "At risk" computed per page after paging: the list and `totalItems` go wrong. Business
  hours cannot be expressed in SQL, so select the project's unresolved tickets, compute
  the clocks, then filter, sort and page (there are few of them).
- Loading the status history one ticket at a time (N+1 queries) for every list page.
- Ticking with `setInterval` in every row: one clock for the page (a `useNow()` hook),
  cleaned up on unmount.
- A countdown in wall-clock time: overnight a "2h left" chip must not reach zero.
