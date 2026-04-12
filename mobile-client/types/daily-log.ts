export type DailyLog = {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  sleepDuration?: number; // minutes
  sleepQuality?: number; // 1–10
  soreness?: number; // 1–10
  fatigue?: number; // 1–10
  stress?: number; // 1–10
  motivation?: number; // 1–10
  hrv?: number; // ms
  bodyWeight?: number; // kg
  notes?: string;
  createdAt: Date;
};
