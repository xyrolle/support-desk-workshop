# 00 · Orient in the codebase

No code in this chapter. Before changing anything, find out what Support Desk is built
with and how it really works. Use the agent in Ask mode, point it at files with @-mentions,
and try an Explore subagent for the wide questions. For every answer, give the file and line
where it happens and the exact behaviour, then prove it with the check.

## The quests

Start with the map. Quests 1 to 5 ask what the app does, quests 6 to 8 how it is built.

### 0. The map

What is Support Desk built with, and how is it organised? Name the stack, each top-level
folder and what it owns, and the path of one request from a page to the database, such as
opening Checkout's ticket list.

Check: `npm ls --depth=0 --workspaces` lists the three workspaces and the packages each one
uses. Then open the files on your path in order: each one imports the next, except where the
request leaves the browser (the Vite proxy in `apps/web/vite.config.ts`).

### 1. Who may change a ticket?

Which roles can change a ticket's status, and where is that decided? What does a viewer get
back when they try, word for word? And someone who is not in the project at all?

Check: `npx vitest run apps/api/src/modules/tickets/ticket-update.test.ts -t "viewers"`, or run
the API as the viewer (`DEMO_USER_ID=ravi-patel PORT=8790 npm run start -w @support-desk/api`)
and send `PATCH /api/projects/checkout/tickets/CHK-205` with `{"status":"closed"}`.

### 2. What happens when a member leaves?

An admin removes Diego Alvarez from Checkout. Who is allowed to do that, what could stop
it, and what happens to Diego's tickets (all of them)? What trace does it leave?

Check: count Diego's Checkout tickets by status before and after, in
`apps/api/src/modules/members/members.test.ts` or against a running API.

### 3. What does "mine" mean?

`GET /api/me/tickets` is "My tickets". Which tickets does it return: which statuses, which
projects? How many does Maya have in the test data? Would a Billing ticket assigned to her
show up?

Check: `npx vitest run apps/api/src/modules/tickets/my-tickets.test.ts`.

### 4. From route to activity row

Follow `PATCH /api/projects/checkout/tickets/CHK-205` with `{"status":"in_progress"}` from
the route to the row it writes in `ticket_events`. Name every function on the way, in
order. What happens to the ticket if writing the event fails halfway?

Check: `npx vitest run apps/api/src/db/client.test.ts` and
`apps/api/src/modules/tickets/ticket-update.test.ts`.

### 5. Which module is legacy, and why?

One module is written in an older style. Which one, how can you tell from the code alone,
what would go wrong if a new report copied it, and what should new code use instead?

Check: the answer must name at least three concrete differences, each with a file and line.

### 6. How do the web app and the API agree on a ticket?

The web app and the API are separate programs. Where is a ticket's shape written down, and
how does each side hold the other to it? What does the API answer to a PATCH with
`{"status":"done"}`? What does the web app do with an answer that doesn't match: a field
missing, or one it has never heard of?

Check: `npx vitest run apps/api/src/modules/tickets/ticket-update.test.ts -t "rejects the body"`.

### 7. Where does a test get its data and its clock?

The tests expect exact ids and counts: Checkout has 105 tickets, and the newest is `CHK-205`.
Where does a test's database come from, what time is it inside a test, and how does that time
reach a service? What do `npm run dev` and `npm run db:seed` use instead, and why are the
ticket ids the same on every copy?

Check: `npx vitest run apps/api/src/db/seed.test.ts`, then
`git grep -n "new Date()" -- apps/api/src ':!*.test.ts'` lists every place outside the tests
that reads the real time.

### 8. What does it take to add a field to a ticket?

Every ticket gets a channel: email, chat or phone, shown in the list and on the ticket page.
Don't build it. List every file you would change, in the order you would change them, and the
commands that go with them. What fails, and where, if you skip the migration? And if you skip
the shared schema?

Check: `git grep -l -e firstRespondedAt -e first_responded_at -- apps packages` lists every
file that mentions a field tickets already have. Your list should reach the same layers.

## Stretch

Turn one answer into guidance the next agent will read: a line in `AGENTS.md` or a rule in
`.cursor/rules/` (for example a rule scoped to `apps/api/src/modules/members/**`). Then ask
the same question in a fresh chat and compare the answers.
