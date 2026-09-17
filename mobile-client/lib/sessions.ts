// A session is only "finished" once the user rates it (D2 in the
// implementation plan). Until then its duration stays 0 and it must not
// appear in History, recents, or Insights inputs — the in-progress bar
// already represents it.

export function isFinishedSession(s: { duration: number }): boolean {
  return s.duration > 0;
}

export function finishedSessions<T extends { duration: number }>(list: T[]): T[] {
  return list.filter(isFinishedSession);
}
