import { z } from 'zod';

import {
  decimalRatingSchema,
  identifierSchema,
  isoDateSchema,
  isoDateTimeSchema,
  optionalTextSchema,
} from './primitives';

export const painLogSchema = z.object({
  id: identifierSchema,
  userId: identifierSchema,
  date: isoDateSchema,
  bodyRegion: z.string().min(1),
  severity: decimalRatingSchema,
  notes: optionalTextSchema,
  createdAt: isoDateTimeSchema,
});

export const createPainLogInputSchema = painLogSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const updatePainLogInputSchema = createPainLogInputSchema.partial();

export type PainLog = z.infer<typeof painLogSchema>;
export type CreatePainLogInput = z.infer<typeof createPainLogInputSchema>;
export type UpdatePainLogInput = z.infer<typeof updatePainLogInputSchema>;
