# Insights dashboard: background & proposal (issue #10)

**Date:** 2026-10-03
**Status:** proposal — background research + proposed defaults for the Insights dashboard. No code changed.
**Inputs:** issue #10, `20260316_brainstorm_sesh.md` (sport science), `20260323_data_model.md` (metrics), `20260906_ux_design.md` (UX intent, esp. §7 interpretation layer and S8 wireframe), current implementation in `mobile-client/app/(tabs)/insights.tsx`.

---

## Part 1 — Background: what makes a data dashboard intuitive and meaningful

Distilled from the dashboard-design literature (Stephen Few's *Information Dashboard Design* and whitepapers, glanceable-visualization research, the MIT Vis Group's dashboard heuristics, and Bach et al.'s dashboard design patterns — sources at the end).

### 1. A dashboard answers questions; it does not display data

The recurring finding across all sources: dashboards fail when they are built as "what data do we have?" instead of "what questions does the user bring?". The design process starts from the user's questions, and every element on screen earns its place by answering one of them. Anything that answers no question is clutter, and clutter is not neutral — it actively slows down the answers that matter (Few: "every unnecessary piece of information results in wasted time").

For WOT, the questions are already defined by the UX doc's jobs-to-be-done: **Am I progressing?** (J4) → **Am I balanced?** (J5) → **Is anything drifting wrong?** (J6). In that order.

### 2. Glanceability: the answer must arrive in seconds

A dashboard is a *monitoring* surface, not an analysis tool. Glanceability research (Blascheck et al.) names three requirements: **presence & accessibility** (the info is there when you look), **simplicity & understandability** (readable without learning or effort — simple chart types, few data points), and **suitability & purpose** (it informs a real decision). Few frames monitoring as a three-step process: *scan the big picture → notice what needs attention → drill in only if needed*. The first two steps must work without any interaction.

Mobile raises the bar: the user checks Insights between other things, often for under a minute. The UX doc already encodes this as a budget: "the glance must answer 'am I progressing?' in ≤ 5 seconds without any tap" (F9).

### 3. A number without context is noise

Few's pitfall #2: *supplying inadequate context for the data*. "Load 3,240" means nothing. Meaning comes only from comparison — and the honest comparisons are:

- **vs. the user's own history** ("+9% vs your 4-week average") — the only baseline a personal app actually has;
- **vs. a trend** (sparklines, direction arrows) — the shape matters more than the point value;
- **vs. an explicit threshold** — only where one is defensible.

This is why normative claims ("you should do 20% prehab") are banned in WOT (P12): the app has no basis for them, and fake precision destroys trust.

### 4. Progressive disclosure: keep the default view sacred

The overview shows summaries and exceptions; details live behind deliberate interaction (expand, tap-through). Few's rule: *consider the dashboard sacred* — its composition should not change between visits except because the data changed. Two consequences:

- Raw expert metrics (monotony, strain, ACWR) belong behind an "Advanced" expander, exactly as the UX doc already specifies. "Monotony 2.34" with no interpretation is the canonical anti-pattern (P9).
- Every card and chart should offer "the why" on demand — the numbers behind the statement. Transparency is how a self-coached athlete learns to trust the app (UX doc §7b).

### 5. One clear reading order — hierarchy is the argument

Position and size are the strongest importance signals. The MIT heuristics call this out directly: a dashboard needs a clear, logical reading order, and layout must guide the eye. WOT's reading order is a product statement: **progress → balance → warnings**. A good week renders a satisfying screen of upward trends with *no* warning section at all — the absence of the attention section is the all-clear. Inverting this (alarms first) would make the app feel punitive and violate "calm by default, loud by exception" (P11).

### 6. Attention is the scarcest resource — spend highlighting deliberately

If everything is bold, colored, or boxed, nothing stands out (Few's pitfall #10). Rules that follow:

- Color is spent only where attention is needed: amber for attention, one quiet accent for the rest. Never red, never color alone (icon + words).
- Signals are capped (max 3) — if there are 5 things to say, say the 3 most important (UX doc F9).
- Absence of highlighting must itself be meaningful: no amber = all clear.

### 7. Simplicity beats variety — consistency beats novelty

Few's pitfalls #3, #6, #11: excessive precision, meaningless variety in chart types, decorative clutter. Repeat the same simple widget family (bars, sparklines, trend arrows) so the user builds one perceptual strategy; round numbers to meaningful precision; strip anything that isn't data. Tufte's data-ink ratio, applied to pixels.

### 8. Trends over snapshots; exceptions over states

Single values are weak; the sport-science basis of WOT says the same ("trends are more useful than isolated values" — brainstorm doc). Dashboards earn their keep by surfacing *changes and exceptions*: spikes, drifts, gaps, streaks. A stable metric deserves less space than a moving one.

### 9. The default must degrade gracefully

A dashboard's hardest moments are the edges: no data, little data, stale data. A "meaningful default" is therefore not one fixed layout — it is a defined behavior for every level of data maturity, with empty states that motivate rather than apologize (UX doc §8). Showing a flat, axis-less chart with one data point is worse than saying plainly what will appear and when.

### 10. Dashboard genre: curated, not a data collection

Bach et al. distinguish *curated dashboards* (author-driven: the designer chooses the few right things, fits one screen, minimal interaction) from *data collections* (reader-driven: lots of data, filters, exploration). WOT's Insights is squarely a **curated dashboard**: the app picks the 3–4 blocks that answer the user's questions; exploration is deliberately deferred (and mostly lives in History / session detail instead).

### Common failure modes, condensed as a checklist

From Few's 13 pitfalls and the above, the ones a mobile training dashboard is most likely to commit:

1. Numbers without a baseline ("Load 3,240" — so what?)
2. Expert metrics shown raw (monotony, ACWR) instead of interpreted
3. False precision (3,240.5; ACWR to two decimals on the main view)
4. Warnings framed as verdicts ("injury risk high") — banned by P12
5. Normative targets presented as personal truth
6. Color everywhere, so amber means nothing
7. Broken first-run experience (blank charts, NaN ratios, divide-by-zero in week-over-week math)
8. Layout that reshuffles between visits (violates "sacred dashboard")
9. A signal list that can grow without bound
10. Charts with one data point pretending to be trends

---

## Part 2 — Proposal: meaningful defaults for the WOT Insights dashboard

### What "default" means here

Three properties, in order of importance:

1. **Zero configuration.** No pinning, no settings, no "customize your dashboard". The persona (self-coached athlete) is served by a curated view; customization is a non-goal for now.
2. **Self-referential baselines.** Every comparison is the user vs. their own history. No population norms, no prescribed targets, no streaks or gamification.
3. **Data-maturity adaptive.** The dashboard renders the most meaningful thing the available data honestly supports — never a degenerate chart.

### Default composition (reading order = priority)

Unchanged from the UX doc (S8, §7); restated here with the default windows and baselines made explicit:

| # | Block | Answers | Default window | Baseline shown |
|---|---|---|---|---|
| 1 | Load trend + one-line verdict | Am I progressing? | last 8 weeks, weekly bars | user's own trailing 4-week average |
| 2 | Strength progression | Are my key lifts moving? | recent 4 weeks vs prior 4 weeks | each exercise vs itself (best set) |
| 3 | Balance (region mix) | Where does my stimulus go? | last 4 weeks | user's own historical share |
| 4 | Needs attention (0–3 cards) | Is anything drifting wrong? | rolling 7–28 days per rule | per-signal personal norms (§7b triggers) |
| 5 | Advanced metrics (collapsed) | For the curious | — | monotony · strain · ACWR, raw |

Key defaults that make this meaningful rather than mechanical:

- **The verdict is text, not a number.** "Building steadily · +9% vs your 4-week average", not "weekly load 3,240". The number supports the sentence, never the reverse (P9).
- **Key exercises are auto-detected** (most-logged strength exercises). No setup; pinning is a later enhancement, not a default.
- **Balance is framed against the user's own usual share** ("Prehab 3% · your usual 8%"), never against a normative ratio.
- **The attention section is conditional.** No signal → no section → the calm screen *is* the all-clear. Cap: 3 cards, priority order per UX doc §7b (stacked warning → pain recurring → load spike → recovery dip → …).
- **One positive signal is part of the default set** (progression win). The dashboard notices good things too; an all-alarm dashboard trains the user to ignore it.

### Data maturity ladder — the core of "meaningful default"

The dashboard must never render a degenerate visualization. Proposed stages:

| Stage | Condition | What renders |
|---|---|---|
| 0 — Empty | 0 finished sessions | Motivational empty state (existing copy): "Log a few sessions and patterns will start appearing here." |
| 1 — Warming up | 1–2 sessions, or < 7 days of history | No charts. A quiet summary of what's logged + what unlocks next ("Load trend appears after a week of training"). |
| 2 — Trending | ≥ 7 days and ≥ 3 sessions | Load trend chart appears. Verdict suppressed until ≥ 4 weeks of data (a % vs a 1-week "average" is noise); until then, neutral copy ("First weeks — building your baseline"). Balance block appears (share of what exists, without "usual" comparison). |
| 3 — Full | ≥ 28 days of history | Everything: verdict vs 4-week average, balance vs own historical share, all signal rules active (they need baselines to be meaningful). |

Signal rules individually declare their minimum data (e.g. load spike needs ≥ 5 weeks: 1 acute + 4 baseline; exposure gap needs a region to have been "regular" first). A signal that lacks its baseline simply doesn't fire — a false alarm costs more trust than a missed one.

### Language and visual defaults

Already specified by the UX doc; restated as dashboard defaults:

- Hedged language always (P12): "possible spike", "worth watching", "consider". Never scores, never predictions, never imperatives.
- Amber for attention, secondary blue for progression content, never red. Every signal is icon + words.
- Precision defaults: loads rounded to whole numbers; percentages whole; no decimals on the main view. Exact values live in "the why" expanders.

### Deliberately not in the default view

- Raw monotony / strain / ACWR (behind "Advanced metrics" — already implemented).
- Goals, targets, rings, streaks — normative framing the app has no basis for.
- Readiness composites as a single score (brainstorm doc: "show the inputs separately").
- Any drill-down interaction requirement: everything on the default screen is readable with zero taps; taps only reveal *more*.

### Gap analysis: current implementation vs. this proposal

`insights.tsx` already implements the five blocks in the right order, the conditional attention section, the 3-card cap, and the advanced expander. Remaining gaps to reach the proposed defaults (future issues, not this one):

1. **No maturity ladder** — today it's a binary empty/non-empty check; a user with 2 sessions sees near-empty charts. Add stages 1–2.
2. **Balance is not yet framed vs. the user's own history** — shares are shown without the "your usual" baseline.
3. **Positive signal** (progression win) is not in the rule set.
4. **"Why" expanders on signal cards** — cards show statement + action but not yet the underlying numbers.
5. **Verdict copy for the baseline-building period** (< 4 weeks) is undefined.

---

## Sources

- Stephen Few, *Information Dashboard Design* (2006) and whitepapers on perceptualedge.com — *Common Pitfalls in Dashboard Design* (the 13 pitfalls), *Rich Data, Poor Data* (context, bullet graphs, "consider the dashboard sacred"), *With Dashboards, Formatting and Layout Definitely Matter*.
- Blascheck, Bentley, Choe, Horak, Isenberg — *Characterizing Glanceable Visualizations: From Perception to Behavior Change* (2021) — presence/accessibility, simplicity/understandability, suitability/purpose.
- MIT Visualization Group — *Heuristics for Supporting Cooperative Dashboard Design* — question-driven design, reading order, guidance to next step.
- Bach, Freeman, Abdul-Rahman, Turkay, Khan, Fan, Chen — *Dashboard Design Patterns* — curated dashboards vs. data collections; abstraction/screenspace tradeoffs.
- Internal: `20260316_brainstorm_sesh.md` (trends over snapshots, hedged decision support), `20260906_ux_design.md` (J4–J6, F9/F10, §7 interpretation layer, P9/P11/P12).
