import type { TrainingSessionExercise } from '@wot/types';

export type SupersetExercise = Pick<TrainingSessionExercise, 'id' | 'supersetGroup'>;

/**
 * The group an exercise moves to when its superset badge is pressed (issue #7).
 * Cycle: inactive → join the previous exercise's group (or start a new one)
 * → start the next group ("superset 2", 3, …) → back to inactive once the
 * exercise is the sole member of the newest group.
 */
export function nextSupersetGroup(
  exercises: SupersetExercise[],
  exerciseId: string,
): number | null {
  const index = exercises.findIndex((e) => e.id === exerciseId);
  if (index === -1) return null;

  const current = exercises[index].supersetGroup ?? null;
  const groups = exercises
    .map((e) => e.supersetGroup)
    .filter((g): g is number => g != null);
  const max = groups.length > 0 ? Math.max(...groups) : 0;

  if (current === null) {
    const previous = exercises[index - 1];
    return previous?.supersetGroup ?? max + 1;
  }

  const soleNewest = current === max && groups.filter((g) => g === max).length === 1;
  return soleNewest ? null : max + 1;
}
