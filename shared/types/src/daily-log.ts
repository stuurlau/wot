import { z } from 'zod';

import {
  decimalRatingSchema,
  hrvSchema,
  identifierSchema,
  isoDateSchema,
  isoDateTimeSchema,
  kilogramsSchema,
  optionalTextSchema,
  smallIntSchema,
  userIdSchema,
} from './primitives.js';

export const dailyLogSchema = z.object({
  id: identifierSchema,
  userId: userIdSchema,
  date: isoDateSchema,
  sleepDuration: smallIntSchema.nullish(),
  sleepQuality: decimalRatingSchema.nullish(),
  soreness: decimalRatingSchema.nullish(),
  fatigue: decimalRatingSchema.nullish(),
  stress: decimalRatingSchema.nullish(),
  motivation: decimalRatingSchema.nullish(),
  hrv: hrvSchema.max(999.99).nullish(),
  bodyWeight: kilogramsSchema.max(999.99).nullish(),
  notes: optionalTextSchema,
  createdAt: isoDateTimeSchema,
});

export const createDailyLogInputSchema = dailyLogSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const updateDailyLogInputSchema = createDailyLogInputSchema.partial();

export type DailyLog = z.infer<typeof dailyLogSchema>;
export type CreateDailyLogInput = z.infer<typeof createDailyLogInputSchema>;
export type UpdateDailyLogInput = z.infer<typeof updateDailyLogInputSchema>;
