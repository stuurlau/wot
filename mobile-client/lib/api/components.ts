import type {
  CreateTrainingSessionComponentInput,
  UpdateTrainingSessionComponentInput,
  TrainingSessionComponent,
} from '@wot/types';

import { apiClient } from './client';

export interface RecentComponent {
  name: string;
  lastUsedAt: string;
  lastComponent: {
    weight: number | null;
    reps: number | null;
    rir: number | null;
    rpe: number | null;
  };
}

export const components = {
  create: (trainingSessionId: string, body: CreateTrainingSessionComponentInput) =>
    apiClient
      .post<TrainingSessionComponent>(`/sessions/${trainingSessionId}/components`, body)
      .then((r) => r.data),

  update: (
    trainingSessionId: string,
    componentId: string,
    body: UpdateTrainingSessionComponentInput,
  ) =>
    apiClient
      .patch<TrainingSessionComponent>(
        `/sessions/${trainingSessionId}/components/${componentId}`,
        body,
      )
      .then((r) => r.data),

  delete: (trainingSessionId: string, componentId: string) =>
    apiClient.delete(`/sessions/${trainingSessionId}/components/${componentId}`),

  recents: (limit?: number) =>
    apiClient
      .get<{ data: RecentComponent[] }>('/components/recents', { params: { limit } })
      .then((r) => r.data.data),
};
