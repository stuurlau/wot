export type Session = {
  id: string;
  userId: string;
  startedAt: Date;
  duration: number; // seconds
  srpe: number; // 1–10, decimals allowed
  type: string; // "strength", "run", "yoga", etc.
  title?: string;
  notes?: string;
  createdAt: Date;
};

export type SessionComponent = {
  id: string;
  sessionId: string;
  name: string;
  bodyRegions?: string[];
  weight?: number; // kg
  reps?: number;
  rir?: number; // 0–10
  distance?: number; // meters
  duration?: number; // seconds
  pace?: number; // seconds per km
  rpe?: number; // 1–10
  sortOrder: number;
  notes?: string;
  createdAt: Date;
};
