import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import type { Signal } from '@/lib/insights';

export function SignalCard({ signal }: { signal: Signal }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Pressable onPress={() => setExpanded((e) => !e)} className="mb-3 rounded-2xl bg-surface-container-low px-5 py-4">
      <View className="flex-row items-center justify-between">
        <Text className="font-body text-[9px] uppercase tracking-[3px] text-foreground">
          {signal.title}
        </Text>
        <Text className="font-body text-[12px]" style={{ color: Colors.warning }}>
          {signal.kind === 'progression-win' ? '▲' : '⚠'}
        </Text>
      </View>
      <Text className="mt-2 font-body text-[13px] leading-5 text-muted-foreground">
        {signal.body}
      </Text>
      {expanded ? (
        <Text className="mt-2 font-body text-[10px] tracking-[2px] text-muted-foreground">
          {signal.kind} · priority {signal.priority}
        </Text>
      ) : null}
    </Pressable>
  );
}