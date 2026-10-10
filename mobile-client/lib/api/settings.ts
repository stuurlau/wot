import type { UserSettings } from '@wot/types';

import { apiClient } from './client';

export const settings = {
  get: () => apiClient.get<UserSettings>('/settings').then((r) => r.data),

  put: (body: UserSettings) =>
    apiClient.put<UserSettings>('/settings', body).then((r) => r.data),
};
