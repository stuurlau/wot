import { Text, View } from 'react-native';
import { useMemo } from 'react';

import { DataState } from '@/components/data-state';
import { LoadDistributionChart } from '@/components/home/load-distribution-chart';
import { ScreenLayout } from '@/components/screen-layout';
import { useTrainingSessions } from '@/hooks/api';
import { useLoadMetrics } from '@/hooks/use-load-metrics';
import { recentDateRange } from '@/lib/date-range';

export default function InsightsScreen() {
  const range = useMemo(() => recentDateRange(28), []);
  const sessionsQuery = useTrainingSessions({ ...range, limit: 100 });
  const sessions = sessionsQuery.data?.data ?? [];
  const metrics = useLoadMetrics(sessions, []);

  if (sessionsQuery.isLoading) {
    return (
      <ScreenLayout>
        <DataState message="Loading training insights..." />
      </ScreenLayout>
    );
  }

  if (sessionsQuery.isError) {
    return (
      <ScreenLayout>
        <DataState
          message="Unable to load training insights."
          actionLabel="Retry"
          loading={false}
          onAction={() => void sessionsQuery.refetch()}
        />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout scrollable>
      <Text className="mb-2 font-body text-[9px] tracking-[3px] uppercase text-primary">
        Derived locally from sessions
      </Text>
      <Text className="mb-8 font-heading text-[44px] leading-[42px] tracking-[-1.8px] text-foreground">
        Load intelligence.
      </Text>
      <LoadDistributionChart dailyLoads={metrics.dailyLoads} />
      <MetricRow label="Weekly load" value={String(Math.round(metrics.weeklyLoad))} />
      <MetricRow label="Monotony" value={metrics.monotony.toFixed(2)} />
      <MetricRow label="Strain" value={String(Math.round(metrics.strain))} />
      <MetricRow label="ACWR" value={metrics.acwr.toFixed(2)} />
    </ScreenLayout>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between border-b border-border py-4">
      <Text className="font-body text-[10px] tracking-[2px] uppercase text-muted-foreground">
        {label}
      </Text>
      <Text className="font-heading text-[24px] text-foreground">{value}</Text>
    </View>
  );
}
