import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import type { RecentExercise } from '@/lib/api';
import type { TrainingSessionExercise, TrainingSessionExerciseSet } from '@wot/types';
import {
  useCreateExerciseSet,
  useDeleteExercise,
  useDeleteExerciseSet,
  useRenameExercises,
  useSimilarExercises,
  useUpdateExercise,
  useUpdateExerciseSet,
} from '@/hooks/api';
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
  const deleteExercise = useDeleteExercise(sessionId);
  const updateExercise = useUpdateExercise(sessionId);
  const renameExercises = useRenameExercises();
  const [confirmRemove, setConfirmRemove] = useState(false);

  // Inline rename: tap the title to edit, commit on blur/submit. When the
  // name actually changed, offer to rename fuzzy-matched names everywhere.
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [renameFrom, setRenameFrom] = useState<string | null>(null);
  const [renameTo, setRenameTo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const similar = useSimilarExercises(renameFrom);
  const renameCandidates = (similar.data ?? []).filter((name) => name !== renameTo);

  const commitName = async () => {
    setEditingName(false);
    const trimmed = nameDraft.trim();
    if (trimmed === '' || trimmed === exercise.name) return;
    setError(null);
    try {
      await updateExercise.mutateAsync({ exerciseId: exercise.id, body: { name: trimmed } });
    } catch {
      setError("Couldn't rename the exercise. Try again.");
      return;
    }
    setRenameTo(trimmed);
    setRenameFrom(exercise.name);
  };

  const confirmRenameAll = async () => {
    setError(null);
    try {
      await renameExercises.mutateAsync({ from: renameCandidates, to: renameTo });
    } catch {
      setError("Couldn't rename everywhere. Try again.");
      return;
    }
    setRenameFrom(null);
  };

  const strengthReference =
    recent?.lastSet.weight != null || recent?.lastSet.reps != null
      ? `${recent.lastSet.weight ?? '—'} × ${recent.lastSet.reps ?? '—'}`
      : null;

  const lastSet = exercise.sets.at(-1) ?? null;
  const previousValues: SetInput | null = lastSet
    ? {
        weight: lastSet.weight ?? null,
        reps: lastSet.reps ?? null,
        distance: lastSet.distance ?? null,
        duration: lastSet.duration ?? null,
      }
    : null;

  return (
    <View className="mb-8">
      <View className="mb-1 flex-row items-baseline justify-between">
        {editingName ? (
          <TextInput
            value={nameDraft}
            onChangeText={setNameDraft}
            onBlur={() => void commitName()}
            onSubmitEditing={() => void commitName()}
            autoFocus
            autoCapitalize="words"
            className="flex-1 border-b border-primary font-heading text-[26px] leading-[28px] tracking-[-0.8px] text-foreground"
          />
        ) : (
          <Pressable
            className="flex-1"
            hitSlop={4}
            onPress={() => {
              setNameDraft(exercise.name);
              setEditingName(true);
            }}
          >
            <Text className="font-heading text-[26px] leading-[28px] tracking-[-0.8px] text-foreground">
              {exercise.name}
            </Text>
          </Pressable>
        )}
        <View className="flex-row items-baseline gap-3">
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

      {error ? (
        <Text className="mb-2 font-body text-[12px] text-destructive">{error}</Text>
      ) : null}

      {renameFrom && renameCandidates.length > 0 ? (
        <View className="mb-2 rounded-xl bg-surface-container-low px-3 py-2">
          <Text className="mb-2 font-body text-[11px] leading-4 text-foreground">
            Also rename {renameCandidates.map((name) => `“${name}”`).join(', ')} to “{renameTo}”
            in past workouts?
          </Text>
          <View className="flex-row gap-4">
            <Pressable
              onPress={() => void confirmRenameAll()}
              disabled={renameExercises.isPending}
              hitSlop={8}
            >
              <Text className="font-body text-[10px] uppercase tracking-[2px] text-primary">
                {renameExercises.isPending ? 'Renaming…' : 'Rename all'}
              </Text>
            </Pressable>
            <Pressable onPress={() => setRenameFrom(null)} hitSlop={8}>
              <Text className="font-body text-[10px] uppercase tracking-[2px] text-muted-foreground">
                Dismiss
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}

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
          previousValues={previousValues}
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
