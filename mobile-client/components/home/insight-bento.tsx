import { Text, View } from 'react-native';
import { Fonts, Colors } from '@/constants/theme';

type InsightBentoProps = {
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

export function InsightBento({ strain, weeklyLoad, prevWeeklyLoad }: InsightBentoProps) {
  const { score, label } = getTrainingEffect(strain);
  const loadDelta = getLoadDelta(weeklyLoad, prevWeeklyLoad);

  return (
    <View className="flex-row gap-3 mb-12">
      {/* Insight card (wide) */}
      <View
        className="flex-1 p-6 justify-between"
        style={{ backgroundColor: 'rgba(255,255,255,0.6)', minHeight: 180 }}
      >
        <View>
          <Text
            style={{
              fontFamily: Fonts.headingBold,
              fontSize: 18,
              letterSpacing: -0.5,
              color: Colors.onSurface,
              marginBottom: 8,
            }}
          >
            Physiological Insight
          </Text>
          <Text
            style={{
              fontFamily: Fonts.body,
              fontSize: 13,
              lineHeight: 20,
              color: Colors.onSurfaceVariant,
            }}
          >
            Week-over-week load delta:{' '}
            <Text style={{ color: Colors.primary, fontFamily: Fonts.bodySemiBold }}>
              {loadDelta}
            </Text>
            . Recommended next session intensity: moderate.
          </Text>
        </View>
        <View className="flex-row items-center gap-2 mt-4 pt-4" style={{ borderTopWidth: 1, borderTopColor: Colors.border }}>
          <Text
            style={{
              fontFamily: Fonts.body,
              fontSize: 9,
              letterSpacing: 3,
              textTransform: 'uppercase',
              color: Colors.primary,
            }}
          >
            System_REC.042
          </Text>
        </View>
      </View>

      {/* Training effect card (narrow) */}
      <View
        className="p-6 justify-between"
        style={{ backgroundColor: Colors.primary, width: 120, minHeight: 180 }}
      >
        <Text
          style={{
            fontFamily: Fonts.body,
            fontSize: 8,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: Colors.onPrimary,
            opacity: 0.5,
          }}
        >
          Metric_Score
        </Text>
        <View>
          <Text
            style={{
              fontFamily: Fonts.body,
              fontSize: 9,
              letterSpacing: 3,
              textTransform: 'uppercase',
              color: Colors.onPrimary,
              opacity: 0.8,
            }}
          >
            Training Effect
          </Text>
          <Text
            style={{
              fontFamily: Fonts.headingBold,
              fontSize: 40,
              letterSpacing: -2,
              color: Colors.onPrimary,
              fontVariant: ['tabular-nums'],
              marginTop: 4,
            }}
          >
            {score}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.body,
              fontSize: 9,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: Colors.onPrimary,
              opacity: 0.6,
              marginTop: 4,
            }}
          >
            {label}
          </Text>
        </View>
      </View>
    </View>
  );
}
