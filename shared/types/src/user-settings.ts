import { z } from 'zod';

// Per-mode set-input configuration (settings page). The logging UI offers
// two modes; each user picks which inputs appear for their sets.
// - strength: weight/reps plus the RIR or RPE effort scale (or both)
// - cardio: time/distance based combos, e.g. "distance x duration" or
//   "weight x duration" for loaded carries
export const strengthSetFieldSchema = z.enum(['weight', 'reps', 'rir', 'rpe']);
export const cardioSetFieldSchema = z.enum(['weight', 'reps', 'distance', 'duration']);

const uniqueFields = (fields: string[]) => new Set(fields).size === fields.length;

export const userSettingsSchema = z.object({
  strengthFields: z
    .array(strengthSetFieldSchema)
    .min(1)
    .refine(uniqueFields, { message: 'Fields must be unique.' }),
  cardioFields: z
    .array(cardioSetFieldSchema)
    .min(1)
    .refine(uniqueFields, { message: 'Fields must be unique.' }),
});

export type StrengthSetField = z.infer<typeof strengthSetFieldSchema>;
export type CardioSetField = z.infer<typeof cardioSetFieldSchema>;
export type UserSettings = z.infer<typeof userSettingsSchema>;

// Mirrors the original hardcoded logging UI: weight x reps (intensity hidden
// until used) for strength, distance x duration for cardio.
export const defaultUserSettings: UserSettings = {
  strengthFields: ['weight', 'reps'],
  cardioFields: ['distance', 'duration'],
};
