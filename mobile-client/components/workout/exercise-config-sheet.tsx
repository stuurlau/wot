import { useEffect, useState, type ReactNode } from 'react';
import { Platform, Pressable, Text, TextInput, View } from 'react-native';

import { PillChip } from '@/components/ui/pill-chip';
import { Sheet } from '@/components/ui/sheet';
import {
  useDeleteExercise,
  useExerciseConfigMap,
  useExerciseTags,
  useSetExerciseConfig,
  useSetExerciseTags,
  useUpdateExercise,
} from '@/hooks/api';
import { DEFAULT_TAGS } from '@/lib/insights';
import type { ExerciseConfig, ExerciseMode, ExerciseSetField } from '@wot/types';
import { BodyPartPicker } from './body-part-picker';

const MODES: ExerciseMode[] = ['strength', 'cardio', 'flexibility'];
const MAX_INPUTS = 4;

const FIELD_OPTIONS: { key: ExerciseSetField; label: string }[] = [
  { key: 'weight', label: 'kg' },
  { key: 'reps', label: 'reps' },
  { key: 'rir', label: 'rir' },
  { key: 'rpe', label: 'rpe' },
  { key: 'distance', label: 'km' },
  { key: 'duration', label: 'sec' },
  { key: 'durationMin', label: 'min' },
];

// sec and min write the same duration column — picking one drops the other.
const EXCLUSIVE: Partial<Record<ExerciseSetField, ExerciseSetField>> = {
  duration: 'durationMin',
  durationMin: 'duration',
};

const EMPTY_CONFIG: ExerciseConfig = {
  fields: null,
  tempo: null,
  bodyParts: null,
  mode: null,
  restTimer: null,
};

/** Patch one exercise name's config (PUT replaces the whole config). */
export function useWriteExerciseConfig(exerciseName: string, onError?: () => void) {
  const { data: configMap } = useExerciseConfigMap();
  const setConfig = useSetExerciseConfig();
  const config = configMap?.get(exerciseName) ?? null;
  return (patch: Partial<ExerciseConfig>) =>
    setConfig.mutate(
      { exerciseName, config: { ...EMPTY_CONFIG, ...config, ...patch } },
      { onError },
    );
}

type ExerciseConfigSheetProps = {
  visible: boolean;
  onClose: () => void;
  sessionId: string;
  exerciseId: string;
  exerciseName: string;
  /** The set-input fields the exercise currently resolves to (for display). */
  resolvedFields: ExerciseSetField[];
  mode: ExerciseMode;
  /** Body parts of this session's exercise instance. */
  currentBodyParts: string[];
  supersetGroup: number | null;
  /** Groups offered as chips (besides None). */
  supersetOptions: number[];
};

/**
 * Per-exercise cog menu: everything secondary about an exercise lives here so
 * the block itself stays calm. Auto-saves (app-wide convention): chips write
 * the name-keyed config / tags immediately; superset and body parts also
 * patch this session's instance.
 */
export function ExerciseConfigSheet({
  visible,
  onClose,
  sessionId,
  exerciseId,
  exerciseName,
  resolvedFields,
  mode,
  currentBodyParts,
  supersetGroup,
  supersetOptions,
}: ExerciseConfigSheetProps) {
  const { data: configMap } = useExerciseConfigMap();
  const { data: tagsRows = [] } = useExerciseTags();
  const setTags = useSetExerciseTags();
  const updateExercise = useUpdateExercise(sessionId);
  const deleteExercise = useDeleteExerciseOnce(sessionId, exerciseId, onClose);

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
  const onSaveError = () => setError("Couldn't save. Check your connection and try again.");
  const writeConfig = useWriteExerciseConfig(exerciseName, onSaveError);

  const fields = config?.fields ?? resolvedFields;
  const toggleField = (key: ExerciseSetField) => {
    const next = fields.includes(key)
      ? fields.filter((f) => f !== key)
      : [...fields.filter((f) => f !== EXCLUSIVE[key]), key];
    if (next.length === 0 || next.length > MAX_INPUTS) return;
    writeConfig({ fields: FIELD_OPTIONS.map((o) => o.key).filter((k) => next.includes(k)) });
  };

  const commitTempo = () => {
    const trimmed = tempo.trim();
    if (trimmed === (config?.tempo ?? '')) return;
    writeConfig({ tempo: trimmed === '' ? null : trimmed });
  };

  const writeTags = (next: string[]) =>
    setTags.mutate({ exerciseName, tags: next }, { onError: onSaveError });
  const toggleTag = (tag: string) =>
    writeTags(tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag]);
  const addTag = () => {
    const tag = tagDraft.trim().toLowerCase();
    setTagDraft('');
    if (tag !== '' && !tags.includes(tag)) writeTags([...tags, tag]);
  };

  // Chips reflect the session instance (what the header shows); an empty
  // instance falls back to the stored default so nothing looks lost.
  const activeParts = currentBodyParts.length > 0 ? currentBodyParts : (config?.bodyParts ?? []);
  const togglePart = (part: string) => {
    const next = activeParts.includes(part)
      ? activeParts.filter((p) => p !== part)
      : [...activeParts, part];
    writeConfig({ bodyParts: next.length > 0 ? next : null });
    updateExercise.mutate({ exerciseId, body: { bodyParts: next } }, { onError: onSaveError });
  };

  const setSuperset = (group: number | null) =>
    updateExercise.mutate({ exerciseId, body: { supersetGroup: group } }, { onError: onSaveError });

  const restOn = config?.restTimer !== false;

  return (
    <Sheet visible={visible} onClose={onClose}>
      <Text className="mb-5 font-heading text-[24px] tracking-[-0.6px] text-foreground">
        {exerciseName}
      </Text>

      <View className="gap-[22px]">
        <Section label="Superset">
          <ChipRow>
            <PillChip label="None" selected={supersetGroup == null} onPress={() => setSuperset(null)} />
            {supersetOptions.map((g) => (
              <PillChip
                key={g}
                label={`Superset ${g}`}
                selected={supersetGroup === g}
                onPress={() => setSuperset(g)}
              />
            ))}
          </ChipRow>
        </Section>

        <Section label="Type">
          <ChipRow>
            {MODES.map((m) => (
              <PillChip
                key={m}
                label={m}
                selected={mode === m}
                // A new type resets the set inputs to that type's defaults.
                onPress={() => writeConfig({ mode: m, fields: null })}
              />
            ))}
          </ChipRow>
        </Section>

        <Section
          label={`Set inputs · up to ${MAX_INPUTS}`}
          action={
            config?.fields ? (
              <Pressable onPress={() => writeConfig({ fields: null })} hitSlop={8}>
                <Text className="font-body text-[10px] uppercase tracking-[2px] text-primary">Reset</Text>
              </Pressable>
            ) : null
          }
        >
          <ChipRow>
            {FIELD_OPTIONS.map((o) => (
              <PillChip
                key={o.key}
                label={o.label}
                selected={fields.includes(o.key)}
                onPress={() => toggleField(o.key)}
              />
            ))}
          </ChipRow>
        </Section>

        <InlineRow label="Rest timer after a set">
          <View className="flex-row gap-2">
            <PillChip label="On" selected={restOn} onPress={() => writeConfig({ restTimer: null })} />
            <PillChip label="Off" selected={!restOn} onPress={() => writeConfig({ restTimer: false })} />
          </View>
        </InlineRow>

        <InlineRow label="Tempo">
          <TextInput
            value={tempo}
            onChangeText={setTempoDraft}
            onBlur={commitTempo}
            onSubmitEditing={commitTempo}
            placeholder="3-2-1"
            placeholderTextColor="rgba(0,0,0,0.3)"
            autoCapitalize="none"
            className="w-[110px] border-b pb-1 text-right font-heading text-[22px] text-foreground"
            style={{ borderBottomColor: 'rgba(0,0,0,0.15)', fontVariant: ['tabular-nums'] }}
          />
        </InlineRow>

        <Section label="Tags">
          <ChipRow>
            {[...DEFAULT_TAGS, ...tags.filter((t) => !DEFAULT_TAGS.includes(t))].map((t) => (
              <PillChip key={t} label={t} selected={tags.includes(t)} onPress={() => toggleTag(t)} />
            ))}
            <TextInput
              value={tagDraft}
              onChangeText={setTagDraft}
              onSubmitEditing={addTag}
              placeholder="+ tag"
              placeholderTextColor="rgba(0,0,0,0.3)"
              autoCapitalize="none"
              returnKeyType="done"
              className="w-[72px] border-b py-0.5 font-body text-[12px] text-foreground"
              style={{ borderBottomColor: 'rgba(0,0,0,0.15)' }}
            />
          </ChipRow>
        </Section>

        <Section label="Body parts">
          <BodyPartPicker selected={activeParts} onToggle={togglePart} />
        </Section>

        {error ? <Text className="font-body text-[12px] text-destructive">{error}</Text> : null}

        <View className="flex-row items-center justify-between gap-4 border-t border-border pt-4">
          <Text className="flex-1 font-body text-[12px] leading-4 text-faint">
            {/* Drag reorder is native-only (see exercise-list.web.tsx). */}
            {Platform.OS === 'web' ? '' : 'Hold the name to drag and reorder.'}
          </Text>
          <Pressable onPress={deleteExercise.press} hitSlop={8} className="py-2">
            <Text
              className={`font-body text-[10px] uppercase tracking-[2px] ${
                deleteExercise.confirming ? 'text-destructive' : 'text-muted-foreground'
              }`}
            >
              {deleteExercise.confirming ? 'Tap again to remove' : 'Remove exercise'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Sheet>
  );
}

// Two-tap remove (no dialog): first tap arms for 3 s, second removes.
function useDeleteExerciseOnce(sessionId: string, exerciseId: string, onDone: () => void) {
  const deleteExercise = useDeleteExercise(sessionId);
  const [confirming, setConfirming] = useState(false);
  useEffect(() => {
    if (!confirming) return;
    const id = setTimeout(() => setConfirming(false), 3000);
    return () => clearTimeout(id);
  }, [confirming]);
  const press = () => {
    if (!confirming) return setConfirming(true);
    setConfirming(false);
    onDone();
    deleteExercise.mutate(exerciseId);
  };
  return { confirming, press };
}

const SECTION_LABEL = 'font-body text-[10px] uppercase tracking-[2px] text-muted-foreground';

function Section({ label, action, children }: { label: string; action?: ReactNode; children: ReactNode }) {
  return (
    <View>
      <View className="mb-2 flex-row items-baseline justify-between">
        <Text className={SECTION_LABEL}>{label}</Text>
        {action}
      </View>
      {children}
    </View>
  );
}

function InlineRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="flex-row items-end justify-between gap-4">
      <Text className={`${SECTION_LABEL} flex-1`}>{label}</Text>
      {children}
    </View>
  );
}

function ChipRow({ children }: { children: ReactNode }) {
  return <View className="flex-row flex-wrap items-center gap-2">{children}</View>;
}
