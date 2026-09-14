import { useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { VersionFooter } from '@/components/version-footer';
import { useCreateTrainingSession, useTrainingSession } from '@/hooks/api';
import { exercises } from '@/lib/api';
import { useActiveSessionStore } from '@/stores/active-session-store';

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
}

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: session } = useTrainingSession(id ?? '');
  const createSession = useCreateTrainingSession();
  const startActive = useActiveSessionStore((s) => s.start);
  const [error, setError] = useState<string | null>(null);

  if (!session) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <AppHeader />
        <Text className="px-6 pt-6 font-body text-[12px] text-muted-foreground">Loading…</Text>
      </SafeAreaView>
    );
  }

  const logAgain = async () => {
    setError(null);
    try {
      const s = await createSession.mutateAsync({
        startedAt: new Date().toISOString(),
        duration: 0,
        srpe: 1,
        type: session.type,
        title: session.title,
      });
      for (const [i, ex] of session.exercises.entries()) {
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

  return (
    <SafeAreaView className="flex-1">
      <AppHeader />
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingTop: 20, paddingBottom: 32 }}>
          <Pressable onPress={() => router.back()} className="mb-4 self-start">
            <Text className="font-body text-[11px] uppercase tracking-[2px] text-muted-foreground">
              ← Back
            </Text>
          </Pressable>

          <View className="mb-6 flex-row items-baseline justify-between">
            <Text className="font-heading text-[32px] leading-[30px] tracking-[-1px] text-foreground">
              {session.title ?? session.type.charAt(0).toUpperCase() + session.type.slice(1)}
            </Text>
            <Text className="font-body text-[10px] uppercase tracking-[2px] text-muted-foreground">
              {session.type}
            </Text>
          </View>

          <View className="mb-6 flex-row gap-6">
            <View>
              <Text className="font-body text-[9px] uppercase tracking-[3px] text-muted-foreground">
                {new Date(session.startedAt).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}
              </Text>
              <Text className="mt-1 font-heading text-[22px] text-foreground">
                {formatDuration(session.duration)}
              </Text>
            </View>
            <View>
              <Text className="font-body text-[9px] uppercase tracking-[3px] text-muted-foreground">
                Effort
              </Text>
              <Text className="mt-1 font-heading text-[22px] text-foreground" style={{ fontVariant: ['tabular-nums'] }}>
                {session.srpe}/10
              </Text>
            </View>
            <View>
              <Text className="font-body text-[9px] uppercase tracking-[3px] text-muted-foreground">
                Load
              </Text>
              <Text className="mt-1 font-heading text-[22px] text-foreground" style={{ fontVariant: ['tabular-nums'] }}>
                {Math.round(session.load).toLocaleString()}
              </Text>
            </View>
          </View>

          {session.exercises.map((ex) => (
            <View key={ex.id} className="mb-6">
              <View className="mb-1 flex-row items-baseline justify-between">
                <Text className="font-heading text-[22px] tracking-[-0.4px] text-foreground">
                  {ex.name}
                </Text>
                {ex.bodyRegions && ex.bodyRegions.length > 0 ? (
                  <Text className="font-body text-[9px] uppercase tracking-[2px] text-muted-foreground">
                    {ex.bodyRegions.join(' · ')}
                  </Text>
                ) : null}
              </View>
              {ex.sets.length === 0 ? (
                <Text className="font-body text-[12px] text-muted-foreground">No sets logged.</Text>
              ) : (
                ex.sets.map((set, i) => {
                  const hasStrength = set.weight != null || set.reps != null;
                  const label = hasStrength
                    ? `${set.weight ?? '—'} × ${set.reps ?? '—'}`
                    : `${set.distance ?? '—'} km${set.duration != null ? ` · ${Math.round(set.duration / 60)} min` : ''}`;
                  return (
                    <View key={set.id} className="flex-row items-center justify-between py-1">
                      <Text className="w-8 font-body text-[11px] text-muted-foreground" style={{ fontVariant: ['tabular-nums'] }}>
                        {i + 1}
                      </Text>
                      <Text className="font-body-medium text-[15px] text-foreground" style={{ fontVariant: ['tabular-nums'] }}>
                        {label}
                      </Text>
                    </View>
                  );
                })
              )}
            </View>
          ))}

          {session.notes ? (
            <Text className="mb-6 font-body text-[13px] italic text-muted-foreground">
              {session.notes}
            </Text>
          ) : null}

          {error ? (
            <Text className="mb-3 font-body text-[12px] text-destructive">{error}</Text>
          ) : null}

          <Pressable
            onPress={() => void logAgain()}
            disabled={createSession.isPending}
            className="items-center rounded-2xl bg-primary px-6 py-4 active:opacity-80"
          >
            <Text className="font-body-bold text-[11px] uppercase tracking-[3px] text-primary-foreground">
              {createSession.isPending ? 'Starting…' : 'Log again'}
            </Text>
          </Pressable>
        </ScrollView>
      <VersionFooter />
    </SafeAreaView>
  );
}