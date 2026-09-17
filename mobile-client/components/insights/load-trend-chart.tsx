import { Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import type { LoadVerdict, WeeklyLoad } from '@/lib/insights';

type LoadTrendChartProps = {
  weeklyLoads: WeeklyLoad[];
  verdict: LoadVerdict;
};

export function LoadTrendChart({ weeklyLoads, verdict }: LoadTrendChartProps) {
  const max = Math.max(...weeklyLoads.map((w) => w.load), 1);

  return (
    <View className="mb-8">
      <View className="mb-4 flex-row items-baseline justify-between">
        <Text className="font-heading text-[24px] tracking-[-0.6px] text-foreground">
          Load · last {weeklyLoads.length} weeks
        </Text>
        <Text className="font-body text-[10px] uppercase tracking-[2px] text-primary">
          {verdict.direction}
        </Text>
      </View>

      <View className="flex-row items-end gap-1.5" style={{ height: 120 }}>
        {weeklyLoads.map((w) => {
          const pct = max > 0 ? (w.load / max) * 100 : 0;
          const empty = w.load === 0;
          return (
            <View key={w.weekStart} className="flex-1 items-center gap-1">
              <View className="flex-1 w-full items-center justify-end">
                {empty ? null : (
                  <View
                    style={{
                      width: '70%',
                      height: `${Math.max(pct, 4)}%`,
                      backgroundColor: Colors.secondary,
                    }}
                  />
                )}
              </View>
              <Text
                className="font-body text-[8px] text-muted-foreground"
                style={{ fontVariant: ['tabular-nums'] }}
              >
                {w.weekStart.slice(5)}
              </Text>
            </View>
          );
        })}
      </View>

      <Text className="mt-3 font-body text-[12px] text-muted-foreground">
        {verdict.direction === 'spiking'
          ? `This week is ${verdict.deltaPct}% above your usual.`
          : verdict.deltaPct === null
            ? 'Building — first load logged.'
            : verdict.direction === 'building'
              ? `Building ${verdict.deltaPct >= 0 ? '+' : ''}${verdict.deltaPct}% vs your average.`
              : verdict.direction === 'dipping'
                ? `Light week vs your usual.`
                : 'Steady — consistent training.'}
      </Text>
    </View>
  );
}