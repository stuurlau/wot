import { z } from 'zod';

// Tags group free-text exercise names per user (e.g. "prehab",
// "flexibility", or a personal goal). There is no exercise library, so tags
// attach to the exercise name, not to a catalogue entry. Tags are normalized
// to lowercase so casing cannot split a group.
export const exerciseTagNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(50)
  .transform((tag) => tag.toLowerCase());

// Replace semantics: the listed tags become the full tag set of the exercise.
export const setExerciseTagsInputSchema = z.object({
  exerciseName: z.string().min(1),
  tags: z.array(exerciseTagNameSchema).max(25),
});

export type SetExerciseTagsInput = z.infer<typeof setExerciseTagsInputSchema>;
