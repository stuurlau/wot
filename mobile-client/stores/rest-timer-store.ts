import { create } from 'zustand';

type RestTimerState = {
  /** Session the running rest clock belongs to. */
  sessionId: string | null;
  /** Set the clock was (re)started after — a rest always sits between two sets. */
  previousSetId: string | null;
  startedAtMs: number | null;
  /** (Re)start the rest clock for a session after saving a set. */
  start: (sessionId: string, previousSetId: string) => void;
  /** Discard the rest clock without recording. */
  stop: () => void;
};

export const useRestTimerStore = create<RestTimerState>((set) => ({
  sessionId: null,
  previousSetId: null,
  startedAtMs: null,
  start: (sessionId, previousSetId) => set({ sessionId, previousSetId, startedAtMs: Date.now() }),
  stop: () => set({ sessionId: null, previousSetId: null, startedAtMs: null }),
}));
