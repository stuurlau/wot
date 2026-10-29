import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Sheet } from '@/components/ui/sheet';
import {
  useExerciseConfigMap,
  useExerciseTags,
  useSetExerciseConfig,
  useSetExerciseTags,
  useUpdateExercise,
} from '@/hooks/api';
import { bodyPartLabel, bodyPartRoots, type ExerciseConfig, type ExerciseSetField } from '@wot/types';
import { BodyPartPicker } from './body-part-picker';

const FIELD_OPTIONS: { key: ExerciseSetField; label: string }[] = [
  { key: 'weight', label: 'kg' },
  { key: 'reps', label: 'reps' },
  { key: 'rir', label: 'rir' },
  { key: 'rpe', label: 'rpe' },
  { key: 'distance', label: 'km' },
  { key: 'duration', label: 'sec' },
];

type ExerciseConfigSheetProps = {
  visible: boolean;
  onClose: () => void;
  sessionId: string;
  exerciseId: string;
  exerciseName: string;
  /** The set-input fields the exercise currently resolves to (for display). */
  resolvedFields: ExerciseSetField[];
  /** Body parts of this session's exercise instance. */
  currentBodyParts: string[];
};

/**
 * Per-exercise cog menu. Everything auto-saves (app-wide convention): chips
 * write the name-keyed config / tags immediately. Body parts additionally
 * patch the current session instance so the header updates in place.
 */
export function ExerciseConfigSheet({
  visible,
  onClose,
  sessionId,
  exerciseId,
  exerciseName,
  resolvedFields,
  currentBodyParts,
}: ExerciseConfigSheetProps) {
  const { data: configMap } = useExerciseConfigMap();
  const { data: tagsRows = [] } = useExerciseTags();
  const setConfig = useSetExerciseConfig();
  const setTags = useSetExerciseTags();
  const updateExercise = useUpdateExercise(sessionId);

  const config = configMap?.get(exerciseName) ?? null;
  const tags = tagsRows.find((row) => row.exerciseName === exerciseName)?.tags ?? [];

  const [tempoDraft, setTempoDraft] = useState<string | null>(null);
  const [tagDraft, setTagDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (visible) {
      setTempoDraft(null);
      setTagDraft('');
      setError(null);
    }
  }, [visible]);
  const tempo = tempoDraft ?? config?.tempo ?? '';

  const writeConfig = (patch: Partial<ExerciseConfig>) => {
    const current: ExerciseConfig = config ?? { fields: null, tempo: null, bodyParts: null };
    setConfig.mutate(
      { exerciseName, config: { ...current, ...patch } },
      { onError: () => setError("Couldn't save. Check your connection and try again.") },
    );
  };

  const toggleField = (key: ExerciseSetField) => {
    const current = config?.fields ?? resolvedFields;
    const next = current.includes(key) ? current.filter((f) => f !== key) : [...current, key];
    const ordered = FIELD_OPTIONS.filter((o) => next.includes(o.key)).map((o) => o.key);
    if (ordered.length === 0) return; // keep at least one input
    writeConfig({ fields: ordered });
  };

  const commitTempo = () => {
    const trimmed = tempo.trim();
    if (trimmed === (config?.tempo ?? '')) return;
    writeConfig({ tempo: trimmed === '' ? null : trimmed });
  };

  const writeTags = (next: string[]) => {
    setTags.mutate(
      { exerciseName, tags: next },
      { onError: () => setError("Couldn't save tags. Try again.") },
    );
  };

  const addTag = () => {
    const tag = tagDraft.trim().toLowerCase();
    if (tag === '' || tags.includes(tag)) return;
    setTagDraft('');
    writeTags([...tags, tag]);
  };

  // Chips reflect the session instance (what the header shows); an empty
  // instance falls back to the stored default so nothing looks lost.
  const activeParts =
    currentBodyParts.length > 0 ? currentBodyParts : (config?.bodyParts ?? []);
  const togglePart = (part: string) => {
    const next = activeParts.includes(part)
      ? activeParts.filter((p) => p !== part)
      : [...activeParts, part];
    writeConfig({ bodyParts: next.length > 0 ? next : null });
    updateExercise.mutate(
      { exerciseId, body: { bodyParts: next } },
      { onError: () => setError("Couldn't update body parts. Try again.") },
    );
  };

  const countedIn = bodyPartRoots(activeParts).map((r) => bodyPartLabel(r) ?? r);
  const fieldsAreCustom = config?.fields != null;

  return (
    <Sheet visible={visible} onClose={onClose}>
      <Text className="mb-1 font-heading text-[24px] tracking-[-0.6px] text-foreground">
        {exerciseName}
      </Text>
      <Text className="mb-5 font-body text-[13px] leading-5 text-muted-foreground">
        Set inputs, tempo, tags and body parts — remembered for next time you add it.
      </Text>

      <View className="mb-4 flex-row items-baseline justify-between">
        <Text className="font-body text-[10px] uppercase tracking-[2px] text-muted-foreground">
          Set inputs
        </Text>
        {fieldsAreCustom ? (
          <Pressable onPress={() => writeConfig({ fields: null })} hitSlop={8}>
            <Text className="font-body text-[10px] uppercase tracking-[2px] text-primary">
              Reset to automatic
            </Text>
          </Pressable>
        ) : null}
      </View>
      <View className="mb-5 flex-row flex-wrap gap-2">
        {FIELD_OPTIONS.map((option) => {
          const active = (config?.fields ?? resolvedFields).includes(option.key);
          return (
            <Pressable
              key={option.key}
              onPress={() => toggleField(option.key)}
              className={
                active
                  ? 'rounded-full bg-primary px-3 py-1.5'
                  : 'rounded-full bg-surface-container-low px-3 py-1.5'
              }
            >
              <Text
                className={
                  active
                    ? 'font-body text-[11px] uppercase tracking-[2px] text-primary-foreground'
                    : 'font-body text-[11px] uppercase tracking-[2px] text-muted-foreground'
                }
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {!fieldsAreCustom ? (
        <Text className="-mt-3 mb-5 font-body text-[10px] text-muted-foreground">
          Following your settings — tap a field to customize for this exercise.
        </Text>
      ) : null}

      <Text className="mb-2 font-body text-[10px] uppercase tracking-[2px] text-muted-foreground">
        Tempo
      </Text>
      <TextInput
        value={tempo}
        onChangeText={setTempoDraft}
        onBlur={commitTempo}
        onSubmitEditing={commitTempo}
        placeholder="e.g. 3-2-1 (optional)"
        placeholderTextColor="rgba(0,0,0,0.3)"
        autoCapitalize="none"
        className="mb-5 border-b border-border pb-1 font-body text-[16px] text-foreground"
      />

      <Text className="mb-2 font-body text-[10px] uppercase tracking-[2px] text-muted-foreground">
        Tags
      </Text>
      <View className="mb-2 flex-row flex-wrap items-center gap-2">
        {tags.map((tag) => (
          <Pressable
            key={tag}
            onPress={() => writeTags(tags.filter((t) => t !== tag))}
            className="rounded-full bg-primary px-3 py-1.5"
          >
            <Text className="font-body text-[11px] uppercase tracking-[2px] text-primary-foreground">
              {tag} ✕
            </Text>
          </Pressable>
        ))}
        <TextInput
          value={tagDraft}
          onChangeText={setTagDraft}
          onSubmitEditing={addTag}
          placeholder="+ tag"
          placeholderTextColor="rgba(0,0,0,0.3)"
          autoCapitalize="none"
          returnKeyType="done"
          className="min-w-[80px] border-b border-border pb-1 font-body text-[14px] text-foreground"
        />
      </View>

      <Text className="mb-2 mt-3 font-body text-[10px] uppercase tracking-[2px] text-muted-foreground">
        Body parts
      </Text>
      <BodyPartPicker selected={activeParts} onToggle={togglePart} />
      {countedIn.length > 0 ? (
        <Text className="mb-2 font-body text-[11px] text-muted-foreground">
          Counts in: <Text className="text-foreground">{countedIn.join(' · ')}</Text>
        </Text>
      ) : null}

      {error ? (
        <Text className="mt-2 font-body text-[12px] text-destructive">{error}</Text>
      ) : null}
    </Sheet>
  );
}
