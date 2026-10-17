# Hierarchical body parts — picker + insights

**Date:** 2026-10-17
**Status:** proposed
**Design:** `docs/ui-designs/body-part-selection/WOT Body Parts Picker.html` (proposal variant: drill-down list)
**Stacks on:** #34/#36 (exercise config), #33 (insights explorer)

## What the design specifies

- A fixed 3-level tree: **Region** (upper / core / lower) → **Group** (chest,
  back, shoulders, arms, neck / abs, obliques, deep core / hips, thighs,
  lower legs) → **Muscle** (quads, lats, front delts, …). Full node list in
  the design file; the tree is static and lives in code, not the DB.
- **Stop at any level**: selecting a node clears its ancestors and
  descendants — a branch holds at most one selection ("Back squat: lower
  body" is valid without picking muscles).
- Every selection has a **role**: primary (✓) or secondary (½), with a
  mode toggle while picking. Tap a selected node again to deselect.
- Dose rule for insights: **1 set for primary, ½ set for secondary**, rolled
  up through ancestors ("Counts in: Lower body").
- Picker UX (proposal variant): drill-down list — tap the circle to
  select, tap the name to go deeper, breadcrumbs back up. (Refining chips
  and expandable tree were explored and rejected.)

## Datamodel

1. **Shared tree** in `@wot/types` (`body-part.ts`):
   - `bodyPartTree` constant (the tree above) + `bodyPartIdSchema` (zod enum
     over all node ids), plus helpers: `bodyPartAncestors(id)`,
     `bodyPartIsValidSelection(ids)` (no two ids on the same branch),
     `bodyPartLabel(id)`, `bodyPartRollup(ids)` → id + ancestors.
2. **Columns** — replace `body_regions text[]` with two arrays of node ids:
   - `training_session_exercises`: `body_parts_primary text[]`,
     `body_parts_secondary text[]` (disjoint; branch-exclusive)
   - `exercise_configs`: same two columns replacing `bodyRegions` (the
     cog-menu default that prefills new instances)
   Validation (shared zod, so API + client agree): ids exist in the tree,
   primary ∩ secondary = ∅, no ancestor/descendant pairs across the union.
3. **Migration**: map legacy free-text regions to node ids where
   unambiguous (`chest→chest`, `back→back`, `legs→lower`, `arms→arms`,
   `core→core`, muscle names → same id, `shoulders→shoulders`), all as
   primary; unmapped legacy strings (`push`, `pull`, `prehab`, …) are
   dropped — they were informal labels, and the data is dev-stage.
4. **Wire change** (breaking, coordinated): `bodyRegions` leaves the
   exercise schema; `bodyPartsPrimary`/`bodyPartsSecondary` take its place
   in session detail, history rows, and the config endpoints. App and API
   deploy together; no version skew concern at this stage.

## API

- Exercise create/update inputs + serializers switch to the two arrays
  (validated via the shared schema).
- `/exercises/config` GET/PUT carry the new shape.
- History rows (`GET /exercises/history`) carry both arrays — the insights
  engine reads them client-side, no new endpoint needed.
- Tests: selection-validation 422s (unknown id, same-branch pair,
  primary=secondary), roundtrips, config roundtrip with the new shape,
  legacy-rename cascade still intact.

## Mobile

- New `BodyPartPicker` (design's proposal variant): breadcrumbs, rows with
  select-circle vs drill-in name, primary/secondary mode toggle, summary
  line ("Primary · Secondary · Counts in"). Selection logic mirrors the
  prototype: selecting clears the branch, tap-again deselects.
- `ExerciseConfigSheet`: the flat body-parts chips are replaced by an entry
  row opening the picker (inside the same sheet — it is a list section, not
  a stacked modal; see #30). Writes the new config shape and patches the
  live instance (both arrays).
- Picker prefill: config primary/secondary applied on add.
- Exercise header shows resolved part labels (e.g. "quads · glutes").

## Insights (stacks on #33)

- New Explorer scope type **body part** (any node, any level), browsable
  region → group → muscle in the scope sheet.
- Rollup: an exercise counts toward part P when any selected part is P or a
  descendant of P; its sets weigh 1 (primary) or ½ (secondary) for
  set-derived metrics (sets, volume load). Session-level sRPE load is not
  split by part.
- Glance unchanged — tags stay the balance unit per the redesign.
- Deferred: region-gap signal variant, prefill library (see below).

## Sequencing

1. PR: shared tree + datamodel migration + API validation/serialization +
   tests (stacks on #34).
2. PR: `BodyPartPicker` + cog-menu integration + header display + picker
   prefill (stacks on #36).
3. PR: explorer body-part scope + rollup (stacks on #33).
Merge order: #32/#34/#36 → (1) → (2), and #33 → (3).

Dated doc + `20260323_data_model.md` update land with PR 1.

## Open questions

- **Prefill library** (the design's open question): a built-in
  exercise→parts map would be a de-facto exercise catalogue — against the
  current convention. Park it; revisit once we see how much manual tagging
  actually happens.
- Legacy drop of unmapped strings (push/pull/prehab) — OK?
- Secondary ½-weighting applies to sets/volume only, not session sRPE load
  — OK?
