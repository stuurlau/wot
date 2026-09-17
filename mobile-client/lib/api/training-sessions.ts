import type {
  CreateTrainingSessionInput,
  TrainingSession,
  TrainingSessionExercise,
  TrainingSessionExerciseSet,
  UpdateTrainingSessionInput,
} from '@wot/types';

import { apiClient } from './client';

export interface TrainingSessionListParams {
  from?: string;
  to?: string;
  type?: string;
  limit?: number;
  cursor?: string;
}

export interface TrainingSessionPage {
  data: TrainingSessionWithLoad[];
  page: { nextCursor: string | null };
}

// Server adds computed `load` field
export type TrainingSessionWithLoad = TrainingSession & { load: number };

export interface TrainingSessionDetail extends TrainingSessionWithLoad {
  exercises: (TrainingSessionExercise & { sets: TrainingSessionExerciseSet[] })[];
}

export const trainingSessions = {
  list: (params?: TrainingSessionListParams) =>
    apiClient.get<TrainingSessionPage>('/sessions', { params }).then((r) => r.data),

  get: (id: string) =>
    apiClient.get<TrainingSessionDetail>(`/sessions/${id}`).then((r) => r.data),

  create: (body: CreateTrainingSessionInput) =>
    apiClient.post<TrainingSessionWithLoad>('/sessions', body).then((r) => r.data),

  update: (id: string, body: UpdateTrainingSessionInput) =>
    apiClient.patch<TrainingSessionWithLoad>(`/sessions/${id}`, body).then((r) => r.data),

  delete: (id: string) => apiClient.delete(`/sessions/${id}`),
};
