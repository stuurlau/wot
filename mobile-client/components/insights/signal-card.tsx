import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import type { Signal } from '@/lib/insights';

export function SignalCard({ signal }: { signal: Signal }) {
  const [expanded, setExpanded] = useState(false);
  const positive = signal.kind === 'progression-win';

  return (
    <Pressable onPress={() => setExpanded((e) => !e)} className="mb-3 rounded-2xl bg-surface-container-low px-5 py-4">
      <View className="flex-row items-center justify-between">
        <Text className="font-body text-[9px] uppercase tracking-[3px] text-foreground">
          {signal.title}
        </Text>
        <Text
          className="font-body text-[12px]"
          style={{ color: positive ? Colors.secondary : Colors.warning }}
        >
          {positive ? '▲' : '⚠'}
        </Text>
      </View>
      <Text className="mt-2 font-body text-[13px] leading-5 text-muted-foreground">
        {signal.body}
      </Text>
      {expanded && signal.details && signal.details.length > 0 ? (
        <View className="mt-2 border-t border-border pt-2">
          {signal.details.map((detail) => (
            <Text
              key={detail}
              className="font-body text-[11px] leading-5 text-muted-foreground"
              style={{ fontVariant: ['tabular-nums'] }}
            >
              {detail}
            </Text>
          ))}
        </View>
      ) : null}
    </Pressable>
  );
}
