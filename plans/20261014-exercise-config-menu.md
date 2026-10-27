# Per-exercise config ("cog menu") + set-row editing bug

**Date:** 2026-10-14
**Status:** decided — option A (user-coupled, name-keyed config); bug fixed in PR #32

## Decisions (from sparring)

- **Option A**: `exercise_configs` keyed by `(user_id, exercise_name)` — no
  exercise catalogue; config rows are created lazily on first cog-save.
- **Tempo**: real column on `training_session_exercise_sets` (per-set data),
  but the UI sets it at the **exercise level** (cog menu); new sets are
  stamped with the exercise's current tempo.
- **Flat field list**: per-exercise `fields` is an unrestricted subset of
  weight/reps/rir/rpe/distance/duration — any combination, not constrained
  per mode like the global settings. Tempo is NOT part of `fields` (it
  lives at exercise level).

## Scope

1. **Bug: set-row inputs vanish on web.** Confirmed via screenshot: the
   set-row `TextInput`s use `min-w-[56px]` with no width; on web an `<input>`
   without explicit width falls back to the browser default (~170px), so a
   focused intensity input (plus its siblings) overflows the right-aligned
   row and clips kg/reps off-screen until the set is saved. Native collapses
   the same style to ~56px, which is why it's web-only. Fix: fixed input
   width (`w-[72px]`) on both the add-row and saved-row edit inputs. (A
   secondary discoverability nit remains — saved rows only show the
   intensity field once exercise-level `showIntensity` is on — subsumed by
   the set-row rebuild below.)

2. **Per-exercise set-input config via a cog icon** next to the exercise
   name (workout screen). A sheet to configure, per exercise:
   - set-input fields: weight / reps / **seconds** (weighted holds, e.g.
     plank done as "strength") / distance / **tempo** (new, e.g. "3-2-1")
   - intensity input: RIR / RPE / both / none
   - tags (first UI for the existing `exercise_tags` API from #22)
   - body parts (first editing UI for `body_regions`)
   Everything persisted and re-applied the next time that exercise is added.

## Datamodel (recommended option A)

Sessions keep free-text exercise names (no managed catalogue — the current
convention stays). Per-exercise state attaches to the **name**, following
the `exercise_tags` precedent from #22:

- New table `exercise_configs`:
  - `user_id` text FK → user (CASCADE)
  - `exercise_name` text — the free-text name, trimmed (same key semantics
    as `exercise_tags`); unique per (user, name)
  - `strength_fields` / `cardio_fields` / `flexibility_fields` text[]
    nullable — same enum shape as `user_settings` (extended with `'tempo'`,
    and `'duration'` allowed for strength); null = inherit from global
    settings
  - `body_regions` text[] nullable — prefill when the exercise is added;
    the session instance stays independently editable
  - created/updated timestamps
- New set field: `tempo` text nullable on `training_session_exercise_sets`
  (+ shared zod schema, wire type, migration).
- Endpoints: `GET/PUT /exercises/config` (mirroring the tags endpoints from
  #22: GET returns every name → config pair, PUT replaces one name's
  config). Rename endpoint (#16) cascades to `exercise_configs` rows (and
  already-covered tags) so config follows renames.
- Resolution order for an exercise instance's fields:
  exercise config → global `user_settings` → built-in defaults.

Field enums move to one shared list per mode including `'tempo'` (and
`'duration'` under strength for weighted holds; the hold/interval timer
from #28 becomes available for strength rows with `duration` enabled).

## Mobile changes

- `ExerciseBlock`: cog icon next to the superset badge →
  `ExerciseConfigSheet` (new, rendered inside `Sheet`):
  - field toggles per mode (chips), intensity = whichever of rir/rpe are in
    the strength field list (both allowed — settings already support it)
  - tags editor (chips + add), body-parts editor (suggestion chips from the
    existing fixed list + free text)
  - Save: `PUT /exercises/config`, `PUT /exercises/tags`, and immediately
    PATCH the current exercise instance's `body_regions` so the visible
    exercise updates without waiting for the next add.
- `SetRow` rebuild: render fields from the **resolved config** instead of
  the hardcoded `STRENGTH_FIELDS`/`CARDIO_FIELDS`/`FLEXIBILITY_FIELDS`;
  tempo = text input (pattern like `3-2-1`); saved rows always render every
  configured field (empty = tappable to fill) — this is the structural fix
  for the editing dead-end. The `⇄` flip stays only as a quick toggle
  between rir/rpe when exactly one is configured; hidden when both/neither.
- Picker: unchanged in this round (tag-based grouping is a follow-up).

## Sequencing

1. PR: bug reproduction + isolated set-row fix **only if trivial**; else
   fold into PR 3.
2. PR: shared/types + api — `tempo` column, `exercise_configs` table,
   config endpoints, rename cascade, integration tests.
3. PR: mobile — `ExerciseConfigSheet`, set-row rebuild, settings hooks;
   typecheck + lint.
4. Follow-up (separate): picker grouping by tags; program feature consumes
   config for `planned_exercises`.

## Open decision (spar)

A (above, name-keyed config) vs B (user exercise catalog:
`user_exercises(id, …)` created lazily on first use, sessions keep the name
as a snapshot but gain a nullable `exercise_id` FK). B buys stable identity
(single-row renames, direct references from the future `planned_exercises`)
at the cost of a bigger migration, picker rework, and dropping the "no
exercise library" convention. Recommendation: A now, revisit B when the
programming feature lands — its planned tables are still doc-only, so
nothing is blocked.

## Docs/conventions

- Dated docs entry for the datamodel addition (per AGENTS.md).
- AGENTS.md "no exercise library" line stays true under A; update it if B
  is chosen later.
