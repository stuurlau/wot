import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { defaultUserSettings, type UserSettings } from '@wot/types';

import { settings } from '@/lib/api';

export const settingsKeys = {
  all: ['settings'] as const,
};

// Settings change rarely and default client-side, so a long staleTime plus
// optimistic updates keeps every consumer snappy and offline-friendly.
export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: settings.get,
    select: (data) => data ?? defaultUserSettings,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UserSettings) => settings.put(body),
    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey: settingsKeys.all });
      const previous = queryClient.getQueryData<UserSettings>(settingsKeys.all);
      queryClient.setQueryData(settingsKeys.all, body);
      return { previous };
    },
    onError: (_error, _body, context) => {
      if (context?.previous) {
        queryClient.setQueryData(settingsKeys.all, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
}
