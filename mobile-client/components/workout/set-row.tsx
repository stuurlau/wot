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
export type SetFieldKey = keyof SetInput;

const EMPTY_INPUT: SetInput = {
  weight: null,
  reps: null,
  rir: null,
  rpe: null,
  distance: null,
  duration: null,
};

// Duration is stored in whole seconds; cardio enters it in minutes.
const FIELD_LABELS: Record<SetFieldKey, string> = {
  weight: 'kg',
  reps: 'reps',
  rir: 'rir',
  rpe: 'rpe',
  distance: 'km',
  duration: 'sec',
};

const fieldLabel = (key: SetFieldKey, mode: SetMode): string =>
  key === 'duration' && mode === 'cardio' ? 'min' : FIELD_LABELS[key];

const isIntensity = (key: SetFieldKey) => key === 'rir' || key === 'rpe';

type SetRowProps = {
  setNumber: number;
  mode: SetMode;
  /** Ordered set-input fields to render, resolved per exercise. */
  fields: SetFieldKey[];
  values: SetInput | null; // null => empty "add next set" row
  lastReference: string | null;
  previousValues?: SetInput | null; // previous set of this exercise, for Copy
  /** Quick "+ RIR" affordance on the add row (inherited fields only). */
  onShowIntensity?: () => void;
  /** Quick rir⇄rpe flip under the intensity input (inherited fields only). */
  onFlipIntensity?: () => void;
  busy: boolean;
  onCreate: (input: SetInput) => void;
  onUpdate: (input: SetInput) => void;
  onDelete: () => void;
};

function toNumber(raw: string): number | null {
  const n = Number(raw.replace(',', '.'));
  return raw.trim() === '' || Number.isNaN(n) ? null : n;
}

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
  fields,
  values,
  lastReference,
  previousValues,
  onShowIntensity,
  onFlipIntensity,
  busy,
  onCreate,
  onUpdate,
  onDelete,
}: SetRowProps) {
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [editKey, setEditKey] = useState<SetFieldKey | null>(null);
  const [editValue, setEditValue] = useState('');
  // Saved rows keep their ✓/✕ affordances hidden until the row is tapped.
  const [expanded, setExpanded] = useState(false);

  // Hold/interval timer on the "add next set" row, offered whenever the row
  // has a duration field. Stopping it fills the duration input; pressing ✓
  // while it runs stops it and uses the elapsed time.
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

  /** Typed duration → stored seconds (cardio types minutes). */
  const toSeconds = (v: number | null): number | null =>
    v == null ? null : mode === 'cardio' ? minToSec(v) : Math.round(v);

  const copyable = previousValues != null && fields.some((f) => previousValues[f] != null);

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

  // Only the configured fields are written; everything else stays null.
  const commitEdit = (key: SetFieldKey) => {
    setEditKey(null);
    if (values === null) return;
    const edited = toNumber(editValue);
    const input: SetInput = { ...EMPTY_INPUT };
    for (const f of fields) {
      if (f === key) {
        input[f] = f === 'duration' ? toSeconds(edited) : edited;
      } else {
        input[f] = values[f];
      }
    }
    onUpdate(input);
  };

  const renderValue = (key: SetFieldKey): string => {
    if (values === null) return '';
    const value = values[key];
    if (value == null) return '';
    if (key === 'duration' && mode === 'cardio') return String(secToMin(value));
    return value.toString();
  };

  const renderField = (key: SetFieldKey, editing: boolean, inputValue: string, onChange: (t: string) => void, onCommit: () => void) => {
    const input = (
      <TextInput
        value={inputValue}
        onChangeText={onChange}
        onBlur={editing ? onCommit : undefined}
        onSubmitEditing={editing ? onCommit : undefined}
        placeholder={editing ? undefined : fieldLabel(key, mode)}
        placeholderTextColor="rgba(0,0,0,0.3)"
        keyboardType="numeric"
        autoFocus={editing}
        className={`w-[72px] border-b pb-0.5 text-right font-heading text-[22px] leading-[24px] text-foreground ${
          editing ? 'border-primary' : 'border-border'
        }`}
        style={{ fontVariant: ['tabular-nums'] }}
      />
    );
    if (!isIntensity(key) || !onFlipIntensity) return <View key={key}>{input}</View>;
    return (
      <View key={key}>
        {input}
        <Pressable onPress={onFlipIntensity} hitSlop={8}>
          <Text className="text-center font-body text-[9px] uppercase tracking-[2px] text-primary">
            {fieldLabel(key, mode)} ⇄
          </Text>
        </Pressable>
      </View>
    );
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
          {fields.map((key) => {
            if (editKey === key) {
              return renderField(key, true, editValue, setEditValue, () => commitEdit(key));
            }
            const valueText = renderValue(key);
            return (
              <Pressable
                key={key}
                onPress={() => {
                  setEditKey(key);
                  setEditValue(valueText);
                }}
                hitSlop={8}
              >
                <Text
                  className="font-heading text-[22px] leading-[24px] text-foreground"
                  style={{ fontVariant: ['tabular-nums'] }}
                >
                  {valueText}
                </Text>
                {isIntensity(key) && onFlipIntensity ? (
                  <Pressable onPress={onFlipIntensity} hitSlop={8}>
                    <Text className="text-center font-body text-[9px] uppercase tracking-[2px] text-primary">
                      {fieldLabel(key, mode)} ⇄
                    </Text>
                  </Pressable>
                ) : (
                  <Text className="text-center font-body text-[9px] uppercase tracking-[2px] text-muted-foreground">
                    {fieldLabel(key, mode)}
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

      <View className="flex-1 flex-row flex-wrap items-center justify-end gap-2">
        {fields.map((key) =>
          renderField(key, false, draft[key] ?? '', (t) => setDraft((p) => ({ ...p, [key]: t })), () => {}),
        )}

        {onShowIntensity ? (
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

        {fields.includes('duration') ? (
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
            const input: SetInput = { ...EMPTY_INPUT };
            for (const f of fields) {
              input[f] =
                f === 'duration'
                  ? (timedSec ?? toSeconds(toNumber(draft.duration ?? '')))
                  : toNumber(draft[f] ?? '');
            }
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
