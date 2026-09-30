import { create } from 'zustand';

type RestTimerState = {
  /** Session the running rest clock belongs to. */
  sessionId: string | null;
  startedAtMs: number | null;
  /** (Re)start the rest clock for a session. */
  start: (sessionId: string) => void;
  /** Discard the rest clock without recording. */
  stop: () => void;
};

export const useRestTimerStore = create<RestTimerState>((set) => ({
  sessionId: null,
  startedAtMs: null,
  start: (sessionId) => set({ sessionId, startedAtMs: Date.now() }),
  stop: () => set({ sessionId: null, startedAtMs: null }),
}));

/** Seconds on the rest clock for this session, or null when it is not running. */
export function elapsedRestSeconds(sessionId: string): number | null {
  const state = useRestTimerStore.getState();
  if (state.sessionId !== sessionId || state.startedAtMs === null) return null;
  return Math.max(0, Math.round((Date.now() - state.startedAtMs) / 1000));
}
