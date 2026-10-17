import { z } from 'zod';

import { bodyPartsSchema } from './body-part.js';
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
  tempoSchema,
  userIdSchema,
} from './primitives.js';

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
  load: z.number().nonnegative(),
});

export const createTrainingSessionInputSchema = trainingSessionSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  load: true,
});

export const updateTrainingSessionInputSchema = createTrainingSessionInputSchema.partial();

export const trainingSessionExerciseSchema = z.object({
  id: identifierSchema,
  trainingSessionId: identifierSchema,
  name: z.string().min(1),
  bodyParts: bodyPartsSchema.nullish(),
  sortOrder: smallIntSchema,
  supersetGroup: smallIntSchema.nullish(),
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
  tempo: tempoSchema.nullish(),
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

// Bulk rename: every `from` name is matched exactly (names come from the
// similar-names endpoint, which does the fuzzy part), all matches become `to`.
export const renameExercisesInputSchema = z.object({
  from: z.array(z.string().min(1)).min(1).max(100),
  to: z.string().min(1),
});

// Reorder: the array is the full ordered exercise list of the session; the
// server assigns sortOrder by array index. Duplicates are rejected — the
// route additionally checks the list matches the session's exercises exactly.
export const reorderExercisesInputSchema = z.object({
  exerciseIds: z
    .array(identifierSchema)
    .min(1)
    .max(200)
    .refine((ids) => new Set(ids).size === ids.length, {
      message: 'Exercise ids must be unique.',
    }),
});

// A rest interval always sits between two sets of the same session.
export const restTimeSchema = z.object({
  id: identifierSchema,
  setBeforeId: identifierSchema,
  setAfterId: identifierSchema,
  fromAt: isoDateTimeSchema,
  tillAt: isoDateTimeSchema,
  createdAt: isoDateTimeSchema,
});

export const createRestTimeInputSchema = restTimeSchema.omit({
  id: true,
  createdAt: true,
});

export type TrainingSession = z.infer<typeof trainingSessionSchema>;
export type CreateTrainingSessionInput = z.infer<typeof createTrainingSessionInputSchema>;
export type UpdateTrainingSessionInput = z.infer<typeof updateTrainingSessionInputSchema>;
export type TrainingSessionExercise = z.infer<typeof trainingSessionExerciseSchema>;
export type CreateTrainingSessionExerciseInput = z.infer<typeof createTrainingSessionExerciseInputSchema>;
export type UpdateTrainingSessionExerciseInput = z.infer<typeof updateTrainingSessionExerciseInputSchema>;
export type TrainingSessionExerciseSet = z.infer<typeof trainingSessionExerciseSetSchema>;
export type CreateTrainingSessionExerciseSetInput = z.infer<typeof createTrainingSessionExerciseSetInputSchema>;
export type UpdateTrainingSessionExerciseSetInput = z.infer<typeof updateTrainingSessionExerciseSetInputSchema>;
export type RenameExercisesInput = z.infer<typeof renameExercisesInputSchema>;
export type ReorderExercisesInput = z.infer<typeof reorderExercisesInputSchema>;
export type RestTime = z.infer<typeof restTimeSchema>;
export type CreateRestTimeInput = z.infer<typeof createRestTimeInputSchema>;
