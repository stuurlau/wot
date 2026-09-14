# WOT UX Implementation Plan

**Date:** 2026-09-06
**Supersedes:** none (new). Companion to `20260906_ux_design.md`, which is the source of truth for *what* to build; this document is *how*, at file-level precision.

**Purpose:** a concrete, ordered build plan for the UX design, written so a lower-cost model (or a human with less context) can execute it without re-deriving decisions or rediscovering the codebase.

---

## 0. TL;DR and cost strategy

**What's already done (do NOT rebuild):**
- ✅ Backend: every endpoint in `docs/20260815_rest_api_contract.md` is implemented in `api/src/routes/api/` (sessions, exercises, sets, daily-logs, pain-logs, `exercises/recents`).
- ✅ Shared types: `shared/types/src/` (Zod + inferred TS types), consumed as `@wot/types`.
- ✅ Frontend API layer: `mobile-client/lib/api/*` (axios client + one method per endpoint).
- ✅ Frontend hooks: `mobile-client/hooks/api/*` (TanStack Query, queries + mutations + cache invalidation).
- ✅ Auth: `stores/auth-store.ts` (zustand), `lib/auth-client.ts`, `app/(auth)/*`.

**What's missing:** all the screens and interaction — logging flow, check-in, pain, insights interpretation, session detail, navigation restructure.

**Cost strategy (why this plan is "low cost"):**
1. **Zero new dependencies.** Everything uses libs already installed: `expo-router`, `zustand`, `@tanstack/react-query`, `nativewind`, `react-native-svg`, `expo-haptics`, RN `Modal` for bottom sheets (no bottom-sheet lib).
2. **Online-first, server-backed.** Every "add exercise" / "log set" is an immediate API call using the *existing* hooks. This avoids an offline sync queue, optimistic-id remapping, and local persistence — the three biggest sources of bug cost. Offline sync is explicitly deferred (§9).
3. **One small backend addition** (exercise history for strength trends), ~60 lines following an existing pattern. Everything else is frontend.
4. **Copy-paste sketches** for the tricky parts (routing, active-session store, bottom sheet, set row, signals).

**Net new work:** ~13 new files, ~8 modified files, 1 backend file. See §8 for the effort table.

---

## 1. Architectural decisions (read before implementing)

### D1 — Routing: root `Slot` → `Stack`

To support full-screen flows (Active Workout) and pushed screens (Session detail), convert the root layout from a bare `<Slot/>` to a `<Stack>`. Standard expo-router.

```tsx
// app/_layout.tsx  — replace <Slot /> with:
import { Stack } from 'expo-router';
// ... keep QueryClientProvider, ThemeProvider, AuthGuard, PortalHost, StatusBar
<Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen name="(auth)" />
  <Stack.Screen name="(tabs)" />
  <Stack.Screen name="workout" options={{ presentation: 'modal', gestureEnabled: false }} />
  <Stack.Screen name="session/[id]" options={{ headerShown: true, title: '', headerBackTitle: 'Back' }} />
</Stack>
```

Keep `unstable_settings = { anchor: '(tabs)' }` as-is. The `AuthGuard` logic is unchanged.

### D2 — Active session is a small zustand store + server truth

The data model has **no `finished_at` / status field**, so "is a workout in progress" is client-side state. The workout itself lives on the server (real ids) so nothing is lost on navigation.

```ts
// stores/active-session-store.ts
import { create } from 'zustand';

type ActiveSessionState = {
  sessionId: string | null;
  startedAtMs: number | null;
  start: (sessionId: string) => void;
  clear: () => void;
};

export const useActiveSessionStore = create<ActiveSessionState>((set) => ({
  sessionId: null,
  startedAtMs: null,
  start: (sessionId) => set({ sessionId, startedAtMs: Date.now() }),
  clear: () => set({ sessionId: null, startedAtMs: null }),
}));
```

**Flow:** "Start workout" → `POST /sessions` (placeholders: `duration: 0`, `srpe: 1`, `type: 'strength'`, `startedAt: new Date().toISOString()`, `title: null`) → store `sessionId` + `startedAtMs` → `router.push('/workout')`. The workout screen reads the store and fetches the live session via `useTrainingSession(sessionId)`.

**Known limitation (accepted for v1):** if the user force-quits mid-workout, the in-memory store is empty and a placeholder session (duration 0, srpe 1) lingers in History. Documented, low harm, with a cheap future fix (a "discard incomplete session" action or a status column). Do **not** build a fix now.

### D3 — Bottom sheets are a reusable `Modal` primitive

No bottom-sheet library. Build one shared primitive used by exercise picker, check-in, pain, and finish.

```tsx
// components/ui/sheet.tsx
import { Modal, Pressable, View } from 'react-native';

export function Sheet({ visible, onClose, children }: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/30" onPress={onClose} />
      <View className="absolute bottom-0 w-full rounded-t-3xl bg-background px-6 pt-4 pb-10 max-h-[75%]">
        {children}
      </View>
    </Modal>
  );
}
```

Every sheet content is a `<Sheet>` child. Dismiss by tapping the backdrop or a ✕.

### D4 — Shared 1–10 selector (used by sRPE, severity, wellness)

```tsx
// components/ui/rating-scale.tsx
// props: value: number | null; onChange: (n: number) => void; min?: 1; max?: 10
// renders a horizontal wrap of pressable numbers; selected number is filled.
```

### D5 — The one backend addition

`GET /exercises/history?from=YYYY-MM-DD&to=YYYY-MM-DD` (required `from`/`to`, same semantics as daily-logs list). Returns flat rows so the client derives strength/balance trends (consistent with the "frontend derives metrics" rule).

```json
{ "data": [ { "name": "Bench Press", "bodyRegions": ["push","chest"], "date": "2026-08-31", "weight": 82.5, "reps": 5 } ] }
```

Implementation sketch (§6.1) follows the existing `exercises.ts` route pattern exactly.

---

## 2. Build order and phases

Each phase leaves the app shippable and the loops it touches complete. Verify after every phase with `make typecheck` and `make lint` (see §9).

---

## 3. Phase 0 — Foundations (routing + primitives)

### T0.1 — Root stack
- **File:** `app/_layout.tsx` (modify)
- **Change:** `<Slot/>` → `<Stack>` per D1. Add screens `workout` and `session/[id]`.
- **Acceptance:** app still boots; `/(auth)` and `/(tabs)` still render; `router.push('/workout')` and `router.push('/session/x')` resolve.

### T0.2 — Active session store
- **File:** `stores/active-session-store.ts` (create)
- **Change:** per D2.
- **Acceptance:** store exposes `start`/`clear`; typechecks.

### T0.3 — Sheet primitive
- **File:** `components/ui/sheet.tsx` (create) — per D3.

### T0.4 — Rating scale primitive
- **File:** `components/ui/rating-scale.tsx` (create) — per D4.

### T0.5 — Tab rename "Log" → "Today"
- **File:** `app/(tabs)/_layout.tsx` (modify)
- **Change:** `index` screen `title: 'Log'` → `title: 'Today'`. (Icon optional: `square.and.pencil` → `sun.max` or `house`.)
- **Acceptance:** tab bar reads "TODAY".

---

## 4. Phase 1 — The logging loop (fixes pain #1: "can't log")

### T1.1 — Active Workout screen
- **File:** `app/workout.tsx` (create)
- **Change:** full-screen route. Reads `useActiveSessionStore(s => s.sessionId)`. If no session, `router.back()`. Fetches `useTrainingSession(sessionId)`. Renders:
  - header: minimize (↓ → `router.back()`), editable title (tap → inline input → `useUpdateTrainingSession` PATCH `title`), elapsed timer (`useEffect` 1s interval from `startedAtMs`), `Finish` button (opens Finish sheet).
  - body: list of `ExerciseBlock`s (T1.3), then "+ Add exercise" (opens Exercise Picker sheet, T1.2).
  - footer: "+ Pain" (opens Pain sheet, §5), "+ Note" (optional, defer or simple).
- **Acceptance:** starting a workout creates a server session, shows live timer and exercise list; minimizing returns to tabs; the session persists server-side.

### T1.2 — Exercise Picker sheet
- **File:** `components/workout/exercise-picker-sheet.tsx` (create)
- **Change:** `<Sheet>` fed by `useRecentExercises()`. Search input filters the recents list client-side (case-insensitive substring). Tapping a recent → `useCreateExercise(sessionId).mutateAsync({ name, bodyRegions, sortOrder, notes: null })` where `sortOrder = current exercise count`. No match → "Create \"…\"" row → creates exercise with that name, empty `bodyRegions`. Show each recent's `lastSet` (weight/reps) right-aligned as reference.
- **Acceptance:** picker opens instantly (no spinner), recents listed, selection creates a server exercise.

### T1.3 — Exercise block + set rows (the hard part)
- **Files:** `components/workout/exercise-block.tsx` (create), `components/workout/set-row.tsx` (create)
- **Change:**
  - `exercise-block` renders the exercise name, region chips (read-only display in v1), and its sets from the session detail. Always appends one empty `SetRow` at the bottom.
  - `set-row` handles three states: **(a) empty** — inline `TextInput`s for weight and reps (numeric keyboard) + a `✓`; tapping `✓` calls `useCreateExerciseSet` with `{ sortOrder, weight: parsedWeight ?? null, reps: parsedReps ?? null, rir: null, distance: null, duration: null, pace: null, rpe: null, notes: null }`. **(b) logged** — shows values as tappable inline numbers; tap → editable → `useUpdateExerciseSet` PATCH on submit/blur; long-press → `useDeleteExerciseSet`.
  - Cardio/endurance exercises (detected by the recents `lastSet` having `distance`/`pace` and no `weight`) show `distance` + `duration` fields instead. Detected per exercise at add-time from recents; store the chosen field mode in component state.
  - On ✓, fire `expo-haptics` (`Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`).
  - `sortOrder` = index in the sets array.
- **Acceptance:** a familiar strength set logs in ≤ 4 taps; values POST correctly; logged sets are editable and removable; a new empty row appears after each log.

### T1.4 — Finish sheet
- **File:** `components/workout/finish-sheet.tsx` (create)
- **Change:** `<Sheet>` showing:
  - **Duration** (auto from `Date.now() - startedAtMs`, editable numeric) — seconds.
  - **"How hard was it?"** → `<RatingScale min=1 max=10>` (required; default none).
  - **Type** → chips `strength | run | ride | mobility | other` (default `strength`).
  - **Feeling (optional)** → chips `Good | Tired | Something hurts` (the last opens Pain sheet and pre-binds nothing).
  - **Note (optional)** → single text field.
  - **Save** → `useUpdateTrainingSession(sessionId).mutateAsync({ duration, srpe, type, title })` → `useActiveSessionStore.clear()` → `router.back()`.
- **Acceptance:** finish costs ≤ 3 taps; `srpe`/`duration`/`type` are persisted; active store cleared; returns to Today.

### T1.5 — Active-session mini-bar (persistent resume)
- **Files:** `components/active-session-bar.tsx` (create), `app/(tabs)/_layout.tsx` (modify)
- **Change:** a thin bar showing `▶ {title || type} · mm:ss · N exercises` that `router.push('/workout')` on tap. Render it above the tab bar using a custom `tabBar`:
  ```tsx
  // app/(tabs)/_layout.tsx
  import { BottomTabBar } from '@react-navigation/bottom-tabs';
  // <Tabs ... tabBar={(props) => (
  //   <View>
  //     <ActiveSessionBar />
  //     <BottomTabBar {...props} />
  //   </View>
  // )}>
  ```
  *Fallback if this is fiddly:* render `<ActiveSessionBar />` at the top of each of the three tab screens instead. Pick one approach; do not build both.
- **Acceptance:** when a workout is active, every tab shows a 1-tap resume bar; tapping returns to the workout; bar disappears after finish.

### T1.6 — Today screen: the "Start workout" entry
- **File:** `app/(tabs)/index.tsx` (rewrite)
- **Change:** replace the dashboard with the Today layout (§S1 of the UX doc):
  - Primary `Start workout` button → `useCreateTrainingSession` → store → `router.push('/workout')`.
  - Secondary `Repeat: {last title}` row (if history exists) → fetch last session detail, POST new session, POST each exercise (empty sets), then push `/workout`.
  - This week strip (reuse `useLoadMetrics`) — plain-text "3 sessions · moderate".
  - Recent list (reuse `SessionHistoryCard`, tap → `/session/[id]`).
- **Acceptance:** cold-open → first exercise ≤ 10s; repeat-last works in 1 tap.

---

## 5. Phase 2 — Today guidance + check-in + pain (fixes pain #2)

### T2.1 — Daily check-in
- **Files:** `components/home/check-in-card.tsx` (create), `components/home/check-in-sheet.tsx` (create)
- **Change:**
  - Card shows on Today if no daily log for today. Detect via `useDailyLogs({ from: today, to: tomorrow })`.
  - Sheet: 4 core rows (Sleep duration stepper ±15min; Sleep quality / Fatigue / Soreness via `<RatingScale>`), "More" expander (Stress, Motivation, HRV, Body weight, Note). "Save" → `useUpsertDailyLog` with body **omitting `date`** (the API path carries it). "Not today" dismisses.
- **Acceptance:** check-in ≤ 20s, fully skippable, writes one daily log for today.

### T2.2 — Pain sheet
- **File:** `components/home/pain-sheet.tsx` (create)
- **Change:** `<Sheet>` with region chips (suggested list from recents' `bodyRegions` + a fixed set: shoulders, knees, hips, back, elbow, ankle, other) + free-text, `<RatingScale min=1 max=10>` severity, optional note. Save → `useCreatePainLog({ date: today, bodyRegion, severity, notes })`.
- **Acceptance:** pain loggable in ≤ 4 taps from Today / workout / finish.

### T2.3 — Wire check-in + pain into Today
- **File:** `app/(tabs)/index.tsx` (modify)
- **Change:** add check-in card, quiet "+ Pain" line, and the "Shoulder pain logged 2d ago (4/10)" awareness line (derive from `usePainLogs` last-7-days).
- **Acceptance:** all three surfaces reachable and dismissible.

---

## 6. Phase 3 — Interpretation layer (fixes "numbers without meaning")

### T3.1 — Backend: exercise history endpoint
- **Files:** `api/src/routes/api/exercises.ts` (modify), `api/src/routes/api/schemas.ts` (modify), `api/src/routes/api/training-sessions.test.ts` or new `exercises.test.ts` (test)
- **Change:**
  ```ts
  // schemas.ts — add:
  export const exerciseHistoryQuerySchema = z.object({ from: isoDateSchema, to: isoDateSchema })
    .strict().superRefine((v, ctx) => validateDateRange(v, ctx, true));

  // exercises.ts — add route (mirror recents but date-scoped, join sets):
  app.get('/exercises/history', { preHandler: requireAuthentication }, async (request) => {
    const { from, to } = parseRequest(exerciseHistoryQuerySchema, request.query, true);
    const rows = await db.select({
      name: trainingSessionExercises.name,
      bodyRegions: trainingSessionExercises.bodyRegions,
      date: trainingSessions.startedAt,          // derive YYYY-MM-DD client-side
      weight: trainingSessionExerciseSets.weight,
      reps: trainingSessionExerciseSets.reps,
    })
      .from(trainingSessionExercises)
      .innerJoin(trainingSessions, eq(trainingSessionExercises.trainingSessionId, trainingSessions.id))
      .innerJoin(trainingSessionExerciseSets, eq(trainingSessionExerciseSets.trainingSessionExerciseId, trainingSessionExercises.id))
      .where(and(eq(trainingSessions.userId, authenticatedUserId(request)),
                 gte(trainingSessions.startedAt, utcMidnight(from)),
                 lt(trainingSessions.startedAt, utcMidnight(to))))
      .orderBy(asc(trainingSessions.startedAt));
    return { data: rows.map(r => ({
      name: r.name, bodyRegions: r.bodyRegions ?? [],
      date: r.date.toISOString().slice(0,10),
      weight: r.weight === null ? null : Number(r.weight),
      reps: r.reps,
    })) };
  });
  ```
- **Acceptance:** returns flat rows over a date range; new unit/integration test passes.

### T3.2 — Client API + hook for history
- **Files:** `lib/api/exercises.ts` (modify), `hooks/api/use-exercises.ts` (modify)
- **Change:** add `exercises.history({from,to})` and `useExerciseHistory(params)` (invalidate on set mutations — add to existing `onSuccess` invalidations).

### T3.3 — Insights derivation (pure functions)
- **File:** `lib/insights.ts` (create)
- **Change:** pure, dependency-free functions (unit-testable later):
  - `buildWeeklyLoads(sessions, weeks=8): { weekStart, load }[]`
  - `loadVerdict(weeklyLoads): { direction: 'building'|'holding'|'spiking'|'dipping', deltaPct }`
  - `strengthProgression(history, n=5): { name, weeklyBest: number[], direction: 'up'|'flat'|'down' }[]` (weekly best = max `weight` per exercise per week; direction = last-4wk vs prior-4wk mean)
  - `regionBalance(history, days=28): { region, sharePct }[]` (share of set volume; `weight*reps`, fallback 1 per set)
  - `deriveSignals(sessions, weeklyLoads, painLogs, history): Signal[]` implementing §7b thresholds (constants at top of file).
  - `type Signal = { kind: string; title: string; body: string; priority: number }`
- **Acceptance:** pure and typed; returns sensible output on `lib/mock-data.ts` fixtures.

### T3.4 — Insights screen rebuild
- **Files:** `app/(tabs)/insights.tsx` (rewrite), components `components/insights/signal-card.tsx`, `components/insights/load-trend-chart.tsx`, `components/insights/strength-progression.tsx`, `components/insights/balance-bars.tsx` (create)
- **Change:** compose in the UX doc's reading order (§S8): load trend + verdict → strength progression (sparklines) → balance → "Needs attention" signals (max 3) → "Advanced metrics" expander (monotony/strain/ACWR from `useLoadMetrics`).
- **Acceptance:** no raw metric shown without a plain-language interpretation; a data-rich week shows progression first and possibly zero signals.

### T3.5 — History + Session detail
- **Files:** `app/(tabs)/history.tsx` (modify), `app/session/[id].tsx` (create)
- **Change:** History rows tap → `/session/[id]`. Session detail (`useTrainingSession(id)`) renders the full session + persistent "Log again" button (POST new session + copy exercises).
- **Acceptance:** reuse a session in 3 taps.

---

## 7. Phase 4 — Polish / deferred items (do NOT start until Phases 0–3 ship)

- Pain-overlay on strength/balance views (pain region + load in same window).
- Exposure-gap and plateau/win signals beyond the v1 rule set.
- Offline-first sync queue (replaces online-first; the API layer already isolates network calls, so this is additive).
- Rest timer, exercise reorder/delete UX, body-silhouette pain picker, Plan tab, dark mode.

---

## 8. Effort / cost model

Sizes: **S** ≈ ≤150 lines & low risk · **M** ≈ 150–300 lines & moderate risk · **L** ≈ 300+ lines or multi-file/tricky.

| Phase | Task | Files (C=create, M=modify) | Size |
|---|---|---|---|
| 0 | Root stack | `app/_layout.tsx` M | S |
| 0 | Active session store | `stores/active-session-store.ts` C | S |
| 0 | Sheet + rating-scale | `components/ui/sheet.tsx`, `rating-scale.tsx` C | S |
| 0 | Tab rename | `app/(tabs)/_layout.tsx` M | S |
| 1 | Active Workout screen | `app/workout.tsx` C | L |
| 1 | Exercise picker | `components/workout/exercise-picker-sheet.tsx` C | M |
| 1 | Exercise block + set row | `exercise-block.tsx`, `set-row.tsx` C | L |
| 1 | Finish sheet | `finish-sheet.tsx` C | M |
| 1 | Mini-bar | `active-session-bar.tsx` C, `_layout.tsx` M | M |
| 1 | Today start entry | `app/(tabs)/index.tsx` M | M |
| 2 | Check-in card + sheet | `check-in-card.tsx`, `check-in-sheet.tsx` C | M |
| 2 | Pain sheet | `pain-sheet.tsx` C | M |
| 3 | Backend history endpoint | `exercises.ts` M, `schemas.ts` M, test C | M |
| 3 | History api + hook | `lib/api/exercises.ts` M, `use-exercises.ts` M | S |
| 3 | Insights derivation | `lib/insights.ts` C | L |
| 3 | Insights screen + 4 components | `insights.tsx` M + 4 C | L |
| 3 | History + session detail | `history.tsx` M, `session/[id].tsx` C | M |

**Totals:** ~13 created, ~8 modified, 1 backend file. Roughly: **7 S · 8 M · 4 L**. The two `L` tasks in Phase 1 (workout screen + set row) are the critical path and carry most of the bug risk — implement them carefully and test manually against the running `make dev` stack.

**Suggested implementation order to a cheaper model:** deliver Phase 0 + Phase 1 first (this alone makes the app a *usable training log* — the current gap), then Phase 2, then Phase 3.

---

## 9. Verification & definition of done

After **every** task/phase, run from repo root:

```bash
make typecheck   # tsc --noEmit in mobile-client + api
make lint        # expo lint in mobile-client
make test        # backend unit + integration (only needed for T3.1)
```

Manual smoke test (needs `make dev` running):
1. Sign up → land on Today (empty state, motivational).
2. Start workout → add "Bench Press" from recents → log 80×8, 80×8 → Finish → rate 7 → Save → back to Today; week strip shows +1.
3. Minimize mid-workout → mini-bar visible on all tabs → resume → finish.
4. Check in (4 rows) → card disappears for the day.
5. Log pain → awareness line appears on Today.
6. Insights shows load verdict + strength sparklines + balance + ≤3 signals (or the "log a few sessions" empty state).

---

## 10. Hand-off notes (read before coding — API gotchas for a cheap model)

- **`POST /sessions` requires** `startedAt` (ISO with timezone), `duration` (int seconds ≥ 0), `srpe` (1–10), `type` (non-empty). Send placeholders `duration: 0, srpe: 1, type: 'strength'` on start.
- **`POST …/sets` requires `sortOrder`** (int ≥ 0); all measurement fields are optional and nullable — send `null` for unused, never `0` as a placeholder for unset values.
- **`PUT /daily-logs/:date` body must NOT contain `date`** (it's in the path) even though the shared `CreateDailyLogInput` type includes it — send only wellness fields.
- **Path params are UUIDs** (`z.uuid()`); use the server-returned `id` values verbatim.
- **`GET /daily-logs` requires both `from` and `to`** (returns 400 otherwise); use `recentDateRange(n)` from `lib/date-range.ts`.
- **Lists are paginated** (`{ data, page: { nextCursor } }`). For MVP screens, request `limit: 100` and render `data` directly; pagination UI is out of scope.
- **Numbers from the server arrive as `number`** already (serialization layer converts the stored strings); no manual parse needed on read — only convert strings → numbers when *sending* from text inputs.
- **Empty states copy** must match `docs/20260906_ux_design.md` §8 verbatim (motivational tone).
- **Never** show a raw metric without interpretation (UX doc §7); follow the "Say / Never say" table.

---

*End of plan. Divergence from `20260906_ux_design.md` must be documented in this file.*
