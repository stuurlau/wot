import { Text, View } from 'react-native';

// Label/value row with a bottom divider (advanced metrics, explorer summary).
export function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between border-b border-border py-3">
      <Text className="font-body text-[10px] uppercase tracking-[2px] text-muted-foreground">
        {label}
      </Text>
      <Text
        className="font-heading text-[20px] text-foreground"
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {value}
      </Text>
    </View>
  );
}
