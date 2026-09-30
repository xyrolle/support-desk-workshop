# 02 · Full-text search in a command palette

Builds on 01 (filters).

## User story

As a support engineer, I want to press ⌘K anywhere, type a few words from a title, a
description or the conversation, and jump to the ticket, best matches first, so that I can
find the earlier ticket about the same problem while a customer is waiting.

## Acceptance checks

Index

- [ ] A custom migration (`npm run db:generate -w @support-desk/api -- --custom --name
      ticket_search`) creates an SQLite FTS5 table `ticket_search` over each ticket's title,
      description and comments, with `tokenize = 'unicode61 remove_diacritics 2'` and
      `prefix = '2 3'`.
- [ ] Triggers keep it in sync when a ticket is created, when its title or description
      changes and when a comment is added. The migration backfills the existing tickets.
- [ ] A reply posted through the API is found by the next search.

API: `GET /api/projects/:projectId/tickets?q=`

- [ ] Every word of `q` must match, as a prefix (`refun` finds "refunded"). Results are
      ranked with `bm25()`, weighing the title 10, the description 4 and the comments 1.
      With `q`, the default order is relevance; an explicit `sort` still applies.
- [ ] Each item gets a `snippet`: the best matching passage as a list of parts,
      `[{ "text": "...", "highlighted": false }, { "text": "Apple", "highlighted": true }, ...]`,
      so the UI never has to parse markup. Without `q` there is no snippet.
- [ ] On `checkout` (test seed):
  - `?q=apple pay` returns 4 tickets, `CHK-197` "Apple Pay domain verification keeps
    failing" first.
  - `?q=refun` returns 6 tickets.
  - `?q=idempotency` returns only `CHK-196`: the word is only in its internal notes.
  - `?q=3-D Secure` returns 4 tickets, `CHK-176` first.
  - `?q=webhook` returns 12 tickets, and `?q=webhook&status=closed` 8 of them.
- [ ] Input that is not FTS5 syntax never breaks the endpoint: `?q="`, `?q=-`, `?q=*` and
      `?q=()` return 200 with no tickets, and `?q=AND` searches for the word "and"
      (98 Checkout tickets contain a word starting with "and").
- [ ] `q` is trimmed; a blank `q` means no search; more than 100 characters is a 400.
- [ ] Search stays inside the project and the policy: `internal-tools?q=saml` returns
      `INT-115` and `INT-129` only, and `billing?q=invoice` is the usual 404.

Web: the command palette

- [ ] ⌘K (Ctrl+K on Windows and Linux) opens a palette over any page, focused on its
      input; so does a "Search" button with the ⌘K hint in the table toolbar (not in the
      page header). It searches the project you are in (the first of your projects
      elsewhere), named as a chip next to the input.
- [ ] Results appear as you type (after 200 ms, at most 8), each with its id, status, title
      and snippet; highlighted parts are `<mark>` elements built from the parts, never
      `dangerouslySetInnerHTML`.
- [ ] Arrow keys move through the results, Enter opens the ticket, Esc closes the palette
      and gives focus back to where it was. The mouse works too.
- [ ] While the API answers, the previous results stay (no flicker); with no match:
      "No tickets match “…”".
- [ ] It is a dialog with a labelled input and a listbox, so a screen reader announces the
      active result.

## Stretch: jump to an id, search my tickets

- [ ] Typing a ticket id (`CHK-104`, case-insensitive, with or without the dash) shows it as
      the first result, "Go to CHK-104", in any of your projects: `MOB-120` jumps to Mobile
      App even from Checkout. An id you cannot see (`BIL-101`) or that does not exist
      (`CHK-999`) shows no such row and falls back to normal search, revealing nothing.
- [ ] A scope switch in the palette (Tab) toggles between the project and "My tickets".
      `GET /api/me/tickets?q=` searches Maya's unresolved tickets across her projects:
      `?q=export` returns 4 tickets from three projects, `INT-151` first.
- [ ] Watch for: resolving ids in the browser from the loaded list (misses other pages and
      projects); an id lookup that answers differently for hidden and missing tickets.

## Out of scope

Searching every project at once, recent searches, actions in the palette ("assign to
me"), stemming or synonyms, highlighting inside the ticket page.

## Likely files

- a custom migration in `apps/api/src/db/migrations/`
- `apps/api/src/modules/tickets/tickets.repository.ts` (a search condition in
  `matchesFilter()`, ranking, snippet), `ticket-search.ts` (turns input into an FTS5 query)
- `packages/shared/src/tickets.ts` (`q`, `snippet`)
- `apps/web/src/features/search/CommandPalette.tsx`, `use-command-palette.ts`,
  `SearchSnippet.tsx` (new), the layout (the ⌘K listener)

## Watch for

- Raw input passed to `MATCH`: `"`, `-`, `AND`, `*` alone and `3-D` are FTS5 syntax and
  give a 500 (`fts5: syntax error`, `no such column: D`). Quote every word, double any `"`
  inside it, and put the `*` outside the quotes: `"3-D"* "Secure"*`.
- `LIKE '%…%'` or `instr()`: no ranking, no prefix semantics, and it misses the comments.
- Forgetting the backfill: without it the triggers only index tickets created afterwards.
- A search join that only filters the page, not the count.
- Declaring the FTS5 table in `schema.ts` as if it were a normal table; drizzle-kit would
  try to manage it. It lives in the custom migration.
- Snippets returned as HTML: customer text can contain markup.
- Out-of-order responses: typing "ref" then "refund" can show the "ref" results last.
  Keep the query in the TanStack Query key so stale answers are ignored.
- ⌘K caught by the browser or by the input: prevent the default and listen on the
  document, not on one component.
