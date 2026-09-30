---
name: review-change
description: Review the current Support Desk diff before committing or opening a PR.
---

1. Run `git status`, `git diff` and `git diff --staged`; read each changed file in full.
2. Check the rules AGENTS.md states: `authorize()` or `visibleProjectIds()` from `auth/policy.ts` on every project route; ticket changes write activity events in the same `inTransaction()`; time from `context.clock`; zod at every edge; no new dependencies.
3. Check that nothing copies `modules/reports/` (raw SQL, `legacy-dates.ts`, `formatTicketRef`).
4. Check the tests: one per acceptance check, the hidden-project 404, the viewer 403, the activity event.
5. Check the UI: loading, error and empty states, light and dark mode; customer text rendered as text.
6. Run `npm run check` (and `npm run test:e2e` if pages changed).
7. Report blocking issues first, then nits, each with `file:line` and a suggested fix.
