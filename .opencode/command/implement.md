---
description: Implement one plan and open a PR.
agent: build
---

Implement the plan I give you using the **builder** subagent.

1. `$ARGUMENTS` is either a path to a `plans/*.md` file or a task description
   that maps to a plan file — resolve it to exactly one plan.
2. If that plan has `status: draft` or unchecked **Open questions**, ask me to
   confirm the open questions before building.
3. Dispatch the builder subagent with the plan path. Wait for it to finish.
4. When it returns, show me: the PR link, the commit list, and the
   verification results. Flag anything the builder deviated on.
5. After my review, mark the backlog item done
   (`- [x] done → <PR url>`) if I approve it.

$ARGUMENTS
