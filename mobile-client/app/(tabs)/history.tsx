import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SessionHistoryCard } from '@/components/home/session-history-card';
import { AppHeader } from '@/components/app-header';
import { useTrainingSessions } from '@/hooks/api';
import { recentDateRange } from '@/lib/date-range';
import { finishedSessions } from '@/lib/sessions';

export default function HistoryScreen() {
  const range = useMemo(() => recentDateRange(90), []);
  const sessionsQuery = useTrainingSessions({ ...range, limit: 100 });
  const sessions = finishedSessions(sessionsQuery.data?.data ?? []);

  return (
    <SafeAreaView className="flex-1">
      <AppHeader />
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingTop: 20, paddingBottom: 32 }}>
          <Text className="mb-6 font-heading text-[40px] leading-[38px] tracking-[-1.6px] text-foreground">
            History
          </Text>

          {sessionsQuery.isLoading && sessions.length === 0 ? (
            <Text className="font-body text-[12px] text-muted-foreground">Loading…</Text>
          ) : null}

          {!sessionsQuery.isLoading && sessions.length === 0 ? (
            <Text className="font-body text-[13px] leading-6 text-muted-foreground">
              Nothing logged yet. Your first session will appear here.
            </Text>
          ) : null}

          <View className="border-t border-border">
            {sessions.map((session) => (
              <Pressable
                key={session.id}
                onPress={() => router.push(`/session/${session.id}` as never)}
              >
                <SessionHistoryCard session={session} />
              </Pressable>
            ))}
          </View>
        </ScrollView>
    </SafeAreaView>
  );
}