import type { CreateDailyLogInput, DailyLog, UpdateDailyLogInput } from '@wot/types';

import { apiClient } from './client';

export interface DailyLogListParams {
  from?: string;
  to?: string;
}

export const dailyLogs = {
  list: (params?: DailyLogListParams) =>
    apiClient.get<{ data: DailyLog[] }>('/daily-logs', { params }).then((r) => r.data.data),

  upsert: (date: string, body: CreateDailyLogInput | UpdateDailyLogInput) =>
    apiClient.put<DailyLog>(`/daily-logs/${date}`, body).then((r) => r.data),

  delete: (date: string) => apiClient.delete(`/daily-logs/${date}`),
};
