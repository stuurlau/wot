# WOT UI/UX design

> **Frontend-consultant review** — log-first, notepad-feel, injury-aware training app.

---

## A) UX Evaluation

### Product context

WOT is for a sports enthusiast in his 30s who loves training, trains across multiple disciplines, and gets injured from over-excitement, poor variation, and skipped prehab. The app needs to help him log consistently and notice patterns — without ever feeling heavy or punitive.

### Core positioning

Not a coaching app. Not a fitness tracker. A **smart training notepad** that earns trust through speed and simplicity, then rewards consistency with useful signal.

### Competitor gaps WOT can fill

| App | Strength | Gap WOT targets |
|---|---|---|
| Strava | Social + cardio tracking | No strength logging, no injury awareness |
| Strong | Serious lifting log | Single-sport, no pain/prehab context |
| Nike Training Club | Guided workouts | No free-form logging, no load analysis |
| JEFIT | Structured plans | Feels heavy and dated, no mixed-sport support |
| Notion (feel reference) | Calm, fast, flexible | Not a workout tool at all |

**WOT's opening**: the only fast, minimal, mixed-sport app that helps you notice injury risk without feeling like a medical tool.

---

## B) Logging UX Principles

These are the non-negotiable rules for every logging-related surface.

### P1 — Speed above all in logging

The active workout screen must never slow you down. Every tap, every default, every navigation choice should reduce time-to-logged-set.

> Measure: a familiar set should be logged in 3 taps or fewer.

### P2 — Recents first, always

Recent exercises, recent templates, and recent sessions should surface before anything else. The user should almost never type to find something they've used before.

### P3 — Inline everything

No modals for editing sets, reps, or weights. Inline tap-to-edit on every data point. Modals only for truly distinct flows (e.g. selecting a new exercise).

### P4 — Forgiveness over confirmation

Auto-save everything. No "are you sure?" dialogs for normal actions. Undo is enough. The app should never make the user afraid to tap.

### P5 — Notepad, not form

Exercises and sets should read like a list, not a multi-column table. The visual rhythm should feel like writing notes, not filling out a spreadsheet.

### P6 — Pain and readiness are optional add-ons, never gates

A user should never be required to fill in how they feel before logging. These capture points are available but always secondary and always skippable.

### P7 — Mixed sport is a first-class citizen

Strength, cardio, mobility, climbing, and prehab all use the same logging surface. The activity type changes the fields shown, not the overall flow.

### P8 — Offline is normal

The user trains in gyms, outdoors, in bad reception. Logging should work offline with no visible degradation. Sync happens silently afterward.

### P9 — Visible progress within a session

As sets are logged, the workout should feel like it's building up. The user should be able to see what they've done without scrolling to a separate summary.

### P10 — Quiet completion

Finishing a workout should feel like closing a notebook: satisfying and brief. No mandatory rating screens. A quick optional summary, then back to home.

---

## C) Information Architecture

### Navigation structure

Four tabs. Log is always the leftmost and default.

```
┌─────────────────────────────────────────────────┐
│                                                 │
│   [ Log ]  [ History ]  [ Plan ]  [ Insights ]  │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Log** — primary action hub. Gets you into workout instantly.
**History** — reverse-chronological log. Doubles as a reuse tool.
**Plan** — lightweight calendar. Optional, stays simple.
**Insights** — compact dashboard with the most useful signals.

### Screen hierarchy

```
App
├── Log (default tab)
│   ├── Home / Quick Log
│   └── Active Workout
│       ├── Exercise Picker
│       └── Set / Interval / Note entry (inline)
├── History
│   ├── Session list
│   └── Session detail
│       └── Reuse / Copy
├── Plan
│   ├── Week calendar
│   └── Session stub editor
└── Insights
    ├── Load trend chart
    ├── Body region distribution
    ├── Pain / soreness overlay
    └── Variation signal
```

### Tab badge rules

- **Log**: no badge. Always feels like an open invitation.
- **History**: no badge.
- **Plan**: optional dot if today has a planned session not yet started.
- **Insights**: optional dot if a warning signal (e.g. high load spike) is active.

---

## D) Critical User Flows

### Flow A — Start logging in under 10 seconds

```
Home screen
  → tap "Start workout"
  → choose: [Blank] / [Repeat last: Push session] / [Template: Upper body]
  → Active Workout opens
  → add first exercise
```

Tap count target: **2–3 taps** from cold open to first exercise field.

Design rules:
- "Start workout" must be the dominant element on the home screen
- The template picker should appear as a bottom sheet, not a new screen
- If user had an incomplete workout, offer "Continue" above "Start new"

---

### Flow B — Log a familiar set in 3 taps

```
Active Workout
  → tap "+ Add exercise"
  → Recent list loads instantly (no search needed for familiar exercises)
  → tap exercise name
  → set row appears with previous weight/reps pre-filled
  → tap "+" to add the set (confirm with defaults)
```

Tap count target: **3 taps** for a repeated exercise with same weight/reps.

Design rules:
- previous session values should auto-populate as editable defaults
- the "+" button to add a set must be reachable with the thumb
- weight and reps are editable inline, not via a picker modal

---

### Flow C — Add a pain or readiness note

```
Active Workout
  → tap "+" beside "Feeling"  (always visible but small, below session title)
  → bottom sheet: [Feeling good] [Bit tired] [Something hurts]
  → if "Something hurts": tap body area + 1–3 severity dots
  → optional free-text note
  → done
```

Tap count target: **2–4 taps**.

Design rules:
- this entry point must never be the first thing the user sees
- pre-defined options should cover 80% of cases without typing
- the body area picker should be a simple illustrated silhouette, not a text list

---

### Flow D — Reuse a previous session

```
History tab
  → tap any past session
  → "Use as template" button in session detail
  → Active Workout opens with exercises pre-loaded (sets empty)
  → begin logging
```

Tap count target: **3 taps**.

Design rules:
- "Use as template" should be a persistent secondary action in session detail, never buried
- pre-loaded exercises should show previous values as grey placeholders
- user can remove or reorder exercises before the first set is added

---

### Flow E — Finish and close a workout

```
Active Workout
  → tap "Finish workout" (top right or floating bottom)
  → quick summary appears: duration, exercises, total volume (optional)
  → tap "Done"
  → returns to Home
```

Tap count target: **2 taps**.

Design rules:
- no rating required
- summary is glanceable, not a full report
- pain/readiness prompt is optional and dismissible in one tap

---

## E) Screen Wireframes

### Screen 1 — Home / Quick Log

```
┌─────────────────────────────────────┐
│  Saturday, 21 Mar          [avatar] │
│                                     │
│  ┌───────────────────────────────┐  │
│  │      Start workout        ▶   │  │   ← primary action, full-width
│  └───────────────────────────────┘  │
│                                     │
│  Continue: Push session (22 min)    │   ← only shown if in-progress session
│                                     │
│  ─────── Recent ───────────────     │
│                                     │
│  ◎  Upper body (Tue)                │
│  ◎  Run 45min (Sun)                 │
│  ◎  Mobility (Mon)                  │
│                                     │
│  ─────── This week ────────────     │
│                                     │
│  ▓▓▓▓░░░  Load: moderate            │   ← tiny bar, text label
│  4 sessions · 3 body regions        │
│                                     │
│                                     │
│  [Log]  [History]  [Plan]  [Insights]│
└─────────────────────────────────────┘
```

**Kid Wow Check**: dominant Start button, date anchor. PASS
**Mom Comprehension Check**: "Saturday. I can start a workout or see what I did recently." PASS

---

### Screen 2 — Active Workout

```
┌─────────────────────────────────────┐
│  ← Back              Finish ✓       │
│                                     │
│  Push session                       │   ← editable title
│  Today · 0:14:22  🔴 recording      │
│                                     │
│  ─────────────────────────────      │
│  Bench Press                        │
│    Set 1   80kg × 8    ✓            │
│    Set 2   80kg × 8    ✓            │
│    Set 3   ___  × ___  +            │   ← tap to fill inline
│  + Add set                          │
│                                     │
│  Overhead Press                     │
│    Set 1   50kg × 10   ✓            │
│  + Add set                          │
│                                     │
│  ─────────────────────────────      │
│                                     │
│       + Add exercise                │   ← always visible, low hierarchy
│                                     │
│  ─────────────────────────────      │
│  Feeling: —              + note     │   ← quiet, bottom of screen
│                                     │
│  [Log]  [History]  [Plan]  [Insights]│
└─────────────────────────────────────┘
```

**Kid Wow Check**: exercises are clearly building up. Active recording signal visible. PASS
**Mom Comprehension Check**: "They're logging bench press sets. 2 done, 1 to go." PASS

---

### Screen 3 — Exercise Picker (bottom sheet)

```
┌─────────────────────────────────────┐
│                                     │
│  Add exercise              ✕        │
│                                     │
│  🔍 Search exercises...             │
│                                     │
│  ─────── Recent ───────────────     │
│  Bench Press                        │
│  Squat                              │
│  Overhead Press                     │
│  Pull-ups                           │
│                                     │
│  ─────── Categories ──────────     │
│  💪 Strength                        │
│  🏃 Cardio                          │
│  🧘 Mobility                        │
│  🩹 Prehab / Rehab                  │
│  ✏️  Custom                         │
│                                     │
└─────────────────────────────────────┘
```

**Mom Comprehension Check**: "Pick an exercise from the list or search." PASS

---

### Screen 4 — History

```
┌─────────────────────────────────────┐
│  History                            │
│                                     │
│  [ All ▾ ]  [ This month ▾ ]        │   ← simple filters
│                                     │
│  ─── This week ──────────────       │
│                                     │
│  Sat 21 Mar   Push session   45min  │
│  Thu 19 Mar   Run            38min  │
│  Tue 17 Mar   Upper body     52min  │
│                                     │
│  ─── Last week ──────────────       │
│                                     │
│  Sat 14 Mar   Lower body     41min  │
│  Wed 11 Mar   Mobility       20min  │
│  ...                                │
│                                     │
│  [Log]  [History]  [Plan]  [Insights]│
└─────────────────────────────────────┘
```

Tap a row → session detail → "Use as template" button.

---

### Screen 5 — Insights (compact)

```
┌─────────────────────────────────────┐
│  Insights                           │
│                                     │
│  ─── Load this month ──────────     │
│                                     │
│   ▂▃▅▇▅▃▄▆  (weekly bars)          │
│   Apr       ← this week: moderate   │
│                                     │
│  ─── Body regions ─────────────     │
│                                     │
│   Push  ████████  48%               │
│   Pull  █████     30%               │
│   Legs  ███       18%               │
│   Core  ▌         4%  ← low         │
│                                     │
│  ─── Recent signals ───────────     │
│                                     │
│  ⚠  Shoulder mentioned 3× this week │
│  💡 No leg session in 8 days         │
│                                     │
│  [Log]  [History]  [Plan]  [Insights]│
└─────────────────────────────────────┘
```

**Mom Comprehension Check**: "Push muscles are used a lot, legs barely at all. And there's a shoulder thing." PASS

---

## F) Interaction Model

### Inline editing rules

- All set values (weight, reps, duration, distance) are tap-to-edit inline
- Keyboard appears in place, no navigation change
- Confirm with `return` or tap outside
- Value is saved immediately

### Auto-save contract

- Every set logged is saved instantly to local storage
- Workout state is preserved on app close, background, or crash
- No manual "save" action exists anywhere in the logging flow

### Bottom sheet rules

- Exercise picker, feeling check-in, and session options open as bottom sheets
- Sheets are dismissible with a swipe down or tap outside
- Sheets never cover more than 70% of the screen height

### Empty states

| Surface | Empty state text |
|---|---|
| Home — no recent sessions | "Start your first workout →" |
| History — no sessions yet | "Nothing logged yet. Your first session will appear here." |
| Insights — not enough data | "Log a few sessions and patterns will start appearing here." |
| Plan — nothing planned | "Tap a day to add a planned session." |

### Error states

- Offline: no error shown during logging. Sync quietly retries.
- Sync failed: subtle banner "Syncing…" — never blocks logging
- Load failed on History/Insights: "Couldn't load — tap to retry" inline

---

## G) Visual Design Direction

### Tone

Calm. Minimal. Airy. Like a clean notebook.

The UI should feel like you've opened a well-designed paper training log — structured enough to be reliable, simple enough to not get in the way.

### Typography

- Display / headings: medium weight, generous line height
- Body / set data: monospace-adjacent or tabular figures for numbers (so columns align)
- Labels: small, low contrast, never competing with content

### Color

- Near-white background, off-black text
- One accent color for primary actions (e.g. a warm charcoal or a muted forest green — not a fluorescent sports color)
- Warning signals use amber/orange + icon + label — never color alone
- Dark mode support from day one (semantic tokens only)

### Spacing

- Generous padding inside cards and rows
- Exercise blocks separated by subtle dividers, not card borders
- Clear vertical rhythm: the app should be easy to scan top to bottom

### Icons

- Body region icons: simple silhouette-based
- Activity category icons: minimal line style (not emoji-style)
- Status icons: check (logged), dash (empty), warning triangle — always paired with a label

---

## H) Comprehension Bar Results

| Screen | Kid Wow | Mom Comprehension | Verdict |
|---|---|---|---|
| Home / Quick Log | PASS | PASS | ✅ |
| Active Workout | PASS | PASS | ✅ |
| Exercise Picker | PASS | PASS | ✅ |
| History | PASS | PASS | ✅ |
| Insights | PASS | PASS | ✅ |

No High Fixes required at this planning stage. All screens pass with the designs above.

---

## I) Implementation Notes

### Component contracts

**WorkoutLogger**
- receives: `workoutId`, `exercises[]`, `isActive: boolean`
- emits: `onSetLogged`, `onExerciseAdded`, `onWorkoutFinished`
- must preserve state through background/foreground cycles

**ExercisePickerSheet**
- receives: `recentExercises[]`, `onSelect`
- renders: search input + recent list + categories
- must open in < 200ms (local data only, no API call)

**SetRow**
- receives: `set: { weight, reps, done }`, `previousSet?`
- inline editing only — no modal
- shows previous values as placeholder when empty

**FeelingCapture**
- receives: `workoutId`
- fully optional, dismissible
- body-region silhouette for pain location

**InsightsDashboard**
- receives: computed metrics (load, distribution, signals)
- all values derived from local data (no API required for MVP)
- signals list capped at 3 items — no infinite scroll

### Data contracts

```
Workout {
  id: string
  title: string
  startedAt: Date
  finishedAt?: Date
  exercises: Exercise[]
  feeling?: FeelingEntry
}

Exercise {
  id: string
  name: string
  category: 'strength' | 'cardio' | 'mobility' | 'prehab' | 'custom'
  bodyRegions: BodyRegion[]
  sets: SetEntry[]
}

SetEntry {
  id: string
  weight?: number
  reps?: number
  duration?: number
  distance?: number
  rpe?: number
  completedAt: Date
}

FeelingEntry {
  energy: 'good' | 'ok' | 'tired'
  pain?: { region: BodyRegion; severity: 1 | 2 | 3 }[]
  note?: string
}
```

### Edge cases

- mid-session app kill: restore from local state on next open, offer to continue
- exercise added twice in one session: allowed, no deduplication
- no previous session data: set rows start empty, no placeholder shown
- very long session (2h+): timer stays accurate, no timeout
- offline for days: all local data preserved, sync queue flushed when connection returns

---

## J) UI to Implementation Handoff

This document is authoritative for UX intent.

Any implementation that diverges from the principles, flows, or wireframes in this document must be documented with an explicit reason. Silent divergence is not allowed.

Next implementation steps:
1. Set up navigation shell (4 tabs)
2. Build `Home / Quick Log` screen
3. Build `Active Workout` screen with inline `SetRow` editing
4. Build `ExercisePickerSheet`
5. Wire local persistence (SQLite)
6. Build `History` list and session detail
7. Build `Insights` with computed metrics
8. Build `Plan` calendar
