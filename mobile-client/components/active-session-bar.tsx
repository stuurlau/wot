import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';

import { useTrainingSession } from '@/hooks/api';
import { useActiveSessionStore } from '@/stores/active-session-store';

function formatElapsed(startedAtMs: number, now: number): string {
  const total = Math.max(0, Math.floor((now - startedAtMs) / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function ActiveSessionBar() {
  const sessionId = useActiveSessionStore((s) => s.sessionId);
  const startedAtMs = useActiveSessionStore((s) => s.startedAtMs);
  const { data: session } = useTrainingSession(sessionId ?? '');

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!sessionId) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [sessionId]);

  if (!sessionId || !session) return null;

  const label = session.title || session.type || 'Workout';
  const exercises = session.exercises?.length ?? 0;

  return (
    <Pressable
      onPress={() => router.push('/workout')}
      className="flex-row items-center justify-between px-6 py-2"
      style={{ borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.08)' }}
    >
      <View className="flex-row items-center gap-2">
        <Text className="font-body text-[10px] tracking-[2px] text-primary">▶</Text>
        <Text className="font-body-medium text-[13px] text-foreground" numberOfLines={1}>
          {label}
        </Text>
      </View>
      <View className="flex-row items-center gap-3">
        <Text
          className="font-body text-[11px] text-muted-foreground"
          style={{ fontVariant: ['tabular-nums'] }}
        >
          {exercises} ex
        </Text>
        <Text
          className="font-body text-[11px] text-muted-foreground"
          style={{ fontVariant: ['tabular-nums'] }}
        >
          {startedAtMs ? formatElapsed(startedAtMs, now) : '--:--'}
        </Text>
      </View>
    </Pressable>
  );
}