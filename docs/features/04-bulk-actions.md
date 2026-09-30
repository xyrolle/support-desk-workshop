# 04 · Bulk actions with undo

Built in its own worktree, next to 03. Both change the ticket list row and query.

## User story

As a support lead triaging the morning queue, I want to select a run of tickets and change
their status, priority or assignee at once, and undo it if I picked the wrong ones, so
that triage takes one minute instead of twenty clicks.

## Acceptance checks

API: `PATCH /api/projects/:projectId/tickets`

- [ ] Body: `{ "updates": [{ "ticketId": "CHK-205", "changes": { ... } }, ...] }`, where
      `changes` is the same `ticketChangesSchema` as the single-ticket PATCH. 1 to 100
      updates, each ticket at most once (otherwise 400).
- [ ] All updates run in one transaction. Each ticket goes through `requireTicket()` with
      `editTickets`, so the policy is checked per ticket, and gets the same rules as the
      single PATCH: `describeChanges()`, `resolvedAt`, and one activity event per change.
- [ ] The response is `{ "tickets": TicketListItem[], "previous": TicketState[] }`, where
      `previous` holds each ticket's `status`, `priority`, `assigneeId` and `labelIds`
      before the change.
- [ ] Assigning `CHK-205`, `CHK-204` and `CHK-203` to Maya with status `in_progress` gives
      three tickets in progress and six events (a status and an assignee change each), all
      by Maya at `TEST_NOW`. `previous` for `CHK-203` is
      `{ "ticketId": "CHK-203", "status": "open", "priority": "low", "assigneeId": null, "labelIds": [] }`.
- [ ] Sending `previous` back as updates (the undo) restores all three exactly; the activity
      log records the undo as new events and keeps the old ones.
- [ ] If any update is invalid, nothing changes: a ticket from another project (`MOB-101`)
      or an unknown one (`CHK-999`) gives 404, an assignee who is a viewer (`ravi-patel`)
      gives 400, and the other tickets in the request are untouched.
- [ ] A viewer gets 403, `billing` gives the usual 404.

Web: the project ticket list

- [ ] Each row has a checkbox, and the header checkbox selects the page. Shift-click on a
      second row selects every row in between (and shift-click again extends or shrinks the
      range from the last clicked row), as in a mail client.
- [ ] With a selection, the design system's selection bar shows "3 selected" with Status,
      Priority and Assignee menus and "Clear". Without `permissions.editTickets` the
      checkboxes are disabled with a tooltip saying why.
- [ ] The rows change at once (an optimistic update of the list's query cache); if the
      request fails they go back and an error toast explains why.
- [ ] A toast "Updated 3 tickets" with "Undo" stays for 8 seconds. Undo sends the
      `previous` values and the rows change back.
- [ ] The selection clears when the page, the filters or the project change.

## Stretch: keyboard selection and bulk labels

- [ ] With the list focused, `x` toggles the selection of the focused row, and shift+`x`
      extends the range to it; the selection bar and undo work the same.
- [ ] The bulk request accepts `labels: { "add": [labelIds], "remove": [labelIds] }` next to
      `updates`, applied on the server to each ticket's current labels, so a stale list in
      the browser cannot drop a label someone added meanwhile. Adding Payments (4) and
      removing Bug (1) on `CHK-205`, `CHK-196` and `CHK-182` writes three events: Payments
      added to `CHK-205`, Bug removed from the other two (they already have Payments).
- [ ] A label of another project is a 400; undo restores each ticket's exact label set.
- [ ] The selection bar gets a Labels menu with a checkbox per label (checked, unchecked or
      mixed across the selection).
- [ ] Watch for: `x` firing while typing in an input; label changes computed in the browser
      from the rows on screen.

## Out of scope

Selecting across pages ("select all 105"), bulk actions in My tickets, bulk comments.
Undo restores the values from before the bulk change even if someone changed a ticket in
between.

## Likely files

- `packages/shared/src/tickets.ts` (bulk request and response)
- `apps/api/src/modules/tickets/tickets.routes.ts`, `tickets.service.ts` (share the
  single-ticket update logic instead of copying it), `ticket-bulk-update.test.ts` (new)
- `apps/web/src/api/client.ts`, `queries.ts` (a mutation with optimistic update and rollback)
- `apps/web/src/features/tickets/use-ticket-selection.ts` (new, with the range logic),
  the ticket table and row, the design system's `SelectionBar` and toast

## Watch for

- A loop of single PATCH requests from the browser: no transaction, N requests, a
  half-applied change when one fails.
- Copying `updateTicket()` into a bulk version instead of extracting the shared part: two
  places that must remember `resolvedAt` and the activity events.
- Opening a transaction per ticket instead of one around all of them.
- An optimistic update without a rollback, or one that writes into every cached page
  instead of the visible one.
- Shift-click ranges computed from row indexes after the list re-sorted: anchor the range
  on ticket ids in the current order.
