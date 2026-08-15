import type { CreatePainLogInput, PainLog, UpdatePainLogInput } from '@wot/types';

import { apiClient } from './client';

export interface PainLogListParams {
  from?: string;
  to?: string;
  bodyRegion?: string;
  limit?: number;
  cursor?: string;
}

export interface PainLogPage {
  data: PainLog[];
  page: { nextCursor: string | null };
}

export const painLogs = {
  list: (params?: PainLogListParams) =>
    apiClient.get<PainLogPage>('/pain-logs', { params }).then((r) => r.data),

  create: (body: CreatePainLogInput) =>
    apiClient.post<PainLog>('/pain-logs', body).then((r) => r.data),

  update: (id: string, body: UpdatePainLogInput) =>
    apiClient.patch<PainLog>(`/pain-logs/${id}`, body).then((r) => r.data),

  delete: (id: string) => apiClient.delete(`/pain-logs/${id}`),
};
