import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';

export type SetInput = {
  weight: number | null;
  reps: number | null;
  rir: number | null;
  rpe: number | null;
  distance: number | null;
  /** Whole seconds, matching the API column. */
  duration: number | null;
};

export type SetMode = 'strength' | 'cardio' | 'flexibility';

type FieldDef = { key: keyof SetInput; label: string };

type SetRowProps = {
  setNumber: number;
  mode: SetMode;
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

// Flexibility sets are holds: a duration, optionally weighted ("time ×
// weight"). Leave the weight blank for a plain stretch.
const FLEXIBILITY_FIELDS: FieldDef[] = [
  { key: 'duration', label: 'sec' },
  { key: 'weight', label: 'kg' },
];

// The API stores set duration in whole seconds; cardio enters it in minutes.
const minToSec = (min: number | null) => (min == null ? null : Math.round(min * 60));
const secToMin = (sec: number | null) => (sec == null ? null : Math.round(sec / 6) / 10);

function formatClock(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

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
      : mode === 'cardio'
        ? CARDIO_FIELDS
        : FLEXIBILITY_FIELDS;
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [editKey, setEditKey] = useState<keyof SetInput | null>(null);
  const [editValue, setEditValue] = useState('');
  // Saved rows keep their ✓/✕ affordances hidden until the row is tapped.
  const [expanded, setExpanded] = useState(false);

  // Hold/interval timer on the "add next set" row of time-based modes.
  // Stopping it fills the duration input (sec for flexibility, min for
  // cardio); pressing ✓ while it runs stops it and uses the elapsed time.
  const [timerStartedAt, setTimerStartedAt] = useState<number | null>(null);
  const [timerNow, setTimerNow] = useState(0);
  useEffect(() => {
    if (timerStartedAt === null) return;
    const id = setInterval(() => setTimerNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [timerStartedAt]);
  const timerSec =
    timerStartedAt === null ? 0 : Math.max(0, Math.floor((timerNow - timerStartedAt) / 1000));

  const startTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const now = Date.now();
    setTimerStartedAt(now);
    setTimerNow(now);
  };

  /** Stop the timer, fill the duration draft, and return the exact seconds. */
  const stopTimer = (): number => {
    if (timerStartedAt === null) return 0;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const sec = Math.max(1, Math.round((Date.now() - timerStartedAt) / 1000));
    setTimerStartedAt(null);
    setDraft((p) => ({
      ...p,
      duration: mode === 'cardio' ? String(secToMin(sec)) : String(sec),
    }));
    return sec;
  };

  const copyable =
    previousValues != null &&
    (mode === 'strength'
      ? previousValues.weight != null || previousValues.reps != null
      : mode === 'cardio'
        ? previousValues.distance != null || previousValues.duration != null
        : previousValues.duration != null || previousValues.weight != null);

  const copyPrevious = () => {
    if (!previousValues) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDraft({
      weight: previousValues.weight?.toString() ?? '',
      reps: previousValues.reps?.toString() ?? '',
      rir: previousValues.rir?.toString() ?? '',
      rpe: previousValues.rpe?.toString() ?? '',
      distance: previousValues.distance?.toString() ?? '',
      duration:
        previousValues.duration == null
          ? ''
          : String(mode === 'cardio' ? secToMin(previousValues.duration) : previousValues.duration),
    });
  };

  const commitEdit = (key: keyof SetInput) => {
    setEditKey(null);
    if (values === null) return;
    const edited = toNumber(editValue);
    const input: SetInput =
      mode === 'strength'
        ? {
            weight: key === 'weight' ? edited : values.weight,
            reps: key === 'reps' ? edited : values.reps,
            rir: key === 'rir' ? edited : values.rir,
            rpe: key === 'rpe' ? edited : values.rpe,
            distance: null,
            duration: null,
          }
        : mode === 'cardio'
          ? {
              weight: null,
              reps: null,
              rir: null,
              rpe: null,
              distance: key === 'distance' ? edited : values.distance,
              duration: key === 'duration' ? minToSec(edited) : values.duration,
            }
          : {
              weight: key === 'weight' ? edited : values.weight,
              reps: null,
              rir: null,
              rpe: null,
              distance: null,
              duration: key === 'duration' ? (edited == null ? null : Math.round(edited)) : values.duration,
            };
    onUpdate(input);
  };

  const renderValue = (key: keyof SetInput): string => {
    if (values === null) return '';
    const value = values[key];
    if (value == null) return '';
    // Cardio stores seconds but displays minutes.
    if (key === 'duration' && mode === 'cardio') return String(secToMin(value));
    return value.toString();
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
                  className="w-[72px] border-b border-primary pb-0.5 text-right font-heading text-[22px] leading-[24px] text-foreground"
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
              className="w-[72px] border-b border-border pb-0.5 text-right font-heading text-[22px] leading-[24px] text-foreground"
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

        {mode !== 'strength' ? (
          <Pressable
            onPress={() => (timerStartedAt === null ? startTimer() : stopTimer())}
            hitSlop={8}
            className="ml-1 px-1 py-1"
          >
            {timerStartedAt !== null ? (
              <Text
                className="font-body text-[12px] text-primary"
                style={{ fontVariant: ['tabular-nums'] }}
              >
                {formatClock(timerSec)} ■
              </Text>
            ) : (
              <Text className="font-body text-[10px] uppercase tracking-[2px] text-muted-foreground">
                ▶
              </Text>
            )}
          </Pressable>
        ) : null}

        <Pressable
          onPress={() => {
            if (busy) return;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            // A running timer wins over a typed duration — it was started to
            // measure this set. Its exact seconds bypass the min round-trip.
            const timedSec = timerStartedAt !== null ? stopTimer() : null;
            const typedDuration = toNumber(draft.duration ?? '');
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
                : mode === 'cardio'
                  ? {
                      weight: null,
                      reps: null,
                      rir: null,
                      rpe: null,
                      distance: toNumber(draft.distance ?? ''),
                      duration: timedSec ?? minToSec(typedDuration),
                    }
                  : {
                      weight: toNumber(draft.weight ?? ''),
                      reps: null,
                      rir: null,
                      rpe: null,
                      distance: null,
                      duration:
                        timedSec ?? (typedDuration == null ? null : Math.round(typedDuration)),
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
