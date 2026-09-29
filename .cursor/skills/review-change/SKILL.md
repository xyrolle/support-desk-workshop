---
name: review-change
description: Review the current Support Desk diff before committing or opening a PR.
---

1. Run `git status`, `git diff` and `git diff --staged`; read each changed file in full.
2. Check it against AGENTS.md: layers respected, `requireProjectAccess()` on project routes, zod at every edge, shared types reused, no new dependencies.
3. Check the tests: one per acceptance criterion, plus the hidden-project 404.
4. Check the UI: loading, error and empty states, light and dark mode.
5. Run `npm run check` (and `npm run test:e2e` if pages changed).
6. Report blocking issues first, then nits, each with `file:line` and a suggested fix.
