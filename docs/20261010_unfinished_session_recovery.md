# Unfinished session recovery (issue #24)

**Date:** 2026-10-10
**Status:** done

## Why

Starting a workout immediately creates a placeholder session (`duration: 0`)
and finishing it sets the real duration + sRPE. Only finished sessions appear
in History, recents and Insights. The active workout lives in an in-memory
zustand store (D2 in `20260906_ux_implementation_plan.md`), so closing the app
mid-workout orphaned the placeholder: it stayed in the database but surfaced
nowhere — logged workouts silently "disappeared" (issue #24). This implements
the "cheap future fix" D2 explicitly deferred.

## Decisions

### Detection is client-side, no schema change

A session with `duration === 0` that is **not** the one in the active-session
store is orphaned (the app was closed or crashed before finishing). The most
recent one is surfaced on the Today tab. No `status`/`finished_at` column:
the existing duration placeholder already encodes it.

### Recovery prompt on app open + permanent banner

- The first time an orphan is seen per app run, a bottom sheet
  (`components/workout/unfinished-session-sheet.tsx`) pops up over the Today
  tab with three actions:
  - **Finish workout** — opens the normal finish sheet (rate sRPE, correct
    duration/type/note) so the session lands in History.
  - **Resume instead** — adopts the session into the active-session store
    with its *original* `startedAt` (new optional `start()` parameter) and
    opens the workout screen, timer intact.
  - **Discard** — two-tap delete for false starts (same confirm pattern as
    the session detail screen).
- A persistent "Unfinished workout" card on the Today tab re-opens the sheet,
  so dismissing the popup never strands the session again. Multiple orphans
  are handled one at a time, most recent first.

### Duration prefill stops at last activity for stale workouts

Finishing a forgotten workout used to prefill `now − start` — a 3-day-old
workout suggested a 3-day duration. `lib/sessions.ts` now computes the
suggestion as `now − start`, but cut off at the **last logged activity**
(exercise/set `createdAt`) once nothing was logged for over an hour
(`suggestedDurationMinutes`). This is the issue's "save after an hour of no
extra sessions" as a *suggestion*: the duration field stays editable and the
user confirms/corrects it in the finish sheet. Applies to the normal finish
flow too (minimized workout resumed hours later).

The finish sheet now derives its initial state from the session detail
(`useTrainingSession`) instead of the store's `startedAtMs`, initializing once
per open so refetches can't clobber edits; the type chip starts from the
session's actual type.

### Finishing an orphan must not kill a live workout

`FinishSheet` previously cleared the active-session store and rest timer
unconditionally. Both are now only torn down when the finished session is the
one they belong to, so finishing an old orphan while a different workout is
in progress leaves the live workout untouched. New `backOnSave` prop
(default `true`) skips the `router.back()` when finishing from a tab.

## Deliberately left out

- **Server-side auto-finish**: actually writing a duration after 1h of
  inactivity would either store a placeholder sRPE (corrupting load metrics)
  or need a schema change. The prompt achieves the same with user-confirmed
  data.
- **Unfinished sessions in History/Insights**: they remain finished-only;
  the Today card is the single visible entry point for orphans.
- Orphans older than the Today query window (60 days) are not prompted for.
