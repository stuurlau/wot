import { Text, View } from 'react-native';

import type { RegionShare } from '@/lib/insights';

export function BalanceBars({ shares }: { shares: RegionShare[] }) {
  if (shares.length === 0) return null;

  return (
    <View className="mb-8">
      <Text className="mb-3 font-heading text-[24px] tracking-[-0.6px] text-foreground">
        Balance · last 4 weeks
      </Text>
      {shares.slice(0, 6).map((r) => (
        <View key={r.region} className="mb-2">
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="font-body text-[11px] text-foreground">{r.region}</Text>
            <Text
              className="font-body text-[11px] text-muted-foreground"
              style={{ fontVariant: ['tabular-nums'] }}
            >
              {r.sharePct}%
            </Text>
          </View>
          <View className="h-2 overflow-hidden rounded-full bg-surface-container-low">
            <View className="h-full rounded-full bg-primary" style={{ width: `${r.sharePct}%` }} />
          </View>
        </View>
      ))}
    </View>
  );
}