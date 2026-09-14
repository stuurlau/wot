import type { CreateDailyLogInput, DailyLog, UpdateDailyLogInput } from '@wot/types';

import { apiClient } from './client';

export interface DailyLogListParams {
  from?: string;
  to?: string;
}

// The PUT route carries the date in the URL path; the body must omit it
// (the API schema is strict and rejects unknown properties).
export type UpsertDailyLogBody = Omit<CreateDailyLogInput | UpdateDailyLogInput, 'date'>;

export const dailyLogs = {
  list: (params?: DailyLogListParams) =>
    apiClient.get<{ data: DailyLog[] }>('/daily-logs', { params }).then((r) => r.data.data),

  upsert: (date: string, body: UpsertDailyLogBody) =>
    apiClient.put<DailyLog>(`/daily-logs/${date}`, body).then((r) => r.data),

  delete: (date: string) => apiClient.delete(`/daily-logs/${date}`),
};