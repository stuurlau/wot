import type { TrainingSessionDetail } from '@/lib/api';

// A session is only "finished" once the user rates it (D2 in the
// implementation plan). Until then its duration stays 0 and it must not
// appear in History, recents, or Insights inputs — the Today tab surfaces it
// via the unfinished-workout prompt instead.

export function isFinishedSession(s: { duration: number }): boolean {
  return s.duration > 0;
}

export function finishedSessions<T extends { duration: number }>(list: T[]): T[] {
  return list.filter(isFinishedSession);
}

// A workout is considered abandoned once nothing was logged for this long;
// its suggested duration then stops at the last activity instead of "now".
const STALE_AFTER_MS = 60 * 60 * 1000;

/** Last time anything was logged in the session (exercise or set created). */
export function lastActivityMs(session: TrainingSessionDetail): number {
  let last = new Date(session.startedAt).getTime();
  for (const exercise of session.exercises) {
    last = Math.max(last, new Date(exercise.createdAt).getTime());
    for (const set of exercise.sets) {
      last = Math.max(last, new Date(set.createdAt).getTime());
    }
  }
  return last;
}

/**
 * Suggested duration (minutes) for the finish sheet. Normally "now − start",
 * but for a stale session (no activity for over an hour) it cuts off at the
 * last logged activity so a forgotten workout doesn't turn into a 3-day
 * duration. The field stays editable — this is only the prefill.
 */
export function suggestedDurationMinutes(
  startedAtMs: number,
  lastActiveMs: number,
  nowMs: number,
): number {
  const endMs = nowMs - lastActiveMs > STALE_AFTER_MS ? lastActiveMs : nowMs;
  return Math.max(1, Math.round((endMs - startedAtMs) / 60000));
}
