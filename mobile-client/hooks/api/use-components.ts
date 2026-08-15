import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { components } from '@/lib/api';

export const componentKeys = {
  recents: (limit?: number) => ['components', 'recents', limit] as const,
};

export function useRecentComponents(limit?: number) {
  return useQuery({
    queryKey: componentKeys.recents(limit),
    queryFn: () => components.recents(limit),
  });
}

export function useCreateComponent(trainingSessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof components.create>[1]) =>
      components.create(trainingSessionId, body),
    onSuccess: () => {
      // Invalidate the parent session detail so components list refreshes
      queryClient.invalidateQueries({ queryKey: ['training-sessions', 'detail', trainingSessionId] });
      queryClient.invalidateQueries({ queryKey: componentKeys.recents() });
    },
  });
}

export function useUpdateComponent(trainingSessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ componentId, body }: {
      componentId: string;
      body: Parameters<typeof components.update>[2];
    }) => components.update(trainingSessionId, componentId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-sessions', 'detail', trainingSessionId] });
    },
  });
}

export function useDeleteComponent(trainingSessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (componentId: string) => components.delete(trainingSessionId, componentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-sessions', 'detail', trainingSessionId] });
    },
  });
}
