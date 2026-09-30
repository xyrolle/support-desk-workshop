# 00 · Orientation answers (hosts only)

Line numbers are for `v2/base`. Accept answers that point to the right function even if
the line is off by a few.

## 1. Who may change a ticket?

- Agents and admins. The table is `permissionsByRole` in
  `apps/api/src/auth/policy.ts:25-29`: viewers have no `editTickets`.
- The PATCH route (`apps/api/src/modules/tickets/tickets.routes.ts:16`) calls
  `updateTicket()`, which calls `requireTicket(context, projectId, ticketId, "editTickets")`
  (`tickets.service.ts:111`), which calls `authorize()` (`auth/policy.ts:54-71`).
- `authorize()` checks membership first (`policy.ts:59-62`): someone outside the project
  gets `404 {"error":{"code":"not_found","message":"Project \"checkout\" was not found."}}`,
  exactly like a project that does not exist. Then the permission (`policy.ts:65-69`): a
  viewer gets `403` with `Viewers of Checkout cannot change or comment on tickets.`
- Bonus: only agents and admins can be *assigned* a ticket either
  (`requireAssignable()`, `tickets.service.ts:190-196`).

## 2. What happens when a member leaves?

- `DELETE /api/projects/:projectId/members/:userId` (`members.routes.ts:19`) calls
  `removeMember()` (`apps/api/src/modules/members/members.service.ts:71-83`).
- Only admins: `authorize(context, projectId, "manageMembers")` (line 73). An agent gets
  `403 Agents of Checkout cannot manage members.`
- What can stop it: an unknown member is a 404 (`requireMember()`, lines 85-91); the last
  admin cannot leave, `409 Checkout needs at least one admin.` (`requireAnotherAdmin()`,
  lines 93-97).
- His tickets: in one transaction (lines 79-82), `releaseAssignedTickets()`
  (`tickets.service.ts:148-177`) unassigns his **unresolved** tickets in **that project
  only**; resolved and closed tickets keep him as assignee (history stays true), and his
  tickets in other projects are untouched. In the test data Diego has 9 unresolved and 6
  resolved or closed Checkout tickets; after the removal the 9 are unassigned.
- The trace: one `assignee_changed` event per released ticket, from Diego to nobody, by
  the admin who removed him, at the same time.
- The same release happens when a member is demoted to viewer (`changeMemberRole()`,
  lines 61-66).

## 3. What does "mine" mean?

- `listMyTickets()` (`apps/api/src/modules/tickets/tickets.service.ts:48-56`): assigned to
  the current user, status in `unresolvedStatuses` (`open`, `in_progress`, `blocked`,
  `packages/shared/src/tickets.ts:15`), in the projects from `visibleProjectIds()`
  (`auth/policy.ts:46-48`).
- Maya has 15: 7 in Checkout, 5 in Internal Tools and 3 in Mobile App, `MOB-184` first
  (most recently updated). Resolved tickets are no longer "mine", like Zendesk's
  "unsolved tickets" view.
- A Billing ticket assigned to her would **not** show: Billing is not in her visible
  projects. `my-tickets.test.ts` proves it by assigning `BIL-101` to her.

## 4. From route to activity row

1. `tickets.routes.ts:16`: `validate("json", ticketChangesSchema)` parses the body
   (`packages/shared/src/tickets.ts:89`).
2. `updateTicket()` (`tickets.service.ts:104`) → `requireTicket()` → `authorize()`.
3. `describeChanges()` (`modules/tickets/ticket-changes.ts:12`) turns the change into
   `{ type: "status_changed", from: "open", to: "in_progress" }`.
4. `inTransaction()` (`db/client.ts:42`, called at `tickets.service.ts:124`) wraps
   `updateTicketRow()` (with `resolvedAtAfter()`, `modules/tickets/resolution.ts:13`)
   and `recordTicketEvents()` (`modules/activity/activity.repository.ts:16`), which maps
   the change with `toTicketEventRow()` (line 22) to a row in `ticket_events`
   (`db/schema.ts:168`): `from_value = 'open'`, `to_value = 'in_progress'`, the actor,
   the clock's time.
5. If the event insert throws, the transaction rolls back and the ticket keeps its old
   status: `client.test.ts` shows it ("saves nothing when the work throws").

## 5. Which module is legacy, and why?

`apps/api/src/modules/reports/`. From the code alone:

- The header says so (`reports.service.ts:1-8`, `legacy-dates.ts:1-5`).
- Raw SQL strings run on `database.$client` (`reports.service.ts:13-44`, `77-81`) instead
  of the Drizzle query builder; rows cast with `as` instead of being validated.
- Its own date helpers count whole UTC days and ignore the project's time zone
  (`legacy-dates.ts`); `today()` calls `new Date()` directly (line 50), so tests fake the
  system time.
- snake_case JSON; the route parses its own query string instead of `validate()`
  (`reports.routes.ts`).
- The deprecated `formatTicketRef()` (`lib/format-ticket-ref.ts`, used at
  `reports.service.ts:109`).
- AGENTS.md says it (`AGENTS.md:80-87`), and `.cursor/rules/legacy-reports.mdc` is scoped
  to it.

What goes wrong if a new report copies it: day and week boundaries in UTC instead of the
project's time zone (Mobile App's day starts at 04:00 UTC), no zod at the edges, SQL that
bypasses the repositories. Feature 06 is the chance to see an agent do exactly that.
