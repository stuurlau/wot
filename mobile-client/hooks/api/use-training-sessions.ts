import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { trainingSessions } from '@/lib/api';
import type { TrainingSessionListParams } from '@/lib/api';

export const trainingSessionKeys = {
  all: ['training-sessions'] as const,
  list: (params?: TrainingSessionListParams) =>
    [...trainingSessionKeys.all, 'list', params] as const,
  detail: (id: string) => [...trainingSessionKeys.all, 'detail', id] as const,
};

export function useTrainingSessions(params?: TrainingSessionListParams) {
  return useQuery({
    queryKey: trainingSessionKeys.list(params),
    queryFn: () => trainingSessions.list(params),
  });
}

export function useTrainingSession(id: string) {
  return useQuery({
    queryKey: trainingSessionKeys.detail(id),
    queryFn: () => trainingSessions.get(id),
    enabled: !!id,
  });
}

export function useCreateTrainingSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: trainingSessions.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingSessionKeys.all });
    },
  });
}

export function useUpdateTrainingSession(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof trainingSessions.update>[1]) =>
      trainingSessions.update(id, body),
    onSuccess: (updated) => {
      queryClient.setQueryData(trainingSessionKeys.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: trainingSessionKeys.list() });
    },
  });
}

export function useDeleteTrainingSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: trainingSessions.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingSessionKeys.all });
    },
  });
}
