import { Text, View } from 'react-native';
import { Fonts, Colors } from '@/constants/theme';

type DailyLoadEntry = { date: string; load: number };

type LoadDistributionChartProps = {
  dailyLoads: DailyLoadEntry[];
};

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return DAY_LABELS[d.getDay() === 0 ? 6 : d.getDay() - 1];
}

export function LoadDistributionChart({ dailyLoads }: LoadDistributionChartProps) {
  const maxLoad = Math.max(...dailyLoads.map((d) => d.load), 1);

  return (
    <View className="mb-12">
      {/* Section header */}
      <View className="mb-4 pb-4" style={{ borderBottomWidth: 1, borderBottomColor: Colors.border }}>
        <Text
          style={{
            fontFamily: Fonts.headingBold,
            fontSize: 22,
            letterSpacing: -0.8,
            color: Colors.onSurface,
            marginBottom: 4,
          }}
        >
          Training Load Distribution
        </Text>
        <Text
          style={{
            fontFamily: Fonts.body,
            fontSize: 9,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: Colors.onSurfaceVariant,
          }}
        >
          Dataset: session_load // window: 7_day_rolling
        </Text>
      </View>

      {/* Legend */}
      <View className="flex-row gap-6 mb-6">
        <View className="flex-row items-center gap-2">
          <View className="w-2 h-2" style={{ backgroundColor: Colors.primary }} />
          <Text
            style={{
              fontFamily: Fonts.body,
              fontSize: 9,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: Colors.onSurfaceVariant,
            }}
          >
            Load_idx
          </Text>
        </View>
      </View>

      {/* Bar chart */}
      <View
        className="flex-row items-end justify-between px-2"
        style={{ height: 160 }}
      >
        {dailyLoads.map((entry) => {
          const heightPct = maxLoad > 0 ? (entry.load / maxLoad) * 100 : 0;
          const isEmpty = entry.load === 0;

          return (
            <View key={entry.date} className="flex-1 items-center gap-3">
              <View className="flex-1 w-full items-center justify-end">
                <View
                  style={{
                    width: 8,
                    height: isEmpty ? 2 : `${Math.max(heightPct, 4)}%` as any,
                    backgroundColor: isEmpty
                      ? Colors.surfaceContainerHighest
                      : Colors.primary,
                    opacity: isEmpty ? 0.3 : 1,
                  }}
                />
              </View>
              <Text
                style={{
                  fontFamily: Fonts.body,
                  fontSize: 9,
                  letterSpacing: 3,
                  color: Colors.onSurfaceVariant,
                  opacity: isEmpty ? 0.3 : 1,
                }}
              >
                {getDayLabel(entry.date)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
