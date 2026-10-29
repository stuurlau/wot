import { z } from 'zod';

import { bodyPartsSchema } from './body-part.js';
import { tempoSchema } from './primitives.js';

// Per-exercise logging configuration, keyed by (user, exercise name) — the
// "no exercise library" convention stays: names are free text and config
// rows are created lazily from the exercise's cog menu. `fields` is a flat,
// unrestricted subset of the set-input properties (unlike the per-mode
// global user_settings) so any set shape is possible, e.g. strength with
// seconds for weighted holds.
export const exerciseSetFieldSchema = z.enum([
  'weight',
  'reps',
  'rir',
  'rpe',
  'distance',
  'duration',
  // Same duration column (stored in seconds), entered in minutes.
  'durationMin',
]);

export const exerciseConfigSchema = z.object({
  // null = inherit from the global user_settings for the exercise's mode.
  fields: z
    .array(exerciseSetFieldSchema)
    .min(1)
    .refine((fields) => new Set(fields).size === fields.length, {
      message: 'Fields must be unique.',
    })
    .refine((fields) => !(fields.includes('duration') && fields.includes('durationMin')), {
      message: 'Duration is either seconds or minutes.',
    })
    .nullable(),
  // Tempo is configured at exercise level and stamped onto new sets.
  tempo: tempoSchema.nullable(),
  // Prefill for body parts when the exercise is added to a session.
  bodyParts: bodyPartsSchema.nullable(),
});

export type ExerciseSetField = z.infer<typeof exerciseSetFieldSchema>;
export type ExerciseConfig = z.infer<typeof exerciseConfigSchema>;

// One user's config row as returned by GET /exercises/config.
export const exerciseConfigEntrySchema = exerciseConfigSchema.extend({
  exerciseName: z.string(),
});

export type ExerciseConfigEntry = z.infer<typeof exerciseConfigEntrySchema>;

// Replace semantics: the config becomes the full config of the exercise
// name. An all-null config resets to inheriting the global settings (the
// API deletes the row).
export const setExerciseConfigInputSchema = z.object({
  exerciseName: z.string().trim().min(1),
  config: exerciseConfigSchema,
});

export type SetExerciseConfigInput = z.infer<typeof setExerciseConfigInputSchema>;
