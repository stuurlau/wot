# Active workout redesign — calmer exercise blocks

**Date:** 2026-10-31
**Design:** `docs/ui-designs/wot-active-workout-redesign/` (Claude Design handoff;
`project/Active Workout Redesign.dc.html` + `WorkoutScreen.dc.html`)

## What changed

- **Exercise header**: the name owns the first line (wraps freely) with only a
  faint cog beside it. One meta line below: "Superset 1 with …" in accent,
  then tempo · body parts.
- **Cog sheet** now holds everything secondary, in this order: superset
  (None / Superset 1–3, plus any higher group in use), type, set inputs (up
  to 4, incl. `min`), rest timer on/off, tempo, tags (defaults push · pull ·
  legs · prehab plus your own, toggled), body parts, and at the bottom the
  reorder hint (native only) and two-tap "Remove exercise". The SS badge
  (tap-to-cycle) and the header Remove are gone; `lib/superset.ts` was removed.
- **Type chips** (strength / cardio / flexibility) show under the name only
  before the first set; afterwards type lives in the sheet. Changing type
  resets set inputs to that type's defaults.
- **Logged sets** read as a ledger ("80 kg × 5" · "rir 2"). Tap edits all
  values inline (outlined ✓ saves); long-press hides the set with a
  "Set N removed. Undo" line — the delete is sent after 5 s (or when the
  block unmounts). No dialog.
- **Next set card**: "Set N · Last 82.5 × 5 · + RIR · Copy" above, full-width
  inputs below (unit sub-labels; rir ⇄ rpe under the intensity input), hold
  timer (▶ / running "0:42 ■") and a 44 px ✓ at the right edge. Only the
  active exercise (last focused/logged; defaults to where the rest clock
  runs, else the newest) gets the white card.
- **Rest clock** moved from the top bar into the next-set card of the
  exercise just logged. Header: minimize · 32 px clock · finish.
- **+ Add exercise** and **+ Pain** share one row.
- New UI primitive `components/ui/pill-chip.tsx` = design-system "sm" chip
  (filled, 9 px uppercase). Tailwind gained `faint` and `on-surface-variant`.

## Datamodel

`exercise_configs` gains two nullable columns (migration `0008`):

- `mode` — `strength | cardio | flexibility` (shared `exerciseModeSchema`);
  null = strength. Previously the type was local UI state and reset on every
  load, which would have stranded cardio exercises on strength inputs once the
  chips hide after the first set.
- `rest_timer` — boolean; null = on. Off: logging a set records the rest
  that ended but does not start a new one.

Both default to null in the shared schema, so app builds that omit them
still validate (a PUT from such a build resets them — acceptable at this
stage).

## Deliberate deviations from the prototype

- Body parts use the real `@wot/types` tree and the existing
  `BodyPartPicker`, not the prototype's simplified tree.
- The add-exercise sheet is the existing `ExercisePickerSheet` (unchanged).
- "Reset" next to "Set inputs" is kept so a custom field list can go back
  to following the settings.
- **Dark mode** values from the design are not applied — the app has no dark
  mode yet; tracked as a follow-up issue.
