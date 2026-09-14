import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DataState } from '@/components/data-state';
import { AppHeader } from '@/components/app-header';
import { PainSheet } from '@/components/home/pain-sheet';
import { ExerciseBlock } from '@/components/workout/exercise-block';
import { ExercisePickerSheet } from '@/components/workout/exercise-picker-sheet';
import { FinishSheet } from '@/components/workout/finish-sheet';
import { useRecentExercises, useTrainingSession, useUpdateTrainingSession } from '@/hooks/api';
import { useActiveSessionStore } from '@/stores/active-session-store';

function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export default function WorkoutScreen() {
  const sessionId = useActiveSessionStore((s) => s.sessionId);
  const startedAtMs = useActiveSessionStore((s) => s.startedAtMs);
  const { data: session } = useTrainingSession(sessionId ?? '');
  const { data: recents = [] } = useRecentExercises(20);
  const updateSession = useUpdateTrainingSession(sessionId ?? '');

  const [now, setNow] = useState(Date.now());
  const [title, setTitle] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [finishVisible, setFinishVisible] = useState(false);
  const [painVisible, setPainVisible] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const titleInit = useRef(false);
  useEffect(() => {
    // Initialize once: server title if set, else a suggestion (day + type).
    // Never re-run — later refetches must not clobber what the user typed.
    if (session && !titleInit.current) {
      titleInit.current = true;
      if (session.title) {
        setTitle(session.title);
      } else {
        const day = new Date(session.startedAt).toLocaleDateString(undefined, {
          weekday: 'long',
        });
        const type = session.type.charAt(0).toUpperCase() + session.type.slice(1);
        setTitle(`${day} ${type}`);
      }
    }
  }, [session]);

  const recentByName = useMemo(
    () => new Map(recents.map((r) => [r.name, r])),
    [recents],
  );

  const commitTitle = useCallback(() => {
    if (!sessionId) return;
    const trimmed = title.trim();
    if (trimmed === (session?.title ?? '') || trimmed === '') return;
    void updateSession.mutateAsync({ title: trimmed });
  }, [sessionId, title, session?.title, updateSession]);

  if (!sessionId || !startedAtMs) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="font-body text-[12px] text-muted-foreground">No active workout.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <AppHeader />
      <View className="px-6 pb-2 pt-1">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text className="font-body text-[11px] uppercase tracking-[2px] text-muted-foreground">
              ↓ Minimize
            </Text>
          </Pressable>
          <Text
            className="font-heading text-[22px] tracking-[-0.6px] text-foreground"
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {formatElapsed(now - (startedAtMs ?? now))}
          </Text>
          <Pressable onPress={() => setFinishVisible(true)} hitSlop={12}>
            <Text className="font-body text-[11px] uppercase tracking-[2px] text-primary">
              Finish
            </Text>
          </Pressable>
        </View>

        <TextInput
          value={title}
          onChangeText={setTitle}
          onEndEditing={commitTitle}
          placeholder="Workout title"
          placeholderTextColor="rgba(0,0,0,0.3)"
          className="mt-2 border-b border-border pb-1 font-heading text-[30px] tracking-[-1px] text-foreground"
        />
      </View>

      {session ? (
        <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 40 }}>
          {session.exercises.length === 0 ? (
            <Pressable onPress={() => setPickerVisible(true)} className="mb-4 self-start py-1">
              <Text className="font-body text-[13px] leading-5 text-muted-foreground">
                Add your first exercise →
              </Text>
            </Pressable>
          ) : (
            session.exercises.map((exercise) => (
              <ExerciseBlock
                key={exercise.id}
                sessionId={sessionId}
                exercise={exercise}
                recent={recentByName.get(exercise.name) ?? null}
              />
            ))
          )}

          <Pressable onPress={() => setPickerVisible(true)} className="py-4">
            <Text className="font-body text-[11px] uppercase tracking-[3px] text-primary">
              + Add exercise
            </Text>
          </Pressable>

          <Pressable onPress={() => setPainVisible(true)} className="py-2">
            <Text className="font-body text-[10px] uppercase tracking-[3px] text-muted-foreground">
              + Pain
            </Text>
          </Pressable>
        </ScrollView>
      ) : (
        <View className="flex-1 px-6 pt-6">
          <DataState message="Loading workout…" />
        </View>
      )}

      <ExercisePickerSheet
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        sessionId={sessionId}
        nextSortOrder={session?.exercises.length ?? 0}
      />
      <FinishSheet
        visible={finishVisible}
        onClose={() => setFinishVisible(false)}
        sessionId={sessionId}
        startedAtMs={startedAtMs}
        onLogPain={() => setPainVisible(true)}
      />
      <PainSheet visible={painVisible} onClose={() => setPainVisible(false)} />
    </SafeAreaView>
  );
}