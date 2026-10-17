# Hierarchical body parts — picker + insights

**Date:** 2026-10-17
**Status:** implemented (shared tree + migration + API + picker; insights Explorer scope deferred)
**Design:** `docs/ui-designs/body-part-selection/WOT Body Parts Picker.html` (drill-down variant; implemented as refining chips — see Mobile)
**Stacks on:** #34/#36 (exercise config), #33 (insights explorer)

## What the design specifies (as adjusted in sparring)

- A fixed 3-level tree: **Region** (upper / core / lower) → **Group** (chest,
  back, shoulders, arms, neck / abs, obliques, deep core / hips, thighs,
  lower legs) → **Muscle** (quads, lats, front delts, …). Full node list in
  the design file; the tree is static and lives in code, not the DB.
- **Multi-select across all levels** (user decision, overriding the design's
  branch-exclusive rule): "lower body" *and* specific muscles (quads,
  glutes) can all be selected at once. Parent+child is redundant for
  rollups but harmless — it expresses "the whole region, and specifically
  this muscle".
- **No primary/secondary roles** (user decision — too complicated). A
  selection is a plain set of node ids; a set counts 1 toward each selected
  part and, for rollups, toward its ancestors.
- Picker UX: **implemented as the refining-chips variant** (design turn 2) rather
  than the drill-down list above — chips toggle in place, selecting a branch
  opens the next level inline below it, parent chips show a "some parts
  selected" count. Single visible surface inside the config sheet, fewer taps.

## Datamodel

1. **Shared tree** in `@wot/types` (`body-part.ts`):
   - `bodyPartTree` constant (the tree above) + `bodyPartIdSchema` (zod enum
     over all node ids), plus helpers: `bodyPartAncestors(id)`,
     `bodyPartLabel(id)`, `bodyPartRollup(ids)` → each id + its ancestors,
     deduped.
2. **Columns** — `body_regions text[]` becomes a single array of node ids:
   - `training_session_exercises.body_parts text[]`
   - `exercise_configs.body_parts text[]` (replacing its `bodyRegions`; the
     cog-menu default that prefills new instances)
   Validation (shared zod, so API + client agree): ids exist in the tree,
   unique. Nothing else — multi-select across levels is allowed.
3. **Migration**: map legacy free-text regions to node ids where
   unambiguous (`chest→chest`, `back→back`, `legs→lower`, `arms→arms`,
   `core→core`, muscle names → same id, `shoulders→shoulders`); unmapped
   legacy strings (`push`, `pull`, `prehab`, …) are dropped — they were
   informal labels, and the data is dev-stage.
4. **Wire change** (breaking, coordinated): `bodyRegions` leaves the
   exercise schema; `bodyParts` takes its place in session detail, history
   rows, and the config endpoints. App and API deploy together; no version
   skew concern at this stage.

## API

- Exercise create/update inputs + serializers switch to the two arrays
  (validated via the shared schema).
- `/exercises/config` GET/PUT carry the new shape.
- History rows (`GET /exercises/history`) carry both arrays — the insights
  engine reads them client-side, no new endpoint needed.
- Tests: selection-validation 422s (unknown id, duplicate ids),
  roundtrips, config roundtrip with the new shape, legacy-rename cascade
  still intact.

## Mobile

- New `BodyPartPicker` (refining chips, minus the role toggle): one chip row per
  open level, free multi-select across levels, parent chips show a "some parts
  selected" count, resolved labels plus the rollup ("Counts in: …") under the
  picker.
- `ExerciseConfigSheet`: the flat body-parts chips are replaced by the picker
  (inside the same sheet — it is a list section, not a stacked modal; see #30).
  Writes the new config shape and patches the live instance.
- Picker prefill: configured parts applied on add.
- Exercise header shows resolved part labels (e.g. "lower body · quads").

## Insights (stacks on #33)

- New Explorer scope type **body part** (any node, any level), browsable
  region → group → muscle in the scope sheet.
- Rollup: an exercise counts toward part P when any selected part is P or a
  descendant of P; each of its sets counts once (no role weighting).
- Glance unchanged — tags stay the balance unit per the redesign.
- Deferred: region-gap signal variant, prefill library (see below).

## Sequencing

1. PR (this one): shared tree + datamodel migration + API validation/serialization
   + tests + `BodyPartPicker` + cog-menu integration + header display + picker
   prefill, plus dated doc + `20260323_data_model.md` update (stacks on #36).
   The wire change is breaking, so the picker ships in the same PR as the schema.
2. PR: explorer body-part scope + rollup (stacks on #33).
Merge order: #32/#34/#36 → (1), and #33 → (2).

## Open questions

- **Prefill library** (the design's open question): a built-in
  exercise→parts map would be a de-facto exercise catalogue — against the
  current convention. Park it; revisit once we see how much manual tagging
  actually happens.
- Legacy drop of unmapped strings (push/pull/prehab) — resolved: they map to
  `NULL` and live on as `exercise_tags` (dev-stage data).
