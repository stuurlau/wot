import type { DailyLog, PainLog } from '@wot/types';
import type { ExerciseHistoryRow, ExerciseTagsRow } from '@/lib/api';

/**
 * Insights engine — a port of the "Insights Redesign" prototype logic
 * (docs/20261015_insights_glance_explorer_redesign.md). Everything is computed
 * client-side from set-level history rows, exercise tags, daily check-ins and
 * pain logs. Weeks are Monday–Sunday; the current week is always the last
 * point and compares against prior weeks cut at the same weekday.
 */

// ---------------------------------------------------------------------------
// Dates (UTC day numbers; weeks start Monday)
// ---------------------------------------------------------------------------

const DAY_MS = 86400000;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function dayNumberOf(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number);
  return Date.UTC(y, m - 1, d) / DAY_MS;
}

export function todayDayNumber(now = new Date()): number {
  return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / DAY_MS;
}

// Monday-first weekday (Mon 0 … Sun 6). Day number 0 (1970-01-01) was a Thursday.
export function weekdayOf(day: number): number {
  return (((day + 3) % 7) + 7) % 7;
}

// Day numbers of Mondays satisfy day % 7 === 4 (1970-01-05 was a Monday), so
// Monday-aligned week indices are integers: floor((day - 4) / 7).
const MONDAY_OFFSET = 4;

export function weekOfDay(day: number): number {
  return Math.floor((day - MONDAY_OFFSET) / 7);
}

export function weekStartDay(week: number): number {
  return week * 7 + MONDAY_OFFSET;
}

export function fmtDay(day: number): string {
  const d = new Date(day * DAY_MS);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

export function dayLabel(day: number): string {
  return `${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][weekdayOf(day)]} ${fmtDay(day)}`;
}

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

// ---------------------------------------------------------------------------
// Dataset
// ---------------------------------------------------------------------------

export type InsightsSet = {
  w: number | null;
  r: number | null;
  rir: number | null;
  rpe: number | null;
  // Hold seconds (timed/flexibility sets).
  sec: number | null;
};

export type InsightsExercise = { name: string; tags: string[]; sets: InsightsSet[] };

export type InsightsSession = {
  id: string;
  day: number;
  wk: number;
  type: string;
  durationSec: number;
  srpe: number;
  exercises: InsightsExercise[];
};

export type ExerciseKind = 'weighted' | 'bodyweight' | 'timed';

export type ExerciseInfo = {
  name: string;
  tags: string[];
  kind: ExerciseKind;
  // Sessions containing this exercise (all time in the fetched window).
  sessionCount: number;
};

export type InsightsData = {
  sessions: InsightsSession[]; // sorted by day
  daily: { day: number; wk: number; fatigue: number | null; soreness: number | null }[];
  pain: { day: number; wk: number; region: string }[];
  exercises: Map<string, ExerciseInfo>;
  // Every tag worth offering: the defaults first, then user tags (sorted).
  tags: string[];
  firstDay: number | null;
  firstWk: number | null;
  today: { day: number; dow: number; wk: number };
  cache: Map<string, number | null>;
};

export const DEFAULT_TAGS = ['push', 'pull', 'legs', 'prehab'];

// Exercise names with an evidence-checked note (docs: insights redesign).
// Keys are lowercase; each entry needs a checked source.
export const EVIDENCE: Record<string, string> = {
  'nordic curl':
    'Programmes that include Nordic curls roughly halved hamstring injuries (van Dyk et al., 2019, BJSM · 8,459 athletes).',
};

function classifyExercise(sets: InsightsSet[]): ExerciseKind {
  const hasWeight = sets.some((s) => s.w != null);
  const hasReps = sets.some((s) => s.r != null);
  const hasHold = sets.some((s) => s.sec != null);
  if (hasWeight) return 'weighted';
  if (hasHold && !hasReps) return 'timed';
  return 'bodyweight';
}

export function buildInsightsData(
  rows: ExerciseHistoryRow[],
  tagRows: ExerciseTagsRow[],
  dailyLogs: DailyLog[],
  painLogs: PainLog[],
  todayDay: number,
): InsightsData {
  const tagsByName = new Map<string, string[]>();
  for (const row of tagRows) tagsByName.set(row.exerciseName, row.tags);

  const sessionMap = new Map<string, InsightsSession>();
  const exerciseOrder = new Map<string, Map<string, InsightsExercise>>();
  for (const row of rows) {
    let session = sessionMap.get(row.sessionId);
    if (!session) {
      const day = dayNumberOf(row.date);
      session = {
        id: row.sessionId,
        day,
        wk: weekOfDay(day),
        type: row.sessionType,
        durationSec: row.sessionDuration,
        srpe: row.sessionSrpe,
        exercises: [],
      };
      sessionMap.set(row.sessionId, session);
      exerciseOrder.set(row.sessionId, new Map());
    }
    const byExercise = exerciseOrder.get(row.sessionId)!;
    let exercise = byExercise.get(row.exerciseId);
    if (!exercise) {
      exercise = { name: row.name, tags: tagsByName.get(row.name) ?? [], sets: [] };
      byExercise.set(row.exerciseId, exercise);
      session.exercises.push(exercise);
    }
    exercise.sets.push({
      w: row.weight,
      r: row.reps,
      rir: row.rir,
      rpe: row.rpe,
      sec: row.duration,
    });
  }

  const sessions = [...sessionMap.values()].sort((a, b) => a.day - b.day);

  const exercises = new Map<string, ExerciseInfo>();
  for (const session of sessions) {
    const seen = new Set<string>();
    for (const exercise of session.exercises) {
      if (seen.has(exercise.name)) continue;
      seen.add(exercise.name);
      const info = exercises.get(exercise.name);
      if (info) info.sessionCount += 1;
      else
        exercises.set(exercise.name, {
          name: exercise.name,
          tags: exercise.tags,
          kind: 'bodyweight',
          sessionCount: 1,
        });
    }
  }
  // Classify each exercise across its full history (one session may be
  // unweighted-only while others carry load).
  for (const [name, info] of exercises) {
    const allSets = sessions
      .flatMap((s) => s.exercises.filter((e) => e.name === name))
      .flatMap((e) => e.sets);
    info.kind = classifyExercise(allSets);
  }

  const userTags = new Set<string>();
  for (const tags of tagsByName.values()) for (const tag of tags) userTags.add(tag);
  const tags = [
    ...DEFAULT_TAGS,
    ...[...userTags].filter((t) => !DEFAULT_TAGS.includes(t)).sort(),
  ];

  const daily = dailyLogs.map((l) => {
    const day = dayNumberOf(l.date);
    return { day, wk: weekOfDay(day), fatigue: l.fatigue ?? null, soreness: l.soreness ?? null };
  });
  const pain = painLogs.map((l) => {
    const day = dayNumberOf(l.date);
    return { day, wk: weekOfDay(day), region: l.bodyRegion };
  });

  const firstDay = sessions.length ? sessions[0].day : null;
  return {
    sessions,
    daily,
    pain,
    exercises,
    tags,
    firstDay,
    firstWk: firstDay == null ? null : weekOfDay(firstDay),
    today: { day: todayDay, dow: weekdayOf(todayDay), wk: weekOfDay(todayDay) },
    cache: new Map(),
  };
}

// ---------------------------------------------------------------------------
// Data-maturity ladder (docs/20261003_insights_dashboard_defaults.md)
// ---------------------------------------------------------------------------

export type DataMaturity = 'empty' | 'warming-up' | 'trending' | 'full';

export function dataMaturity(D: InsightsData): DataMaturity {
  const n = D.sessions.length;
  if (n === 0 || D.firstDay == null) return 'empty';
  const days = D.today.day - D.firstDay;
  if (n <= 2 || days < 7) return 'warming-up';
  if (days < 28) return 'trending';
  return 'full';
}

// ---------------------------------------------------------------------------
// Scopes & metrics
// ---------------------------------------------------------------------------

export type Scope = { type: 'all' } | { type: 'tag'; id: string } | { type: 'exercise'; id: string };
export type ScopeType = Scope['type'];

export type MetricKey =
  | 'volume'
  | 'load'
  | 'exLoad'
  | 'duration'
  | 'sets'
  | 'reps'
  | 'sessions'
  | 'top'
  | 'e1rm'
  | 'hard'
  | 'setRpe'
  | 'intensity'
  | 'fatigue'
  | 'soreness'
  | 'hold'
  | 'pain';

export type MetricMeta = {
  label: string;
  unit: string;
  scopes: ScopeType[];
  // Weekly sums (y-axis starts at 0; current week compares at the weekday cutoff).
  add?: boolean;
  // Weekly max aggregation (top set / e1RM).
  max?: boolean;
  // Weighted sets / weighted exercises only.
  weightedOnly?: boolean;
  // Decimals to display.
  dec?: number;
};

export const METRICS: Record<MetricKey, MetricMeta> = {
  volume: { label: 'Volume load', unit: 'kg', scopes: ['all', 'tag', 'exercise'], add: true, weightedOnly: true },
  load: { label: 'sRPE load', unit: 'AU', scopes: ['all'], add: true },
  exLoad: { label: 'RPE × reps', unit: 'AU', scopes: ['all', 'tag', 'exercise'], add: true },
  duration: { label: 'Training minutes', unit: 'min', scopes: ['all', 'tag'], add: true },
  sets: { label: 'Sets', unit: 'sets', scopes: ['all', 'tag', 'exercise'], add: true },
  reps: { label: 'Reps', unit: 'reps', scopes: ['all', 'tag', 'exercise'], add: true },
  sessions: { label: 'Sessions', unit: 'sessions', scopes: ['all', 'tag', 'exercise'], add: true },
  top: { label: 'Top set', unit: 'kg', scopes: ['exercise'], max: true, weightedOnly: true },
  e1rm: { label: 'Est. 1RM', unit: 'kg', scopes: ['exercise'], max: true, weightedOnly: true },
  hard: { label: 'Hard sets', unit: 'sets', scopes: ['all', 'tag', 'exercise'], add: true },
  setRpe: { label: 'Set RPE', unit: '/ 10', scopes: ['exercise'], dec: 1 },
  intensity: { label: 'Avg sRPE', unit: '/ 10', scopes: ['all'], dec: 1 },
  fatigue: { label: 'Fatigue', unit: '/ 10', scopes: ['all'], dec: 1 },
  soreness: { label: 'Soreness', unit: '/ 10', scopes: ['all'], dec: 1 },
  hold: { label: 'Hold time', unit: 'min', scopes: ['all', 'tag', 'exercise'], add: true, dec: 1 },
  pain: { label: 'Pain logs', unit: 'logs', scopes: ['all'], add: true },
};

// "About this metric" copy: [body, source].
export const METRIC_WHY: Record<MetricKey, [string, string]> = {
  volume: [
    'Volume load (external load, often called tonnage): kg × reps over your weighted sets — your main load number. Bodyweight and timed sets have no kg, so they show up in sets and perceived load instead. Across very different exercises the total is rough: a kilo on a squat is not a kilo on a lateral raise.',
    '',
  ],
  load: [
    'Session RPE load (internal load): how hard the session felt (0–10) × session duration. Covers every session, including runs and bodyweight work.',
    'Foster 2001 · review of 36 validation studies: Haddad et al. 2017',
  ],
  exLoad: [
    'Set RPE × reps, summed. There is no established name or validation for this yet — read it as a rough effort-weighted rep count. RIR counts as 10 − RIR; sets without either are left out.',
    '',
  ],
  duration: [
    'Total minutes trained. For an exercise tag, the full duration of every session that includes it.',
    '',
  ],
  sets: [
    'Weekly sets per muscle group show a dose–response with muscle and strength gain. Bodyweight and loaded sets count the same.',
    'Schoenfeld et al. 2017 · dose–response meta-regression, Sports Med 2025',
  ],
  reps: ['Total repetitions. Most useful within one exercise — across exercises, sets compare better.', ''],
  sessions: ['How often you trained this. Regularity is what the gap signal watches.', ''],
  top: ['Heaviest set each week — the clearest progression signal for a loaded lift.', ''],
  e1rm: ['Estimated one-rep max (Epley), so sets with different reps compare. An estimate, not a test.', ''],
  hard: [
    'Sets you rated RPE 7 or higher (about 3 reps in reserve or fewer). Uses your per-set RPE; sets without one are not counted.',
    '',
  ],
  setRpe: ['Average RPE of your logged sets for this exercise — the per-exercise intensity, next to the session-level sRPE.', ''],
  intensity: ['Average session RPE on the CR-10 scale.', ''],
  fatigue: ['From your daily check-in. Shown on its own, never merged into a readiness score.', ''],
  soreness: ['From your daily check-in. Shown on its own, never merged into a readiness score.', ''],
  hold: ['Total time held, from the set timer. Weight is shown when you add it, never estimated for bodyweight.', ''],
  pain: ['Pain logs per day. Pain recurring in one area is the highest-priority signal.', ''],
};

export function availableMetrics(D: InsightsData, scope: Scope): MetricKey[] {
  const info = scope.type === 'exercise' ? D.exercises.get(scope.id) : null;
  if (info?.kind === 'timed') return ['hold', 'sets', 'sessions'];
  if (info?.kind === 'bodyweight') return ['reps', 'sets', 'hard', 'setRpe', 'sessions'];
  return (Object.keys(METRICS) as MetricKey[]).filter(
    (k) => METRICS[k].scopes.includes(scope.type) && k !== 'hold',
  );
}

export function defaultMetric(D: InsightsData, scope: Scope): MetricKey {
  if (scope.type !== 'exercise') return 'volume';
  const kind = D.exercises.get(scope.id)?.kind;
  return kind === 'timed' ? 'hold' : kind === 'bodyweight' ? 'reps' : 'top';
}

export const scopeKey = (s: Scope): string =>
  s.type === 'all' ? 'all' : (s.type === 'tag' ? 't:' : 'e:') + s.id;

export const parseScopeKey = (k: string): Scope =>
  k === 'all' ? { type: 'all' } : k.startsWith('t:') ? { type: 'tag', id: k.slice(2) } : { type: 'exercise', id: k.slice(2) };

const matchScope = (scope: Scope, e: InsightsExercise): boolean =>
  scope.type === 'all' || (scope.type === 'tag' ? e.tags.includes(scope.id) : e.name === scope.id);

// RPE with RIR converted (RPE = 10 − RIR); null when neither is logged.
const rpeOf = (s: InsightsSet): number | null =>
  s.rpe ?? (s.rir != null ? 10 - s.rir : null);

function exVal(m: MetricKey, sets: InsightsSet[]): number | null {
  if (m === 'sets') return sets.length;
  if (m === 'exLoad')
    return sets.reduce((a, s) => {
      const rpe = rpeOf(s);
      return a + (rpe != null ? rpe * (s.r || 0) : 0);
    }, 0);
  if (m === 'hard') return sets.filter((s) => (rpeOf(s) ?? 0) >= 7).length;
  if (m === 'setRpe') {
    const rp = sets.map(rpeOf).filter((v): v is number => v != null);
    return rp.length ? rp.reduce((a, b) => a + b, 0) / rp.length : null;
  }
  if (m === 'reps') return sets.reduce((a, s) => a + (s.r || 0), 0);
  if (m === 'hold') return sets.reduce((a, s) => a + (s.sec || 0), 0) / 60;
  if (m === 'volume') return sets.reduce((a, s) => a + (s.w != null && s.r != null ? s.w * s.r : 0), 0);
  // top / e1rm: weekly max over weighted sets.
  let best: number | null = null;
  for (const s of sets) {
    if (s.w == null) continue;
    const v = m === 'top' ? s.w : s.w * (1 + (s.r ?? 1) / 30);
    best = best == null ? v : Math.max(best, v);
  }
  return best;
}

function rawVal(D: InsightsData, m: MetricKey, scope: Scope, w: number, maxDow?: number): number | null {
  const inWeek = (x: { day: number; wk: number }) =>
    x.wk === w && (maxDow == null || weekdayOf(x.day) <= maxDow);
  const ss = D.sessions.filter(inWeek);
  switch (m) {
    case 'load':
      return ss.reduce((a, s) => a + s.durationSec * s.srpe, 0);
    case 'duration':
      return (
        ss
          .filter((s) => scope.type === 'all' || s.exercises.some((e) => matchScope(scope, e)))
          .reduce((a, s) => a + s.durationSec, 0) / 60
      );
    case 'intensity':
      return ss.length ? ss.reduce((a, s) => a + s.srpe, 0) / ss.length : null;
    case 'sessions':
      return ss.filter((s) => scope.type === 'all' || s.exercises.some((e) => matchScope(scope, e)))
        .length;
    case 'fatigue':
    case 'soreness': {
      const vals = D.daily.filter(inWeek).map((x) => x[m]).filter((v): v is number => v != null);
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    }
    case 'pain':
      return D.pain.filter(inWeek).length;
  }
  if (m === 'setRpe') {
    const rp: number[] = [];
    for (const s of ss)
      for (const e of s.exercises)
        if (matchScope(scope, e)) for (const st of e.sets) { const v = rpeOf(st); if (v != null) rp.push(v); }
    return rp.length ? rp.reduce((a, b) => a + b, 0) / rp.length : null;
  }
  const isMax = METRICS[m].max;
  let acc: number | null = isMax ? null : 0;
  for (const s of ss)
    for (const e of s.exercises)
      if (matchScope(scope, e)) {
        const v = exVal(m, e.sets);
        if (isMax) {
          if (v != null) acc = acc == null ? v : Math.max(acc, v);
        } else acc = (acc ?? 0) + (v ?? 0);
      }
  return acc;
}

export function val(D: InsightsData, m: MetricKey, scope: Scope, w: number, maxDow?: number): number | null {
  if (w < 0 || D.firstWk == null || w < D.firstWk) return null;
  const k = `${m}|${scopeKey(scope)}|${w}|${maxDow}`;
  let cached = D.cache.get(k);
  if (cached === undefined) {
    cached = rawVal(D, m, scope, w, maxDow);
    D.cache.set(k, cached);
  }
  return cached;
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

export function fnum(m: MetricKey, v: number | null): string {
  if (v == null) return '—';
  const meta = METRICS[m];
  if (m === 'e1rm') v = Math.round(v);
  return v.toLocaleString('en-US', {
    maximumFractionDigits: meta.max ? 1 : (meta.dec ?? 0),
    minimumFractionDigits: meta.dec ?? 0,
  });
}

export const fval = (m: MetricKey, v: number | null): string =>
  v == null ? '—' : `${fnum(m, v)} ${METRICS[m].unit}`;

// Loose decimal: 7 → "7", 7.5 → "7.5" (for sRPE values inside copy).
const fdec = (v: number): string => v.toLocaleString('en-US', { maximumFractionDigits: 1 });

const mean = (a: number[]): number | null => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);

export const signed = (n: number, suffix = ''): string =>
  (n > 0 ? '+' : n < 0 ? '−' : '±') +
  Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 1 }) +
  suffix;

export type CompareResult = { v: number | null; pct: number | null; text: string };

export function compare(D: InsightsData, m: MetricKey, scope: Scope, w: number): CompareResult {
  const meta = METRICS[m];
  const md = w === D.today.wk && meta.add ? D.today.dow : undefined;
  const v = val(D, m, scope, w, md);
  const prior = [1, 2, 3, 4].map((k) => val(D, m, scope, w - k, md));
  if (v == null) return { v, pct: null, text: 'Nothing logged that week.' };
  if (D.firstWk == null || w - 4 < D.firstWk)
    return { v, pct: null, text: 'First weeks — building your baseline.' };
  const nn = prior.filter((p): p is number => p != null);
  if (!nn.length) return { v, pct: null, text: 'Nothing logged in the 4 weeks before.' };
  if (meta.max) {
    const best = Math.max(...nn);
    return {
      v,
      pct: null,
      text: `${signed(Math.round((v - best) * 10) / 10, ' kg')} vs your best of the previous 4 weeks`,
    };
  }
  const b = mean(nn);
  if (!b) return { v, pct: null, text: 'None in the previous 4 weeks.' };
  const pct = Math.round(((v - b) / b) * 100);
  return {
    v,
    pct,
    text:
      signed(pct, '%') +
      (md != null ? ` vs your usual by ${DAY_NAMES[D.today.dow]}` : ' vs your 4-week average'),
  };
}

// ---------------------------------------------------------------------------
// Chart math (shared by the SVG line chart and sparklines)
// ---------------------------------------------------------------------------

export type ChartPoint = { x: number; y: number };

// Monotone cubic interpolation (Fritsch–Carlson): smooth curves that never
// overshoot the data. Null values break the line into segments.
export function smoothPath(pts: ChartPoint[]): string {
  if (!pts.length) return '';
  if (pts.length === 1) return `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  const n = pts.length;
  const d: number[] = [];
  const m: number[] = [];
  for (let i = 0; i < n - 1; i++) d.push((pts[i + 1].y - pts[i].y) / (pts[i + 1].x - pts[i].x));
  m[0] = d[0];
  m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const al = m[i] / d[i];
    const be = m[i + 1] / d[i];
    const s = al * al + be * be;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      m[i] = t * al * d[i];
      m[i + 1] = t * be * d[i];
    }
  }
  let p = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const dx = (pts[i + 1].x - pts[i].x) / 3;
    p += ` C${(pts[i].x + dx).toFixed(1)} ${(pts[i].y + m[i] * dx).toFixed(1)} ${(
      pts[i + 1].x - dx
    ).toFixed(1)} ${(pts[i + 1].y - m[i + 1] * dx).toFixed(1)} ${pts[i + 1].x.toFixed(1)} ${pts[
      i + 1
    ].y.toFixed(1)}`;
  }
  return p;
}

// Split a value series into non-null segments and smooth each one.
export function smoothedSegments(
  vals: (number | null)[],
  xs: (i: number) => number,
  ys: (v: number) => number,
): string {
  const segs: ChartPoint[][] = [];
  let s: ChartPoint[] = [];
  vals.forEach((v, i) => {
    if (v == null) {
      if (s.length) segs.push(s);
      s = [];
      return;
    }
    s.push({ x: xs(i), y: ys(v) });
  });
  if (s.length) segs.push(s);
  return segs.map(smoothPath).join(' ');
}

export function niceTicks(lo: number, hi: number, count: number): number[] {
  const raw = (hi - lo) / count;
  const p = Math.pow(10, Math.floor(Math.log10(raw || 1)));
  const r = raw / p;
  const step = (r <= 1 ? 1 : r <= 2 ? 2 : r <= 2.5 ? 2.5 : r <= 5 ? 5 : 10) * p;
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step)
    out.push(Math.round(v * 1000) / 1000);
  return out;
}

export const compact = (v: number): string =>
  Math.abs(v) >= 10000
    ? `${Math.round(v / 1000)}k`
    : Math.abs(v) >= 1000
      ? `${Math.round(v / 100) / 10}k`
      : String(Math.round(v * 10) / 10);

// ---------------------------------------------------------------------------
// Glance
// ---------------------------------------------------------------------------

export type GlanceVerdict = { title: string; sub: string };

export function glanceVerdict(D: InsightsData, stage: DataMaturity): GlanceVerdict {
  const all: Scope = { type: 'all' };
  const c = compare(D, 'volume', all, D.today.wk);
  const roll = (end: number): number => {
    let v = 0;
    for (const s of D.sessions)
      if (s.day <= end && s.day > end - 7)
        for (const e of s.exercises) v += exVal('volume', e.sets) ?? 0;
    return v;
  };
  const r7 = roll(D.today.day);
  const rPrior = [1, 2, 3, 4].map((k) => roll(D.today.day - 7 * k));
  const rAvg = mean(rPrior);
  const rollOk = D.firstDay != null && D.firstDay <= D.today.day - 35 && rAvg != null && rAvg > 0;
  if (stage === 'full' && rollOk) {
    const p = Math.round(((r7 - rAvg) / rAvg) * 100);
    const title =
      p >= 30
        ? 'Load rising fast'
        : p <= -50
          ? 'A lighter week'
          : Math.abs(p) <= 8
            ? 'Holding steady'
            : p > 0
              ? 'Building steadily'
              : 'Easing off';
    return {
      title,
      sub: `${signed(p, '%')} vs your usual 7 days · ${Math.round(r7).toLocaleString('en-US')} kg volume load in the last 7 days`,
    };
  }
  return {
    title: 'First weeks',
    sub: `First weeks — building your baseline. ${Math.round(c.v ?? 0).toLocaleString('en-US')} kg volume load so far this week.`,
  };
}

export function glanceLoadChart(
  D: InsightsData,
  stage: DataMaturity,
): { weeks: number[]; vals: (number | null)[]; avg: (number | null)[] | null } {
  const all: Scope = { type: 'all' };
  const start = Math.max(D.today.wk - 7, D.firstWk ?? D.today.wk);
  const weeks: number[] = [];
  for (let w = start; w <= D.today.wk; w++) weeks.push(w);
  const vals = weeks.map((w) => val(D, 'volume', all, w));
  const avg =
    stage === 'full'
      ? weeks.map((w) => {
          const p = [1, 2, 3, 4].map((k) => val(D, 'volume', all, w - k));
          return p.some((x) => x == null) ? null : mean(p as number[]);
        })
      : null;
  return { weeks, vals, avg };
}

export type KeyLift = {
  name: string;
  meta: string;
  tone: 'up' | 'flat' | 'faint';
  delta: number | null;
  value: string;
  spark: (number | null)[];
  target: { scope: Scope; metric: MetricKey; win: 12 };
};

export function keyLifts(D: InsightsData): KeyLift[] {
  const CUR = D.today.wk;
  const candidates = [...D.exercises.values()]
    .filter((e) => e.kind === 'weighted')
    .map((e) => ({
      e,
      n: D.sessions.filter(
        (s) => s.wk > CUR - 8 && s.exercises.some((x) => x.name === e.name),
      ).length,
    }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n || a.e.name.localeCompare(b.e.name))
    .slice(0, 4);

  return candidates.map(({ e }) => {
    const sc: Scope = { type: 'exercise', id: e.name };
    const tv: (number | null)[] = [];
    for (let w = CUR - 7; w <= CUR; w++) tv.push(val(D, 'top', sc, w));
    const rec = tv.slice(4).filter((v): v is number => v != null);
    const pri = tv.slice(0, 4).filter((v): v is number => v != null);
    const last = [...tv].reverse().find((v) => v != null) ?? null;
    let meta = 'First weeks';
    let tone: KeyLift['tone'] = 'faint';
    let delta: number | null = null;
    if (pri.length && rec.length) {
      delta = Math.max(...rec) - Math.max(...pri);
      if (delta > 0) {
        meta = `↗ ${signed(delta, ' kg')} · 4 wk`;
        tone = 'up';
      } else if (delta < 0) {
        meta = `↘ ${signed(delta, ' kg')} · 4 wk`;
        tone = 'flat';
      } else {
        meta = '→ flat · 4 wk';
        tone = 'flat';
      }
    }
    return {
      name: e.name,
      meta,
      tone,
      delta,
      value: fnum('top', last),
      spark: tv,
      target: { scope: sc, metric: 'top', win: 12 },
    };
  });
}

export type TagBalanceRow = {
  tag: string;
  now: number;
  usual: number | null;
  nowPct: number;
  usualPct: number;
  loPct: number;
  spanPct: number;
  text: string;
  target: { scope: Scope; metric: MetricKey; win: 12 };
};

export function tagBalance(
  D: InsightsData,
  stage: DataMaturity,
): { hasUsual: boolean; rows: TagBalanceRow[] } {
  const cutDay = D.today.day - 28;
  const setsBy = (pred: (s: InsightsSession) => boolean) => {
    const c: Record<string, number> = {};
    for (const s of D.sessions)
      if (pred(s)) for (const e of s.exercises) for (const t of e.tags) c[t] = (c[t] || 0) + e.sets.length;
    return c;
  };
  const nowC = setsBy((s) => s.day > cutDay);
  const oldC = setsBy((s) => s.day <= cutDay);
  const oldWeeks =
    D.firstDay != null && D.firstDay <= cutDay - 28 ? (cutDay - D.firstDay) / 7 : 0;
  const perWk = (c: Record<string, number>, t: string, wks: number) => Math.round((c[t] || 0) / wks);
  const usualOn = stage === 'full' && oldWeeks > 0;
  const rows = D.tags
    .map((t) => ({
      t,
      now: perWk(nowC, t, 4),
      usual: usualOn ? perWk(oldC, t, oldWeeks) : null,
    }))
    .filter((r) => r.now > 0 || (r.usual ?? 0) > 0);
  const maxS = Math.max(4, ...rows.map((r) => Math.max(r.now, r.usual || 0))) * 1.15;
  return {
    hasUsual: usualOn,
    rows: rows.map(({ t, now, usual }) => {
      const a = (now / maxS) * 100;
      const u = usual != null ? (usual / maxS) * 100 : a;
      return {
        tag: t,
        now,
        usual,
        nowPct: a,
        usualPct: u,
        loPct: Math.min(a, u),
        spanPct: Math.abs(a - u),
        text: `${now} / wk${usual != null ? ` · usual ${usual}` : ''}`,
        target: { scope: { type: 'tag', id: t }, metric: 'sets', win: 12 },
      };
    }),
  };
}

export type Signal = {
  kind: string;
  title: string;
  body: string;
  priority: number;
  positive: boolean;
  details: string[];
  link: string;
  target: { scope: Scope; metric: MetricKey; win: 4 | 8 | 12 | 26 | 52; sel?: number };
};

const SESSION_SPIKE_FACTOR = 1.1;
const TAG_GAP_DAYS = 10;

export function deriveSignals(D: InsightsData, stage: DataMaturity, lifts: KeyLift[]): Signal[] {
  const signals: Signal[] = [];
  const all: Scope = { type: 'all' };
  const types = [...new Set(D.sessions.map((s) => s.type))];

  // Session spike: the last session of a type (within 3 days) vs the biggest
  // same-type session in the 30 days before (needs ≥ 3 priors).
  for (const type of types) {
    const ts = D.sessions.filter((s) => s.type === type);
    const lastS = ts[ts.length - 1];
    if (!lastS || D.today.day - lastS.day > 3) continue;
    const prior = ts.filter((s) => s.day < lastS.day && s.day >= lastS.day - 30);
    if (prior.length < 3) continue;
    const big = Math.max(...prior.map((s) => s.durationSec * s.srpe));
    const cur = lastS.durationSec * lastS.srpe;
    if (cur > big * SESSION_SPIKE_FACTOR) {
      signals.push({
        kind: `session-spike-${type}`,
        title: `Bigger ${type} session than usual`,
        body: `Your last ${type} session was ${Math.round((cur / big - 1) * 100)}% above your biggest in the 30 days before. Worth an easier next one.`,
        priority: 60,
        positive: false,
        details: [
          `${dayLabel(lastS.day)}: ${Math.round(cur)} AU`,
          `Biggest in prior 30 days: ${Math.round(big)} AU`,
        ],
        link: 'See load →',
        target: { scope: all, metric: 'load', win: 8, sel: D.today.wk },
      });
    }
  }

  // Tag gap: a tag with ≥ 4 sessions ever and ≥ 10 days since the last one.
  for (const tag of D.tags) {
    const rs = D.sessions.filter((s) => s.exercises.some((e) => e.tags.includes(tag)));
    if (rs.length < 4) continue;
    const last = rs[rs.length - 1].day;
    const gap = D.today.day - last;
    if (gap < TAG_GAP_DAYS) continue;
    const evidence = [...D.exercises.values()]
      .filter((e) => e.tags.includes(tag) && EVIDENCE[e.name.toLowerCase()])
      .map((e) => EVIDENCE[e.name.toLowerCase()]);
    signals.push({
      kind: `tag-gap-${tag}`,
      title: `No ${tag} work in ${gap} days`,
      body: 'Your usual rhythm includes it. Worth getting a session in.',
      priority: 40,
      positive: false,
      details: [
        `Last ${tag} session: ${dayLabel(last)}`,
        `Before that: ${rs.filter((s) => s.day > last - 56).length} sessions in 8 weeks`,
        ...evidence,
      ],
      link: `See ${tag} history →`,
      target: { scope: { type: 'tag', id: tag }, metric: 'sessions', win: 12 },
    });
  }

  // Lift climbing (positive): the first key lift trending up.
  const win = lifts.find((l) => (l.delta ?? 0) > 0);
  if (win && stage === 'full') {
    signals.push({
      kind: 'lift-climbing',
      title: `${win.name} is climbing`,
      body: `Top set ${signed(win.delta ?? 0, ' kg')} over the last 4 weeks. Keep doing what you're doing.`,
      priority: 20,
      positive: true,
      details: [`Current top set: ${win.value} kg`],
      link: 'See progression →',
      target: win.target,
    });
  }

  return signals.sort((a, b) => b.priority - a.priority).slice(0, 3);
}

export function advancedRows(D: InsightsData): { label: string; value: string }[] {
  const dl: number[] = [];
  for (let d = D.today.day - 27; d <= D.today.day; d++) {
    dl.push(
      D.sessions.filter((s) => s.day === d).reduce((a, s) => a + s.durationSec * s.srpe, 0),
    );
  }
  const l7 = dl.slice(-7);
  const acute = l7.reduce((a, b) => a + b, 0);
  const m7 = acute / 7;
  const sd = Math.sqrt(l7.reduce((a, x) => a + (x - m7) ** 2, 0) / l7.length) || 1;
  return [
    { label: 'sRPE load · 7 days', value: Math.round(acute).toLocaleString('en-US') },
    { label: 'Monotony', value: (m7 / sd).toFixed(2) },
    { label: 'Strain', value: Math.round((acute * m7) / sd).toLocaleString('en-US') },
  ];
}

// ---------------------------------------------------------------------------
// Explorer
// ---------------------------------------------------------------------------

export type RangeWeeks = 4 | 8 | 12 | 26 | 52;
export type CompareMode = 'avg' | 'prev' | 'none';

export const rangeName = (n: number): string =>
  n >= 52 ? '1 year' : n >= 26 ? '6 months' : `${n} weeks`;

export function exploreSeries(
  D: InsightsData,
  scope: Scope,
  m: MetricKey,
  n: RangeWeeks,
  cmp: CompareMode,
): { weeks: number[]; vals: (number | null)[]; avg: (number | null)[] | null; ghost: (number | null)[] | null } {
  const weeks: number[] = [];
  for (let w = D.today.wk - n + 1; w <= D.today.wk; w++) weeks.push(w);
  const vals = weeks.map((w) => val(D, m, scope, w));
  const avg =
    cmp === 'avg'
      ? weeks.map((w) => {
          const p = [1, 2, 3, 4].map((k) => val(D, m, scope, w - k)).filter((x): x is number => x != null);
          return D.firstWk == null || w - 4 < D.firstWk || !p.length ? null : mean(p);
        })
      : null;
  const ghost = cmp === 'prev' ? weeks.map((w) => val(D, m, scope, w - n)) : null;
  return { weeks, vals, avg, ghost };
}

export function exploreSummary(
  D: InsightsData,
  scope: Scope,
  m: MetricKey,
  n: RangeWeeks,
): { label: string; value: string }[] {
  const meta = METRICS[m];
  const weeks: number[] = [];
  for (let w = D.today.wk - n + 1; w <= D.today.wk; w++) weeks.push(w);
  const vals = weeks.map((w) => val(D, m, scope, w));
  const nn = vals.filter((v): v is number => v != null);
  const prevN = weeks.map((w) => val(D, m, scope, w - n)).filter((v): v is number => v != null);
  const range = rangeName(n);

  if (meta.max) {
    const best = nn.length ? Math.max(...nn) : null;
    return [
      { label: `Best · ${range}`, value: fval(m, best) },
      {
        label: 'Change over range',
        value: nn.length > 1 ? signed(Math.round((nn[nn.length - 1] - nn[0]) * 10) / 10, ' kg') : '—',
      },
    ];
  }
  if (meta.add) {
    const fullW = weeks
      .filter((w) => w !== D.today.wk)
      .map((w) => val(D, m, scope, w))
      .filter((v): v is number => v != null);
    const tot = nn.reduce((a, b) => a + b, 0);
    const ptot = prevN.reduce((a, b) => a + b, 0);
    const bi = vals.reduce<number>(
      (best, v, i) => (v != null && (best < 0 || v > (vals[best] ?? -Infinity)) ? i : best),
      -1,
    );
    const bestVal = bi >= 0 ? vals[bi] : null;
    const summary = [
      { label: `Total · ${range}`, value: fval(m, tot) },
      { label: 'Weekly average', value: fval(m, mean(fullW)) },
      {
        label: 'Best week',
        value: bi >= 0 ? `${fmtDay(weekStartDay(weeks[bi]))} · ${fnum(m, bestVal)}` : '—',
      },
    ];
    if (prevN.length === n && ptot)
      summary.push({ label: `vs previous ${range}`, value: signed(Math.round(((tot - ptot) / ptot) * 100), '%') });
    return summary;
  }
  return [
    { label: `Average · ${range}`, value: fval(m, mean(nn)) },
    { label: 'Highest week', value: fval(m, nn.length ? Math.max(...nn) : null) },
    { label: 'Lowest week', value: fval(m, nn.length ? Math.min(...nn) : null) },
  ];
}

export type BreakdownRow = {
  label: string;
  sub: string;
  value: string;
  drill: Scope | null;
};

function setsTxt(sets: InsightsSet[]): string {
  const f = sets[0];
  if (f.sec != null && f.r == null) return sets.map((x) => `${x.sec}s hold`).join(' · ');
  const same = sets.every((x) => x.w === f.w && x.r === f.r);
  const base = same
    ? `${sets.length} × ${f.r}${f.w != null ? ` @ ${fnum('top', f.w)} kg` : ''}`
    : sets.map((x) => `${x.w != null ? `${fnum('top', x.w)}×` : ''}${x.r}`).join(' · ');
  const rp = sets.map(rpeOf).filter((v): v is number => v != null);
  return base + (rp.length ? ` · RPE ${rp.map(fdec).join('/')}` : '');
}

export function breakdown(D: InsightsData, m: MetricKey, scope: Scope, w: number): BreakdownRow[] {
  const ss = D.sessions.filter((s) => s.wk === w);
  if (m === 'fatigue' || m === 'soreness')
    return D.daily
      .filter((d) => d.wk === w)
      .map((d) => ({
        label: dayLabel(d.day),
        sub: 'Daily check-in',
        value: d[m] != null ? `${fnum(m, d[m])} / 10` : '—',
        drill: null,
      }));
  if (m === 'pain')
    return D.pain
      .filter((p) => p.wk === w)
      .map((p) => ({ label: dayLabel(p.day), sub: cap(p.region), value: '', drill: null }));
  if (m === 'load' || m === 'duration' || m === 'intensity' || (m === 'sessions' && scope.type === 'all'))
    return ss
      .filter((s) => scope.type === 'all' || s.exercises.some((e) => matchScope(scope, e)))
      .map((s) => ({
        label: dayLabel(s.day),
        sub: `${s.type} · ${Math.round(s.durationSec / 60)} min · sRPE ${fdec(s.srpe)}`,
        value:
          m === 'load'
            ? `${Math.round(s.durationSec * s.srpe).toLocaleString('en-US')} AU`
            : m === 'duration'
              ? `${Math.round(s.durationSec / 60)} min`
              : m === 'intensity'
                ? fdec(s.srpe)
                : '',
        drill: null,
      }));
  if (scope.type === 'exercise')
    return ss.flatMap((s) =>
      s.exercises
        .filter((e) => e.name === scope.id)
        .map((e) => ({
          label: dayLabel(s.day),
          sub: setsTxt(e.sets),
          // One row per session; a "sessions" count adds nothing per row.
          value: m === 'sessions' ? '' : fval(m, exVal(m, e.sets)),
          drill: null,
        })),
    );
  if (m === 'sessions' && scope.type === 'tag')
    return ss
      .filter((s) => s.exercises.some((e) => e.tags.includes(scope.id)))
      .map((s) => ({
        label: dayLabel(s.day),
        sub: s.exercises
          .filter((e) => e.tags.includes(scope.id))
          .map((e) => e.name)
          .join(' · '),
        value: '',
        drill: null,
      }));
  const g = new Map<string, number>();
  const names = new Map<string, Set<string>>();
  let tot = 0;
  for (const s of ss)
    for (const e of s.exercises)
      if (matchScope(scope, e)) {
        const keys = scope.type === 'all' ? (e.tags.length ? e.tags : ['untagged']) : [e.name];
        const v = exVal(m, e.sets) ?? 0;
        for (const k of keys) {
          g.set(k, (g.get(k) || 0) + v);
          if (!names.has(k)) names.set(k, new Set());
          names.get(k)!.add(e.name);
        }
        tot += v;
      }
  return [...g]
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => ({
      label: scope.type === 'all' ? cap(k) : k,
      sub:
        scope.type === 'all'
          ? [...(names.get(k) ?? [])].join(' · ')
          : `${tot ? Math.round((v / tot) * 100) : 0}% of the week`,
      value: fval(m, v),
      drill:
        scope.type === 'all'
          ? k === 'untagged'
            ? null
            : ({ type: 'tag', id: k } as Scope)
          : ({ type: 'exercise', id: k } as Scope),
    }));
}

export type ScopeSheetExercise = {
  name: string;
  meta: string;
  sessionCount: number;
};

export function scopeSheetExercises(D: InsightsData): ScopeSheetExercise[] {
  return [...D.exercises.values()]
    .filter((e) => e.sessionCount > 0)
    .sort((a, b) => b.sessionCount - a.sessionCount || a.name.localeCompare(b.name))
    .map((e) => {
      let last: number | null = null;
      for (const s of D.sessions)
        for (const x of s.exercises) if (x.name === e.name) last = exVal('top', x.sets) ?? last;
      const tail =
        e.kind === 'timed' ? 'timed hold' : e.kind === 'bodyweight' ? 'bodyweight' : `last ${fnum('top', last)} kg`;
      return {
        name: e.name,
        meta: `${e.tags.length ? e.tags.join(' · ') : 'untagged'} · ${e.sessionCount} sessions · ${tail}`,
        sessionCount: e.sessionCount,
      };
    });
}
