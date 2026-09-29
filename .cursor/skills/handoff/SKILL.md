---
name: handoff
description: Write a handoff note so a teammate or another agent can continue Support Desk work.
---

1. Run `npm run check` and record the honest result (which step failed, if any).
2. Run `git status` and `git log --oneline -5` to capture the branch state.
3. Reply in chat (not in a file) with: the goal and its `docs/features` spec, what is done, which acceptance criteria are still open, decisions and why, open questions.
4. End with the exact commands to resume, including `npm run db:seed` if the data changed.
