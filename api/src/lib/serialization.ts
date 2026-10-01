import type {
  DailyLog,
  PainLog,
  RestTime,
  TrainingSession,
  TrainingSessionExercise,
  TrainingSessionExerciseSet,
} from "@wot/types";

import type {
  dailyLog,
  painLog,
  restTime,
  trainingSession,
  trainingSessionExercise,
  trainingSessionExerciseSet,
} from "../db/schema/index.js";

type TrainingSessionRow = typeof trainingSession.$inferSelect;
type TrainingSessionExerciseRow = typeof trainingSessionExercise.$inferSelect;
type TrainingSessionExerciseSetRow = typeof trainingSessionExerciseSet.$inferSelect;
type RestTimeRow = typeof restTime.$inferSelect;
type DailyLogRow = typeof dailyLog.$inferSelect;
type PainLogRow = typeof painLog.$inferSelect;

function numberOrNull(value: string | number | null): number | null {
  return value === null ? null : Number(value);
}

function dateTime(value: Date): string {
  return value.toISOString();
}

export function serializeTrainingSession(row: TrainingSessionRow): TrainingSession {
  const srpe = Number(row.srpe);
  return {
    id: row.id,
    userId: row.userId,
    startedAt: dateTime(row.startedAt),
    duration: row.duration,
    srpe,
    type: row.type,
    title: row.title,
    notes: row.notes,
    createdAt: dateTime(row.createdAt),
    load: row.duration * srpe,
  };
}

export function serializeTrainingSessionExercise(row: TrainingSessionExerciseRow): TrainingSessionExercise {
  return {
    id: row.id,
    trainingSessionId: row.trainingSessionId,
    name: row.name,
    bodyRegions: row.bodyRegions,
    sortOrder: row.sortOrder,
    supersetGroup: row.supersetGroup,
    notes: row.notes,
    createdAt: dateTime(row.createdAt),
  };
}

export function serializeTrainingSessionExerciseSet(row: TrainingSessionExerciseSetRow): TrainingSessionExerciseSet {
  return {
    id: row.id,
    trainingSessionExerciseId: row.trainingSessionExerciseId,
    sortOrder: row.sortOrder,
    weight: numberOrNull(row.weight),
    reps: row.reps,
    rir: numberOrNull(row.rir),
    distance: numberOrNull(row.distance),
    duration: row.duration,
    pace: numberOrNull(row.pace),
    rpe: numberOrNull(row.rpe),
    notes: row.notes,
    createdAt: dateTime(row.createdAt),
  };
}

export function serializeRestTime(row: RestTimeRow): RestTime {
  return {
    id: row.id,
    setBeforeId: row.setBeforeId,
    setAfterId: row.setAfterId,
    fromAt: dateTime(row.fromAt),
    tillAt: dateTime(row.tillAt),
    createdAt: dateTime(row.createdAt),
  };
}

export function serializeDailyLog(row: DailyLogRow): DailyLog {
  return {
    id: row.id,
    userId: row.userId,
    date: row.date,
    sleepDuration: row.sleepDuration,
    sleepQuality: numberOrNull(row.sleepQuality),
    soreness: numberOrNull(row.soreness),
    fatigue: numberOrNull(row.fatigue),
    stress: numberOrNull(row.stress),
    motivation: numberOrNull(row.motivation),
    hrv: numberOrNull(row.hrv),
    bodyWeight: numberOrNull(row.bodyWeight),
    notes: row.notes,
    createdAt: dateTime(row.createdAt),
  };
}

export function serializePainLog(row: PainLogRow): PainLog {
  return {
    id: row.id,
    userId: row.userId,
    date: row.date,
    bodyRegion: row.bodyRegion,
    severity: Number(row.severity),
    notes: row.notes,
    createdAt: dateTime(row.createdAt),
  };
}
