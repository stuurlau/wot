import type { DailyLog, TrainingSession, TrainingSessionExercise, TrainingSessionExerciseSet } from '@wot/types';

function daysAgo(n: number, hour = 9): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function dateStr(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export const MOCK_SESSIONS: TrainingSession[] = [
  {
    id: 's1',
    userId: 'u1',
    startedAt: daysAgo(0, 7),
    duration: 4200,
    srpe: 7,
    type: 'strength',
    title: 'Upper body push',
    createdAt: daysAgo(0, 7),
  },
  {
    id: 's2',
    userId: 'u1',
    startedAt: daysAgo(1, 18),
    duration: 3000,
    srpe: 8,
    type: 'run',
    title: 'Threshold run',
    createdAt: daysAgo(1, 18),
  },
  {
    id: 's3',
    userId: 'u1',
    startedAt: daysAgo(2, 10),
    duration: 4500,
    srpe: 7.5,
    type: 'strength',
    title: 'Lower body hypertrophy',
    createdAt: daysAgo(2, 10),
  },
  {
    id: 's4',
    userId: 'u1',
    startedAt: daysAgo(3, 8),
    duration: 2400,
    srpe: 4,
    type: 'yoga',
    title: 'Active recovery flow',
    createdAt: daysAgo(3, 8),
  },
  {
    id: 's5',
    userId: 'u1',
    startedAt: daysAgo(4, 17),
    duration: 3600,
    srpe: 8.5,
    type: 'strength',
    title: 'Pull day',
    createdAt: daysAgo(4, 17),
  },
  {
    id: 's6',
    userId: 'u1',
    startedAt: daysAgo(5, 7),
    duration: 2700,
    srpe: 6,
    type: 'run',
    title: 'Easy zone 2',
    createdAt: daysAgo(5, 7),
  },
  {
    id: 's7',
    userId: 'u1',
    startedAt: daysAgo(6, 9),
    duration: 5400,
    srpe: 9,
    type: 'strength',
    title: 'Full body power',
    createdAt: daysAgo(6, 9),
  },
  // Week 2 (older)
  {
    id: 's8',
    userId: 'u1',
    startedAt: daysAgo(8, 10),
    duration: 3600,
    srpe: 7,
    type: 'strength',
    title: 'Push focus',
    createdAt: daysAgo(8, 10),
  },
  {
    id: 's9',
    userId: 'u1',
    startedAt: daysAgo(9, 18),
    duration: 2400,
    srpe: 6.5,
    type: 'run',
    title: 'Tempo intervals',
    createdAt: daysAgo(9, 18),
  },
  {
    id: 's10',
    userId: 'u1',
    startedAt: daysAgo(11, 8),
    duration: 3000,
    srpe: 5,
    type: 'mobility',
    title: 'Mobility & stretch',
    createdAt: daysAgo(11, 8),
  },
];

export const MOCK_EXERCISES: TrainingSessionExercise[] = [
  { id: 'e1', trainingSessionId: 's1', name: 'Bench Press', bodyRegions: ['push', 'chest'], sortOrder: 1, createdAt: daysAgo(0) },
  { id: 'e2', trainingSessionId: 's1', name: 'OHP', bodyRegions: ['push', 'shoulders'], sortOrder: 2, createdAt: daysAgo(0) },
  { id: 'e3', trainingSessionId: 's1', name: 'Incline DB Press', bodyRegions: ['push', 'chest'], sortOrder: 3, createdAt: daysAgo(0) },
  { id: 'e4', trainingSessionId: 's2', name: 'Threshold Run', bodyRegions: ['legs', 'cardio'], sortOrder: 1, createdAt: daysAgo(1) },
  { id: 'e5', trainingSessionId: 's3', name: 'Back Squat', bodyRegions: ['legs', 'quad'], sortOrder: 1, createdAt: daysAgo(2) },
  { id: 'e6', trainingSessionId: 's3', name: 'RDL', bodyRegions: ['legs', 'hinge'], sortOrder: 2, createdAt: daysAgo(2) },
  { id: 'e7', trainingSessionId: 's5', name: 'Deadlift', bodyRegions: ['pull', 'hinge'], sortOrder: 1, createdAt: daysAgo(4) },
];

export const MOCK_SETS: TrainingSessionExerciseSet[] = [
  { id: 'set1', trainingSessionExerciseId: 'e1', weight: 80, reps: 8, rir: 2, sortOrder: 1, createdAt: daysAgo(0) },
  { id: 'set2', trainingSessionExerciseId: 'e1', weight: 80, reps: 8, rir: 2, sortOrder: 2, createdAt: daysAgo(0) },
  { id: 'set3', trainingSessionExerciseId: 'e2', weight: 50, reps: 10, rir: 3, sortOrder: 1, createdAt: daysAgo(0) },
  { id: 'set4', trainingSessionExerciseId: 'e4', distance: 10020, pace: 272, sortOrder: 1, createdAt: daysAgo(1) },
  { id: 'set5', trainingSessionExerciseId: 'e5', weight: 110, reps: 6, rir: 1, sortOrder: 1, createdAt: daysAgo(2) },
  { id: 'set6', trainingSessionExerciseId: 'e7', weight: 140, reps: 5, rir: 1, sortOrder: 1, createdAt: daysAgo(4) },
];

export const MOCK_DAILY_LOGS: DailyLog[] = [
  { id: 'd1', userId: 'u1', date: dateStr(0), sleepDuration: 420, sleepQuality: 7, soreness: 4, fatigue: 3, stress: 3, motivation: 8, createdAt: daysAgo(0) },
  { id: 'd2', userId: 'u1', date: dateStr(1), sleepDuration: 390, sleepQuality: 6, soreness: 5, fatigue: 5, stress: 4, motivation: 7, createdAt: daysAgo(1) },
  { id: 'd3', userId: 'u1', date: dateStr(2), sleepDuration: 450, sleepQuality: 8, soreness: 3, fatigue: 3, stress: 2, motivation: 9, createdAt: daysAgo(2) },
  { id: 'd4', userId: 'u1', date: dateStr(3), sleepDuration: 480, sleepQuality: 9, soreness: 2, fatigue: 2, stress: 2, motivation: 8, createdAt: daysAgo(3) },
  { id: 'd5', userId: 'u1', date: dateStr(4), sleepDuration: 360, sleepQuality: 5, soreness: 6, fatigue: 6, stress: 5, motivation: 6, createdAt: daysAgo(4) },
  { id: 'd6', userId: 'u1', date: dateStr(5), sleepDuration: 400, sleepQuality: 7, soreness: 4, fatigue: 4, stress: 3, motivation: 7, createdAt: daysAgo(5) },
  { id: 'd7', userId: 'u1', date: dateStr(6), sleepDuration: 430, sleepQuality: 7.5, soreness: 5, fatigue: 5, stress: 4, motivation: 7, createdAt: daysAgo(6) },
];
