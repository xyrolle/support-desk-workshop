# 00 · Orient in the codebase

No code in this chapter. Before changing anything, find out how Support Desk really works.
Use the agent in Ask mode, point it at files with @-mentions, and try an Explore subagent
for the wide questions. For every answer, give the file and line where it happens and the
exact behaviour, then prove it with the check.

## The five quests

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

## Stretch

Turn one answer into guidance the next agent will read: a line in `AGENTS.md` or a rule in
`.cursor/rules/` (for example a rule scoped to `apps/api/src/modules/members/**`). Then ask
the same question in a fresh chat and compare the answers.
