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
