# Rest times table + RIR/RPE flip

**Date:** 2026-10-01
**Status:** done

## Why

Review feedback on PR #15 (issue #7) replaced two decisions from
`20260930_active_session_improvements.md`:

1. "Rest before set" as a column on `training_session_exercise_sets` is not
   logical — a rest always sits **between two sets**, so it deserves its own
   table with from/till timestamps.
2. Users should choose RIR **or** RPE per set, defaulting to RIR, flipping
   between them on press.

## Decisions

### `rest_times` table (replaces the `rest` column)

Migration `0004_jittery_hitman` drops `rest` from
`training_session_exercise_sets` and adds `rest_times`:

- `set_before_id` / `set_after_id` — FKs to
  `training_session_exercise_sets` (CASCADE). Storing both endpoints makes the
  "rest is always between two sets" invariant explicit and covers rests across
  exercises (supersets), which a per-set column cannot express.
- `from_at` / `till_at` — the rest interval as timestamps. Duration is derived
  at query time; nothing derived is stored.

Wire contract: `POST /sessions/{sessionId}/rest-times` with
`{ setBeforeId, setAfterId, fromAt, tillAt }`. Both sets must belong to the
session; `setAfterId` must differ from `setBeforeId` and `tillAt` must not
precede `fromAt` (422 otherwise). Rest times are capture-only for now — they
are not included in the session-detail response yet, matching the previous
"capture first, surface later" staging.

Capture stays fully automatic in the mobile client: the rest-timer store now
also remembers the set it was (re)started after (`previousSetId`). Saving a
set restarts the clock, and when a previous set exists the client records the
interval between them. The "Rest m:ss" chip and Stop action are unchanged.

### RIR/RPE flip in set rows

The per-set intensity input defaults to RIR. Pressing the field label
(`rir ⇄` / `rpe ⇄` under the value) flips the input between RIR and RPE, per
exercise block. The mode defaults to RPE when the exercise's history has RPE
values but no RIR. Only the active scale is written on save; the `+ RIR`
reveal affordance (UX doc F4) is unchanged and the input stays visible once
used — now for either scale.
