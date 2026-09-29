---
name: tdd
description: Implement a Support Desk change test-first. Use when building a spec from docs/features or fixing a bug.
---

1. Read the spec in `docs/features/` and list its acceptance criteria.
2. Take the first criterion and write one failing test next to the code (`*.test.ts`), using `createTestApp()` for the API.
3. Run just that file: `npx vitest run <path>`. Confirm it fails for the expected reason.
4. Write the smallest change that passes, following routes → services → repositories.
5. Re-run the file, then `npm test`. Move to the next criterion.
6. Finish with `npm run check`, and `npm run test:e2e` if a page changed.
