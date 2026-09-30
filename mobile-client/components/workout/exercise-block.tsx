import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import type { RecentExercise } from '@/lib/api';
import type { TrainingSessionExercise, TrainingSessionExerciseSet } from '@wot/types';
import { useCreateExerciseSet, useDeleteExercise, useDeleteExerciseSet, useUpdateExercise, useUpdateExerciseSet } from '@/hooks/api';
import { elapsedRestSeconds, useRestTimerStore } from '@/stores/rest-timer-store';
import { SetRow, type SetInput } from './set-row';

type ExerciseBlockProps = {
  sessionId: string;
  exercise: TrainingSessionExercise & { sets: TrainingSessionExerciseSet[] };
  recent?: RecentExercise | null;
  /** Group the exercise moves to when its superset badge is pressed. */
  nextSupersetGroup: number | null;
};

function toSetBody(input: SetInput, sortOrder: number) {
  return {
    sortOrder,
    weight: input.weight ?? undefined,
    reps: input.reps ?? undefined,
    rir: input.rir ?? undefined,
    distance: input.distance ?? undefined,
    duration: input.duration ?? undefined,
  };
}

export function ExerciseBlock({ sessionId, exercise, recent, nextSupersetGroup }: ExerciseBlockProps) {
  const [mode, setMode] = useState<'strength' | 'cardio'>('strength');
  const createSet = useCreateExerciseSet(sessionId, exercise.id);
  const updateSet = useUpdateExerciseSet(sessionId, exercise.id);
  const deleteSet = useDeleteExerciseSet(sessionId, exercise.id);
  const updateExercise = useUpdateExercise(sessionId);
  const deleteExercise = useDeleteExercise(sessionId);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [rirToggled, setRirToggled] = useState(false);

  // RIR stays visible once it has been used on this exercise (this session or
  // via the recents of an earlier one), or once the user asked for it.
  const showRir =
    rirToggled || exercise.sets.some((s) => s.rir != null) || recent?.lastSet.rir != null;

  const logSet = (input: SetInput) => {
    const rest = elapsedRestSeconds(sessionId);
    useRestTimerStore.getState().start(sessionId);
    createSet.mutate({ ...toSetBody(input, exercise.sets.length), rest: rest ?? undefined });
  };

  const strengthReference =
    recent?.lastSet.weight != null || recent?.lastSet.reps != null
      ? `${recent.lastSet.weight ?? '—'} × ${recent.lastSet.reps ?? '—'}`
      : null;

  return (
    <View className="mb-8">
      <View className="mb-1 flex-row items-baseline justify-between">
        <Text className="font-heading text-[26px] leading-[28px] tracking-[-0.8px] text-foreground">
          {exercise.name}
        </Text>
        <View className="flex-row items-baseline gap-3">
          <Pressable
            hitSlop={8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              updateExercise.mutate({
                exerciseId: exercise.id,
                body: { supersetGroup: nextSupersetGroup },
              });
            }}
            className={
              exercise.supersetGroup != null
                ? 'self-center rounded-full bg-primary px-2 py-0.5'
                : 'self-center rounded-full bg-surface-container-low px-2 py-0.5'
            }
          >
            <Text
              className={
                exercise.supersetGroup != null
                  ? 'font-body text-[9px] uppercase tracking-[2px] text-primary-foreground'
                  : 'font-body text-[9px] uppercase tracking-[2px] text-muted-foreground'
              }
            >
              {exercise.supersetGroup != null ? `SS${exercise.supersetGroup}` : 'SS'}
            </Text>
          </Pressable>
          {exercise.bodyRegions && exercise.bodyRegions.length > 0 ? (
            <Text className="font-body text-[9px] uppercase tracking-[2px] text-muted-foreground">
              {exercise.bodyRegions.join(' · ')}
            </Text>
          ) : null}
          <Pressable
            hitSlop={8}
            onPress={() => {
              if (confirmRemove) {
                deleteExercise.mutate(exercise.id);
              } else {
                setConfirmRemove(true);
                setTimeout(() => setConfirmRemove(false), 3000);
              }
            }}
          >
            <Text
              className={
                confirmRemove
                  ? 'font-body text-[9px] uppercase tracking-[2px] text-destructive'
                  : 'font-body text-[9px] uppercase tracking-[2px] text-muted-foreground'
              }
            >
              {confirmRemove ? 'Tap again to remove' : 'Remove'}
            </Text>
          </Pressable>
        </View>
      </View>

      <View className="mb-2 flex-row gap-2">
        {(['strength', 'cardio'] as const).map((m) => (
          <Pressable
            key={m}
            onPress={() => setMode(m)}
            className={
              mode === m
                ? 'rounded-full bg-primary px-3 py-1'
                : 'rounded-full bg-surface-container-low px-3 py-1'
            }
          >
            <Text
              className={
                mode === m
                  ? 'font-body text-[9px] uppercase tracking-[2px] text-primary-foreground'
                  : 'font-body text-[9px] uppercase tracking-[2px] text-muted-foreground'
              }
            >
              {m}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="border-t border-border">
        {exercise.sets.map((set, i) => (
          <SetRow
            key={set.id}
            setNumber={i + 1}
            mode={mode}
            values={{
              weight: set.weight ?? null,
              reps: set.reps ?? null,
              rir: set.rir ?? null,
              distance: set.distance ?? null,
              duration: set.duration ?? null,
            }}
            lastReference={null}
            showRir={showRir}
            onShowRir={() => setRirToggled(true)}
            busy={updateSet.isPending || deleteSet.isPending}
            onCreate={() => {}}
            onUpdate={(input) => updateSet.mutate({ setId: set.id, body: toSetBody(input, i) })}
            onDelete={() => deleteSet.mutate(set.id)}
          />
        ))}

        <SetRow
          key={`new-${exercise.sets.length}`}
          setNumber={exercise.sets.length + 1}
          mode={mode}
          values={null}
          lastReference={mode === 'strength' ? strengthReference : null}
          showRir={mode === 'strength' && showRir}
          onShowRir={() => setRirToggled(true)}
          busy={createSet.isPending}
          onCreate={logSet}
          onUpdate={() => {}}
          onDelete={() => {}}
        />
      </View>
    </View>
  );
}