# Programming datamodel — weekly planned sessions

**Date:** 2026-10-10
**Status:** proposal

## Why

Issue #13 asks for a programming feature: plan weekly workout sessions up
front. Two entry flows must be supported:

- **Blueprint** — pick a past session and reuse it as the template for a
  planned session.
- **Compose** — select exercises with a weekly set target each, then
  distribute them over training days; exercises can still be added, removed
  or swapped during distribution.

The Plan tab (see `20260321_ui_ux_design.md`) is a lightweight week calendar
with optional planned sessions, so the datamodel is built around a repeating
week, not absolute dates. This doc covers the datamodel only — no
implementation yet, matching the issue's "start with thinking out the
datamodel".

## Proposed tables

### `training_plans`

Container for one weekly program.

- `id` text PK, `user_id` text FK → `user` (CASCADE)
- `name` text (e.g. "Push/pull/legs", defaults to something derived like the
  creation week)
- `status` text: `active` | `archived`. At most one active plan per user,
  enforced in app logic (not a partial unique index) so history stays
  inspectable.
- `created_at` timestamp

### `plan_exercise_targets`

Weekly set targets — the input of the compose flow. Lives on the plan, not
on a day: distribution over days is derived from these plus the planned
sessions' exercises.

- `id` text PK, `plan_id` text FK → `training_plans` (CASCADE)
- `exercise_name` text — free text, no exercise library (same convention as
  `training_session_exercises.name`)
- `target_sets` integer (weekly total across all days)

### `planned_sessions`

One slot on the week calendar.

- `id` text PK
- `plan_id` text FK → `training_plans` (CASCADE)
- `user_id` text FK → `user` (CASCADE) — all app tables scope by user
  directly for the standard query pattern
- `weekday` smallint 0–6 — recurring weekly slot (a week calendar has no
  absolute dates; surfacing "what's planned today" is a weekday lookup)
- `title` text nullable, `type` text — same session-type set as
  `training_sessions` (`strength`, `cardio`, `mobility`, …)
- `sort_order` integer — multiple sessions per weekday stay ordered
- `source_session_id` text FK → `training_sessions` nullable — blueprint
  provenance; the copy is a snapshot, edits don't back-sync
- `status` text: `planned` | `done` | `skipped`
- `realized_session_id` text FK → `training_sessions` nullable — set when
  the planned session is started for real (see materialization)
- `created_at` timestamp

### `planned_exercises`

Exercises inside one planned session — the distribution step edits these.

- `id` text PK, `planned_session_id` text FK → `planned_sessions` (CASCADE)
- `name` text, `body_regions` text[] (same conventions as
  `training_session_exercises`)
- `superset_group` integer nullable
- `sort_order` integer
- `target_sets` integer — sets to prefill on materialization; initialized
  from the blueprint's set count or split from `plan_exercise_targets`
  during distribution
- `notes` text nullable (e.g. "top set @8 RPE")

## Flows

**Blueprint.** User picks a past session; its exercises (name, body regions,
superset group, order, set count) are copied into a new `planned_sessions`
row with `source_session_id` set. Subsequent edits of either side never
sync — the copy is the point.

**Compose.** User fills `plan_exercise_targets` (exercise + weekly sets),
then distributes: assign each target's sets across one or more weekdays,
which creates `planned_exercises` rows. Targets stay on the plan so the Plan
tab can show "Squat: 6/10 sets placed" — coverage is computed at query time
(sum of `planned_exercises.target_sets` per name vs.
`plan_exercise_targets.target_sets`); nothing derived is stored.

**Materialization.** Starting a planned session creates a real
`training_sessions` row with exercises and `target_sets` empty set rows
prefilled (same prefill path as repeating an exercise), links it via
`realized_session_id`, and marks the planned session `done`. Skipping just
sets `status`; the week view distinguishes both from `planned`.

## Staging

1. Tables + Plan tab week view with CRUD on planned sessions (no
   materialization).
2. Blueprint copy flow.
3. Compose flow with targets + distribution.
4. Materialization into the workout screen.

## Open questions

- Multi-week cycles (progression, deload weeks) — deliberately out of scope;
  a repeating single week covers the Plan tab's calendar. Cycles would add
  `week_index` on top of `weekday` later without breaking this model.
- Whether `planned_sessions` needs absolute-date overrides (holiday weeks).
  Deferred — `skipped` covers the common case.
- Does materializing prefill set *values* from the blueprint (weight/reps)
  or only set *count*? Proposal: count only — the point of a plan is
  intent, and last-session prefill already exists in the workout screen.
