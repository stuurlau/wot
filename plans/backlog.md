# Backlog

Task intake for the agent workflow. Add rough task lines here (plain bullets).
The `/daily` command reads this file, proposes today's tasks, and the planner
turns them into plans in `plans/`.

Format: one task per bullet, newest at the bottom. Planner/builder annotate
status in place:

- [ ] <task description>
- [x] planned → plans/20260914-slug.md
- [x] done → <PR url>

## Tasks

- [ ]
- [x] planned → plans/20261014-exercise-config-menu.md (set-row editing bug + per-exercise cog menu: fields/seconds/tempo, rir-rpe, tags, body parts; datamodel decision A vs B pending)
- [x] planned → plans/20261017-body-parts.md (hierarchical body parts: 3-level tree, free multi-select across levels, drill-down picker, explorer body-part scope; stacks on #34/#36/#33)
