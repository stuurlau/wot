# Programming datamodel — training blocks & planned sessions

**Date:** 2026-10-10
**Status:** proposal

## Why

Issue #13 asks for a programming feature: plan workout sessions up front.
Two entry flows must be supported:

- **Blueprint** — pick a past session and reuse it as the template for a
  planned session.
- **Compose** — select exercises with a set target each, then distribute
  them over training days; exercises can still be added, removed or swapped
  during distribution.

The top-level concept is a **training block**: a repeating pattern of 1 or
2 weeks (e.g. week 1 push/pull/push, week 2 pull/push/pull) repeated for
the block's duration (e.g. 8 weeks). The Plan tab (see
`20260321_ui_ux_design.md`) renders the current pattern as a lightweight
calendar with optional planned sessions, so the datamodel is built around
the pattern, not absolute dates. This doc covers the datamodel only — no
implementation yet, matching the issue's "start with thinking out the
datamodel".

## Proposed tables

### `program_training_block`

Container for one training block.

- `id` uuid PK, `user_id` text FK → `users` (CASCADE)
- `name` text (e.g. "Push/pull 8-week block", defaults to something derived
  like the creation week)
- `pattern_weeks` smallint — length of the repeating pattern: 1 or 2 weeks
- `duration_weeks` smallint nullable — total block length (e.g. 8); null =
  open-ended, the pattern repeats until the block is archived
- `status` text: `active` | `archived`. At most one active block per user,
  enforced in app logic (not a partial unique index) so history stays
  inspectable.
- `created_at` timestamp

### `plan_exercise_sets`

Set targets per pattern period — the input of the compose flow. Lives on
the block, not on a day: distribution over days is derived from these plus
the planned sessions' exercises.

- `id` uuid PK, `block_id` uuid FK → `program_training_block` (CASCADE)
- `exercise_name` text — free text, no exercise library (same convention as
  `training_session_exercises.name`)
- `target_sets` integer (total per pattern period across all days)

### `planned_sessions`

One slot in the block's pattern.

- `id` uuid PK
- `block_id` uuid FK → `program_training_block` (CASCADE)
- `user_id` text FK → `users` (CASCADE) — all app tables scope by user
  directly for the standard query pattern
- `pattern_day` smallint — ordinal training day within the pattern (day 1,
  2, …, 7 × `pattern_weeks`); sessions are placed and ordered by this, not
  pinned to a calendar date
- `weekday` smallint 0–6 nullable — optional hint for users who think in
  weekdays; the calendar view can render it, but the pattern day stays the
  source of truth so a session can be done on any day
- `title` text nullable, `type` text — same session-type set as
  `training_sessions` (`strength`, `cardio`, `mobility`, …)
- `sort_order` smallint — multiple sessions per pattern day stay ordered
- `source_session_id` uuid FK → `training_sessions` nullable — blueprint
  provenance; the copy is a snapshot, edits don't back-sync
- `status` text: `planned` | `done` | `skipped`
- `realized_session_id` uuid FK → `training_sessions` nullable — set when
  the planned session is started for real (see materialization)
- `created_at` timestamp

### `planned_exercises`

Exercises inside one planned session — the distribution step edits these.

- `id` uuid PK, `planned_session_id` uuid FK → `planned_sessions` (CASCADE)
- `name` text, `body_regions` text[] (same conventions as
  `training_session_exercises`)
- `superset_group` smallint nullable
- `sort_order` smallint
- `target_sets` integer — sets to prefill on materialization; initialized
  from the blueprint's set count or split from `plan_exercise_sets` during
  distribution
- `target_rpe` numeric(3,1) nullable — optional RPE target (1–10, decimals
  allowed, same convention as wellness RPE); weight/reps prescription stays
  out deliberately
- `notes` text nullable

## Flows

**Blueprint.** User picks a past session; its exercises (name, body regions,
superset group, order, set count) are copied into a new `planned_sessions`
row on a pattern day with `source_session_id` set. Subsequent edits of
either side never sync — the copy is the point.

**Compose.** User fills `plan_exercise_sets` (exercise + sets per pattern
period), then distributes: assign each target's sets across one or more
pattern days, which creates `planned_exercises` rows. Targets stay on the
block so the Plan tab can show "Squat: 6/10 sets placed" — coverage is
computed at query time (sum of `planned_exercises.target_sets` per name vs.
`plan_exercise_sets.target_sets`); nothing derived is stored.

**Materialization.** Starting a planned session creates a real
`training_sessions` row with exercises and `target_sets` empty set rows
prefilled (same prefill path as repeating an exercise), links it via
`realized_session_id`, and marks the planned session `done`. Skipping just
sets `status`; the calendar view distinguishes both from `planned`.

**Flexibility.** A planned slot is intent, never a gate: a session planned
for a given pattern day (or weekday hint) can be done days later — starting
it is always allowed regardless of when the slot was. The plan never blocks
training.

## Staging

1. Tables + Plan tab pattern view with CRUD on planned sessions (no
   materialization).
2. Blueprint copy flow.
3. Compose flow with targets + distribution.
4. Materialization into the workout screen.

## Decisions from review

- **Training blocks & 2-week patterns** — in scope via
  `program_training_block`: `pattern_weeks` (1 or 2) repeated for
  `duration_weeks`. Longer cycles fit later by raising the `pattern_weeks`
  cap without breaking this model.
- **No absolute dates** — pattern days plus an optional weekday hint cover
  the calendar; doing a session days later than planned is explicitly fine
  (see Flexibility), and `skipped` covers missed intent.
- **Materialization prefills set count only** — no weight/reps
  prescription; an optional `target_rpe` per exercise instead. The point of
  a plan is intent, and last-session prefill already exists in the workout
  screen.
- **Progression** (planned load/RPE progression across the weeks of a
  block) — deliberately deferred; it layers a week index and per-week
  target overrides on top of this model later.
