# Insights dashboard: implementation plan (from the proposal doc)

**Date:** 2026-10-10
**Status:** implementation plan + partial implementation landed (this PR).
**Input:** `20261003_insights_dashboard_defaults.md` (background + proposed defaults, gap analysis §Part 2).

---

## The plan, concretely

The proposal doc ends with five gaps between the current `insights.tsx` and the
proposed defaults. Ordered by user impact, each gap maps to one work item:

| # | Gap (from the proposal) | Work item | Where | Status |
|---|---|---|---|---|
| 1 | No maturity ladder (binary empty/non-empty) | `dataMaturity(sessions, today)` → `empty` / `warming-up` / `trending` / `full`; screen renders per stage | `lib/insights.ts`, `app/(tabs)/insights.tsx` | **Done** |
| 2 | Balance not framed vs. own history | `regionBalance(history, today)`: shares over the last 28 days + `usualPct` from all older history; `null` when no older data | `lib/insights.ts`, `components/insights/balance-bars.tsx` | **Done** |
| 3 | Positive signal missing | Already landed earlier (`progression-win` rule). Remaining polish: win icon uses secondary blue, not warning amber | `components/insights/signal-card.tsx` | **Done** |
| 4 | No "why" expanders on signal cards | `Signal.details?: string[]` — every rule ships the numbers behind its statement; card renders them on tap | `lib/insights.ts`, `components/insights/signal-card.tsx` | **Done** |
| 5 | Verdict copy for baseline period undefined | `baselineReady` prop on `LoadTrendChart`; below 4 weeks the verdict tag is hidden and the caption reads "First weeks — building your baseline." | `components/insights/load-trend-chart.tsx`, screen | **Done** |

### Maturity stages (as implemented)

| Stage | Condition | Renders |
|---|---|---|
| `empty` | 0 finished sessions | Motivational empty state (existing copy) |
| `warming-up` | 1–2 sessions, or < 7 days of history | Quiet summary: session count + what unlocks next. No charts |
| `trending` | ≥ 7 days and ≥ 3 sessions | Load trend (verdict suppressed), strength progression, balance without "usual", signals |
| `full` | ≥ 28 days of history | Everything: verdict vs 4-week average, balance vs own usual share |

### Signal-rule minimum data (as implemented)

Per the proposal, a signal that lacks its baseline simply doesn't fire:

- **Load spike** now requires all 4 baseline weeks to have actual load
  (1 acute + 4 baseline weeks), not just a non-zero average.
- **Recovery dip** now requires the last 3 *logged* days to all be high —
  previously any 3 high days in the window fired, while the copy claimed
  "3 days in a row".
- All other rules are self-baselining (pain recurring, exposure gap, plateau,
  progression-win) and unchanged in their trigger logic.

## Deliberately left out (not in this PR)

- **Stacked-warning composite signal** (UX doc §7b top priority): combining
  multiple firing warnings into one escalated card. Needs its own copy and
  priority design.
- **"Why" expanders beyond signal cards** (e.g. numbers behind the load
  verdict itself).
- **Exposure-gap "regular first" tightening**: the rule still only requires
  one past use of a region; the proposal's stricter "was regular, then
  stopped" definition needs frequency tracking.
- Signal rules are not gated per maturity stage; instead each rule declares
  its own minimum data (spike baseline above). Self-contained rules (pain,
  recovery) stay active from the first week — a real pain recurrence is
  meaningful even with little history.

## Verification

- `npx tsc --noEmit` (mobile-client): clean.
- `npm run lint` (mobile-client): clean.
- No backend/shared-types changes; no test runner exists in mobile-client.
