# Active session improvements (issue #7)

**Date:** 2026-09-30
**Status:** done

## Why

Notes from a real workout (issue #7): saving a set took two checkmark presses,
no supersets, no per-set RIR input, no rest tracking, set inputs used a
different font than the rest of the app, and the bottom tab bar rendered with
a broken shadow on Android.

## Decisions

### One-press set save

The workout `KeyboardAwareScrollView` now uses
`keyboardShouldPersistTaps="handled"`. With the default (`"never"`), the first
tap while the keyboard was open only dismissed the keyboard, so the big ✓
needed a second press. Taps on buttons are now delivered immediately.

### Supersets — `superset_group` on `training_session_exercises`

New nullable `smallint` column (migration `0003_early_bastion`). Exercises in
one session sharing a group number form one superset; `null` means not in a
superset. A superset is per **exercise**, not per set — its whole point is
linking different exercises.

Each exercise block has an `SS` badge with this press cycle
(`mobile-client/lib/superset.ts`):

- **inactive → active:** join the previous exercise's group if it has one,
  otherwise start a new group (`max + 1`, i.e. group 1 initially).
- **active → next group:** pressing again moves the exercise to a brand-new
  group ("superset 2", 3, …).
- **active → inactive:** pressing while the exercise is the sole member of the
  newest group clears it back to `null`.

Groups are not renumbered on delete; gaps are harmless because the cycle only
uses the previous exercise's group and the maximum.

### RIR per set

The `rir` column already existed; only the UI was missing. Implemented exactly
per `docs/20260906_ux_design.md` (F4): a small `+ RIR` affordance on the new-set
row reveals the RIR input (after weight and reps), and it stays visible for
that exercise once used — locally via component state and across sessions via
the recents query (`lastSet.rir`). RIR is strength-only. A per-set **RPE**
input was not added: the issue asks for "RIR or RPE", the UX doc prescribes
RIR, and the `rpe` column remains available on the wire.

### Rest timer — `rest` on `training_session_exercise_sets`

New nullable `integer` column: seconds of rest **before** the set. Capture is
fully automatic (`mobile-client/stores/rest-timer-store.ts`): saving a set
(re)starts a rest clock, and the next set saved stores the elapsed time. The
first set of a session has no rest. A "Rest m:ss" chip under the workout
header shows the running clock with a Stop action that discards it. The clock
is a global store, so it survives minimizing the workout; it is discarded when
the session is finished.

Stored `rest` values are not rendered on logged set rows yet — capturing comes
first, surfacing (and analytics) is a follow-up.

### Input font

Set-row inputs (new-set row and inline edit) used Inter Medium at 16px while
every displayed number in the app is Space Grotesk. Both now render in
`font-heading` (Space Grotesk) at 22px with tabular figures, so typed values
look exactly like logged values.

### Bottom tab bar

On Android the tab bar had `backgroundColor: 'transparent'` with the default
elevation shadow — the shadow drew around a see-through bar, rendering as a
grey gradient blob. The bar is now `Colors.surface` with a hairline top border
and `elevation: 0`.

## Deliberately left out

- **"Sets should also be a input modal thingy"** (issue #7): conflicts with
  principle P5 — inline everything (`docs/20260906_ux_design.md`); set values
  are edited in place and sheets are for distinct sub-tasks (picker, check-in,
  pain, finish). Clarifying question asked on the issue; building a set-entry
  sheet needs an explicit UX-doc divergence.
- Displaying stored `rest` on logged sets / rest analytics (follow-up).
- Per-set RPE input (see above).
