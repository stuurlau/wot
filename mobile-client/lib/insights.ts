import type { DailyLog, PainLog } from '@wot/types';
import { bodyPartLabel, bodyPartRoots } from '@wot/types';
import type { ExerciseHistoryRow } from '@/lib/api';

export type Signal = {
  kind: string;
  title: string;
  body: string;
  priority: number;
  // "The why": underlying numbers behind the statement, shown on expand.
  details?: string[];
};

// Data-maturity ladder (docs/20261003_insights_dashboard_defaults.md): the
// dashboard renders the most meaningful thing the available data honestly
// supports — never a degenerate chart or a baseline-less verdict.
export type DataMaturity = 'empty' | 'warming-up' | 'trending' | 'full';

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

export type RegionShare = {
  region: string;
  sharePct: number;
  // The user's own historical share (history older than the recent window);
  // null when there is no older data to compare against.
  usualPct: number | null;
};

const LOAD_SPIKE_FACTOR = 1.3;
const EXPOSURE_GAP_DAYS = 10;
const RECOVERY_DIP_DAYS = 3;
const RECOVERY_DIP_THRESHOLD = 7;
const PLATEAU_WEEKS = 4;
const WIN_WEEKS = 2;
const TREND_WINDOW_WEEKS = 8;
const BALANCE_RECENT_DAYS = 28;
// A load-spike verdict only means something against a real baseline:
// 1 acute week + 4 baseline weeks with actual load.
const SPIKE_BASELINE_WEEKS = 4;

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

// Maturity stages (see the proposal doc): empty → motivational state;
// warming-up → quiet summary, no charts; trending → charts without
// baseline comparisons; full → verdict vs 4-week average and "usual" shares.
export function dataMaturity(
  sessions: { startedAt: string }[],
  todayKey: string,
): DataMaturity {
  if (sessions.length === 0) return 'empty';
  const firstDay = sessions.map((s) => s.startedAt.slice(0, 10)).sort()[0];
  const days = daysBetween(firstDay, todayKey);
  if (sessions.length <= 2 || days < 7) return 'warming-up';
  if (days < BALANCE_RECENT_DAYS) return 'trending';
  return 'full';
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

function regionShares(history: ExerciseHistoryRow[]): Map<string, number> {
  const totals = new Map<string, number>();
  let sum = 0;
  for (const row of history) {
    const volume = row.weight !== null && row.reps !== null ? row.weight * row.reps : 1;
    // Roll each selection up to its top-level region(s) so the balance chart
    // stays at region granularity regardless of how specific the user was.
    const roots = bodyPartRoots(row.bodyParts);
    const regions =
      roots.length > 0 ? roots.map((r) => bodyPartLabel(r) ?? r) : ['Uncategorised'];
    const split = volume / regions.length;
    for (const region of regions) {
      totals.set(region, (totals.get(region) ?? 0) + split);
      sum += split;
    }
  }
  const shares = new Map<string, number>();
  if (sum === 0) return shares;
  for (const [region, v] of totals) shares.set(region, Math.round((v / sum) * 100));
  return shares;
}

// Shares over the recent window, framed against the user's own usual share
// (everything older than the window). A region with no older history gets
// usualPct null — never a comparison against a normative ratio.
export function regionBalance(history: ExerciseHistoryRow[], todayKey: string): RegionShare[] {
  const recent = history.filter((r) => daysBetween(r.date, todayKey) < BALANCE_RECENT_DAYS);
  const older = history.filter((r) => daysBetween(r.date, todayKey) >= BALANCE_RECENT_DAYS);
  const recentShares = regionShares(recent);
  const usualShares = regionShares(older);
  return Array.from(recentShares.entries())
    .map(([region, sharePct]) => ({
      region,
      sharePct,
      usualPct: usualShares.get(region) ?? null,
    }))
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

  // Load spike — only with a real baseline (a false alarm costs more trust
  // than a missed one): the 4 baseline weeks must all have load.
  const baselineWeeks = weeklyLoads.slice(0, -1).slice(-SPIKE_BASELINE_WEEKS);
  const hasSpikeBaseline =
    baselineWeeks.length === SPIKE_BASELINE_WEEKS && baselineWeeks.every((w) => w.load > 0);
  if (verdict.direction === 'spiking' && hasSpikeBaseline) {
    const current = weeklyLoads.at(-1)?.load ?? 0;
    signals.push({
      kind: 'load-spike',
      title: 'Load rising fast',
      body: `This week is ${verdict.deltaPct}% above your usual. Consider keeping the next session easy.`,
      priority: 60,
      details: [
        `This week so far: ${Math.round(current)}`,
        `Your 4-week average: ${Math.round(mean(baselineWeeks.map((w) => w.load)))}`,
      ],
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
      const dates = recentPain
        .filter((p) => p.bodyRegion === region)
        .map((p) => p.date)
        .sort();
      signals.push({
        kind: 'pain-recurring',
        title: `${region[0]?.toUpperCase() ?? ''}${region.slice(1)} pain recurring`,
        body: `${count} pain logs in the last 7 days. Worth watching.`,
        priority: 80,
        details: dates.map((d) => `${d} · pain logged`),
      });
    }
  }

  // Recovery dip — the last RECOVERY_DIP_DAYS logged days were all high.
  const sorted = [...dailyLogs].sort((a, b) => a.date.localeCompare(b.date));
  const recentLogged = sorted.slice(-RECOVERY_DIP_DAYS);
  const isHigh = (d: DailyLog) =>
    (d.fatigue ?? 0) >= RECOVERY_DIP_THRESHOLD || (d.soreness ?? 0) >= RECOVERY_DIP_THRESHOLD;
  if (recentLogged.length >= RECOVERY_DIP_DAYS && recentLogged.every(isHigh)) {
    signals.push({
      kind: 'recovery-dip',
      title: 'Recovery markers dipping',
      body: `Fatigue or soreness have been high for ${RECOVERY_DIP_DAYS} days in a row. Load tolerance may be lower than usual.`,
      priority: 50,
      details: recentLogged.map(
        (d) => `${d.date} · fatigue ${d.fatigue ?? '–'} · soreness ${d.soreness ?? '–'}`,
      ),
    });
  }

  // Exposure gap
  const regionsSeen = new Set<string>();
  for (const row of exerciseHistory) bodyPartRoots(row.bodyParts).forEach((r) => regionsSeen.add(r));
  for (const region of regionsSeen) {
    const lastUse = exerciseHistory
      .filter((r) => bodyPartRoots(r.bodyParts).includes(region))
      .map((r) => r.date)
      .sort()
      .at(-1);
    if (lastUse && daysBetween(lastUse, todayKey) >= EXPOSURE_GAP_DAYS) {
      signals.push({
        kind: 'exposure-gap',
        title: `No ${(bodyPartLabel(region) ?? region).toLowerCase()} work in ${daysBetween(lastUse, todayKey)} days`,
        body: 'Your usual rhythm includes it. Worth getting a session in.',
        priority: 40,
        details: [`Last ${region} session: ${lastUse}`],
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
          details: [`Weekly best: ${lastNonNull.join(' → ')}`],
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
        details: [`Weekly best: ${lastTwo.join(' → ')}`],
      });
      break;
    }
  }

  return signals.sort((a, b) => b.priority - a.priority).slice(0, 3);
}