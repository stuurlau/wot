# Issue #8 bugfixes — home staleness, sheet scroll, exercise rename, set-row UX

**Date:** 2026-09-30
**Status:** implemented

Five bugs from issue #8, plus the follow-up request for fuzzy matching on
rename-all.

## 1. Sessions not appearing on Home until app restart

**Root cause:** `useUpdateTrainingSession` (used by the finish-workout flow)
invalidated `trainingSessionKeys.list()`, whose key ends in `undefined`
params. React Query's partial matching compares key elements pairwise, so
`['training-sessions', 'list', undefined]` never matches the parameterized
list keys Home/History actually use (`{from, to, limit}`). The Home tab stays
mounted, so nothing refetched and the cached session kept `duration: 0`,
which `finishedSessions` filters out.

**Fix:** invalidate the whole `trainingSessionKeys.all` subtree. The same
mismatch existed in `use-exercises.ts` (`recents()` never matched
`recents(20)`); exercise keys now share an `exerciseKeys.all` prefix that the
mutations invalidate.

## 2. Daily-log Save button disappeared after expanding "More"

`Sheet` capped its container at 80% height but the content could not scroll,
so the expanded Stress/Motivation/Note fields pushed Save out of reach.
`Sheet` now wraps children in a `ScrollView`
(`keyboardShouldPersistTaps="handled"`) whose `maxHeight` is 80% of the
keyboard-avoiding container (measured via `onLayout`, seeded with the window
height), so it stays correct while the keyboard is open. This fixes every
sheet (check-in, pain, finish, exercise picker).

## 3. Renaming an exercise in an active workout

- The exercise name in `ExerciseBlock` is now tap-to-edit inline (per the
  "inline editing" UX principle) and saves through the existing exercise
  `PATCH`.
- After a rename, an inline offer appears: *Also rename "\<old\>" in past
  workouts?* listing all of the user's similar exercise names, with
  **Rename all** / **Dismiss** actions.
- Fuzzy matching runs **client-side** (`mobile-client/lib/similarity.ts`:
  trigram Dice similarity ≥ 0.5, case/spacing-insensitive, typo-tolerant)
  over all known exercise names, which the client caches in the query store
  via `useExerciseNames` (a high-limit `GET /exercises/recents` call; the
  endpoint's `limit` cap was raised to 500 for this). So the suggestion
  keeps working on a flaky connection — no extra round-trip after a rename.
- One new endpoint backs the destructive half:
  `PATCH /api/v1/exercises/rename` takes `{ from: string[], to: string }`
  (schema: `renameExercisesInputSchema` in `@wot/types`) and renames the
  user's exercises matching the listed names **exactly**, returning
  `{ updated: n }`. The destructive operation stays deterministic because
  the client confirms the concrete name list first.
- The trigram approach runs in memory over a user's distinct names (small)
  and needs no `pg_trgm` extension or migration.

## 4. Set-row edit affordances were always visible

Saved set rows now show the ✓/✕ actions only after the row is tapped (tap
again to hide). Tap-on-value inline edit and long-press delete are unchanged.

## 5. Copy weight/reps from the previous set

The "add next set" row shows a small **Copy** action when the exercise has a
previous set with values for the current mode (weight/reps or
distance/duration). It prefills the draft inputs so the user can adjust
before tapping ✓.

## Deliberately left out

- No DB migration — the rename endpoint reuses the existing `name` column and
  similarity runs client-side.
- No per-name cherry-picking in the rename offer — the issue asks for a
  "rename all" option; the candidate list is shown for review before
  confirming.
