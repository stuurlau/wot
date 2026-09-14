import type { DailyLog, PainLog } from '@wot/types';
import type { ExerciseHistoryRow } from '@/lib/api';

export type Signal = {
  kind: string;
  title: string;
  body: string;
  priority: number;
};

export type LoadVerdict = {
  direction: 'building' | 'holding' | 'spiking' | 'dipping';
  // null when there is no baseline to compare against (first real data).
  deltaPct: number | null;
};

export type WeeklyLoad = { weekStart: string; load: number };

export type ExerciseTrend = {
  name: string;
  weeklyBest: (number | null)[];
  direction: 'up' | 'flat' | 'down';
};

export type RegionShare = { region: string; sharePct: number };

const LOAD_SPIKE_FACTOR = 1.3;
const EXPOSURE_GAP_DAYS = 10;
const RECOVERY_DIP_DAYS = 3;
const RECOVERY_DIP_THRESHOLD = 7;
const PLATEAU_WEEKS = 4;
const WIN_WEEKS = 2;
const TREND_WINDOW_WEEKS = 8;

function weekStartKey(date: Date): string {
  const d = new Date(date);
  const day = d.getDay() === 0 ? 7 : d.getDay();
  d.setDate(d.getDate() - (day - 1));
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function lastNWeeks(n: number): Date[] {
  const weeks: Date[] = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    weeks.push(d);
  }
  return weeks;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function daysBetween(a: string, b: string): number {
  const A = new Date(`${a}T00:00:00Z`);
  const B = new Date(`${b}T00:00:00Z`);
  return Math.round((B.getTime() - A.getTime()) / 86400000);
}

export function sessionLoad(s: { duration: number; srpe: number }): number {
  return s.duration * s.srpe;
}

export function buildWeeklyLoads(
  sessions: { startedAt: string; duration: number; srpe: number }[],
  weeks = TREND_WINDOW_WEEKS,
): WeeklyLoad[] {
  const buckets = new Map<string, number>();
  for (const s of sessions) {
    const key = weekStartKey(new Date(s.startedAt));
    buckets.set(key, (buckets.get(key) ?? 0) + sessionLoad(s));
  }
  return lastNWeeks(weeks)
    .reverse()
    .map((w) => {
      const key = weekStartKey(w);
      return { weekStart: key, load: buckets.get(key) ?? 0 };
    });
}

export function loadVerdict(weeklyLoads: WeeklyLoad[]): LoadVerdict {
  const current = weeklyLoads.at(-1)?.load ?? 0;
  const prior = weeklyLoads.slice(0, -1).slice(-4).map((w) => w.load);
  const priorAvg = mean(prior);
  const deltaPct = priorAvg > 0 ? Math.round(((current - priorAvg) / priorAvg) * 100) : 0;

  if (priorAvg === 0) return { direction: 'building', deltaPct: null };
  if (current >= priorAvg * LOAD_SPIKE_FACTOR) return { direction: 'spiking', deltaPct };
  if (current <= priorAvg * 0.5 && current > 0) return { direction: 'dipping', deltaPct };
  if (Math.abs(deltaPct) <= 8) return { direction: 'holding', deltaPct };
  return current > priorAvg ? { direction: 'building', deltaPct } : { direction: 'dipping', deltaPct };
}

export function strengthProgression(
  history: ExerciseHistoryRow[],
  n = TREND_WINDOW_WEEKS,
): ExerciseTrend[] {
  const byName = new Map<string, ExerciseHistoryRow[]>();
  for (const row of history) {
    if (row.weight === null) continue;
    const list = byName.get(row.name) ?? [];
    list.push(row);
    byName.set(row.name, list);
  }

  const trends: ExerciseTrend[] = [];
  for (const [name, rows] of byName) {
    const weeks = lastNWeeks(n).reverse();
    const weeklyBest: (number | null)[] = weeks.map((w) => {
      const key = weekStartKey(w);
      const best = rows
        .filter((r) => weekStartKey(new Date(`${r.date}T00:00:00Z`)) === key)
        .reduce<number | null>(
          (acc, r) => (acc === null ? r.weight : Math.max(acc, r.weight!)),
          null,
        );
      return best;
    });
    if (weeklyBest.every((v) => v === null)) continue;

    const recent = weeklyBest.slice(-4).filter((v): v is number => v !== null);
    const prior = weeklyBest.slice(-8, -4).filter((v): v is number => v !== null);
    const recentAvg = mean(recent);
    const priorAvg = mean(prior);
    let direction: 'up' | 'flat' | 'down' = 'flat';
    if (priorAvg > 0 && recentAvg > priorAvg * 1.03) direction = 'up';
    else if (priorAvg > 0 && recentAvg < priorAvg * 0.97) direction = 'down';

    trends.push({ name, weeklyBest, direction });
  }

  return trends.sort((a, b) => {
    const aCount = a.weeklyBest.filter((v) => v !== null).length;
    const bCount = b.weeklyBest.filter((v) => v !== null).length;
    return bCount - aCount;
  });
}

export function regionBalance(history: ExerciseHistoryRow[]): RegionShare[] {
  const totals = new Map<string, number>();
  let sum = 0;
  for (const row of history) {
    const volume = row.weight !== null && row.reps !== null ? row.weight * row.reps : 1;
    const regions = row.bodyRegions.length > 0 ? row.bodyRegions : ['uncategorised'];
    const split = volume / regions.length;
    for (const region of regions) {
      totals.set(region, (totals.get(region) ?? 0) + split);
      sum += split;
    }
  }
  if (sum === 0) return [];
  return Array.from(totals.entries())
    .map(([region, v]) => ({ region, sharePct: Math.round((v / sum) * 100) }))
    .sort((a, b) => b.sharePct - a.sharePct);
}

export function deriveSignals(input: {
  sessions: { startedAt: string; duration: number; srpe: number }[];
  exerciseHistory: ExerciseHistoryRow[];
  painLogs: PainLog[];
  dailyLogs: DailyLog[];
  todayKey: string;
}): Signal[] {
  const { exerciseHistory, painLogs, dailyLogs, todayKey } = input;
  const signals: Signal[] = [];
  const weeklyLoads = buildWeeklyLoads(input.sessions);
  const verdict = loadVerdict(weeklyLoads);

  // Load spike
  if (verdict.direction === 'spiking') {
    signals.push({
      kind: 'load-spike',
      title: 'Load rising fast',
      body: `This week is ${verdict.deltaPct}% above your usual. Consider keeping the next session easy.`,
      priority: 60,
    });
  }

  // Pain recurring (same region >= 2x in 7 days)
  const now = new Date(`${todayKey}T00:00:00Z`);
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentPain = painLogs.filter((p) => new Date(`${p.date}T00:00:00Z`) >= weekAgo);
  const regionCounts = new Map<string, number>();
  for (const p of recentPain) {
    regionCounts.set(p.bodyRegion, (regionCounts.get(p.bodyRegion) ?? 0) + 1);
  }
  for (const [region, count] of regionCounts) {
    if (count >= 2) {
      signals.push({
        kind: 'pain-recurring',
        title: `${region[0]?.toUpperCase() ?? ''}${region.slice(1)} pain recurring`,
        body: `${count} pain logs in the last 7 days. Worth watching.`,
        priority: 80,
      });
    }
  }

  // Recovery dip
  const sorted = [...dailyLogs].sort((a, b) => a.date.localeCompare(b.date));
  const dipDays = sorted
    .filter((d) => (d.fatigue ?? 0) >= RECOVERY_DIP_THRESHOLD || (d.soreness ?? 0) >= RECOVERY_DIP_THRESHOLD)
    .slice(-RECOVERY_DIP_DAYS);
  if (dipDays.length >= RECOVERY_DIP_DAYS) {
    signals.push({
      kind: 'recovery-dip',
      title: 'Recovery markers dipping',
      body: `Fatigue or soreness have been high for ${RECOVERY_DIP_DAYS} days in a row. Load tolerance may be lower than usual.`,
      priority: 50,
    });
  }

  // Exposure gap
  const regionsSeen = new Set<string>();
  for (const row of exerciseHistory) row.bodyRegions.forEach((r) => regionsSeen.add(r));
  const gapTargets = Array.from(new Set([...regionsSeen, 'legs', 'prehab', 'pull']));
  for (const region of gapTargets) {
    const lastUse = exerciseHistory
      .filter((r) => r.bodyRegions.includes(region))
      .map((r) => r.date)
      .sort()
      .at(-1);
    if (lastUse && daysBetween(lastUse, todayKey) >= EXPOSURE_GAP_DAYS) {
      signals.push({
        kind: 'exposure-gap',
        title: `No ${region} work in ${daysBetween(lastUse, todayKey)} days`,
        body: 'Your usual rhythm includes it. Worth getting a session in.',
        priority: 40,
      });
    }
  }

  // Plateau / win on key exercises
  for (const trend of strengthProgression(exerciseHistory).slice(0, 5)) {
    const lastNonNull = trend.weeklyBest.filter((v): v is number => v !== null).slice(-PLATEAU_WEEKS);
    if (lastNonNull.length >= PLATEAU_WEEKS) {
      const recent = lastNonNull.slice(-2);
      const oldest = lastNonNull[0];
      const isFlat = Math.abs(recent[1] - oldest) / oldest < 0.02;
      if (trend.direction === 'down' || (trend.direction === 'flat' && isFlat)) {
        signals.push({
          kind: 'plateau',
          title: `${trend.name} flat for ${PLATEAU_WEEKS} weeks`,
          body: 'Normal — or a sign to vary the stimulus.',
          priority: 30,
        });
        break;
      }
    }
    const lastTwo = trend.weeklyBest.filter((v): v is number => v !== null).slice(-WIN_WEEKS);
    if (lastTwo.length >= WIN_WEEKS && lastTwo[1] > lastTwo[0] && trend.direction === 'up') {
      signals.push({
        kind: 'progression-win',
        title: `${trend.name} is climbing`,
        body: `Up ${WIN_WEEKS} weeks running. Keep doing what you're doing.`,
        priority: 20,
      });
      break;
    }
  }

  return signals.sort((a, b) => b.priority - a.priority).slice(0, 3);
}