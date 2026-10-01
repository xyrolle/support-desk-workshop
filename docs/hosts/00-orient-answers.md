# 00 · Orientation answers (hosts only)

Line numbers are for `main`. Accept answers that point to the right function even if
the line is off by a few.

## 0. The map

- The stack: npm workspaces (`package.json:8-11`), three of them. `apps/web` is React 19
  with React Router, TanStack Query, Base UI and Tailwind CSS, built with Vite
  (`apps/web/package.json:11-35`). `apps/api` is Hono on Node, with zod validation through
  `@hono/zod-validator` and Drizzle ORM on better-sqlite3 (`apps/api/package.json:12-20`).
  `packages/shared` is zod schemas and the types inferred from them, imported as source by
  both apps (`packages/shared/package.json:5-7`). Around them: TypeScript, Vitest,
  Playwright and Biome (`package.json:23-30`); `npm run dev` starts both apps
  (`package.json:13`).
- The folders: `apps/web` (pages in `features/`, server data in `api/`, primitives in
  `components/ui/`), `apps/api` (`modules/<name>/` with routes, service and repository,
  `auth/policy.ts`, `db/` with the schema, migrations and seed), `packages/shared` (what
  both apps agree on), `e2e/` (the Playwright smoke test), `docs/` (the specs, the backlog,
  these answers), `scripts/` (`setup-check.ts`), `.cursor/` (rules, skills, the hook, the
  reviewer subagent). The same map is in `AGENTS.md:35-58` and `README.md:33-46`.
- One request, opening Checkout's ticket list:
  1. `apps/web/src/router.tsx:27` maps `/projects/checkout` to `TicketListPage`, which calls
     `useTickets()` (`features/tickets/TicketListPage.tsx:27`).
  2. `useTickets()` (`api/queries.ts:72-77`) calls `api.listTickets()` (`api/client.ts:149-152`),
     which fetches `/api/projects/checkout/tickets?page=1&sort=updated&direction=desc`
     (`client.ts:64`) and parses the answer with `ticketPageSchema` (`client.ts:48-55`).
  3. Vite proxies `/api` to the API on port 8787 (`apps/web/vite.config.ts:11-13`).
  4. `apps/api/src/server.ts:15` serves `createApp()`: the `currentUser` middleware gives the
     request its context (`app.ts:28`) and `app.ts:35` mounts `ticketRoutes`.
  5. `tickets.routes.ts:8-11` validates the query with `ticketListQuerySchema` and calls
     `listProjectTickets()` (`tickets.service.ts:39-46`): `authorize()` first, then
     `pageOfTickets()` (lines 59-67).
  6. `findTickets()` and `countTickets()` (`tickets.repository.ts:43-73`) query the `tickets`
     table (`db/schema.ts:92-120`) with Drizzle, on the SQLite file
     `apps/api/data/support-desk.db` (`config.ts:4`).
- Each file on that path imports the next one; the hop from `client.ts` to `app.ts` is HTTP.

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

## 6. How do the web app and the API agree on a ticket?

- The shape is written once, as zod schemas in `packages/shared/src/tickets.ts`:
  `ticketListItemSchema` (lines 35-50), `ticketDetailSchema` (54-57) and the PATCH body,
  `ticketChangesSchema` (89-100). The TypeScript types are inferred from them (`z.infer`,
  lines 52, 59, 102), and both apps import the same source, so there is no copy to drift.
- The API checks what comes in: `validate("json", ticketChangesSchema)`
  (`tickets.routes.ts:16`) runs before the handler (`http/validation.ts:15-24`), and a
  failure becomes a `ValidationError` (`http/errors.ts:17-22`) that `handleError()` sends as
  a 400 (lines 52-55). `{"status":"done"}` gets `400 {"error":{"code":"validation_error",
  "message":"status: Invalid option: expected one of \"open\"|\"in_progress\"|\"blocked\"|\"resolved\"|\"closed\""}}`.
  The body is a `strictObject` (`tickets.ts:90`), so an unknown key is a 400 too
  (`Unrecognized key: "title"`). The check sends five such bodies
  (`ticket-update.test.ts:158-171`).
- What the API sends back is checked by TypeScript, not at run time: `toListItem()` must
  return a `TicketListItem` (`tickets.repository.ts:167-188`), so a missing or extra field
  fails `npm run typecheck`.
- The web app checks what comes back: every call goes through `request()`, which parses the
  response with the shared schema (`apps/web/src/api/client.ts:47-55`). Errors are parsed
  with `errorResponseSchema` into an `ApiError` with the API's message (lines 83-89).
- An answer that doesn't match: a missing or wrong field makes `parse()` throw; the query
  retries twice, because it is not an `ApiError` (`api/query-client.ts:7-10`), then the page
  shows its error state with "Try again" ("This ticket could not be loaded",
  `components/QueryErrorState.tsx:49-55`). A field the schema doesn't know is dropped
  without a word: `z.object` strips unknown keys, so the web app never sees it.
- Bonus: the list's URL state is parsed with the same `ticketListQuerySchema` the API
  validates the query with (`features/tickets/use-ticket-list-query.ts:23-26`).

## 7. Where does a test get its data and its clock?

- `createTestApp()` (`apps/api/src/test/test-app.ts:21-25`) gives each test its own app on a
  fresh database: `createTestDatabase()` (lines 27-31) opens SQLite in memory
  (`IN_MEMORY_DATABASE`, `db/client.ts:8`), applies the migrations (`openDatabase()`,
  `client.ts:16-28`) and seeds it at `TEST_NOW` (`seedDatabase()`, `db/seed.ts:31-68`).
  Nothing touches `apps/api/data/support-desk.db`, and a test's writes go with its database.
- `TEST_NOW` is the seed date, `2026-09-29T13:00:00.000Z` (`test-app.ts:10`,
  `db/seed/seed-date.ts:11`), so the data is exactly as built; `testClock` always answers
  `TEST_NOW` (`test-app.ts:18`).
- How the time reaches a service: `createApp()` gets the clock (`test-app.ts:23`), the
  `currentUser` middleware puts it in the request's context with the database and the user
  (`auth/current-user.ts:25`, mounted at `app.ts:28`), the route passes `c.var.context`
  (`tickets.routes.ts:18`), and the service asks it (`clock.now()`,
  `tickets.service.ts:123`). That is how `ticket-update.test.ts:30-46` can expect
  `TEST_NOW` in `updatedAt` and in the event. Service tests get the same context from
  `createTestContext()` (`test-app.ts:34-41`).
- `npm run dev` uses the real time: `server.ts:15` passes `systemClock` (`lib/dates.ts:10-12`),
  opens the file (`server.ts:8`, `config.ts:4`) and seeds it only if it is empty (lines
  10-13). `npm run db:seed` deletes the file and seeds it again
  (`db/reset-database.ts:8-10`), at `new Date()` (`seed.ts:31`).
- Same ids on every copy: the seed is always built at `SEED_DATE`, then every timestamp
  moves by the time since (`seedDataFor()`, `seed-date.ts:13-43`). Ticket numbers follow the
  order tickets were opened, so they never change, and "2 hours ago" is still true on the
  day. `seed.test.ts:191-211` proves it for four dates, one before the seed date.
- The grep finds four: the system clock (`dates.ts:11`), the seed's default (`seed.ts:31`)
  and two in the legacy report (`reports/legacy-dates.ts:51`, `reports/reports.service.ts:111`),
  which is why its tests fake the system time (`reports.test.ts:9-10`; quest 5).

## 8. What does it take to add a field to a ticket?

A good plan, in order:

1. `packages/shared/src/tickets.ts`: the values and their schema, like priorities
   (lines 21-25), and `channel` in `ticketListItemSchema` (35-50); the words for the UI next
   to `priorityNames` (`display-names.ts:15-20`). Shared comes first because `db/schema.ts`
   imports its values from there (lines 1-10).
2. `apps/api/src/db/schema.ts`: a `channel` column on `tickets` (92-120), an enum like
   `status` (line 103), with a default.
3. The migration: `npm run db:generate -w @support-desk/api -- --name ticket-channel`
   (`AGENTS.md:32-33`) writes `0001_ticket-channel.sql` and its snapshot in `db/migrations/`.
4. The seed: `toTicketRows()` builds every row (`db/seed/ticket-rows.ts:37-51`); give each
   ticket a channel, assert it in `db/seed.test.ts`, then `npm run db:seed`.
5. The repository: `toListItem()` (`tickets.repository.ts:167-188`) copies it into the answer.
6. The web app: a column in `features/tickets/ticket-columns.tsx` (`TicketColumn`, lines
   10-18, and `ticketColumns`, 33-79) and in the page's list (`TicketListPage.tsx:13-21`),
   a row in the side panel like "First reply" (`ticket-detail/TicketSidePanel.tsx:92-98`),
   and the test data: `buildTicket()` (`apps/web/src/test/fixtures.ts:50-71`) and the UI
   kit's `kitTicket()` (`dev/kit-data.ts:74-90`).
7. `npm run check`.

What fails when a step is skipped (tried on `main`, then reverted):

- No migration: every API test fails in `createTestApp()`, because the in-memory database is
  built from the migrations: `SqliteError: table tickets has no column named channel`.
- No shared schema: `npm run typecheck` fails in `toListItem()` with `TS2353: Object literal
  may only specify known properties, and 'channel' does not exist`. If it slipped through (a
  spread, a cast), the web app would still never see it: `request()` parses with the shared
  schema, which drops unknown keys (quest 6).
- TypeScript is half the to-do list: with the column in `schema.ts`, `tsc` points at
  `ticket-rows.ts:37` (TS2741, the seed); with the field in the shared schema, at
  `tickets.repository.ts:169`, `test/fixtures.ts:51` and `dev/kit-data.ts:80`. It can't see
  the migration, the column on the list or the row on the ticket page.
- The trap: `.notNull()` without a default generates
  ``ALTER TABLE `tickets` ADD `channel` text NOT NULL;``. That works on the tests' empty
  database and after `npm run db:seed` (which starts from an empty file), but every copy
  with tickets fails to start: `Cannot add a NOT NULL column with default value NULL`.
  Give the column a default (`.default("email")`) before generating.
- Not needed while nobody can change it: the PATCH body, activity events, the policy. The
  grep also finds `reports.service.ts:27`: raw SQL names columns as strings, and no type
  check covers them.
