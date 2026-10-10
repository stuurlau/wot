# Flexibility mode and set timer

**Date:** 2026-10-10
**Status:** done
**Issue:** #9 — Flexibility / mobility

## Why

Issue #9 asks for two things:

1. An option for flexibility exercises measured by **time** or **time ×
   weight** (e.g. a 45-second stretch, or a weighted hold).
2. A **timer** for flexibility or cardio exercises, so holds and intervals
   don't have to be measured with an external stopwatch and typed in.

## Decisions

### Flexibility is a third set-logging mode

The exercise block in the workout screen gained a third mode chip next to
`strength` and `cardio`: **`flexibility`**. Its set row shows two inputs:

- `duration` in **seconds** (the hold), always present
- `weight` in kg, optional — blank means a plain stretch, filled means
  "time × weight" (weighted stretch, loaded mobility)

Both map onto the existing `training_session_exercise_sets` columns, so there
is **no schema or API change**. A flexibility set is simply
`{ duration, weight? }`, matching the data model's "flexible performance
metrics" intent for sets.

### Hold/interval timer on the new-set row

Time-based modes (`flexibility` and `cardio`) now show a small ▶ control on
the "add next set" row:

- Tap ▶ to start; the control shows the running elapsed time as `m:ss`.
- Tap again (■) to stop: the elapsed time fills the duration draft — seconds
  for flexibility, minutes (1 decimal) for cardio.
- Pressing ✓ while the timer runs stops it and logs the elapsed time; the
  timer value wins over anything typed in the duration field, because
  starting it declares the intent to measure this set.
- The timer is local component state and lives only on the new-set row (which
  remounts after each logged set), so a logged set automatically resets it.
  Saved sets stay editable inline as before.

### Cardio duration unit fix (required by the timer)

The `duration` column is integer **seconds** (data model), and the set-input
schema enforces integers. The cardio field is labelled `min` and previously
stored the typed value raw, so "30" minutes landed in a seconds column (and
rendered as "1 min" on the session detail screen). A timer that produces
seconds — including sub-minute intervals — cannot work under that mismatch,
so the cardio field now converts: it **displays and edits minutes but stores
whole seconds** (`minToSec`/`secToMin`, 1-decimal display rounding). Timer
values bypass the minute round-trip and store exact seconds.

Consequence: cardio sets logged *before* this change (raw minutes in a
seconds column) now display as tiny minute values in the set row — they were
already mis-rendered on the detail screen, and only new data is fully
correct. No migration was added: the values are ambiguous (a stored `30`
could be a real 30-second interval) and cardio logging has been niche so far.

### Session detail display

`app/session/[id].tsx` labels sets by shape: distance sets keep
`d km · m min`; duration-based sets render as a clock `m:ss` with an optional
`· w kg` suffix (a flexibility hold); weight/reps sets are unchanged.

## Out of scope (deliberately)

- **Mode inference from exercise history** (UX doc F5 wants the field set
  inferred from the last logged set): `GET /exercises/recents` does not
  expose duration/distance of the last set, so inference needs an API change
  and is left for a follow-up. The mode defaults to `strength`; one tap
  switches.
- Wiring the per-user `strengthFields`/`cardioFields` settings into the
  workout screen (listed as follow-up work in
  `20261010_exercise_tags_settings_reorder_prefill.md`).
- Migrating legacy cardio duration values (see above).
