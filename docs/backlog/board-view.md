# Board view with drag and drop

Needs: `v2/base`.

## User story

As a support lead, I want to see a project's open work as columns by status and drag a
ticket to the next column, so that stand-up takes five minutes and the queue is obvious.

## Acceptance checks

API

- [ ] `GET /api/projects/:projectId/board` returns four columns in order, `open`,
      `in_progress`, `blocked` and `resolved`, each with its `total` and up to 50
      `TicketListItem`s, most urgent first, then most recently updated. Closed tickets are
      not on the board.
- [ ] With the test seed, Checkout's columns hold 20, 15, 12 and 8 tickets; the Open column
      starts with `CHK-205` and `CHK-204` (urgent).
- [ ] The usual 404 for `billing`; viewers can read the board.

Web: `/projects/:projectId/board`

- [ ] A List | Board switch in the table toolbar, kept in the URL.
- [ ] Columns are headed by the status (with its design-system icon) and count. Cards show
      the id, title, priority, assignee and the requester's organization; clicking opens the
      ticket.
- [ ] Dragging a card to another column changes its status through the existing
      `PATCH /tickets/:ticketId`, so the activity log gets a `status_changed` event by the
      current user. The card moves at once and goes back, with an error toast, if the
      request fails.
- [ ] The keyboard can do it too: focus a card, press space, move with the arrow keys,
      press space again (announced to screen readers).
- [ ] Viewers see the board but cannot drag; cards say why in a tooltip.

## Out of scope

Reordering within a column, swimlanes, WIP limits, a board across projects.

## Likely files

- `apps/api/src/modules/tickets/board.*` or a function in `tickets.service.ts`, a test
- `packages/shared/src/tickets.ts` (board response)
- `apps/web/src/features/board/*` (new), the toolbar switch

## Watch for

- Adding a drag-and-drop library without asking (native drag events and a keyboard path
  are enough here; if a library is worth it, ask first and pin it).
- A new "move" endpoint that skips `describeChanges()` and the activity event.
- Drops computed from array indexes that change while the board refetches.
- A board built from the paginated list endpoint: 25 tickets is not the board.
