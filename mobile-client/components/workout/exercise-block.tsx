import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import type { RecentExercise } from '@/lib/api';
import type { TrainingSessionExercise, TrainingSessionExerciseSet } from '@wot/types';
import { useCreateExerciseSet, useCreateRestTime, useDeleteExercise, useDeleteExerciseSet, useUpdateExercise, useUpdateExerciseSet } from '@/hooks/api';
import { useRestTimerStore } from '@/stores/rest-timer-store';
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
    rpe: input.rpe ?? undefined,
    distance: input.distance ?? undefined,
    duration: input.duration ?? undefined,
  };
}

export function ExerciseBlock({ sessionId, exercise, recent, nextSupersetGroup }: ExerciseBlockProps) {
  const [mode, setMode] = useState<'strength' | 'cardio'>('strength');
  const createSet = useCreateExerciseSet(sessionId, exercise.id);
  const createRestTime = useCreateRestTime(sessionId);
  const updateSet = useUpdateExerciseSet(sessionId, exercise.id);
  const deleteSet = useDeleteExerciseSet(sessionId, exercise.id);
  const updateExercise = useUpdateExercise(sessionId);
  const deleteExercise = useDeleteExercise(sessionId);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [intensityToggled, setIntensityToggled] = useState(false);
  const [intensityOverride, setIntensityOverride] = useState<'rir' | 'rpe' | null>(null);

  // The intensity input stays visible once it has been used on this exercise
  // (this session or via the recents of an earlier one), or once the user
  // asked for it. RIR is the default; the label press flips between RIR/RPE.
  const hasRir = exercise.sets.some((s) => s.rir != null) || recent?.lastSet.rir != null;
  const hasRpe = exercise.sets.some((s) => s.rpe != null) || recent?.lastSet.rpe != null;
  const showIntensity = intensityToggled || hasRir || hasRpe;
  const intensity = intensityOverride ?? (hasRpe && !hasRir ? 'rpe' : 'rir');

  const logSet = async (input: SetInput) => {
    const rest = useRestTimerStore.getState();
    const restFromMs = rest.sessionId === sessionId ? rest.startedAtMs : null;
    const setBeforeId = rest.sessionId === sessionId ? rest.previousSetId : null;
    let created: TrainingSessionExerciseSet;
    try {
      created = await createSet.mutateAsync(toSetBody(input, exercise.sets.length));
    } catch {
      return; // react-query exposes the error; keep the rest clock running
    }
    useRestTimerStore.getState().start(sessionId, created.id);
    if (setBeforeId && restFromMs !== null) {
      createRestTime.mutate({
        setBeforeId,
        setAfterId: created.id,
        fromAt: new Date(restFromMs).toISOString(),
        tillAt: new Date().toISOString(),
      });
    }
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
              rpe: set.rpe ?? null,
              distance: set.distance ?? null,
              duration: set.duration ?? null,
            }}
            lastReference={null}
            showIntensity={showIntensity}
            intensity={intensity}
            onShowIntensity={() => setIntensityToggled(true)}
            onFlipIntensity={() => setIntensityOverride(intensity === 'rir' ? 'rpe' : 'rir')}
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
          showIntensity={mode === 'strength' && showIntensity}
          intensity={intensity}
          onShowIntensity={() => setIntensityToggled(true)}
          onFlipIntensity={() => setIntensityOverride(intensity === 'rir' ? 'rpe' : 'rir')}
          busy={createSet.isPending}
          onCreate={logSet}
          onUpdate={() => {}}
          onDelete={() => {}}
        />
      </View>
    </View>
  );
}