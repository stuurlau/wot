# Exercise tags, set-input settings, reorder + prefill APIs

**Date:** 2026-10-10
**Status:** done (APIs + settings UI; drag-reorder UI pending)

## Why

Issue #13 ("Bugs and nice to haves") bundles five requests. This change lands
the data model and API surface for four of them; the workout-screen drag UI
and the programming/weekly-plan feature follow separately.

## Decisions

### Exercise tags

Users group free-text exercise names with self-created tags ("prehab",
"flexibility", a personal goal). There is no exercise library, so tags attach
to the exercise **name**, not a catalogue entry — mirroring `body_regions`:
plain strings, no lookup table.

- `exercise_tags` (migration `0005_pink_mauler`): one row per
  `(user_id, exercise_name, tag)` with a unique index on that triple and
  cascade delete on the user.
- Tag names are trimmed and lowercased in the shared zod schema so casing
  cannot split a group.
- Wire contract: `GET /exercises/tags` returns every
  `{ exerciseName, tags }` pair for the user; `PUT /exercises/tags` has
  **replace semantics** — the body becomes the full tag set of that exercise
  name (empty array clears it). Max 25 tags per exercise.

### User settings (set-input fields)

One `user_settings` row per user: `user_id` PK plus a `data` jsonb blob
validated against `userSettingsSchema` (@wot/types) on write. The blob keeps
UI preferences migration-free; a parse failure on read (e.g. after a schema
change) falls back to `defaultUserSettings` instead of breaking the client.

The first preferences are the per-mode set-input fields:

- `strengthFields`: subset of `weight / reps / rir / rpe` (default
  `weight × reps`)
- `cardioFields`: subset of `weight / reps / distance / duration` (default
  `distance × duration`)

At least one field per mode is enforced client- and server-side. The settings
screen (gear in the app header) auto-saves on toggle, per the UX doc.

### Exercise reorder

`PATCH /sessions/{id}/exercises/reorder` takes the **full** ordered list of
the session's exercise ids and rewrites `sort_order` to the array index in one
transaction. The shared schema rejects duplicates; the route 422s unless the
list matches the session's exercises exactly, so a failed attempt can never
leave a partial order. The client hook updates the session-detail cache
optimistically and rolls back on error.

### Set prefill

`GET /exercises/last?name=...` returns the most recent occurrence of an
exercise name (exact match, per user) with its sets, ordered by
`sort_order` — 404 when the name was never logged. The client uses it to
prefill sets when repeating an exercise: `usePrefillExerciseSets` creates the
sets as real rows (auto-save model), so a partial failure just means fewer
prefilled sets.

## Still open (follow-up PRs)

- Drag-reorder UI in the workout screen (`react-native-draggable-flatlist` is
  already a dependency; `GestureHandlerRootView` is in place).
- Wiring tags/prefill into the logging UI.
- Programming / weekly-plan datamodel (issue #13, feature 5).
