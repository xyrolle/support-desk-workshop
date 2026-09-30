# Live updates

Needs: `v2/base`.

## User story

As a support engineer working next to my team, I want the list and the ticket I have open
to change as soon as a teammate changes them, so that two of us never answer the same
customer.

## Acceptance checks

API: `GET /api/projects/:projectId/events` (Server-Sent Events)

- [ ] Returns `text/event-stream` and sends `event: ticket.changed` with
      `data: {"ticketId":"CHK-205"}` whenever a ticket of the project changes: a new
      `ticket_events` row or a new comment. The payload carries ids only.
- [ ] The stream follows the database, not the process: it looks for rows newer than the
      last id it sent (once a second), so a change made by another API process on the same
      database file shows up. That is how the demo runs a second user:
      `DEMO_USER_ID=diego-alvarez PORT=8788 npm run start -w @support-desk/api`.
- [ ] Only members get a stream (`authorize()`); `billing` is the usual 404. Events of other
      projects never appear.
- [ ] A heartbeat comment every 20 seconds keeps proxies from closing it; the poll stops when
      the client disconnects.
- [ ] A test opens the stream with `app.request()`, changes `CHK-205` through the API and
      reads one `ticket.changed` event for it.

Web

- [ ] The list and the ticket page subscribe with `EventSource` and invalidate the queries of
      the changed ticket, so it updates in place. A changed row flashes briefly.
- [ ] On the ticket page, a change by someone else shows a quiet note "Updated by Diego
      Alvarez just now" in the activity.
- [ ] The connection closes when you leave the project, and reconnects on its own.

## Out of scope

Presence ("Diego is viewing"), typing indicators, WebSockets, notifications.

## Likely files

- `apps/api/src/modules/live/*` (new), `app.ts`
- `apps/web/src/api/use-project-events.ts` (new), the list and ticket pages

## Watch for

- An in-process event emitter: it misses changes from the second server process.
- Sending ticket contents in the event (a viewer's stream is fine, but keep it to ids).
- A poll that never stops after the browser closes the tab.
- The Vite proxy or compression buffering the stream: send the right headers and flush.
