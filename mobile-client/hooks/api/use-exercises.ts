import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { exercises } from '@/lib/api';

export const exerciseKeys = {
  recents: (limit?: number) => ['exercises', 'recents', limit] as const,
};

export function useRecentExercises(limit?: number) {
  return useQuery({
    queryKey: exerciseKeys.recents(limit),
    queryFn: () => exercises.recents(limit),
  });
}

export function useCreateExercise(trainingSessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof exercises.create>[1]) =>
      exercises.create(trainingSessionId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-sessions', 'detail', trainingSessionId] });
      queryClient.invalidateQueries({ queryKey: exerciseKeys.recents() });
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
      queryClient.invalidateQueries({ queryKey: exerciseKeys.recents() });
    },
  });
}

export function useDeleteExercise(trainingSessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (exerciseId: string) => exercises.delete(trainingSessionId, exerciseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-sessions', 'detail', trainingSessionId] });
      queryClient.invalidateQueries({ queryKey: exerciseKeys.recents() });
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
    },
  });
}

export function useDeleteExerciseSet(trainingSessionId: string, exerciseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (setId: string) => exercises.deleteSet(trainingSessionId, exerciseId, setId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-sessions', 'detail', trainingSessionId] });
    },
  });
}
