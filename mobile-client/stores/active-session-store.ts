import { create } from 'zustand';

type ActiveSessionState = {
  sessionId: string | null;
  startedAtMs: number | null;
  start: (sessionId: string, startedAtMs?: number) => void;
  clear: () => void;
};

export const useActiveSessionStore = create<ActiveSessionState>((set) => ({
  sessionId: null,
  startedAtMs: null,
  // startedAtMs is passed when adopting an existing (unfinished) session so the
  // timer reflects the real start; a fresh workout defaults to now.
  start: (sessionId, startedAtMs) => set({ sessionId, startedAtMs: startedAtMs ?? Date.now() }),
  clear: () => set({ sessionId: null, startedAtMs: null }),
}));
