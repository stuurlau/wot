# Agent workflow

Daily loop for farming out implementation work to opencode agents.

## Concepts

- `plans/backlog.md` — task intake. Write rough one-liners here.
- `plans/*.md` — implementation plans, one per task, written by the **planner** agent.
- **planner** (`.opencode/agent/planner.md`) — researches the codebase, writes the plan, never touches code.
- **builder** (`.opencode/agent/builder.md`) — implements a plan on branch `agent/<slug>`, commits logically, opens a PR to `main`.

## Morning

    /daily            # or /daily <specific backlog task>

Summarizes backlog, plans, open PRs; proposes 1–2 tasks for today. On your
go-ahead it runs the planner for each chosen task.

## Midday

    /implement plans/20260914-<slug>.md

Dispatches the builder with the plan. You review the PR it opens; after
approval the backlog item is marked done.

## Direct use

You can also invoke the agents directly:

    @planner Add an endpoint that ...
    @builder plans/20260914-<slug>.md

## Rules of the loop

- Plans with open questions get confirmed by you before building.
- The builder pushes `agent/*` branches and PRs to `main`; merging is your job.
- After merge, the API deploys automatically (see docs/deployment.md).
