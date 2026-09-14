---
description: Recon of the codebase and the day's task list.
agent: build
---

Give me a practical run-down to start the day:

1. Read `plans/backlog.md` and `plans/` — list current plans and their status
   (draft / in-review / done).
2. `git status`, `git log --oneline -10`, and `gh pr list` — anything unmerged,
   unwritten, or in review?
3. From the backlog, propose which 1–2 tasks are worth doing today
   (prefer: unfinished plan drafts first, then new backlog items). If $ARGUMENTS
   names a specific task, propose that one only.
4. Wait for my go-ahead. Then, for each chosen task, use the **planner**
   subagent to produce a plan file (or point out that a plan already exists).

$ARGUMENTS
