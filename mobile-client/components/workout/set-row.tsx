import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';

export type SetInput = {
  weight: number | null;
  reps: number | null;
  rir: number | null;
  rpe: number | null;
  distance: number | null;
  duration: number | null;
};

type FieldDef = { key: keyof SetInput; label: string };

type SetRowProps = {
  setNumber: number;
  mode: 'strength' | 'cardio';
  values: SetInput | null; // null => empty "add next set" row
  lastReference: string | null;
  previousValues?: SetInput | null; // previous set of this exercise, for Copy
  showIntensity: boolean;
  /** Which effort scale the intensity input writes to. */
  intensity: 'rir' | 'rpe';
  onShowIntensity: () => void;
  onFlipIntensity: () => void;
  busy: boolean;
  onCreate: (input: SetInput) => void;
  onUpdate: (input: SetInput) => void;
  onDelete: () => void;
};

function toNumber(raw: string): number | null {
  const n = Number(raw.replace(',', '.'));
  return raw.trim() === '' || Number.isNaN(n) ? null : n;
}

const STRENGTH_FIELDS: FieldDef[] = [
  { key: 'weight', label: 'kg' },
  { key: 'reps', label: 'reps' },
];

const CARDIO_FIELDS: FieldDef[] = [
  { key: 'distance', label: 'km' },
  { key: 'duration', label: 'min' },
];

export function SetRow({
  setNumber,
  mode,
  values,
  lastReference,
  previousValues,
  showIntensity,
  intensity,
  onShowIntensity,
  onFlipIntensity,
  busy,
  onCreate,
  onUpdate,
  onDelete,
}: SetRowProps) {
  const intensityField: FieldDef = { key: intensity, label: intensity };
  const fields =
    mode === 'strength'
      ? showIntensity
        ? [...STRENGTH_FIELDS, intensityField]
        : STRENGTH_FIELDS
      : CARDIO_FIELDS;
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [editKey, setEditKey] = useState<keyof SetInput | null>(null);
  const [editValue, setEditValue] = useState('');
  // Saved rows keep their ✓/✕ affordances hidden until the row is tapped.
  const [expanded, setExpanded] = useState(false);

  const copyable =
    previousValues != null &&
    (mode === 'strength'
      ? previousValues.weight != null || previousValues.reps != null
      : previousValues.distance != null || previousValues.duration != null);

  const copyPrevious = () => {
    if (!previousValues) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDraft({
      weight: previousValues.weight?.toString() ?? '',
      reps: previousValues.reps?.toString() ?? '',
      rir: previousValues.rir?.toString() ?? '',
      rpe: previousValues.rpe?.toString() ?? '',
      distance: previousValues.distance?.toString() ?? '',
      duration: previousValues.duration?.toString() ?? '',
    });
  };

  const commitEdit = (key: keyof SetInput) => {
    setEditKey(null);
    if (values === null) return;
    const input: SetInput =
      mode === 'strength'
        ? {
            weight: key === 'weight' ? toNumber(editValue) : values.weight,
            reps: key === 'reps' ? toNumber(editValue) : values.reps,
            rir: key === 'rir' ? toNumber(editValue) : values.rir,
            rpe: key === 'rpe' ? toNumber(editValue) : values.rpe,
            distance: null,
            duration: null,
          }
        : {
            weight: null,
            reps: null,
            rir: null,
            rpe: null,
            distance: key === 'distance' ? toNumber(editValue) : values.distance,
            duration: key === 'duration' ? toNumber(editValue) : values.duration,
          };
    onUpdate(input);
  };

  const renderValue = (key: keyof SetInput): string => {
    if (values === null) return '';
    return values[key]?.toString() ?? '';
  };

  if (values !== null) {
    return (
      <Pressable
        className="flex-row items-center justify-between py-2"
        onPress={() => setExpanded((v) => !v)}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onDelete();
        }}
      >
        <Text
          className="w-8 font-body text-[12px] text-muted-foreground"
          style={{ fontVariant: ['tabular-nums'] }}
        >
          {setNumber}
        </Text>

        <View className="flex-1 flex-row items-center justify-end gap-2">
          {fields.map((f) => {
            if (editKey === f.key) {
              return (
                <TextInput
                  key={f.key}
                  value={editValue}
                  onChangeText={setEditValue}
                  onBlur={() => commitEdit(f.key)}
                  onSubmitEditing={() => commitEdit(f.key)}
                  keyboardType="numeric"
                  autoFocus
                  className="min-w-[56px] border-b border-primary pb-0.5 text-right font-heading text-[22px] leading-[24px] text-foreground"
                  style={{ fontVariant: ['tabular-nums'] }}
                />
              );
            }
            const isIntensity = f.key === 'rir' || f.key === 'rpe';
            return (
              <Pressable
                key={f.key}
                onPress={() => {
                  setEditKey(f.key);
                  setEditValue(renderValue(f.key));
                }}
                hitSlop={8}
              >
                <Text
                  className="font-heading text-[22px] leading-[24px] text-foreground"
                  style={{ fontVariant: ['tabular-nums'] }}
                >
                  {renderValue(f.key)}
                </Text>
                {isIntensity ? (
                  <Pressable onPress={onFlipIntensity} hitSlop={8}>
                    <Text className="text-center font-body text-[9px] uppercase tracking-[2px] text-primary">
                      {f.label} ⇄
                    </Text>
                  </Pressable>
                ) : (
                  <Text className="text-center font-body text-[9px] uppercase tracking-[2px] text-muted-foreground">
                    {f.label}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>

        {expanded ? (
          <>
            <Text className="ml-3 font-body text-[12px] tracking-[2px] text-primary">✓</Text>
            <Pressable onPress={onDelete} hitSlop={8} className="ml-2 px-1">
              <Text className="font-body text-[14px] text-muted-foreground">✕</Text>
            </Pressable>
          </>
        ) : null}
      </Pressable>
    );
  }

  // Empty "add next set" row
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text
        className="w-8 font-body text-[12px] text-muted-foreground"
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {setNumber}
      </Text>

      <View className="flex-1 flex-row items-center justify-end gap-2">
        {fields.map((f) => {
          const isIntensity = f.key === 'rir' || f.key === 'rpe';
          const input = (
            <TextInput
              key={f.key}
              value={draft[f.key] ?? ''}
              onChangeText={(t) => setDraft((p) => ({ ...p, [f.key]: t }))}
              placeholder={f.label}
              placeholderTextColor="rgba(0,0,0,0.3)"
              keyboardType="numeric"
              className="min-w-[56px] border-b border-border pb-0.5 text-right font-heading text-[22px] leading-[24px] text-foreground"
              style={{ fontVariant: ['tabular-nums'] }}
            />
          );
          if (!isIntensity) return input;
          return (
            <View key={f.key}>
              {input}
              <Pressable onPress={onFlipIntensity} hitSlop={8}>
                <Text className="text-center font-body text-[9px] uppercase tracking-[2px] text-primary">
                  {f.label} ⇄
                </Text>
              </Pressable>
            </View>
          );
        })}

        {mode === 'strength' && !showIntensity ? (
          <Pressable onPress={onShowIntensity} hitSlop={8} className="ml-1 py-1">
            <Text className="font-body text-[10px] uppercase tracking-[2px] text-muted-foreground">
              + RIR
            </Text>
          </Pressable>
        ) : null}

        {lastReference ? (
          <Text className="ml-1 max-w-[120px] font-body text-[10px] text-muted-foreground">
            last {lastReference}
          </Text>
        ) : null}

        {copyable ? (
          <Pressable onPress={copyPrevious} hitSlop={8} className="ml-1 px-1 py-1">
            <Text className="font-body text-[10px] uppercase tracking-[2px] text-muted-foreground">
              Copy
            </Text>
          </Pressable>
        ) : null}

        <Pressable
          onPress={() => {
            if (busy) return;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const input: SetInput =
              mode === 'strength'
                ? {
                    weight: toNumber(draft.weight ?? ''),
                    reps: toNumber(draft.reps ?? ''),
                    rir: showIntensity && intensity === 'rir' ? toNumber(draft.rir ?? '') : null,
                    rpe: showIntensity && intensity === 'rpe' ? toNumber(draft.rpe ?? '') : null,
                    distance: null,
                    duration: null,
                  }
                : {
                    weight: null,
                    reps: null,
                    rir: null,
                    rpe: null,
                    distance: toNumber(draft.distance ?? ''),
                    duration: toNumber(draft.duration ?? ''),
                  };
            setDraft({});
            onCreate(input);
          }}
          className="ml-2 h-9 w-9 items-center justify-center rounded-full bg-primary"
        >
          <Text className="font-body-bold text-[16px] text-primary-foreground">✓</Text>
        </Pressable>
      </View>
    </View>
  );
}
