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
} from './primitives';

export const dailyLogSchema = z.object({
  id: identifierSchema,
  userId: identifierSchema,
  date: isoDateSchema,
  sleepDuration: smallIntSchema.optional(),
  sleepQuality: decimalRatingSchema.optional(),
  soreness: decimalRatingSchema.optional(),
  fatigue: decimalRatingSchema.optional(),
  stress: decimalRatingSchema.optional(),
  motivation: decimalRatingSchema.optional(),
  hrv: hrvSchema.optional(),
  bodyWeight: kilogramsSchema.optional(),
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
