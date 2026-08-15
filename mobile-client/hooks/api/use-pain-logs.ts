import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { painLogs } from '@/lib/api';
import type { PainLogListParams } from '@/lib/api';

export const painLogKeys = {
  all: ['pain-logs'] as const,
  list: (params?: PainLogListParams) => [...painLogKeys.all, 'list', params] as const,
};

export function usePainLogs(params?: PainLogListParams) {
  return useQuery({
    queryKey: painLogKeys.list(params),
    queryFn: () => painLogs.list(params),
  });
}

export function useCreatePainLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: painLogs.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: painLogKeys.all });
    },
  });
}

export function useUpdatePainLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof painLogs.update>[1] }) =>
      painLogs.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: painLogKeys.all });
    },
  });
}

export function useDeletePainLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: painLogs.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: painLogKeys.all });
    },
  });
}
