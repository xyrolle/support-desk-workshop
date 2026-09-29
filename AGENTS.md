# AGENTS.md

Support Desk is a small ticket tracker: projects, tickets, teammates. It is the starter
app for a live course, so keep changes small, readable and in the style of the code
around them. Feature specs for the session live in `docs/features/NN-name.md`.

## Run it

```bash
npm ci
npm run setup:check   # PASS/FAIL for Node 24, install, database seed, API health, Playwright
npm run dev           # API :8787 (Hono) + web :5173 (Vite proxies /api to the API)
```

There is **no real authentication**. Every request acts as a fixed demo user
(`DEMO_USER_ID`, default `maya-chen`), set up in `apps/api/src/auth/current-user.ts`.
Maya belongs to `checkout` and `mobile-app`; `internal-tools` is hidden from her.

## Commands

| Command            | Use it to                                               |
| ------------------ | ------------------------------------------------------- |
| `npm run check`    | Run Biome, typecheck and unit tests (must pass)         |
| `npm test`         | Run all unit tests; `npx vitest run <path>` runs one    |
| `npm run test:e2e` | Run the Playwright smoke test (own ports, in-memory DB) |
| `npm run format`   | Format and auto-fix with Biome                          |
| `npm run db:seed`  | Reset the local database to the demo data               |

After editing `apps/api/src/db/schema.ts`, create a migration with
`npm run db:generate -w @support-desk/api -- --name <change>`.

## Architecture

```
packages/shared/src/     zod schemas + inferred types (Ticket, Project, User, TicketListQuery, TicketPage, ErrorResponse)
apps/api/src/
  app.ts                 builds the Hono app: middleware, routes, error handler
  server.ts              starts the server (seeds an empty database)
  config.ts              environment variables, parsed with zod
  auth/                  current-user.ts (demo user), access.ts (THE access rule)
  http/                  errors.ts, validation.ts, pagination.ts, app-env.ts
  db/                    schema.ts, client.ts, seed.ts, seed-data/, migrations/
  modules/<name>/        <name>.routes.ts → <name>.service.ts → <name>.repository.ts, <name>.test.ts
apps/web/src/
  api/                   client.ts (typed fetch), queries.ts (TanStack Query hooks)
  features/<name>/       pages and components for one feature
  components/            the app shell: Layout, Sidebar, SidebarSection, TopBar, Breadcrumbs, PageHeader, Panel, Pagination
  components/ui/         design-system primitives: Button, Select, Combobox, Menu, Dialog, Toast, Table, ... (popups on Base UI)
  dev/                   the UI kit page at /dev/ui, every primitive in one place (development only)
  styles/index.css       Tailwind entry and design tokens
```

## Where rules live

- **Routes** validate input with `validate()` and a shared schema, call one service
  function, and return `c.json(...)`. Nothing else.
- **Services** own business rules. Every project-scoped service calls
  `requireProjectAccess()` first; hidden and missing projects must give the same 404.
- **Repositories** own Drizzle queries and return shared types. Filters go through
  one `matchesFilter()` function so list and count always agree.
- **Errors**: throw `NotFoundError` or `ValidationError`; `handleError` turns them into
  `{ "error": { "code", "message" } }`. Unexpected errors become a generic 500.
- **Web data** goes through `api/client.ts` (which parses responses with zod) and the
  hooks in `api/queries.ts`. Components never call `fetch`.

## Conventions

- TypeScript strict, ESM. Node runs the API's `.ts` files directly, so relative imports
  end in `.ts`/`.tsx`, and enums and constructor parameter properties are not allowed.
- zod at every edge: request input, environment variables, API responses, URL state.
  Put schemas shared by API and web in `packages/shared`.
- Names: `kebab-case.ts` for modules and hooks, `PascalCase.tsx` for components,
  `<module>.<layer>.ts` in the API. One component per file; a `components/ui/` file
  exports the parts of one primitive (`Select`, `SelectTrigger`, `SelectItem`).
- Small functions, early returns, descriptive names. No commented-out code.
- Tests live next to the code as `*.test.ts(x)`. API tests use `createTestApp()`,
  which seeds an in-memory database with fixed dates.
- UI: reuse the tokens (`bg-canvas`, `text-ink-muted`, `border-line`) and the primitives in
  `components/ui/` (all of them are on http://localhost:5173/dev/ui); every data view needs
  loading, error and empty states, in light and dark.
- **Do not add dependencies without asking.** The `overrides` entry in `package.json`
  patches an old esbuild that drizzle-kit pulls in; leave it alone.
- Format with Biome (`npm run format`). `npm run check` must pass before you hand off.
