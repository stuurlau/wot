import { ScreenLayout } from '@/components/screen-layout';
import { DataState } from '@/components/data-state';
import { SessionHistoryList } from '@/components/home/session-history-list';
import { useTrainingSessions } from '@/hooks/api';
import { recentDateRange } from '@/lib/date-range';
import { useMemo } from 'react';

export default function HistoryScreen() {
  const range = useMemo(() => recentDateRange(90), []);
  const sessionsQuery = useTrainingSessions({ ...range, limit: 100 });
  const sessions = sessionsQuery.data?.data ?? [];

  if (sessionsQuery.isLoading) {
    return (
      <ScreenLayout>
        <DataState message="Loading session history..." />
      </ScreenLayout>
    );
  }

  if (sessionsQuery.isError) {
    return (
      <ScreenLayout>
        <DataState
          message="Unable to load session history."
          actionLabel="Retry"
          loading={false}
          onAction={() => void sessionsQuery.refetch()}
        />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout scrollable>
      <SessionHistoryList sessions={sessions} count={sessions.length || 3} />
    </ScreenLayout>
  );
}
