import { Text, View } from 'react-native';

import type { ExerciseTrend } from '@/lib/insights';

function Sparkline({ values }: { values: (number | null)[] }) {
  const max = Math.max(...values.filter((v): v is number => v !== null), 1);
  return (
    <View className="flex-row items-end gap-0.5">
      {values.map((v, i) => {
        const pct = v === null ? 2 : Math.max((v / max) * 100, 4);
        return (
          <View
            key={i}
            className="flex-1"
            style={{ height: 22, justifyContent: 'flex-end' }}
          >
            <View
              className="w-full"
              style={{
                height: `${pct}%` as any,
                backgroundColor: v === null ? 'rgba(0,0,0,0.08)' : '#395F94',
              }}
            />
          </View>
        );
      })}
    </View>
  );
}

export function StrengthProgression({ trends }: { trends: ExerciseTrend[] }) {
  if (trends.length === 0) return null;

  return (
    <View className="mb-8">
      <Text className="mb-3 font-heading text-[24px] tracking-[-0.6px] text-foreground">
        Strength progression
      </Text>
      {trends.slice(0, 5).map((trend) => (
        <View key={trend.name} className="mb-4 flex-row items-center justify-between">
          <View className="w-[40%]">
            <Text className="font-body-medium text-[14px] text-foreground" numberOfLines={1}>
              {trend.name}
            </Text>
            <Text className="font-body text-[10px] uppercase tracking-[2px] text-muted-foreground">
              {trend.direction === 'up' ? '↗ climbing' : trend.direction === 'down' ? '↘ dipping' : '→ flat'}
            </Text>
          </View>
          <View className="w-[45%]">
            <Sparkline values={trend.weeklyBest} />
          </View>
        </View>
      ))}
    </View>
  );
}