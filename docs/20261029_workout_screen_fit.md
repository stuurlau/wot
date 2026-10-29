# Workout screen: web fix, fit-to-screen header, minutes option

**Date:** 2026-10-29

- **Web crash** — `react-native-draggable-flatlist` calls `findNodeHandle`,
  which react-native-web throws on. The list lives in
  `components/workout/exercise-list.tsx` (native, drag reorder) with an
  `exercise-list.web.tsx` variant (plain list, no reorder on web).
- **Exercise header fits the screen** — the name, SS, cog, tempo, body parts
  and Remove sat in one non-wrapping row and pushed the block (and the set
  row's ✓) off-screen. Now: name + SS + cog on the first line (name shrinks),
  then a meta line (tempo · body parts, max 2 lines) with Remove on the right.
  Mode chips wrap.
- **Minutes for duration** — the cog menu's set inputs gain `min` next to
  `sec`. `exercise_configs.fields` accepts `durationMin`: the same `duration`
  column (still seconds), typed in minutes; `duration` and `durationMin` are
  mutually exclusive (422). No migration (`fields` is `text[]`). Without a
  custom config, cardio still types minutes and other modes seconds.
  `SetRow` takes an explicit `durationUnit` instead of deriving it from mode.
