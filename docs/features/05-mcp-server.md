# 05 · MCP server for ticket data

## User story

As a developer working in Cursor, I want the agent to query Support Desk's real ticket
data through MCP tools, so that it can answer questions like "which Checkout tickets are
blocked?" without me copying data into the chat.

## Acceptance criteria

- [ ] A new workspace `apps/mcp` (`@support-desk/mcp`) runs an MCP server over stdio with
      `@modelcontextprotocol/sdk`. This is a new dependency: ask first, then pin the exact
      version.
- [ ] The server reads data through the running HTTP API (`SUPPORT_DESK_API_URL`, default
      `http://localhost:8787/api`), never the database, so the access rule still applies.
      Responses are parsed with the schemas from `@support-desk/shared`.
- [ ] Three read-only tools, each with a zod input schema and a one-line description:
  - `list_projects`: the projects the demo user can see.
  - `get_project` `{ projectId }`: one project.
  - `list_tickets` `{ projectId, page? }`: one page of tickets (add `status` and `q` if
    features 01 and 02 are merged).
- [ ] Tool results are JSON text the agent can read, for example
      `list_tickets { "projectId": "checkout" }` returns 20 tickets and `totalItems: 30`.
- [ ] A hidden or unknown project returns a tool error (`isError: true`) with the API's
      message `Project "internal-tools" was not found.`, and the server keeps running.
- [ ] If the API is not running, tools return an error that says so and suggests
      `npm run dev`.
- [ ] `.cursor/mcp.json` registers the server as `support-desk`
      (`node apps/mcp/src/server.ts`), and the agent can call `list_projects` from Cursor.
- [ ] Tests call each tool through an MCP client connected with `InMemoryTransport`, with
      `fetch` stubbed, and run as part of `npm test`.

## Out of scope

Write tools (assign, create, close), authentication, HTTP/SSE transport, MCP resources
and prompts.

## Likely files

- `apps/mcp/package.json`, `apps/mcp/tsconfig.json`, `apps/mcp/vitest.config.ts`
- `apps/mcp/src/server.ts`, `src/support-desk-client.ts`, `src/tools/*.ts`, `src/server.test.ts`
- `vitest.config.ts` (add the project), `.cursor/mcp.json`, `AGENTS.md` (commands)
