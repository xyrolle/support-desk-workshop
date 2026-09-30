# Support Desk

The ticket tracker of Brightcart's support team, and the starter project for the
**Agentic Development in Cursor** course. During the day we build the features in
[`docs/features`](docs/features) on top of it with Cursor's agent.

## Quick start

```bash
nvm use               # Node 24
npm ci
npm run setup:check   # prints PASS/FAIL for Node, install, database, API and browser
npm run dev           # API on http://localhost:8787, web on http://localhost:5173
```

There is no login: every request acts as the demo user **Maya Chen**, an admin of
Checkout and an agent in Mobile App and Internal Tools. Billing is hidden from her.

## Commands

| Command               | What it does                                                    |
| --------------------- | --------------------------------------------------------------- |
| `npm run dev`         | API and web together, with reload                               |
| `npm run db:seed`     | Rebuild the local database with fresh demo data (350 tickets)   |
| `npm test`            | Unit and integration tests (Vitest)                             |
| `npm run test:e2e`    | End-to-end smoke test (Playwright)                              |
| `npm run check`       | Biome, TypeScript and unit tests: run before you push           |
| `npm run format`      | Format and fix everything with Biome                            |
| `npm run setup:check` | Verify a fresh machine is ready                                 |

## Architecture

```
apps/web         React 19 · Vite · Tailwind CSS · Base UI · TanStack Query · React Router
   │  fetch /api  (Vite proxies to the API in dev)
   ▼
apps/api         Hono: routes → services → repositories
   │             every service asks auth/policy.ts first
   │  Drizzle ORM
   ▼
SQLite           apps/api/data/support-desk.db  (in-memory in tests)

packages/shared  zod schemas and types, imported by both apps
```

- **Domain**: four projects with members (viewer, agent, admin), tickets with a status,
  priority, assignee, labels and a requester from a customer organization, a
  conversation (public replies, internal notes, customer messages) and an activity log.
- **API**: one access policy (`apps/api/src/auth/policy.ts`). Hidden and missing projects
  return the same 404; viewers get a 403 on any change. Every ticket change writes its
  activity event in the same transaction. Errors always look like
  `{ "error": { "code": "...", "message": "..." } }`.
- **Web**: the design-system primitives live in `apps/web/src/components/ui`; run
  `npm run dev` and open `/dev/ui` to see them all.
- **Demo data**: generated from hand-written tickets, relative to the moment you seed, so
  "2 hours ago" is true on the day. Tests use a fixed clock.

See [`AGENTS.md`](AGENTS.md) for conventions, [`docs/features`](docs/features) for the
live-session tickets and [`docs/backlog`](docs/backlog) for spare ones.
