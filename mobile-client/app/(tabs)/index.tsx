import { ScreenLayout } from "@/components/screen-layout";
import { WelcomeSection } from "@/components/home/welcome-section";
import { LoadDistributionChart } from "@/components/home/load-distribution-chart";
import { SessionHistoryList } from "@/components/home/session-history-list";
import { HomeStats } from "@/components/home/home-stats";
import { useLoadMetrics } from "@/hooks/use-load-metrics";
import { MOCK_SESSIONS, MOCK_DAILY_LOGS } from "@/lib/mock-data";

export default function HomeScreen() {
  const metrics = useLoadMetrics(MOCK_SESSIONS, MOCK_DAILY_LOGS);

  return (
    <ScreenLayout scrollable>
      <WelcomeSection streak={metrics.streak} strain={metrics.strain} />
      <LoadDistributionChart dailyLoads={metrics.dailyLoads} />
      <SessionHistoryList sessions={MOCK_SESSIONS} />
      <HomeStats
        strain={metrics.strain}
        weeklyLoad={metrics.weeklyLoad}
        prevWeeklyLoad={metrics.prevWeeklyLoad}
      />
    </ScreenLayout>
  );
}
