import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { RecentExercise } from '@/lib/api';
import type { TrainingSessionExercise, TrainingSessionExerciseSet } from '@wot/types';
import { useCreateExerciseSet, useDeleteExerciseSet, useUpdateExerciseSet } from '@/hooks/api';
import { SetRow, type SetInput } from './set-row';

type ExerciseBlockProps = {
  sessionId: string;
  exercise: TrainingSessionExercise & { sets: TrainingSessionExerciseSet[] };
  recent?: RecentExercise | null;
};

function toSetBody(input: SetInput, sortOrder: number) {
  return {
    sortOrder,
    weight: input.weight ?? undefined,
    reps: input.reps ?? undefined,
    distance: input.distance ?? undefined,
    duration: input.duration ?? undefined,
  };
}

export function ExerciseBlock({ sessionId, exercise, recent }: ExerciseBlockProps) {
  const [mode, setMode] = useState<'strength' | 'cardio'>('strength');
  const createSet = useCreateExerciseSet(sessionId, exercise.id);
  const updateSet = useUpdateExerciseSet(sessionId, exercise.id);
  const deleteSet = useDeleteExerciseSet(sessionId, exercise.id);

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
        {exercise.bodyRegions && exercise.bodyRegions.length > 0 ? (
          <Text className="font-body text-[9px] uppercase tracking-[2px] text-muted-foreground">
            {exercise.bodyRegions.join(' · ')}
          </Text>
        ) : null}
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
              distance: set.distance ?? null,
              duration: set.duration ?? null,
            }}
            lastReference={null}
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
          busy={createSet.isPending}
          onCreate={(input) =>
            createSet.mutate(toSetBody(input, exercise.sets.length))
          }
          onUpdate={() => {}}
          onDelete={() => {}}
        />
      </View>
    </View>
  );
}