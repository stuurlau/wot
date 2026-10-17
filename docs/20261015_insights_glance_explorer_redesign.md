# Insights redesign: glance + explorer (issue #31)

**Date:** 2026-10-15
**Status:** done
**Input:** issue #31 with the "Insights Redesign" prototype (`Insights Redesign.dc.html` + handoff README), `20261003_insights_dashboard_defaults.md`, `20261010_insights_dashboard_implementation.md`.

## What changed

The Insights tab is rebuilt as two layers, replacing the fixed bar-chart
dashboard (`LoadTrendChart` + `StrengthProgression` + `BalanceBars` are gone):

1. **Glance** — curated, read top-to-bottom in seconds, layout never changes:
   - *Am I progressing? · volume load*: verdict sentence from the rolling
     7-day volume load vs the mean of the four previous 7-day windows, over a
     smoothed line chart of the last 8 weeks with the dashed rolling 4-week
     average and the current week as a hollow dot.
   - *Key lifts*: up to 4 weighted exercises with the most sessions in the
     last 8 weeks; trend meta (best top set of the last 4 weeks vs the 4
     before), 8-week sparkline, last top set.
   - *Where does my training go?*: exercise tags (defaults `push · pull ·
     legs · prehab` plus user tags) in sets/week vs "your usual", as dot
     tracks (filled = now, hollow = usual).
   - *Is anything drifting?*: 0–3 `SignalCard`s (session spike 60, tag gap
     40 with the evidence list, lift climbing 20/positive). No signals →
     "Nothing needs attention this week."
   - *Advanced metrics* (collapsed): sRPE load · 7 days, monotony, strain.
     **ACWR is removed** per the design (Impellizzeri et al., 2020).
2. **Explorer** — opened from every block, point, lift and row: any metric ×
   scope (all training / exercise tag / exercise) × range (4W–1Y) ×
   comparison (4-wk avg / prev period / off), tap-a-week selection,
   breadcrumbs back up, per-week breakdown with drill-down, and a scope sheet
   ("Show data for").

## Metrics

Sixteen metrics with per-scope availability (defaults: all/tag → volume load,
exercise → top set / reps / hold time by exercise kind). Volume load
(kg × reps) is the headline load. RPE × reps converts RIR as `10 − RIR`.
Fatigue and soreness stay separate check-in metrics — never a readiness
composite. Copy lives in `METRIC_WHY` ("About this metric" box). The built-in
evidence map (`EVIDENCE`, currently Nordic curl) feeds the tag-gap signal.

## Data source

All metrics are computed client-side in `lib/insights.ts` from one consistent
dataset (`buildInsightsData`):

- `GET /exercises/history` now returns full set rows joined with their
  session (`sessionId`, `sessionType`, `sessionDuration`, `sessionSrpe`,
  `rir`, `rpe`, hold `duration`, `sortOrder`). Sessions are derived from
  these rows — a finished session without any set carries no stimulus and is
  invisible to Insights.
- Exercise tags (`/exercises/tags`), daily check-ins, pain logs as before.

The client fetches 2 years of history so a 1-year explorer range can compare
against the previous period and "your usual" baselines see all history.

## Conventions of the engine

- Weeks are Monday–Sunday; day arithmetic uses UTC day numbers with integer
  Monday-aligned week indices. The current week compares against prior weeks
  cut at the same weekday ("vs your usual by Wednesday").
- Missed weeks are `null` and break chart lines — never drawn as zero.
- Charts (`components/insights/line-chart.tsx`, `sparkline.tsx`) use
  `react-native-svg` with monotone cubic (Fritsch–Carlson) smoothing; on
  mobile, tap = select and the tooltip stays on the selected week.
- Explorer UI state lives in `stores/insights-store.ts` (zustand) so the tab
  bar can reset it: tapping the Insights tab while exploring returns to the
  glance. Scroll resets on view/scope change.

## Deliberate adaptations from the prototype

- Session-spike signals iterate the user's actual session types (free text)
  instead of the prototype's hardcoded strength/run/prehab.
- Exercise kind (weighted / bodyweight / timed) is inferred from logged sets,
  since there is no exercise library or stored mode.
- Key-lift ties break alphabetically (the prototype's source order has no
  real-data equivalent).
- sRPE load follows the app's data-model convention (seconds × sRPE); the
  "About" copy says "× session duration" accordingly.
- Tag-balance rows open the explorer on metric `sets` (the block's unit),
  matching the prototype's behavior.
- Hover affordances are web-only in the prototype; the mobile charts are
  tap-only, per the handoff README.
