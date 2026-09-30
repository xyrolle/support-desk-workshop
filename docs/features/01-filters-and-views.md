# 01 · Filters and saved views

## User story

As a support engineer, I want to filter a project's tickets by status, priority, assignee
and label, and save a filter as a named view, so that "urgent and unassigned" or "my open
payments tickets" is one click away.

## Acceptance checks

Filters: `GET /api/projects/:projectId/tickets`

- [ ] Four optional, repeatable parameters: `status`, `priority`, `assignee` (a teammate id,
      `me` or `unassigned`) and `label` (a label id). Values of one parameter are combined
      with OR, different parameters with AND. Without them the list is unchanged.
- [ ] On `checkout` (as Maya, with the test seed):
  - `?status=blocked` returns 12 tickets, `CHK-188` first.
  - `?status=open&status=blocked` returns 32.
  - `?priority=urgent&assignee=unassigned` returns exactly `CHK-205` and `CHK-204`.
  - `?assignee=me` returns 21 tickets (every status).
  - `?assignee=me&assignee=unassigned&status=open&status=in_progress&status=blocked`
    returns 19.
  - `?label=4&label=5` (Payments or Taxes) returns 38.
  - `?status=open&status=in_progress&priority=high&priority=urgent&label=4` returns
    `CHK-196`, `CHK-182`, `CHK-160`, `CHK-176`, in that order.
- [ ] Filters combine with `sort` and `page`, and `totalItems` counts the filtered tickets.
- [ ] Invalid values give `400 validation_error`: `?status=done`, `?priority=critical`,
      `?label=payments`, `?assignee=`. A label of another project gives
      `label: 10 is not a label of this project.`

Saved views (private: only their owner sees them)

- [ ] A new `saved_views` table (`id`, `project_id`, `owner_id`, `name`, `filters` as JSON
      text, `created_at`), added with a generated migration.
- [ ] `GET /api/projects/:projectId/views` returns the current user's views in the project,
      by name, each with `id`, `name` and `filters`. Other people's views never appear.
- [ ] `POST /api/projects/:projectId/views` `{ name, filters }` returns 201. The name is
      trimmed, 1 to 60 characters, and unique among the user's views in the project
      (`409 conflict`: `You already have a view called "Urgent".`). `filters` is validated
      with the same schema as the list's filters, when saved and when read back.
- [ ] Every member can save views, viewers included: a private view changes nothing anyone
      else sees, so it needs membership (`authorize(context, projectId)`), not
      `editTickets`. Both routes give the usual 404 for `billing`.

Web: `/projects/:projectId`

- [ ] The filters live in the table toolbar, not in the page header: Status, Priority,
      Assignee (Me and Unassigned first, then the project's agents and admins) and Label,
      each a multi-select from the design system. Active values show as chips; "Clear
      filters" resets them.
- [ ] Filters live in the URL (`?status=open&status=blocked&assignee=me`) and changing one
      goes back to page 1. Opening such a URL shows the filters selected; unknown values in
      the URL are ignored instead of breaking the page.
- [ ] When nothing matches: "No tickets match these filters" with a "Clear filters" button.
- [ ] "Save view" (shown while filters are active) opens a dialog asking for a name. The
      sidebar lists the current project's views under its name; clicking one opens the
      list with its filters, and the view is highlighted while the URL matches it.

## Stretch: share and delete views

For whoever finishes early. Sharing is where permissions come in: a good question to raise
while grilling the core spec, too.

- [ ] `saved_views` gets a `shared` column (a second migration, default `false`). `POST`
      accepts `shared`; `GET` returns the user's own views plus the project's shared views,
      each with `shared` and `owner`.
- [ ] Only agents and admins may create a shared view: a new `shareViews` permission in
      `auth/policy.ts`, shown in `project.permissions`. A viewer (`ravi-patel`) who posts
      `shared: true` gets `403 Viewers of Checkout cannot share views.`, but still sees and
      opens the project's shared views, and can still save private ones.
- [ ] `DELETE /api/projects/:projectId/views/:viewId` returns 204 for the owner, and for an
      admin of the project on a shared view. Someone else's private view is a 404 (it is
      invisible); someone else's shared view is a 403 for agents and viewers.
- [ ] Web: the save dialog gets "Share with the project" (only with `shareViews`); shared
      views show in the sidebar with a small icon; the owner (or an admin, for shared
      views) can delete a view from its menu, after a confirmation.
- [ ] Watch for: a delete that checks ownership in the service with an inline role test
      instead of the policy; deleting by id without the project in the query (a view id
      from another project must be a 404 too).

## Out of scope

Renaming or editing views, reordering them, counts next to views, filters on My tickets,
search (feature 02).

## Likely files

- `packages/shared/src/tickets.ts` (filters in `ticketListQuerySchema`), `views.ts` (new)
- `apps/api/src/modules/tickets/tickets.repository.ts` (`matchesFilter()`), `tickets.service.ts`
- `apps/api/src/db/schema.ts`, a new migration, `apps/api/src/modules/views/*` (new)
- `apps/web/src/features/tickets/FilterBar.tsx`, `use-ticket-list-query.ts`, `TicketListPage.tsx`,
  `apps/web/src/features/views/*` (new), the sidebar

## Watch for

- Repeated query parameters: Hono passes `?status=open` as a string and
  `?status=open&status=blocked` as an array. The schema must accept both, and the web must
  `append` values to `URLSearchParams`, not `set` them.
- A label filter written as a join duplicates rows and breaks `totalItems`. Use `exists`
  inside `matchesFilter()`, so the list and the count stay the same query.
- `assignee=me` resolved in the browser: the API must turn `me` into the current user.
- Reusing `editTickets` for views: viewers would get a 403 for a personal preference.
- Loading views without filtering by owner, so everyone sees everyone's views.
- `filters` read back from JSON without validation: the column is untyped text.
