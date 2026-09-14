import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';

export type SetInput = {
  weight: number | null;
  reps: number | null;
  distance: number | null;
  duration: number | null;
};

type FieldDef = { key: keyof SetInput; label: string };

type SetRowProps = {
  setNumber: number;
  mode: 'strength' | 'cardio';
  values: SetInput | null; // null => empty "add next set" row
  lastReference: string | null;
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
  busy,
  onCreate,
  onUpdate,
  onDelete,
}: SetRowProps) {
  const fields = mode === 'strength' ? STRENGTH_FIELDS : CARDIO_FIELDS;
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [editKey, setEditKey] = useState<keyof SetInput | null>(null);
  const [editValue, setEditValue] = useState('');

  const commitEdit = (key: keyof SetInput) => {
    setEditKey(null);
    if (values === null) return;
    const input: SetInput =
      mode === 'strength'
        ? {
            weight: key === 'weight' ? toNumber(editValue) : values.weight,
            reps: key === 'reps' ? toNumber(editValue) : values.reps,
            distance: null,
            duration: null,
          }
        : {
            weight: null,
            reps: null,
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
                  className="min-w-[56px] border-b border-primary pb-0.5 text-right font-body-medium text-[16px] text-foreground"
                  style={{ fontVariant: ['tabular-nums'] }}
                />
              );
            }
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
                <Text className="text-center font-body text-[9px] uppercase tracking-[2px] text-muted-foreground">
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="ml-3 font-body text-[12px] tracking-[2px] text-primary">✓</Text>
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
        {fields.map((f) => (
          <TextInput
            key={f.key}
            value={draft[f.key] ?? ''}
            onChangeText={(t) => setDraft((p) => ({ ...p, [f.key]: t }))}
            placeholder={f.label}
            placeholderTextColor="rgba(0,0,0,0.3)"
            keyboardType="numeric"
            className="min-w-[56px] border-b border-border pb-0.5 text-right font-body-medium text-[16px] text-foreground"
            style={{ fontVariant: ['tabular-nums'] }}
          />
        ))}

        {lastReference ? (
          <Text className="ml-1 max-w-[120px] font-body text-[10px] text-muted-foreground">
            last {lastReference}
          </Text>
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
                    distance: null,
                    duration: null,
                  }
                : {
                    weight: null,
                    reps: null,
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