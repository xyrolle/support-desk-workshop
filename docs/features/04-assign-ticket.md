# 04 · Assign and reassign tickets

## User story

As a team member, I want to assign a ticket to a teammate, reassign it, or unassign it,
so that everyone knows who is working on what.

## Acceptance criteria

API

- [ ] `GET /api/projects/:projectId/members` returns the project's members as `User[]`,
      sorted by name. `checkout` has Diego Alvarez, Lena Fischer, Maya Chen and Priya Nair.
- [ ] `PATCH /api/projects/:projectId/tickets/:ticketId` with `{ "assigneeId": "priya-nair" }`
      returns `200` and the updated ticket, with `assignee` filled in and a new `updatedAt`.
- [ ] `{ "assigneeId": null }` unassigns the ticket.
- [ ] The body is validated by a shared zod schema; unknown fields, a missing
      `assigneeId` or malformed JSON return `400 validation_error` (never a 500).
- [ ] Assigning someone who is not a member of the ticket's project (for example
      `tomas-silva` on `CHK-101`) returns `400 validation_error`
      "tomas-silva is not a member of this project".
- [ ] A hidden project returns the usual project 404; an unknown ticket returns a
      ticket 404. Both routes go through `requireProjectAccess()`.

Web

- [ ] The assignee cell in the ticket list opens a picker listing the project's members
      and "Unassigned", with the current assignee marked.
- [ ] Choosing someone updates the row straight away and keeps it after a reload.
- [ ] If the request fails, the row goes back to the previous assignee and an error
      message is shown.
- [ ] The picker works with the keyboard (Tab, arrow keys, Enter, Escape).

## Out of scope

Changing status or priority, bulk assignment, notifications, assignment history
(unless feature 03 is merged, in which case add an `assigned` activity entry).

## Likely files

- `packages/shared/src/tickets.ts`: `updateTicketAssigneeSchema`
- `apps/api/src/http/errors.ts`: map Hono's malformed-JSON `HTTPException` to
  `validation_error`
- `apps/api/src/modules/projects/`: members route, service and repository
- `apps/api/src/modules/tickets/`: PATCH route, service rule, repository update, tests
- `apps/web/src/api/client.ts`: `request()` needs a method and a JSON body
- `apps/web/src/api/queries.ts`: `useProjectMembers()`, `useAssignTicket()` mutation
- `apps/web/src/features/tickets/AssigneePicker.tsx` (new), `TicketRow.tsx`
