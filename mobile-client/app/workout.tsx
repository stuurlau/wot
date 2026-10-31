import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/screen';

import { DataState } from '@/components/data-state';
import { AppHeader } from '@/components/app-header';
import { PainSheet } from '@/components/home/pain-sheet';
import { ExerciseBlock } from '@/components/workout/exercise-block';
import { ExerciseList } from '@/components/workout/exercise-list';
import { ExercisePickerSheet } from '@/components/workout/exercise-picker-sheet';
import { FinishSheet } from '@/components/workout/finish-sheet';
import { useRecentExercises, useReorderExercises, useTrainingSession, useUpdateTrainingSession } from '@/hooks/api';
import { useActiveSessionStore } from '@/stores/active-session-store';
import { useRestTimerStore } from '@/stores/rest-timer-store';

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
  // The set the rest clock runs after — its exercise is the active one.
  const restSetId = useRestTimerStore((s) => (s.sessionId === sessionId ? s.previousSetId : null));
  const { data: session } = useTrainingSession(sessionId ?? '');
  const { data: recents = [] } = useRecentExercises(20);
  const updateSession = useUpdateTrainingSession(sessionId ?? '');
  const reorderExercises = useReorderExercises(sessionId ?? '');

  const [now, setNow] = useState(Date.now());
  const [title, setTitle] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [finishVisible, setFinishVisible] = useState(false);
  const [painVisible, setPainVisible] = useState(false);
  // The exercise being worked on (last focused / logged); its next set gets
  // the card surface. Defaults to where the rest clock runs, else the newest.
  const [activeId, setActiveId] = useState<string | null>(null);

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

  const exercises = session?.exercises ?? [];
  const activeExerciseId =
    activeId ??
    exercises.find((e) => e.sets.some((set) => set.id === restSetId))?.id ??
    exercises.at(-1)?.id ??
    null;
  // Superset chips: 1–3, plus any higher group already in use.
  const maxGroup = Math.max(3, ...exercises.map((e) => e.supersetGroup ?? 0));
  const supersetOptions = Array.from({ length: maxGroup }, (_, i) => i + 1);

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
      <Screen className="items-center justify-center">
        <Text className="font-body text-[12px] text-muted-foreground">No active workout.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <AppHeader />
      <View className="px-6 pt-1">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} hitSlop={12} className="flex-1 py-3">
            <Text className="font-body text-[10px] uppercase tracking-[2px] text-muted-foreground">
              ↓ Minimize
            </Text>
          </Pressable>
          <Text
            className="font-heading text-[32px] leading-[36px] tracking-[-1px] text-foreground"
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {formatElapsed(now - (startedAtMs ?? now))}
          </Text>
          <Pressable onPress={() => setFinishVisible(true)} hitSlop={12} className="flex-1 items-end py-3">
            <Text className="font-body-medium text-[10px] uppercase tracking-[2px] text-primary">
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
          className="mt-5 border-b border-border pb-2 font-heading text-[30px] tracking-[-1px] text-foreground"
        />
      </View>

      {session ? (
        <ExerciseList
          exercises={session.exercises}
          onReorder={(ids) => reorderExercises.mutate(ids)}
          renderItem={(item, drag, isActive) => (
            <ExerciseBlock
              sessionId={sessionId}
              exercise={item}
              recent={recentByName.get(item.name) ?? null}
              supersetPartners={session.exercises
                .filter((e) => e.id !== item.id && e.supersetGroup != null && e.supersetGroup === item.supersetGroup)
                .map((e) => e.name)}
              supersetOptions={supersetOptions}
              active={item.id === activeExerciseId}
              onActivate={() => setActiveId(item.id)}
              onNameLongPress={drag}
              isDragging={isActive}
            />
          )}
          empty={
            <Pressable onPress={() => setPickerVisible(true)} className="mb-4 self-start py-1">
              <Text className="font-body text-[13px] leading-5 text-muted-foreground">
                Add your first exercise →
              </Text>
            </Pressable>
          }
          footer={
            <View className="flex-row items-center justify-between gap-4 pb-14 pt-5">
              <Pressable onPress={() => setPickerVisible(true)} className="py-3">
                <Text className="font-body text-[11px] uppercase tracking-[3px] text-primary">
                  + Add exercise
                </Text>
              </Pressable>
              <Pressable onPress={() => setPainVisible(true)} className="py-3">
                <Text className="font-body text-[11px] uppercase tracking-[3px] text-muted-foreground">
                  + Pain
                </Text>
              </Pressable>
            </View>
          }
        />
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
        onLogPain={() => setPainVisible(true)}
      />
      <PainSheet visible={painVisible} onClose={() => setPainVisible(false)} />
    </Screen>
  );
}