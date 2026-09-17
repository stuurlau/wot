import { z } from "zod";

import {
  createDailyLogInputSchema,
  createPainLogInputSchema,
  createTrainingSessionExerciseInputSchema,
  createTrainingSessionExerciseSetInputSchema,
  createTrainingSessionInputSchema,
  isoDateSchema,
} from "@wot/types";

import { queryLimit, validateDateRange } from "../../lib/api-validation.js";

// Single source of truth: body schemas derive from the shared @wot/types
// contract, tightened here with .strict() (unknown fields -> 422) and the
// route-specific omissions (nested resources take their parent ids from the
// URL instead of the body). Path/query schemas are route-level concerns and
// stay local.

export const trainingSessionPathSchema = z.object({ trainingSessionId: z.uuid() }).strict();
export const exercisePathSchema = trainingSessionPathSchema.extend({ exerciseId: z.uuid() }).strict();
export const setPathSchema = exercisePathSchema.extend({ setId: z.uuid() }).strict();
export const painLogPathSchema = z.object({ painLogId: z.uuid() }).strict();
export const dailyLogPathSchema = z.object({ date: isoDateSchema }).strict();

export const createTrainingSessionBodySchema = createTrainingSessionInputSchema.strict();
export const updateTrainingSessionBodySchema = createTrainingSessionInputSchema.partial().strict();

export const createExerciseBodySchema = createTrainingSessionExerciseInputSchema
  .omit({ trainingSessionId: true })
  .strict();
export const updateExerciseBodySchema = createExerciseBodySchema.partial().strict();

export const createExerciseSetBodySchema = createTrainingSessionExerciseSetInputSchema
  .omit({ trainingSessionExerciseId: true })
  .strict();
export const updateExerciseSetBodySchema = createExerciseSetBodySchema.partial().strict();

export const dailyLogBodySchema = createDailyLogInputSchema.omit({ date: true }).strict();

export const createPainLogBodySchema = createPainLogInputSchema.strict();
export const updatePainLogBodySchema = createPainLogInputSchema.partial().strict();

export const trainingSessionListQuerySchema = z
  .object({
    from: isoDateSchema.optional(),
    to: isoDateSchema.optional(),
    type: z.string().min(1).optional(),
    limit: queryLimit(100, 30),
    cursor: z.string().min(1).optional(),
  })
  .strict()
  .superRefine((value, ctx) => validateDateRange(value, ctx));

export const dailyLogListQuerySchema = z
  .object({
    from: isoDateSchema.optional(),
    to: isoDateSchema.optional(),
  })
  .strict()
  .superRefine((value, ctx) => validateDateRange(value, ctx, true));

export const painLogListQuerySchema = z
  .object({
    from: isoDateSchema.optional(),
    to: isoDateSchema.optional(),
    bodyRegion: z.string().min(1).optional(),
    limit: queryLimit(100, 30),
    cursor: z.string().min(1).optional(),
  })
  .strict()
  .superRefine((value, ctx) => validateDateRange(value, ctx));

export const recentsQuerySchema = z
  .object({
    limit: queryLimit(50, 20),
  })
  .strict();

export const exerciseHistoryQuerySchema = z
  .object({
    from: isoDateSchema,
    to: isoDateSchema,
  })
  .strict()
  .superRefine((value, ctx) => validateDateRange(value, ctx, true));
