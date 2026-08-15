import { apiClient } from './client';

export interface DailyLoadPoint {
  date: string;
  load: number;
  sessionCount: number;
}

export interface LoadMetrics {
  weeklyLoad: number;
  monotony: number | null;
  strain: number | null;
  acwr: number | null;
}

export interface LoadInsight {
  range: { from: string; to: string; timezone: string };
  daily: DailyLoadPoint[];
  metrics: LoadMetrics;
}

export interface InsightParams {
  from: string;
  to: string;
  timezone: string;
}

export const insights = {
  load: (params: InsightParams) =>
    apiClient.get<LoadInsight>('/insights/load', { params }).then((r) => r.data),
};
