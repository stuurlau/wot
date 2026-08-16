import { ScreenLayout } from "@/components/screen-layout";
import { WelcomeSection } from "@/components/home/welcome-section";
import { LoadDistributionChart } from "@/components/home/load-distribution-chart";
import { SessionHistoryList } from "@/components/home/session-history-list";
import { HomeStats } from "@/components/home/home-stats";
import { useLoadMetrics } from "@/hooks/use-load-metrics";
import { DataState } from "@/components/data-state";
import { useDailyLogs, useTrainingSessions } from "@/hooks/api";
import { recentDateRange } from "@/lib/date-range";
import { useMemo } from "react";

export default function HomeScreen() {
  const range = useMemo(() => recentDateRange(60), []);
  const sessionsQuery = useTrainingSessions({ ...range, limit: 100 });
  const dailyLogsQuery = useDailyLogs(range);
  const sessions = sessionsQuery.data?.data ?? [];
  const dailyLogs = dailyLogsQuery.data ?? [];
  const metrics = useLoadMetrics(sessions, dailyLogs);
  const isLoading = sessionsQuery.isLoading || dailyLogsQuery.isLoading;
  const hasError = sessionsQuery.isError || dailyLogsQuery.isError;

  if (isLoading && sessions.length === 0 && dailyLogs.length === 0) {
    return (
      <ScreenLayout>
        <DataState message="Loading live training data..." />
      </ScreenLayout>
    );
  }

  if (hasError && sessions.length === 0 && dailyLogs.length === 0) {
    return (
      <ScreenLayout>
        <DataState
          message="Unable to load your training data."
          actionLabel="Retry"
          loading={false}
          onAction={() => {
            void Promise.all([sessionsQuery.refetch(), dailyLogsQuery.refetch()]);
          }}
        />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout scrollable>
      <WelcomeSection streak={metrics.streak} strain={metrics.strain} />
      <LoadDistributionChart dailyLoads={metrics.dailyLoads} />
      <SessionHistoryList sessions={sessions} />
      <HomeStats
        strain={metrics.strain}
        weeklyLoad={metrics.weeklyLoad}
        prevWeeklyLoad={metrics.prevWeeklyLoad}
      />
    </ScreenLayout>
  );
}
