# Hierarchical body parts

**Date:** 2026-10-17
**Stacks on:** exercise config (#34/#36)
**Plan:** `plans/20261017-body-parts.md`
**Design:** `docs/ui-designs/body-part-selection/WOT Body Parts Picker.html`

## What changed

Body regions were free-text (`body_regions text[]`, e.g. `["push", "shoulders"]`)
with a fixed suggestion list. They are now ids from a single fixed tree:

```
Region          Group             Muscle
upper           chest             upperchest, lowerchest
                back              lats, upperback, lowerback
                shoulders         frontdelt, sidedelt, reardelt, cuff
                arms              biceps, triceps, forearms
                neck
core            abs, obliques, deepcore
lower           hips              glutes, hipflexors, adductors, abductors
                thighs            quads, hamstrings
                lowerleg          calves, shins, feet
```

The tree is static in code — `shared/types/src/body-part.ts` — and is the single
source of truth for the picker, API validation and insights rollups. No join
table: it is stored as a `text[]` of ids on `training_session_exercises` and
`exercise_configs`.

## Decisions

- **No primary/secondary roles.** A selection is a plain set of node ids. A set
  counts once toward each selected part and, for rollups, once toward each
  ancestor.
- **Free multi-select across all levels.** `lower` and `quads` can be selected
  together — the design's branch-exclusive rule is not enforced. Redundant for
  rollups, but it expresses "the whole region, and specifically this muscle".
- **Picker variant: refining chips** (design turn 2), not the drill-down list the
  plan first proposed. Selecting a branch opens the next level inline below it;
  parent chips show a "some parts selected" count. Chosen for fewer taps and a
  single visible surface inside the config sheet.
- **Free-text tags stay free text.** `push`, `pull`, `legs`, `prehab` remain on
  `exercise_tags`, separate from the structural tree.
- **Prefill library deferred.** A built-in exercise→parts map would be a de-facto
  exercise catalogue, against the no-catalogue convention.

## Migration

`0007_unusual_lightspeed` renames `body_regions` → `body_parts` on both tables and
maps legacy labels where unambiguous (`chest→chest`, `legs→lower`, muscle/group
names pass through to the same id). Informal labels (`push`, `pull`, `prehab`)
map to `NULL` — the data is dev-stage and those are now tags, not parts.

## Wire change (breaking)

`bodyRegions` is replaced by `bodyParts` (tree ids) on session exercises, history
rows, recents/last, and the config endpoints. The app and API ship together; no
version-skew concern at this stage.

## Insights

Region balance and the exposure-gap signal roll each selection up to its
top-level region. The balance chart stays at region granularity regardless of how
specific a selection was. Deferred: a body-part Explorer scope and a region-gap
signal variant.
