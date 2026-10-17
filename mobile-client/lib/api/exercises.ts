import type {
  CreateTrainingSessionExerciseInput,
  CreateTrainingSessionExerciseSetInput,
  ExerciseConfig,
  RenameExercisesInput,
  ReorderExercisesInput,
  SetExerciseConfigInput,
  SetExerciseTagsInput,
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

export interface ExerciseHistoryRow {
  name: string;
  bodyRegions: string[];
  date: string;
  weight: number | null;
  reps: number | null;
}

export interface ExerciseHistoryParams {
  from: string;
  to: string;
}

export interface ExerciseTagsRow {
  exerciseName: string;
  tags: string[];
}

// One user's per-exercise config row (cog menu), keyed by exercise name.
export type ExerciseConfigRow = ExerciseConfig & { exerciseName: string };

// The most recent occurrence of an exercise name, with its sets — used to
// prefill a freshly added repeat of that exercise.
export interface LastExercise {
  name: string;
  bodyRegions: string[];
  lastUsedAt: string;
  sets: TrainingSessionExerciseSet[];
}

// The API routes reject the FK fields (they live in the URL path), so the
// request-body types intentionally omit them.
export type CreateExerciseBody = Omit<CreateTrainingSessionExerciseInput, 'trainingSessionId'>;
export type UpdateExerciseBody = Omit<UpdateTrainingSessionExerciseInput, 'trainingSessionId'>;
export type CreateExerciseSetBody = Omit<
  CreateTrainingSessionExerciseSetInput,
  'trainingSessionExerciseId'
>;
export type UpdateExerciseSetBody = Omit<
  UpdateTrainingSessionExerciseSetInput,
  'trainingSessionExerciseId'
>;

export const exercises = {
  create: (trainingSessionId: string, body: CreateExerciseBody) =>
    apiClient
      .post<TrainingSessionExercise>(`/sessions/${trainingSessionId}/exercises`, body)
      .then((r) => r.data),

  update: (trainingSessionId: string, exerciseId: string, body: UpdateExerciseBody) =>
    apiClient
      .patch<TrainingSessionExercise>(
        `/sessions/${trainingSessionId}/exercises/${exerciseId}`,
        body,
      )
      .then((r) => r.data),

  delete: (trainingSessionId: string, exerciseId: string) =>
    apiClient.delete(`/sessions/${trainingSessionId}/exercises/${exerciseId}`),

  createSet: (trainingSessionId: string, exerciseId: string, body: CreateExerciseSetBody) =>
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
    body: UpdateExerciseSetBody,
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

  history: (params: ExerciseHistoryParams) =>
    apiClient
      .get<{ data: ExerciseHistoryRow[] }>('/exercises/history', { params })
      .then((r) => r.data.data),

  rename: (body: RenameExercisesInput) =>
    apiClient.patch<{ updated: number }>('/exercises/rename', body).then((r) => r.data),

  reorder: (trainingSessionId: string, exerciseIds: ReorderExercisesInput['exerciseIds']) =>
    apiClient
      .patch<{ data: TrainingSessionExercise[] }>(
        `/sessions/${trainingSessionId}/exercises/reorder`,
        { exerciseIds },
      )
      .then((r) => r.data.data),

  last: (name: string) =>
    apiClient.get<LastExercise>('/exercises/last', { params: { name } }).then((r) => r.data),

  tags: () =>
    apiClient.get<{ data: ExerciseTagsRow[] }>('/exercises/tags').then((r) => r.data.data),

  setTags: (body: SetExerciseTagsInput) =>
    apiClient
      .put<{ exerciseName: string; tags: string[] }>('/exercises/tags', body)
      .then((r) => r.data),

  configs: () =>
    apiClient.get<{ data: ExerciseConfigRow[] }>('/exercises/config').then((r) => r.data.data),

  setConfig: (body: SetExerciseConfigInput) =>
    apiClient.put<ExerciseConfigRow>('/exercises/config', body).then((r) => r.data),
};