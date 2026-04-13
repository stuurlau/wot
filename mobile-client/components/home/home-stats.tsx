import { Text, View } from 'react-native';

type HomeStatsProps = {
  strain: number;
  weeklyLoad: number;
  prevWeeklyLoad: number;
};

function getTrainingEffect(strain: number): { score: string; label: string } {
  // Normalize strain to a 1–5 scale for display
  // Typical strain ranges: 0–50k = low, 50k–150k = moderate, 150k+ = high
  const normalized = Math.min(strain / 50000, 5);
  const score = Math.max(1, Math.min(5, normalized)).toFixed(1);

  if (normalized >= 4) return { score, label: 'Overreaching' };
  if (normalized >= 3) return { score, label: 'Highly productive' };
  if (normalized >= 2) return { score, label: 'Productive' };
  if (normalized >= 1) return { score, label: 'Maintaining' };
  return { score, label: 'Detraining risk' };
}

function getLoadDelta(current: number, previous: number): string {
  if (previous === 0) return '+100%';
  const delta = ((current - previous) / previous) * 100;
  const sign = delta >= 0 ? '+' : '';
  return `${sign}${Math.round(delta)}%`;
}

export function HomeStats({ strain, weeklyLoad, prevWeeklyLoad }: HomeStatsProps) {
  const { score, label } = getTrainingEffect(strain);
  const loadDelta = getLoadDelta(weeklyLoad, prevWeeklyLoad);

  return (
    <View className="flex-row gap-3 mb-12">
      <View className="flex-1 min-h-[180px] bg-white/60 p-6 justify-between">
        <View>
          <Text className="mb-2 font-heading text-[28px] tracking-[-0.8px] text-foreground">
            Physiological Insight
          </Text>
          <Text className="font-body text-[13px] leading-5 text-muted-foreground">
            Week-over-week load delta:{' '}
            <Text className="font-body-medium text-primary">
              {loadDelta}
            </Text>
            . Recommended next session intensity: moderate.
          </Text>
        </View>
        <View className="mt-4 flex-row items-center gap-2 border-t border-border pt-4">
          <Text className="font-body text-[9px] tracking-[3px] uppercase text-primary">
            System_REC.042
          </Text>
        </View>
      </View>

      <View className="w-[120px] min-h-[180px] bg-primary p-6 justify-between">
        <Text className="font-body text-[8px] tracking-[3px] uppercase text-primary-foreground/50">
          Metric_Score
        </Text>
        <View>
          <Text className="font-body text-[9px] tracking-[3px] uppercase text-primary-foreground/80">
            Training Effect
          </Text>
          <Text
            className="mt-1 font-heading text-[48px] tracking-[-2px] text-primary-foreground"
            style={{
              fontVariant: ['tabular-nums'],
            }}
          >
            {score}
          </Text>
          <Text className="mt-1 font-body text-[9px] tracking-[2px] uppercase text-primary-foreground/60">
            {label}
          </Text>
        </View>
      </View>
    </View>
  );
}
