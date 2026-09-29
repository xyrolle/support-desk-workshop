# 02 · Search tickets

## User story

As a support engineer, I want to search a project's tickets by words in the title or
description, so that I can find the ticket a customer is asking about in seconds.

## Acceptance criteria

API: `GET /api/projects/:projectId/tickets?q=<text>`

- [ ] `q` matches tickets whose title **or** description contains the text,
      ignoring case: `q=APPLE PAY` on `checkout` returns only `CHK-101`.
- [ ] Description matches count too: `q=sentry` on `checkout` returns `CHK-101`.
- [ ] `%` and `_` are plain characters, not wildcards: `q=%` on `checkout` returns exactly
      `CHK-107`, `CHK-109` and `CHK-129` (not all 30 tickets).
- [ ] Leading and trailing spaces are ignored; an empty or blank `q` returns all tickets.
- [ ] `q` longer than 100 characters returns `400 validation_error`.
- [ ] `totalItems` counts matches only, and `q` combines with `page` (and with `status`
      if feature 01 is merged).
- [ ] The access rule is unchanged: searching `internal-tools` returns the same 404.

Web

- [ ] A search field in the project header, with a search icon and a placeholder
      "Search tickets".
- [ ] Typing updates `?q=` in the URL after a short pause (about 300 ms) and resets to page 1.
      Opening a URL with `?q=` fills the field and shows the results.
- [ ] Pressing Escape, or the clear button, empties the field and removes `q` from the URL.
- [ ] No matches shows the empty state "No tickets match "<text>"" with a "Clear search" button.

## Out of scope

Full-text indexes or ranking, highlighting matches, searching across projects,
search suggestions.

## Likely files

- `packages/shared/src/tickets.ts`: add `q` to `ticketListQuerySchema`
- `apps/api/src/modules/tickets/tickets.repository.ts`: extend `matchesFilter()`
  (hint: `instr(lower(...), lower(?))` avoids LIKE wildcards entirely)
- `apps/api/src/modules/tickets/tickets.test.ts`
- `apps/web/src/features/tickets/TicketSearch.tsx` (new), `TicketListPage.tsx`,
  `use-ticket-list-query.ts`
