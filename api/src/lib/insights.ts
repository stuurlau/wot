export interface LoadSession {
  startedAt: Date;
  duration: number;
  srpe: string | number;
}

export interface DailyLoad {
  date: string;
  load: number;
  sessionCount: number;
}

export interface LoadMetrics {
  weeklyLoad: number;
  monotony: number | null;
  strain: number | null;
  acwr: number | null;
}

const dateFormatterCache = new Map<string, Intl.DateTimeFormat>();

function dateFormatter(timezone: string) {
  const existing = dateFormatterCache.get(timezone);
  if (existing) return existing;

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  dateFormatterCache.set(timezone, formatter);
  return formatter;
}

export function isValidTimeZone(timezone: string): boolean {
  if (timezone === "UTC") return true;
  return Intl.supportedValuesOf("timeZone").includes(timezone);
}

export function localDate(timestamp: Date, timezone: string): string {
  const values = dateFormatter(timezone).formatToParts(timestamp);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    values.find((value) => value.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function localMidnight(date: string, timezone: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  const target = Date.UTC(year, month - 1, day);
  let instant = new Date(target);
  instant = new Date(target - timezoneOffset(instant, timezone));
  return new Date(target - timezoneOffset(instant, timezone));
}

function timezoneOffset(timestamp: Date, timezone: string): number {
  const values = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(timestamp);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(values.find((value) => value.type === type)?.value);
  return Date.UTC(part("year"), part("month") - 1, part("day"), part("hour"), part("minute"), part("second")) - timestamp.getTime();
}

export function datesInRange(from: string, to: string): string[] {
  const result: string[] = [];
  let current = new Date(`${from}T00:00:00.000Z`);
  const end = new Date(`${to}T00:00:00.000Z`);

  while (current < end) {
    result.push(current.toISOString().slice(0, 10));
    current = new Date(current.getTime() + 86_400_000);
  }
  return result;
}

export function dailyLoads(
  trainingSessions: LoadSession[],
  from: string,
  to: string,
  timezone: string,
): DailyLoad[] {
  const daily = new Map(
    datesInRange(from, to).map((date) => [date, { date, load: 0, sessionCount: 0 }]),
  );

  for (const session of trainingSessions) {
    const date = localDate(session.startedAt, timezone);
    const value = daily.get(date);
    if (value) {
      value.load += session.duration * Number(session.srpe);
      value.sessionCount += 1;
    }
  }

  return [...daily.values()];
}

export function loadMetrics(daily: DailyLoad[]): LoadMetrics {
  const weekly = daily.slice(-7);
  const weeklyLoad = weekly.reduce((total, day) => total + day.load, 0);

  if (weekly.length < 7) {
    return { weeklyLoad, monotony: null, strain: null, acwr: null };
  }

  const mean = weeklyLoad / weekly.length;
  const deviation = Math.sqrt(
    weekly.reduce((total, day) => total + (day.load - mean) ** 2, 0) / weekly.length,
  );
  const monotony = deviation === 0 ? null : mean / deviation;
  const strain = monotony === null ? null : weeklyLoad * monotony;

  const chronic = daily.slice(-28);
  const chronicWeeklyAverage =
    chronic.length < 28 ? null : chronic.reduce((total, day) => total + day.load, 0) / 4;
  const acwr =
    chronicWeeklyAverage === null || chronicWeeklyAverage === 0
      ? null
      : weeklyLoad / chronicWeeklyAverage;

  return { weeklyLoad, monotony, strain, acwr };
}
