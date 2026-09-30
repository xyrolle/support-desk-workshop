---
name: tdd
description: Implement a Support Desk change test-first. Use when building a spec from docs/features or fixing a bug.
---

1. Read the spec in `docs/features/` and list its acceptance checks.
2. Take the first check and write one failing test next to the code (`*.test.ts`), using `createTestApp()` and the fixed `TEST_NOW`.
3. Run just that file: `npx vitest run <path>`. Confirm it fails for the expected reason, not a typo.
4. Write the smallest change that passes: routes → services (policy first, `inTransaction` + `recordTicketEvents` for ticket changes) → repositories.
5. Re-run the file, then `npm test`. Move to the next check.
6. Finish with `npm run check`, and `npm run test:e2e` if a page changed.
