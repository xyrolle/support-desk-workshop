# Similar tickets while writing a new one

Needs: 02 (the full-text index).

## User story

As a support engineer logging a ticket for a customer who called, I want to see existing
tickets that look like the same problem while I type the title, so that I link to the known
issue instead of opening a duplicate.

## Acceptance checks

API

- [ ] `POST /api/projects/:projectId/tickets` `{ title, description, priority, requesterId }`
      creates an open, unassigned ticket with the project's next number (`CHK-206` in the
      test data), returns 201 and the ticket. Agents and admins only (`editTickets`); the
      requester must be an existing contact. The search index picks it up (02's triggers).
- [ ] `GET /api/contacts?q=` finds requesters by name, email or organization, at most 10.
- [ ] `GET /api/projects/:projectId/tickets/similar?title=` returns up to 5 tickets whose
      title, description or conversation match any word of 3 letters or more in the title
      (OR-ed, prefix-matched, safely quoted as in 02), best first by `bm25()`. With the test
      seed on Checkout:
  - "Apple Pay button missing on iPhone" → `CHK-197`, `CHK-161`, `CHK-125`, `CHK-205`,
    `CHK-151`.
  - "Customers charged twice" → `CHK-196` first.
  - "Promo code not working" → `CHK-166` first.
- [ ] A title with no word of 3 letters returns an empty list, never an error.

Web

- [ ] "New ticket" in the table toolbar (disabled with a tooltip for viewers) opens a
      dialog: requester (a Combobox over `/api/contacts`), title, description (Markdown),
      priority.
- [ ] Under the title, "Similar tickets" updates as you type (300 ms), each with its id,
      status and title; clicking one opens it in a new tab.
- [ ] Creating the ticket closes the dialog and opens the new ticket.

## Out of scope

Merging tickets, linking a ticket to a duplicate, suggestions for customer emails.

## Likely files

- `apps/api/src/modules/tickets/*` (create, similar), `apps/api/src/modules/customers/*`
  (contacts search), `packages/shared/src/tickets.ts`
- `apps/web/src/features/tickets/NewTicketDialog.tsx`, `SimilarTickets.tsx` (new)

## Watch for

- AND-ing the words like 02's search: a new title rarely matches every word.
- Reusing 02's quoting helper, not writing a second one.
- The next number computed as `count + 101`: take the project's highest number plus one,
  inside the transaction that inserts.
