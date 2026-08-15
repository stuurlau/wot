import { useQuery } from '@tanstack/react-query';

import { insights } from '@/lib/api';
import type { InsightParams } from '@/lib/api';

export const insightKeys = {
  load: (params: InsightParams) => ['insights', 'load', params] as const,
};

export function useLoadInsight(params: InsightParams) {
  return useQuery({
    queryKey: insightKeys.load(params),
    queryFn: () => insights.load(params),
    // Don't refetch on window focus for insight data — it's stable within a session
    refetchOnWindowFocus: false,
  });
}
