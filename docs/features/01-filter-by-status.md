# 01 · Filter tickets by status

## User story

As a support engineer, I want to filter a project's tickets by status, so that I can
focus on what is blocked or still open, and share that view with a link.

## Acceptance criteria

API: `GET /api/projects/:projectId/tickets?status=<status>`

- [ ] `status` is optional and accepts `open`, `in_progress`, `blocked` or `closed`.
      Without it, the endpoint behaves exactly as today.
- [ ] `?status=blocked` on `checkout` returns exactly `CHK-105`, `CHK-112`, `CHK-119`
      and `CHK-129`, with `totalItems: 4` and `totalPages: 1`.
- [ ] Filter and pagination combine: `?status=open&page=1` on `checkout` returns 13 tickets.
- [ ] An unknown status (`?status=done`) returns `400` with
      `{ "error": { "code": "validation_error", "message": "status: ..." } }`.
- [ ] The access rule is unchanged: `internal-tools?status=open` still returns the same 404.

Web: `/projects/:projectId?status=<status>`

- [ ] The project header has a status filter with "All statuses" plus the four labels
      from `ticket-labels.ts`.
- [ ] Choosing a status puts `?status=...` in the URL and goes back to page 1.
      Choosing "All statuses" removes `status` from the URL.
- [ ] Opening `/projects/checkout?status=blocked` directly shows the filter preselected
      and only the 4 blocked tickets.
- [ ] An invalid `?status=` in the URL shows all tickets instead of an error.
- [ ] When a filter matches nothing, the empty state says "No <status> tickets" and
      offers a "Clear filter" button.

## Out of scope

Selecting several statuses at once, filtering by priority or assignee, saved views,
per-status counts.

## Likely files

- `packages/shared/src/tickets.ts`: add `status` to `ticketListQuerySchema`
- `apps/api/src/modules/tickets/tickets.repository.ts`: `TicketFilter` and `matchesFilter()`
- `apps/api/src/modules/tickets/tickets.service.ts`, `tickets.test.ts`
- `apps/web/src/features/tickets/StatusFilter.tsx` (new), `TicketListPage.tsx`,
  `use-ticket-list-query.ts`
- `apps/web/src/features/projects/ProjectHeader.tsx`: room for header actions
