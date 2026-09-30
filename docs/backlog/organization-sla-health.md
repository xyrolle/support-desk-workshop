# SLA health on the organization page

Needs: 03 (SLA clocks).

## User story

As an account manager preparing a call with a customer, I want to see at a glance how we
are doing on their open tickets and on first responses lately, so that I know whether to
apologize before they ask.

## Acceptance checks

API: `GET /api/organizations/:organizationId`

- [ ] Adds `sla: { breached, atRisk, onTrack, paused, firstResponses: { total, met } }`:
      the organization's unresolved tickets grouped by their SLA state (03's rules: paused
      when waiting on the customer, breached if any running clock is breached, at risk if
      one has at most 120 business minutes left, on track otherwise), and the tickets opened
      in the last 30 days that got a first response, with how many were on time.
- [ ] Only projects the user can see count. With the test seed, Northgate Outfitters for
      Maya: 2 breached, 1 at risk, 7 on track, 4 paused; 13 first responses, 7 on time. For
      Ravi (who sees Billing, not Internal Tools): 2, 1, 7, 3; 12 responses, 7 on time.
- [ ] The numbers come from 03's shared module, measured with the request's clock.

Web

- [ ] The organization page shows a small stacked bar of the four states with a legend and
      counts (red, amber, green, grey), and "First responses on time: 7 of 13 (54%) in the
      last 30 days".
- [ ] The bar is plain SVG or CSS with an accessible text alternative; an organization with
      no open tickets shows "No open tickets" instead of an empty bar.
- [ ] Each segment links to the organization's ticket list filtered to those tickets.

## Out of scope

History charts, per-contact numbers, exporting.

## Likely files

- `apps/api/src/modules/customers/customers.service.ts` (+ test), 03's shared module
- `packages/shared/src/customers.ts`
- `apps/web/src/features/customers/SlaHealth.tsx` (new), the organization page

## Watch for

- A chart library for one bar: ask first; SVG is enough.
- Counting Billing tickets for someone who cannot see Billing.
- Recomputing SLA rules here instead of calling 03's module.
