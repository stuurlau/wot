import { z } from 'zod';

import {
  decimalRatingSchema,
  identifierSchema,
  isoDateTimeSchema,
  kilogramsSchema,
  metersSchema,
  optionalTextSchema,
  paceSecondsPerKmSchema,
  rirSchema,
  secondsSchema,
  smallIntSchema,
  userIdSchema,
} from './primitives.js';

const bodyRegionSchema = z.string().min(1);

export const trainingSessionSchema = z.object({
  id: identifierSchema,
  userId: userIdSchema,
  startedAt: isoDateTimeSchema,
  duration: secondsSchema,
  srpe: decimalRatingSchema,
  type: z.string().min(1),
  title: optionalTextSchema,
  notes: optionalTextSchema,
  createdAt: isoDateTimeSchema,
});

export const createTrainingSessionInputSchema = trainingSessionSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const updateTrainingSessionInputSchema = createTrainingSessionInputSchema.partial();

export const trainingSessionExerciseSchema = z.object({
  id: identifierSchema,
  trainingSessionId: identifierSchema,
  name: z.string().min(1),
  bodyRegions: z.array(bodyRegionSchema).nullish(),
  sortOrder: smallIntSchema,
  notes: optionalTextSchema,
  createdAt: isoDateTimeSchema,
});

export const createTrainingSessionExerciseInputSchema = trainingSessionExerciseSchema.omit({
  id: true,
  createdAt: true,
});

export const updateTrainingSessionExerciseInputSchema = trainingSessionExerciseSchema
  .omit({ trainingSessionId: true })
  .partial();

// Column bounds mirror the DB numeric(precision, scale) definitions.
export const trainingSessionExerciseSetSchema = z.object({
  id: identifierSchema,
  trainingSessionExerciseId: identifierSchema,
  sortOrder: smallIntSchema,
  weight: kilogramsSchema.max(9_999.99).nullish(),
  reps: smallIntSchema.nullish(),
  rir: rirSchema.nullish(),
  distance: metersSchema.max(999_999.99).nullish(),
  duration: secondsSchema.nullish(),
  pace: paceSecondsPerKmSchema.max(9_999.99).nullish(),
  rpe: decimalRatingSchema.nullish(),
  notes: optionalTextSchema,
  createdAt: isoDateTimeSchema,
});

export const createTrainingSessionExerciseSetInputSchema = trainingSessionExerciseSetSchema.omit({
  id: true,
  createdAt: true,
});

export const updateTrainingSessionExerciseSetInputSchema = trainingSessionExerciseSetSchema
  .omit({ trainingSessionExerciseId: true })
  .partial();

export type TrainingSession = z.infer<typeof trainingSessionSchema>;
export type CreateTrainingSessionInput = z.infer<typeof createTrainingSessionInputSchema>;
export type UpdateTrainingSessionInput = z.infer<typeof updateTrainingSessionInputSchema>;
export type TrainingSessionExercise = z.infer<typeof trainingSessionExerciseSchema>;
export type CreateTrainingSessionExerciseInput = z.infer<typeof createTrainingSessionExerciseInputSchema>;
export type UpdateTrainingSessionExerciseInput = z.infer<typeof updateTrainingSessionExerciseInputSchema>;
export type TrainingSessionExerciseSet = z.infer<typeof trainingSessionExerciseSetSchema>;
export type CreateTrainingSessionExerciseSetInput = z.infer<typeof createTrainingSessionExerciseSetInputSchema>;
export type UpdateTrainingSessionExerciseSetInput = z.infer<typeof updateTrainingSessionExerciseSetInputSchema>;
