import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { exercises } from '@/lib/api';
import type { ExerciseHistoryParams, TrainingSessionDetail } from '@/lib/api';
import type { RenameExercisesInput, SetExerciseTagsInput } from '@wot/types';

export const exerciseKeys = {
  all: ['exercises'] as const,
  recents: (limit?: number) => [...exerciseKeys.all, 'recents', limit] as const,
  history: (params?: ExerciseHistoryParams) => [...exerciseKeys.all, 'history', params] as const,
  tags: () => [...exerciseKeys.all, 'tags'] as const,
};

// Fetches all distinct names the user has ever logged (the recents endpoint
// dedupes by name); the API caps `limit` at 500.
const EXERCISE_NAMES_LIMIT = 500;

export function useRecentExercises(limit?: number) {
  return useQuery({
    queryKey: exerciseKeys.recents(limit),
    queryFn: () => exercises.recents(limit),
  });
}

export function useExerciseHistory(params: ExerciseHistoryParams) {
  return useQuery({
    queryKey: exerciseKeys.history(params),
    queryFn: () => exercises.history(params),
  });
}

// All known exercise names, cached in the query store so fuzzy "rename
// similar" matching runs fully client-side and keeps working on a flaky
// connection. Names change rarely; the exercise mutations invalidate
// exerciseKeys.all, so a generous staleTime avoids refetch churn.
export function useExerciseNames() {
  return useQuery({
    queryKey: exerciseKeys.recents(EXERCISE_NAMES_LIMIT),
    queryFn: () => exercises.recents(EXERCISE_NAMES_LIMIT),
    select: (recents) => recents.map((recent) => recent.name),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateExercise(trainingSessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof exercises.create>[1]) =>
      exercises.create(trainingSessionId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-sessions', 'detail', trainingSessionId] });
      queryClient.invalidateQueries({ queryKey: exerciseKeys.all });
    },
  });
}

export function useUpdateExercise(trainingSessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      exerciseId,
      body,
    }: {
      exerciseId: string;
      body: Parameters<typeof exercises.update>[2];
    }) => exercises.update(trainingSessionId, exerciseId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-sessions', 'detail', trainingSessionId] });
      queryClient.invalidateQueries({ queryKey: exerciseKeys.all });
    },
  });
}

export function useDeleteExercise(trainingSessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (exerciseId: string) => exercises.delete(trainingSessionId, exerciseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-sessions', 'detail', trainingSessionId] });
      queryClient.invalidateQueries({ queryKey: exerciseKeys.all });
    },
  });
}

export function useRenameExercises() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: RenameExercisesInput) => exercises.rename(body),
    onSuccess: () => {
      // Renames touch exercises across many past sessions, so both subtrees go.
      queryClient.invalidateQueries({ queryKey: ['training-sessions'] });
      queryClient.invalidateQueries({ queryKey: exerciseKeys.all });
    },
  });
}

export function useCreateExerciseSet(trainingSessionId: string, exerciseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof exercises.createSet>[2]) =>
      exercises.createSet(trainingSessionId, exerciseId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-sessions', 'detail', trainingSessionId] });
      queryClient.invalidateQueries({ queryKey: ['exercises', 'history'] });
    },
  });
}

export function useUpdateExerciseSet(trainingSessionId: string, exerciseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      setId,
      body,
    }: {
      setId: string;
      body: Parameters<typeof exercises.updateSet>[3];
    }) => exercises.updateSet(trainingSessionId, exerciseId, setId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-sessions', 'detail', trainingSessionId] });
      queryClient.invalidateQueries({ queryKey: ['exercises', 'history'] });
    },
  });
}

export function useDeleteExerciseSet(trainingSessionId: string, exerciseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (setId: string) => exercises.deleteSet(trainingSessionId, exerciseId, setId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-sessions', 'detail', trainingSessionId] });
      queryClient.invalidateQueries({ queryKey: ['exercises', 'history'] });
    },
  });
}

export function useExerciseTags() {
  return useQuery({
    queryKey: exerciseKeys.tags(),
    queryFn: exercises.tags,
  });
}

export function useSetExerciseTags() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SetExerciseTagsInput) => exercises.setTags(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exerciseKeys.tags() });
    },
  });
}

// Repeating an exercise from recents prefills the sets of its most recent
// occurrence. The sets are real rows (auto-save), so a partial failure just
// means fewer prefilled sets — the next invalidation reconciles.
export function usePrefillExerciseSets(trainingSessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ exerciseId, name }: { exerciseId: string; name: string }) => {
      const last = await exercises.last(name);
      await Promise.all(
        last.sets.map((set, index) =>
          exercises.createSet(trainingSessionId, exerciseId, {
            sortOrder: index,
            weight: set.weight,
            reps: set.reps,
            rir: set.rir,
            rpe: set.rpe,
            distance: set.distance,
            duration: set.duration,
          }),
        ),
      );
      return last.sets.length;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-sessions', 'detail', trainingSessionId] });
    },
  });
}

export function useReorderExercises(trainingSessionId: string) {
  const queryClient = useQueryClient();
  const detailKey = ['training-sessions', 'detail', trainingSessionId] as const;
  return useMutation({
    mutationFn: (exerciseIds: string[]) => exercises.reorder(trainingSessionId, exerciseIds),
    onMutate: async (exerciseIds) => {
      await queryClient.cancelQueries({ queryKey: detailKey });
      const previous = queryClient.getQueryData<TrainingSessionDetail>(detailKey);
      if (previous) {
        const order = new Map(exerciseIds.map((id, index) => [id, index]));
        queryClient.setQueryData<TrainingSessionDetail>(detailKey, {
          ...previous,
          exercises: [...previous.exercises]
            .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
            .map((exercise, index) => ({ ...exercise, sortOrder: index })),
        });
      }
      return { previous };
    },
    onError: (_error, _ids, context) => {
      if (context?.previous) {
        queryClient.setQueryData(detailKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: detailKey });
    },
  });
}
