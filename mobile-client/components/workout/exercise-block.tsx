import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import type { RecentExercise } from '@/lib/api';
import type { ExerciseMode, TrainingSessionExercise, TrainingSessionExerciseSet } from '@wot/types';
import { defaultUserSettings } from '@wot/types';
import { PillChip } from '@/components/ui/pill-chip';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import {
  useCreateExerciseSet,
  useCreateRestTime,
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
import { ExerciseConfigSheet, useWriteExerciseConfig } from './exercise-config-sheet';
import {
  LoggedSetRow,
  NextSetCard,
  formatClock,
  isIntensity,
  type DurationUnit,
  type SetFieldKey,
  type SetInput,
} from './set-row';

const MODES: ExerciseMode[] = ['strength', 'cardio', 'flexibility'];
const MAX_INPUTS = 4;
const UNDO_MS = 5000;

type ExerciseBlockProps = {
  sessionId: string;
  exercise: TrainingSessionExercise & { sets: TrainingSessionExerciseSet[] };
  recent?: RecentExercise | null;
  /** Names of the other exercises in this one's superset. */
  supersetPartners: string[];
  /** Superset groups offered in the cog sheet. */
  supersetOptions: number[];
  /** The exercise being worked on: its next set gets the card surface. */
  active: boolean;
  onActivate: () => void;
  /** Long-press on the exercise name starts dragging (reorder, native only). */
  onNameLongPress?: () => void;
  /** True while this block is being dragged. */
  isDragging?: boolean;
};

const setValues = (set: TrainingSessionExerciseSet): SetInput => ({
  weight: set.weight ?? null,
  reps: set.reps ?? null,
  rir: set.rir ?? null,
  rpe: set.rpe ?? null,
  distance: set.distance ?? null,
  duration: set.duration ?? null,
});

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

// One exercise of the active workout: name + cog, a quiet meta line, the
// logged sets as a ledger and the next-set card. Everything secondary
// (superset, type, inputs, tempo, tags, body parts, remove) is in the cog sheet.
// docs/ui-designs/wot-active-workout-redesign
export function ExerciseBlock({
  sessionId,
  exercise,
  recent,
  supersetPartners,
  supersetOptions,
  active,
  onActivate,
  onNameLongPress,
  isDragging,
}: ExerciseBlockProps) {
  const createSet = useCreateExerciseSet(sessionId, exercise.id);
  const createRestTime = useCreateRestTime(sessionId);
  const updateSet = useUpdateExerciseSet(sessionId, exercise.id);
  const deleteSet = useDeleteExerciseSet(sessionId, exercise.id);
  const updateExercise = useUpdateExercise(sessionId);
  const renameExercises = useRenameExercises();
  const writeConfig = useWriteExerciseConfig(exercise.name);
  const [configVisible, setConfigVisible] = useState(false);
  const [intensityToggled, setIntensityToggled] = useState(false);
  const [intensityOverride, setIntensityOverride] = useState<'rir' | 'rpe' | null>(null);

  // Per-exercise config (cog menu) -> global per-mode settings -> built-in
  // defaults. A custom config renders exactly its field list; the inherited
  // path keeps the "+ RIR" reveal and rir⇄rpe flip as local state.
  const { data: configMap } = useExerciseConfigMap();
  const { data: userSettings } = useSettings();
  const config = configMap?.get(exercise.name) ?? null;
  const mode: ExerciseMode = config?.mode ?? 'strength';
  // Config 'durationMin' is the duration column typed in minutes.
  const customFields: SetFieldKey[] | null =
    config?.fields?.map((f) => (f === 'durationMin' ? 'duration' : f)) ?? null;
  const durationUnit: DurationUnit = config?.fields
    ? config.fields.includes('durationMin') ? 'min' : 'sec'
    : mode === 'cardio' ? 'min' : 'sec';

  // The intensity input stays visible once it has been used on this exercise
  // (this session or via the recents of an earlier one), or once the user
  // asked for it. RIR is the default; the flip switches between RIR/RPE.
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
    !customFields && mode === 'strength' && showIntensity && !baseFields.includes(intensity)
      ? [...baseFields, intensity]
      : baseFields;

  const canAddIntensity =
    mode === 'strength' && !fields.some(isIntensity) && fields.length < MAX_INPUTS;
  const addIntensity = config?.fields
    ? () => writeConfig({ fields: [...config.fields!, 'rir'] })
    : () => setIntensityToggled(true);
  const flipIntensity = config?.fields
    ? () =>
        writeConfig({
          fields: config.fields!.map((f) => (f === 'rir' ? 'rpe' : f === 'rpe' ? 'rir' : f)),
        })
    : () => setIntensityOverride(intensity === 'rir' ? 'rpe' : 'rir');

  // Rest clock: started after a logged set (unless switched off for this
  // exercise) and shown under this exercise's next set while it runs.
  const rest = useRestTimerStore();
  const restHere =
    rest.sessionId === sessionId &&
    rest.startedAtMs !== null &&
    exercise.sets.some((s) => s.id === rest.previousSetId);

  const logSet = async (input: SetInput) => {
    onActivate();
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
    if (setBeforeId && restFromMs !== null) {
      createRestTime.mutate({
        setBeforeId,
        setAfterId: created.id,
        fromAt: new Date(restFromMs).toISOString(),
        tillAt: new Date().toISOString(),
      });
    }
    const store = useRestTimerStore.getState();
    if (config?.restTimer === false) store.stop();
    else store.start(sessionId, created.id);
  };

  // Long-press delete hides the set at once and offers Undo; the delete is
  // sent when the window closes (or the block unmounts).
  const [pendingDelete, setPendingDelete] = useState<{ id: string; n: number } | null>(null);
  // Refs keep the timers stable: the mutation object changes every render.
  const pendingRef = useRef(pendingDelete);
  pendingRef.current = pendingDelete;
  const deleteRef = useRef(deleteSet.mutate);
  deleteRef.current = deleteSet.mutate;
  useEffect(() => {
    if (!pendingDelete) return;
    const id = setTimeout(() => {
      deleteRef.current(pendingDelete.id);
      setPendingDelete(null);
    }, UNDO_MS);
    return () => clearTimeout(id);
  }, [pendingDelete]);
  useEffect(
    () => () => {
      if (pendingRef.current) deleteRef.current(pendingRef.current.id);
    },
    [],
  );
  const requestDelete = (setId: string, n: number) => {
    if (pendingDelete) deleteSet.mutate(pendingDelete.id); // one undo at a time
    setPendingDelete({ id: setId, n });
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

  const lastReference =
    recent?.lastSet.weight != null || recent?.lastSet.reps != null
      ? `${recent.lastSet.weight ?? '—'} × ${recent.lastSet.reps ?? '—'}`
      : null;
  const visibleSets = exercise.sets.filter((s) => s.id !== pendingDelete?.id);
  const lastSet = visibleSets.at(-1);

  const supersetLabel =
    exercise.supersetGroup != null
      ? `Superset ${exercise.supersetGroup}${supersetPartners.length ? ` with ${supersetPartners.join(', ')}` : ''}`
      : null;
  const meta = [
    config?.tempo,
    exercise.bodyParts?.length ? bodyPartsLabelText(exercise.bodyParts) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View
      className="border-b border-border pb-6 pt-7"
      style={isDragging ? { opacity: 0.85 } : undefined}
    >
      <View className="flex-row items-start gap-1">
        {editingName ? (
          <TextInput
            value={nameDraft}
            onChangeText={setNameDraft}
            onBlur={() => void commitName()}
            onSubmitEditing={() => void commitName()}
            autoFocus
            autoCapitalize="words"
            className="min-w-0 flex-1 border-b border-primary pb-0.5 font-heading text-[26px] leading-[30px] tracking-[-0.8px] text-foreground"
          />
        ) : (
          <Pressable
            className="min-w-0 flex-1"
            onPress={() => {
              setNameDraft(exercise.name);
              setEditingName(true);
            }}
            onLongPress={onNameLongPress}
            delayLongPress={1000}
          >
            <Text className="font-heading text-[26px] leading-[30px] tracking-[-0.8px] text-foreground">
              {exercise.name}
            </Text>
          </Pressable>
        )}
        <Pressable
          onPress={() => setConfigVisible(true)}
          accessibilityLabel="Exercise settings"
          className="-mr-3.5 -mt-[7px] h-11 w-11 items-center justify-center"
        >
          <IconSymbol name="gearshape.fill" size={16} color={Colors.faint} />
        </Pressable>
      </View>

      {supersetLabel || meta ? (
        <View className="mt-1.5 flex-row flex-wrap items-center gap-x-2.5 gap-y-1.5 pr-7">
          {supersetLabel ? (
            <Text className="font-body-medium text-[9px] uppercase leading-4 tracking-[2px] text-primary">
              {supersetLabel}
            </Text>
          ) : null}
          {meta ? (
            <Text className="font-body text-[9px] uppercase leading-4 tracking-[2px] text-muted-foreground">
              {meta}
            </Text>
          ) : null}
        </View>
      ) : null}

      {error ? <Text className="mt-2 font-body text-[12px] text-destructive">{error}</Text> : null}

      {renameFrom && renameCandidates.length > 0 ? (
        <View className="mt-3.5 gap-2.5 rounded-xl bg-surface-container-low px-3.5 py-3">
          <Text className="font-body text-[13px] leading-[18px] text-on-surface-variant">
            Also rename {renameCandidates.map((name) => `“${name}”`).join(', ')} to “{renameTo}” in
            past workouts?
          </Text>
          <View className="flex-row gap-5">
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

      {/* Type matters before the first set (it sets the inputs); later it
          lives in the cog sheet. */}
      {exercise.sets.length === 0 ? (
        <View className="mt-3.5 flex-row flex-wrap gap-2">
          {MODES.map((m) => (
            <PillChip
              key={m}
              label={m}
              selected={mode === m}
              onPress={() => writeConfig({ mode: m, fields: null })}
            />
          ))}
        </View>
      ) : null}

      <View className="mt-3.5">
        {visibleSets.map((set, i) => (
          <LoggedSetRow
            key={set.id}
            setNumber={i + 1}
            fields={fields}
            durationUnit={durationUnit}
            values={setValues(set)}
            onUpdate={(input) => updateSet.mutate({ setId: set.id, body: toSetBody(input, i) })}
            onDelete={() => requestDelete(set.id, i + 1)}
          />
        ))}

        {pendingDelete ? (
          <View className="flex-row items-center gap-4 px-3 py-2">
            <Text className="font-body text-[12px] text-muted-foreground">
              Set {pendingDelete.n} removed.
            </Text>
            <Pressable onPress={() => setPendingDelete(null)} hitSlop={8} className="py-1">
              <Text className="font-body text-[10px] uppercase tracking-[2px] text-primary">Undo</Text>
            </Pressable>
          </View>
        ) : null}

        <NextSetCard
          key={`next-${exercise.sets.length}`}
          setNumber={visibleSets.length + 1}
          fields={fields}
          durationUnit={durationUnit}
          lastReference={lastReference}
          previousValues={lastSet ? setValues(lastSet) : null}
          active={active}
          busy={createSet.isPending}
          onActivate={onActivate}
          onAddIntensity={canAddIntensity ? addIntensity : undefined}
          onFlipIntensity={flipIntensity}
          onCreate={(input) => void logSet(input)}
          rest={restHere ? <RestLine startedAtMs={rest.startedAtMs!} onStop={rest.stop} /> : null}
        />
      </View>

      <ExerciseConfigSheet
        visible={configVisible}
        onClose={() => setConfigVisible(false)}
        sessionId={sessionId}
        exerciseId={exercise.id}
        exerciseName={exercise.name}
        resolvedFields={fields.map((f) => (f === 'duration' && durationUnit === 'min' ? 'durationMin' : f))}
        mode={mode}
        currentBodyParts={exercise.bodyParts ?? []}
        supersetGroup={exercise.supersetGroup ?? null}
        supersetOptions={supersetOptions}
      />
    </View>
  );
}

// Rest clock under the inputs of the exercise just logged — where the eyes
// already are. Ticks on its own so only this line re-renders.
function RestLine({ startedAtMs, onStop }: { startedAtMs: number; onStop: () => void }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <View className="mt-2 flex-row items-center gap-2.5 border-t border-border pt-1.5">
      <Text className="font-body text-[9px] uppercase tracking-[2px] text-muted-foreground">Rest</Text>
      <Text className="font-heading text-[18px] text-foreground" style={{ fontVariant: ['tabular-nums'] }}>
        {formatClock(Math.max(0, Math.floor((now - startedAtMs) / 1000)))}
      </Text>
      <View className="flex-1" />
      <Pressable onPress={onStop} accessibilityLabel="Stop rest timer" className="h-8 justify-center px-1">
        <Text className="font-body text-[9px] uppercase tracking-[2px] text-on-surface-variant">Stop ■</Text>
      </Pressable>
    </View>
  );
}
