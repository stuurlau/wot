import { ScreenLayout } from '@/components/screen-layout';
import { HeroSection } from '@/components/home/hero-section';
import { LoadDistributionChart } from '@/components/home/load-distribution-chart';
import { SessionHistoryList } from '@/components/home/session-history-list';
import { InsightBento } from '@/components/home/insight-bento';
import { useLoadMetrics } from '@/hooks/use-load-metrics';
import { MOCK_SESSIONS, MOCK_DAILY_LOGS } from '@/lib/mock-data';

export default function HomeScreen() {
  const metrics = useLoadMetrics(MOCK_SESSIONS, MOCK_DAILY_LOGS);

  return (
    <ScreenLayout scrollable>
      <HeroSection
        streak={metrics.streak}
        recoveryScore={metrics.recoveryScore}
      />
      <LoadDistributionChart dailyLoads={metrics.dailyLoads} />
      <SessionHistoryList sessions={MOCK_SESSIONS} />
      <InsightBento
        strain={metrics.strain}
        weeklyLoad={metrics.weeklyLoad}
        prevWeeklyLoad={metrics.prevWeeklyLoad}
      />
    </ScreenLayout>
  );
}
