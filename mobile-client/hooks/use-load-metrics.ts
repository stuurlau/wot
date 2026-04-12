import { useMemo } from 'react';
import type { Session, DailyLog } from '@/types';

type DailyLoadEntry = { date: string; load: number };

type LoadMetrics = {
  weeklyLoad: number;
  prevWeeklyLoad: number;
  monotony: number;
  strain: number;
  acwr: number;
  streak: number;
  recoveryScore: number;
  dailyLoads: DailyLoadEntry[];
};

function sessionLoad(s: Session): number {
  return s.duration * s.srpe;
}

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getDailyLoads(sessions: Session[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const s of sessions) {
    const key = toDateKey(s.startedAt);
    map.set(key, (map.get(key) ?? 0) + sessionLoad(s));
  }
  return map;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = values.reduce((sum, v) => sum + (v - m) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function getWindowLoads(dailyMap: Map<string, number>, daysBack: number, offset = 0): number[] {
  const loads: number[] = [];
  const now = new Date();
  for (let i = offset; i < offset + daysBack; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    loads.push(dailyMap.get(toDateKey(d)) ?? 0);
  }
  return loads;
}

function computeStreak(dailyMap: Map<string, number>): number {
  let count = 0;
  const now = new Date();
  for (let i = 0; i < 60; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    if ((dailyMap.get(toDateKey(d)) ?? 0) > 0) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

/** Readiness composite: average of inverted-negative + positive wellness fields, scaled to 0–100 */
function computeRecovery(log?: DailyLog): number {
  if (!log) return 75; // default when no data
  const fields: number[] = [];

  // Positive signals (higher = better)
  if (log.sleepQuality != null) fields.push(log.sleepQuality * 10);
  if (log.motivation != null) fields.push(log.motivation * 10);

  // Negative signals inverted (lower raw = better recovery)
  if (log.soreness != null) fields.push((10 - log.soreness) * 10);
  if (log.fatigue != null) fields.push((10 - log.fatigue) * 10);
  if (log.stress != null) fields.push((10 - log.stress) * 10);

  return fields.length > 0 ? Math.round(mean(fields)) : 75;
}

export function useLoadMetrics(sessions: Session[], dailyLogs: DailyLog[]): LoadMetrics {
  return useMemo(() => {
    const dailyMap = getDailyLoads(sessions);

    const last7 = getWindowLoads(dailyMap, 7);
    const prev7 = getWindowLoads(dailyMap, 7, 7);
    const last28 = getWindowLoads(dailyMap, 28);

    const weeklyLoad = last7.reduce((a, b) => a + b, 0);
    const prevWeeklyLoad = prev7.reduce((a, b) => a + b, 0);
    const avg28 = mean(last28);
    const acwr = avg28 > 0 ? weeklyLoad / 7 / (avg28 / 28 * 7 / 7) : 0;

    const m = mean(last7);
    const sd = stddev(last7);
    const monotony = sd > 0 ? m / sd : 0;
    const strain = weeklyLoad * monotony;

    const streak = computeStreak(dailyMap);
    const todayLog = dailyLogs.find((l) => l.date === toDateKey(new Date()));
    const recoveryScore = computeRecovery(todayLog);

    // Build 7-day array for chart (oldest first → most recent last)
    const dailyLoads: DailyLoadEntry[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = toDateKey(d);
      dailyLoads.push({ date: key, load: dailyMap.get(key) ?? 0 });
    }

    return { weeklyLoad, prevWeeklyLoad, monotony, strain, acwr, streak, recoveryScore, dailyLoads };
  }, [sessions, dailyLogs]);
}
