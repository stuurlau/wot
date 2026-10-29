import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import type { RecentExercise } from '@/lib/api';
import type { TrainingSessionExercise, TrainingSessionExerciseSet } from '@wot/types';
import { defaultUserSettings } from '@wot/types';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import {
  useCreateExerciseSet,
  useCreateRestTime,
  useDeleteExercise,
  useDeleteExerciseSet,
  useExerciseConfigMap,
  useExerciseNames,
  useRenameExercises,
  useSettings,
  useUpdateExercise,
  useUpdateExerciseSet,
} from '@/hooks/api';
import { findSimilarNames } from '@/lib/similarity';
import { bodyPartsLabelText } from '@/lib/body-parts';
import { useRestTimerStore } from '@/stores/rest-timer-store';
import { ExerciseConfigSheet } from './exercise-config-sheet';
import { SetRow, type DurationUnit, type SetFieldKey, type SetInput, type SetMode } from './set-row';

type ExerciseBlockProps = {
  sessionId: string;
  exercise: TrainingSessionExercise & { sets: TrainingSessionExerciseSet[] };
  recent?: RecentExercise | null;
  /** Group the exercise moves to when its superset badge is pressed. */
  nextSupersetGroup: number | null;
  /** Long-press on the exercise name starts dragging (reorder). */
  onNameLongPress?: () => void;
  /** True while this block is being dragged. */
  isDragging?: boolean;
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

export function ExerciseBlock({ sessionId, exercise, recent, nextSupersetGroup, onNameLongPress, isDragging }: ExerciseBlockProps) {
  const [mode, setMode] = useState<SetMode>('strength');
  const createSet = useCreateExerciseSet(sessionId, exercise.id);
  const createRestTime = useCreateRestTime(sessionId);
  const updateSet = useUpdateExerciseSet(sessionId, exercise.id);
  const deleteSet = useDeleteExerciseSet(sessionId, exercise.id);
  const updateExercise = useUpdateExercise(sessionId);
  const deleteExercise = useDeleteExercise(sessionId);
  const renameExercises = useRenameExercises();
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [configVisible, setConfigVisible] = useState(false);
  const [intensityToggled, setIntensityToggled] = useState(false);
  const [intensityOverride, setIntensityOverride] = useState<'rir' | 'rpe' | null>(null);

  // Per-exercise config (cog menu) -> global per-mode settings -> built-in
  // defaults. A custom config renders exactly its field list (flat,
  // unrestricted); only the inherited path keeps the legacy intensity
  // reveal/flip quick toggles.
  const { data: configMap } = useExerciseConfigMap();
  const { data: userSettings } = useSettings();
  const config = configMap?.get(exercise.name) ?? null;
  // Config 'durationMin' is the duration column typed in minutes.
  const customFields: SetFieldKey[] | null =
    config?.fields?.map((f) => (f === 'durationMin' ? 'duration' : f)) ?? null;
  const hasCustomFields = customFields !== null;
  const durationUnit: DurationUnit = config?.fields
    ? config.fields.includes('durationMin') ? 'min' : 'sec'
    : mode === 'cardio' ? 'min' : 'sec';

  // The intensity input stays visible once it has been used on this exercise
  // (this session or via the recents of an earlier one), or once the user
  // asked for it. RIR is the default; the label press flips between RIR/RPE.
  const hasRir = exercise.sets.some((s) => s.rir != null) || recent?.lastSet.rir != null;
  const hasRpe = exercise.sets.some((s) => s.rpe != null) || recent?.lastSet.rpe != null;
  const showIntensity = intensityToggled || hasRir || hasRpe;
  const intensity = intensityOverride ?? (hasRpe && !hasRir ? 'rpe' : 'rir');

  const baseFields: SetFieldKey[] =
    customFields ??
    (mode === 'strength'
      ? [...(userSettings?.strengthFields ?? defaultUserSettings.strengthFields)]
      : mode === 'cardio'
        ? [...(userSettings?.cardioFields ?? defaultUserSettings.cardioFields)]
        : ['duration', 'weight']); // flexibility: holds, optionally weighted
  const fields: SetFieldKey[] =
    !hasCustomFields && mode === 'strength' && showIntensity && !baseFields.includes(intensity)
      ? [...baseFields, intensity]
      : baseFields;
  const setRowToggles = hasCustomFields
    ? {}
    : mode === 'strength'
      ? {
          onShowIntensity: showIntensity ? undefined : () => setIntensityToggled(true),
          onFlipIntensity: showIntensity
            ? () => setIntensityOverride(intensity === 'rir' ? 'rpe' : 'rir')
            : undefined,
        }
      : {};

  const logSet = async (input: SetInput) => {
    const rest = useRestTimerStore.getState();
    const restFromMs = rest.sessionId === sessionId ? rest.startedAtMs : null;
    const setBeforeId = rest.sessionId === sessionId ? rest.previousSetId : null;
    let created: TrainingSessionExerciseSet;
    try {
      created = await createSet.mutateAsync({
        ...toSetBody(input, exercise.sets.length),
        // Tempo is configured at exercise level and stamped onto new sets.
        tempo: config?.tempo ?? undefined,
      });
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

  // Inline rename: tap the title to edit, commit on blur/submit. When the
  // name actually changed, offer to rename fuzzy-matched names everywhere.
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [renameFrom, setRenameFrom] = useState<string | null>(null);
  const [renameTo, setRenameTo] = useState('');
  const [error, setError] = useState<string | null>(null);
  // Fuzzy matching runs locally over the cached names, so the rename offer
  // needs no extra round-trip after the rename itself.
  const { data: exerciseNames = [] } = useExerciseNames();
  const renameCandidates = renameFrom
    ? findSimilarNames(renameFrom, exerciseNames).filter((name) => name !== renameTo)
    : [];

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
        rir: lastSet.rir ?? null,
        rpe: lastSet.rpe ?? null,
        distance: lastSet.distance ?? null,
        duration: lastSet.duration ?? null,
      }
    : null;

  return (
    <View className="mb-8" style={isDragging ? { opacity: 0.85 } : undefined}>
      {/* Name + quick actions; meta (tempo · body parts) and Remove wrap below
          so long names and many parts never push the block off-screen. */}
      <View className="flex-row items-center gap-3">
        {editingName ? (
          <TextInput
            value={nameDraft}
            onChangeText={setNameDraft}
            onBlur={() => void commitName()}
            onSubmitEditing={() => void commitName()}
            autoFocus
            autoCapitalize="words"
            className="min-w-0 flex-1 border-b border-primary font-heading text-[26px] leading-[28px] tracking-[-0.8px] text-foreground"
          />
        ) : (
          <Pressable
            className="min-w-0 flex-1"
            hitSlop={4}
            onPress={() => {
              setNameDraft(exercise.name);
              setEditingName(true);
            }}
            onLongPress={onNameLongPress}
            delayLongPress={1000}
          >
            <Text className="font-heading text-[26px] leading-[28px] tracking-[-0.8px] text-foreground">
              {exercise.name}
            </Text>
          </Pressable>
        )}
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
              ? 'rounded-full bg-primary px-2 py-0.5'
              : 'rounded-full bg-surface-container-low px-2 py-0.5'
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
        <Pressable hitSlop={8} onPress={() => setConfigVisible(true)}>
          <IconSymbol name="gearshape.fill" size={15} color={Colors.onSurfaceVariant} />
        </Pressable>
      </View>

      <View className="mb-2 mt-1 flex-row items-baseline gap-3">
        <Text
          className="min-w-0 flex-1 font-body text-[9px] uppercase tracking-[2px] text-muted-foreground"
          numberOfLines={2}
        >
          {[config?.tempo, exercise.bodyParts?.length ? bodyPartsLabelText(exercise.bodyParts) : null]
            .filter(Boolean)
            .join(' · ')}
        </Text>
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

      <View className="mb-2 flex-row flex-wrap gap-2">
        {(['strength', 'cardio', 'flexibility'] as const).map((m) => (
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
            durationUnit={durationUnit}
            values={{
              weight: set.weight ?? null,
              reps: set.reps ?? null,
              rir: set.rir ?? null,
              rpe: set.rpe ?? null,
              distance: set.distance ?? null,
              duration: set.duration ?? null,
            }}
            lastReference={null}
            fields={fields}
            {...setRowToggles}
            busy={updateSet.isPending || deleteSet.isPending}
            onCreate={() => {}}
            onUpdate={(input) => updateSet.mutate({ setId: set.id, body: toSetBody(input, i) })}
            onDelete={() => deleteSet.mutate(set.id)}
          />
        ))}

        <SetRow
          key={`new-${exercise.sets.length}`}
          setNumber={exercise.sets.length + 1}
          durationUnit={durationUnit}
          values={null}
          lastReference={mode === 'strength' ? strengthReference : null}
          previousValues={previousValues}
          fields={fields}
          {...setRowToggles}
          busy={createSet.isPending}
          onCreate={logSet}
          onUpdate={() => {}}
          onDelete={() => {}}
        />
      </View>

      <ExerciseConfigSheet
        visible={configVisible}
        onClose={() => setConfigVisible(false)}
        sessionId={sessionId}
        exerciseId={exercise.id}
        exerciseName={exercise.name}
        resolvedFields={fields.map((f) => (f === 'duration' && durationUnit === 'min' ? 'durationMin' : f))}
        currentBodyParts={exercise.bodyParts ?? []}
      />
    </View>
  );
}
