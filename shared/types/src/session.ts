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

export const sessionSchema = z.object({
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

export const createSessionInputSchema = sessionSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const updateSessionInputSchema = createSessionInputSchema.partial();

export const sessionComponentSchema = z.object({
  id: identifierSchema,
  sessionId: identifierSchema,
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

export const createSessionComponentInputSchema = sessionComponentSchema.omit({
  id: true,
  createdAt: true,
});

export const updateSessionComponentInputSchema = createSessionComponentInputSchema
  .omit({ sessionId: true })
  .partial();

export type Session = z.infer<typeof sessionSchema>;
export type CreateSessionInput = z.infer<typeof createSessionInputSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionInputSchema>;
export type SessionComponent = z.infer<typeof sessionComponentSchema>;
export type CreateSessionComponentInput = z.infer<typeof createSessionComponentInputSchema>;
export type UpdateSessionComponentInput = z.infer<typeof updateSessionComponentInputSchema>;
