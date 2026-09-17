import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { dailyLogs } from '@/lib/api';
import type { DailyLogListParams } from '@/lib/api';

export const dailyLogKeys = {
  all: ['daily-logs'] as const,
  list: (params?: DailyLogListParams) => [...dailyLogKeys.all, 'list', params] as const,
};

export function useDailyLogs(params?: DailyLogListParams) {
  return useQuery({
    queryKey: dailyLogKeys.list(params),
    queryFn: () => dailyLogs.list(params),
  });
}

export function useUpsertDailyLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ date, body }: { date: string; body: Parameters<typeof dailyLogs.upsert>[1] }) =>
      dailyLogs.upsert(date, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dailyLogKeys.all });
    },
  });
}

export function useDeleteDailyLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dailyLogs.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dailyLogKeys.all });
    },
  });
}
