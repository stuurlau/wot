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
} from './primitives';

const bodyRegionSchema = z.string().min(1);

export const trainingSessionSchema = z.object({
  id: identifierSchema,
  userId: identifierSchema,
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

export const trainingSessionComponentSchema = z.object({
  id: identifierSchema,
  trainingSessionId: identifierSchema,
  name: z.string().min(1),
  bodyRegions: z.array(bodyRegionSchema).optional(),
  weight: kilogramsSchema.optional(),
  reps: smallIntSchema.optional(),
  rir: rirSchema.optional(),
  distance: metersSchema.optional(),
  duration: secondsSchema.optional(),
  pace: paceSecondsPerKmSchema.optional(),
  rpe: decimalRatingSchema.optional(),
  sortOrder: smallIntSchema,
  notes: optionalTextSchema,
  createdAt: isoDateTimeSchema,
});

export const createTrainingSessionComponentInputSchema = trainingSessionComponentSchema.omit({
  id: true,
  createdAt: true,
});

export const updateTrainingSessionComponentInputSchema = createTrainingSessionComponentInputSchema
  .omit({ trainingSessionId: true })
  .partial();

export type TrainingSession = z.infer<typeof trainingSessionSchema>;
export type CreateTrainingSessionInput = z.infer<typeof createTrainingSessionInputSchema>;
export type UpdateTrainingSessionInput = z.infer<typeof updateTrainingSessionInputSchema>;
export type TrainingSessionComponent = z.infer<typeof trainingSessionComponentSchema>;
export type CreateTrainingSessionComponentInput = z.infer<typeof createTrainingSessionComponentInputSchema>;
export type UpdateTrainingSessionComponentInput = z.infer<typeof updateTrainingSessionComponentInputSchema>;
