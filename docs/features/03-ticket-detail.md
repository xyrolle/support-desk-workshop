# 03 · Ticket detail page

## User story

As a support engineer, I want to open a ticket and see its full description and what
has happened to it, so that I have the context before I reply to a customer.

## Acceptance criteria

Data

- [ ] A new `ticket_activity` table: `id`, `ticket_id`, `kind` (`created` or
      `status_changed`), `message`, `created_at`. Added through a generated migration
      (`npm run db:generate -w @support-desk/api -- --name ticket_activity`).
- [ ] The seed gives every ticket a `created` entry at its `createdAt`, and every ticket
      whose status is not `open` a `status_changed` entry at its `updatedAt`
      (for example "Status changed to Blocked").

API: `GET /api/projects/:projectId/tickets/:ticketId`

- [ ] Returns the ticket (same shape as in the list) plus `activity`, oldest first,
      validated by a new shared `ticketDetailSchema`.
- [ ] `CHK-105` has two activity entries: `created`, then `status_changed`.
- [ ] An unknown ticket (`CHK-999`) and a ticket from another project
      (`/projects/checkout/tickets/MOB-201`) both return
      `404 { "error": { "code": "not_found", "message": "Ticket \"<id>\" was not found." } }`.
- [ ] A hidden project (`internal-tools/tickets/INT-301`) returns the usual project 404,
      so it does not reveal that the ticket exists.

Web: `/projects/:projectId/tickets/:ticketId`

- [ ] Ticket titles in the list are links to the detail page.
- [ ] The page shows the id, title, status badge, priority, assignee, created and updated
      times, the description, and the activity as a vertical timeline.
- [ ] "Back to tickets" returns to the list with its previous `?page=` (and filters).
- [ ] An unknown ticket shows a "Ticket not found" empty state with a link to the list.
- [ ] The browser tab reads `CHK-101 · Support Desk`.

## Out of scope

Writing comments, editing fields, Markdown rendering, recording new activity
(feature 04 may add assignment entries).

## Likely files

- `apps/api/src/db/schema.ts`, a new migration in `apps/api/src/db/migrations/`, `db/seed.ts`
- `packages/shared/src/tickets.ts`: activity and ticket detail schemas
- `apps/api/src/modules/tickets/tickets.routes.ts`, `tickets.service.ts`,
  `tickets.repository.ts`, `tickets.test.ts`
- `apps/web/src/router.tsx`, `api/client.ts`, `api/queries.ts`
- `apps/web/src/features/tickets/TicketDetailPage.tsx`, `ActivityTimeline.tsx` (new),
  `TicketRow.tsx`
