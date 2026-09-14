import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CheckInCard } from '@/components/home/check-in-card';
import { CheckInSheet } from '@/components/home/check-in-sheet';
import { PainSheet } from '@/components/home/pain-sheet';
import { SessionHistoryCard } from '@/components/home/session-history-card';
import { AppHeader } from '@/components/app-header';
import { useLoadMetrics } from '@/hooks/use-load-metrics';
import {
  useCreateTrainingSession,
  useDailyLogs,
  usePainLogs,
  useTrainingSessions,
} from '@/hooks/api';
import { exercises, trainingSessions } from '@/lib/api';
import { recentDateRange } from '@/lib/date-range';
import { finishedSessions } from '@/lib/sessions';
import { useActiveSessionStore } from '@/stores/active-session-store';

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function TodayScreen() {
  const range = useMemo(() => recentDateRange(60), []);
  const sessionsQuery = useTrainingSessions({ ...range, limit: 100 });
  const painQuery = usePainLogs({ from: recentDateRange(7).from, limit: 10 });
  const todayLogsQuery = useDailyLogs({
    from: todayKey(),
    to: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    })(),
  });
  const createSession = useCreateTrainingSession();
  const startActive = useActiveSessionStore((s) => s.start);

  const [painVisible, setPainVisible] = useState(false);
  const [checkInVisible, setCheckInVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessions = finishedSessions(sessionsQuery.data?.data ?? []);
  const metrics = useLoadMetrics(sessions, []);
  const recent = sessions.slice(0, 3);
  const last = sessions[0];

  const todayPain = (painQuery.data?.data ?? []).find((p) => p.date === todayKey());
  const checkedInToday = (todayLogsQuery.data ?? []).length > 0;

  const startWorkout = async () => {
    setError(null);
    try {
      const s = await createSession.mutateAsync({
        startedAt: new Date().toISOString(),
        duration: 0,
        srpe: 1,
        type: 'strength',
      });
      startActive(s.id);
      router.push('/workout');
    } catch {
      setError("Couldn't start the workout. Check your connection and try again.");
    }
  };

  const repeatLast = async () => {
    if (!last) return;
    setError(null);
    try {
      const detail = await trainingSessions.get(last.id);
      const s = await createSession.mutateAsync({
        startedAt: new Date().toISOString(),
        duration: 0,
        srpe: 1,
        type: detail.type,
        title: detail.title,
      });
      for (const [i, ex] of detail.exercises.entries()) {
        await exercises.create(s.id, {
          name: ex.name,
          bodyRegions: ex.bodyRegions,
          sortOrder: i,
        });
      }
      startActive(s.id);
      router.push('/workout');
    } catch {
      setError("Couldn't start the workout. Check your connection and try again.");
    }
  };

  const sessionsThisWeek = sessions.filter((s) => {
    const d = new Date(s.startedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo;
  }).length;

  return (
    <SafeAreaView className="flex-1">
      <AppHeader />
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingTop: 20, paddingBottom: 32 }}>
          <Text className="mb-6 font-heading text-[40px] leading-[38px] tracking-[-1.6px] text-foreground">
            Today
          </Text>

          {!checkedInToday ? (
            <CheckInCard onPress={() => setCheckInVisible(true)} />
          ) : null}

          <Pressable
            onPress={() => void startWorkout()}
            disabled={createSession.isPending}
            className="mb-3 items-center rounded-2xl bg-primary px-6 py-5 active:opacity-80"
          >
            <Text className="font-body-bold text-[12px] uppercase tracking-[3px] text-primary-foreground">
              {createSession.isPending ? 'Starting…' : 'Start workout'}
            </Text>
          </Pressable>

          {last ? (
            <Pressable onPress={() => void repeatLast()} className="mb-8 self-start py-1">
              <Text className="font-body text-[11px] uppercase tracking-[2px] text-muted-foreground">
                Repeat: {last.title ?? last.type} ({new Date(last.startedAt).toLocaleDateString(undefined, { weekday: 'short' })})
              </Text>
            </Pressable>
          ) : null}

          {error ? (
            <Text className="-mt-5 mb-8 font-body text-[12px] text-destructive">{error}</Text>
          ) : null}

          <View className="mb-10 border-t border-border pt-4">
            <View className="mb-2 flex-row items-baseline justify-between">
              <Text className="font-body text-[9px] uppercase tracking-[3px] text-muted-foreground">
                This week
              </Text>
              <Text className="font-body text-[9px] uppercase tracking-[3px] text-muted-foreground">
                {sessionsThisWeek} sessions ·{' '}
                {metrics.weeklyLoad > 0
                  ? metrics.weeklyLoad >= metrics.prevWeeklyLoad * 1.3
                    ? 'rising'
                    : metrics.weeklyLoad < metrics.prevWeeklyLoad * 0.7
                      ? 'light'
                      : 'moderate'
                  : 'no load yet'}
              </Text>
            </View>
            <View className="flex-row gap-1">
              {metrics.dailyLoads.map((d) => (
                <View key={d.date} className="h-2 flex-1 rounded-full" style={{ backgroundColor: d.load > 0 ? '#673F8A' : 'rgba(0,0,0,0.08)' }} />
              ))}
            </View>
          </View>

          <View className="mb-10">
            <Text className="mb-2 font-body text-[9px] uppercase tracking-[3px] text-muted-foreground">
              Recent
            </Text>
            {recent.length > 0 ? (
              recent.map((session) => (
                <Pressable key={session.id} onPress={() => router.push(`/session/${session.id}` as never)}>
                  <SessionHistoryCard session={session} />
                </Pressable>
              ))
            ) : (
              <Text className="font-body text-[12px] leading-5 text-muted-foreground">
                Every training log starts with one session.
              </Text>
            )}
          </View>

          <Pressable onPress={() => setPainVisible(true)} className="mb-2 self-start">
            <Text className="font-body text-[10px] uppercase tracking-[3px] text-muted-foreground">
              + Pain
            </Text>
          </Pressable>
          {todayPain ? (
            <Text className="font-body text-[11px] text-muted-foreground">
              {todayPain.bodyRegion} pain logged today ({todayPain.severity}/10)
            </Text>
          ) : null}
        </ScrollView>

        <PainSheet visible={painVisible} onClose={() => setPainVisible(false)} />
        <CheckInSheet visible={checkInVisible} onClose={() => setCheckInVisible(false)} />
      </SafeAreaView>
  );
}