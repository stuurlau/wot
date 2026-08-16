import type {
  CreateTrainingSessionExerciseInput,
  CreateTrainingSessionExerciseSetInput,
  TrainingSessionExercise,
  TrainingSessionExerciseSet,
  UpdateTrainingSessionExerciseInput,
  UpdateTrainingSessionExerciseSetInput,
} from '@wot/types';

import { apiClient } from './client';

export interface RecentExercise {
  name: string;
  bodyRegions: string[];
  lastUsedAt: string;
  lastSet: {
    weight: number | null;
    reps: number | null;
    rir: number | null;
    rpe: number | null;
  };
}

export const exercises = {
  create: (trainingSessionId: string, body: CreateTrainingSessionExerciseInput) =>
    apiClient
      .post<TrainingSessionExercise>(`/sessions/${trainingSessionId}/exercises`, body)
      .then((r) => r.data),

  update: (
    trainingSessionId: string,
    exerciseId: string,
    body: UpdateTrainingSessionExerciseInput,
  ) =>
    apiClient
      .patch<TrainingSessionExercise>(
        `/sessions/${trainingSessionId}/exercises/${exerciseId}`,
        body,
      )
      .then((r) => r.data),

  delete: (trainingSessionId: string, exerciseId: string) =>
    apiClient.delete(`/sessions/${trainingSessionId}/exercises/${exerciseId}`),

  createSet: (
    trainingSessionId: string,
    exerciseId: string,
    body: CreateTrainingSessionExerciseSetInput,
  ) =>
    apiClient
      .post<TrainingSessionExerciseSet>(
        `/sessions/${trainingSessionId}/exercises/${exerciseId}/sets`,
        body,
      )
      .then((r) => r.data),

  updateSet: (
    trainingSessionId: string,
    exerciseId: string,
    setId: string,
    body: UpdateTrainingSessionExerciseSetInput,
  ) =>
    apiClient
      .patch<TrainingSessionExerciseSet>(
        `/sessions/${trainingSessionId}/exercises/${exerciseId}/sets/${setId}`,
        body,
      )
      .then((r) => r.data),

  deleteSet: (trainingSessionId: string, exerciseId: string, setId: string) =>
    apiClient.delete(
      `/sessions/${trainingSessionId}/exercises/${exerciseId}/sets/${setId}`,
    ),

  recents: (limit?: number) =>
    apiClient
      .get<{ data: RecentExercise[] }>('/exercises/recents', { params: { limit } })
      .then((r) => r.data.data),
};
