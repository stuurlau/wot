import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { Colors } from '@/constants/theme';

export type SetInput = {
  weight: number | null;
  reps: number | null;
  rir: number | null;
  rpe: number | null;
  distance: number | null;
  /** Whole seconds, matching the API column. */
  duration: number | null;
};

export type SetFieldKey = keyof SetInput;
export type DurationUnit = 'sec' | 'min';

const EMPTY_INPUT: SetInput = {
  weight: null,
  reps: null,
  rir: null,
  rpe: null,
  distance: null,
  duration: null,
};

// Duration is stored in whole seconds; `durationUnit` picks how it is typed.
const FIELD_LABELS: Record<SetFieldKey, string> = {
  weight: 'kg',
  reps: 'reps',
  rir: 'rir',
  rpe: 'rpe',
  distance: 'km',
  duration: 'sec',
};

const fieldLabel = (key: SetFieldKey, unit: DurationUnit): string =>
  key === 'duration' ? unit : FIELD_LABELS[key];

export const isIntensity = (key: SetFieldKey) => key === 'rir' || key === 'rpe';

function toNumber(raw: string): number | null {
  const n = Number(raw.replace(',', '.'));
  return raw.trim() === '' || Number.isNaN(n) ? null : n;
}

const minToSec = (min: number | null) => (min == null ? null : Math.round(min * 60));
const secToMin = (sec: number | null) => (sec == null ? null : Math.round(sec / 6) / 10);

export function formatClock(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Stored value → the text typed/shown for it (duration in the chosen unit). */
function displayValue(key: SetFieldKey, value: number | null, unit: DurationUnit): string {
  if (value == null) return '';
  return String(key === 'duration' && unit === 'min' ? secToMin(value) : value);
}

/** Drafts of the given fields → a set body; everything else stays null. */
function toInput(fields: SetFieldKey[], draft: Record<string, string>, unit: DurationUnit): SetInput {
  const input: SetInput = { ...EMPTY_INPUT };
  for (const f of fields) {
    const n = toNumber(draft[f] ?? '');
    input[f] = f !== 'duration' || n == null ? n : unit === 'min' ? minToSec(n) : Math.round(n);
  }
  return input;
}

const toDraft = (fields: SetFieldKey[], values: SetInput, unit: DurationUnit) =>
  Object.fromEntries(fields.map((f) => [f, displayValue(f, values[f], unit)]));

// Ledger line: "80 kg × 5" with intensity aside ("rir 2"). Reps are bare
// next to a weight, labelled otherwise.
export function formatSet(fields: SetFieldKey[], values: SetInput, unit: DurationUnit) {
  const has = (f: SetFieldKey) => values[f] != null;
  const main = fields
    .filter((f) => !isIntensity(f) && has(f))
    .map((f) =>
      f === 'reps' && has('weight')
        ? String(values.reps)
        : `${displayValue(f, values[f], unit)} ${fieldLabel(f, unit)}`,
    )
    .join(' × ');
  const sub = fields
    .filter((f) => isIntensity(f) && has(f))
    .map((f) => `${f} ${values[f]}`)
    .join(' · ');
  return { main: main || '—', sub };
}

const LABEL = 'font-body text-[9px] uppercase tracking-[2px]';

type LoggedSetRowProps = {
  setNumber: number;
  fields: SetFieldKey[];
  durationUnit: DurationUnit;
  values: SetInput;
  onUpdate: (input: SetInput) => void;
  onDelete: () => void;
};

// A logged set: tap edits all values inline, long-press deletes (the block
// offers Undo — no dialog).
export function LoggedSetRow({ setNumber, fields, durationUnit, values, onUpdate, onDelete }: LoggedSetRowProps) {
  const [draft, setDraft] = useState<Record<string, string> | null>(null);

  if (draft) {
    const save = () => {
      setDraft(null);
      onUpdate(toInput(fields, draft, durationUnit));
    };
    return (
      <View className="flex-row items-center gap-2 border-b border-border py-1.5 pl-3">
        <Text className="w-5 font-body text-[12px] text-faint">{setNumber}</Text>
        {fields.map((f, i) => (
          <TextInput
            key={f}
            value={draft[f] ?? ''}
            onChangeText={(t) => setDraft((d) => ({ ...d, [f]: t }))}
            onSubmitEditing={save}
            placeholder={fieldLabel(f, durationUnit)}
            placeholderTextColor="rgba(0,0,0,0.3)"
            keyboardType="numeric"
            autoFocus={i === 0}
            className="h-[34px] min-w-0 flex-1 border-b border-primary p-0 text-center font-heading text-[18px] text-foreground"
            style={{ fontVariant: ['tabular-nums'] }}
          />
        ))}
        <Pressable
          onPress={save}
          accessibilityLabel="Save set"
          className="h-9 w-9 items-center justify-center rounded-full border border-primary"
        >
          <Text className="font-body text-[14px] text-primary">✓</Text>
        </Pressable>
      </View>
    );
  }

  const { main, sub } = formatSet(fields, values, durationUnit);
  return (
    <Pressable
      onPress={() => setDraft(toDraft(fields, values, durationUnit))}
      onLongPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onDelete();
      }}
      className="flex-row items-baseline border-b border-border px-3 py-2"
    >
      <Text className="w-7 font-body text-[12px] text-faint" style={{ fontVariant: ['tabular-nums'] }}>
        {setNumber}
      </Text>
      <View className="min-w-0 flex-1 flex-row flex-wrap items-baseline gap-x-3 gap-y-1">
        <Text
          className="font-heading text-[20px] leading-[24px] text-foreground"
          style={{ fontVariant: ['tabular-nums'] }}
        >
          {main}
        </Text>
        {sub ? <Text className={`${LABEL} text-muted-foreground`}>{sub}</Text> : null}
      </View>
    </Pressable>
  );
}

type NextSetCardProps = {
  setNumber: number;
  fields: SetFieldKey[];
  durationUnit: DurationUnit;
  /** "82.5 × 5" from the previous session. */
  lastReference: string | null;
  /** Previous set of this exercise, for Copy. */
  previousValues: SetInput | null;
  /** The exercise being worked on gets the card surface. */
  active: boolean;
  busy: boolean;
  onActivate: () => void;
  /** "+ RIR" reveal; undefined hides it. */
  onAddIntensity?: () => void;
  /** rir ⇄ rpe under the intensity input. */
  onFlipIntensity: () => void;
  onCreate: (input: SetInput) => void;
  /** Rest clock line, shown under the inputs of the exercise just logged. */
  rest?: ReactNode;
};

// The next set: "Set 4 · Last 82.5 × 5 · + RIR · Copy" over full-width inputs,
// hold timer and the ✓ at the thumb edge.
export function NextSetCard({
  setNumber,
  fields,
  durationUnit,
  lastReference,
  previousValues,
  active,
  busy,
  onActivate,
  onAddIntensity,
  onFlipIntensity,
  onCreate,
  rest,
}: NextSetCardProps) {
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [focused, setFocused] = useState<SetFieldKey | null>(null);

  // Hold timer, offered whenever there is a duration input. Stopping it fills
  // the duration; ✓ while it runs stops it and uses the exact elapsed time.
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
    onActivate();
  };

  /** Stop the timer, fill the duration draft, and return the exact seconds. */
  const stopTimer = (): number => {
    if (timerStartedAt === null) return 0;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const sec = Math.max(1, Math.round((Date.now() - timerStartedAt) / 1000));
    setTimerStartedAt(null);
    setDraft((p) => ({ ...p, duration: displayValue('duration', sec, durationUnit) }));
    return sec;
  };

  const copyable = previousValues != null && fields.some((f) => previousValues[f] != null);

  const log = () => {
    if (busy) return;
    const timedSec = timerStartedAt !== null ? stopTimer() : null;
    const input = toInput(fields, draft, durationUnit);
    if (timedSec !== null) input.duration = timedSec;
    if (fields.every((f) => input[f] == null)) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDraft({});
    onCreate(input);
  };

  return (
    <Pressable
      onPress={onActivate}
      className={`mt-2 rounded-2xl pb-2.5 pl-3 pr-2.5 pt-2 ${active ? 'bg-surface-container-lowest' : ''}`}
    >
      <View className="min-h-7 flex-row items-center gap-3">
        <Text className="font-body-medium text-[9px] uppercase tracking-[2px] text-foreground">
          Set {setNumber}
        </Text>
        {lastReference ? (
          <Text className={`${LABEL} text-muted-foreground`} style={{ fontVariant: ['tabular-nums'] }}>
            Last {lastReference}
          </Text>
        ) : null}
        <View className="flex-1" />
        {onAddIntensity ? (
          <Pressable onPress={onAddIntensity} hitSlop={8} className="py-1.5">
            <Text className={`${LABEL} text-muted-foreground`}>+ RIR</Text>
          </Pressable>
        ) : null}
        {copyable ? (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setDraft(toDraft(fields, previousValues, durationUnit));
              onActivate();
            }}
            hitSlop={8}
            className="py-1.5"
          >
            <Text className={`${LABEL} text-muted-foreground`}>Copy</Text>
          </Pressable>
        ) : null}
      </View>

      <View className="flex-row items-start gap-2">
        {fields.map((f) => {
          const value = draft[f] ?? '';
          return (
            <View key={f} className="min-w-0 flex-1">
              <TextInput
                value={value}
                onChangeText={(t) => setDraft((p) => ({ ...p, [f]: t }))}
                onFocus={() => {
                  setFocused(f);
                  onActivate();
                }}
                onBlur={() => setFocused((cur) => (cur === f ? null : cur))}
                onSubmitEditing={log}
                placeholder={fieldLabel(f, durationUnit)}
                placeholderTextColor="rgba(0,0,0,0.3)"
                keyboardType="numeric"
                accessibilityLabel={fieldLabel(f, durationUnit)}
                className="h-10 w-full border-b p-0 text-center font-heading text-[21px] text-foreground"
                style={{
                  fontVariant: ['tabular-nums'],
                  borderBottomColor: focused === f ? Colors.primary : 'rgba(0,0,0,0.15)',
                }}
              />
              {isIntensity(f) ? (
                <Pressable onPress={onFlipIntensity} hitSlop={4} className="h-[18px] justify-center">
                  <Text className="text-center font-body text-[8px] uppercase tracking-[1.5px] text-primary">
                    {f === 'rir' ? 'rir ⇄ rpe' : 'rpe ⇄ rir'}
                  </Text>
                </Pressable>
              ) : (
                <Text className="h-[18px] text-center font-body text-[8px] uppercase leading-[18px] tracking-[1.5px] text-faint">
                  {value !== '' ? fieldLabel(f, durationUnit) : ''}
                </Text>
              )}
            </View>
          );
        })}

        {fields.includes('duration') ? (
          timerStartedAt === null ? (
            <Pressable
              onPress={startTimer}
              accessibilityLabel="Start hold timer"
              className="h-10 w-10 items-center justify-center rounded-full bg-surface-container-low"
            >
              <Text className="font-body text-[11px] text-on-surface-variant">▶</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={stopTimer}
              accessibilityLabel="Stop hold timer"
              className="h-10 flex-row items-center gap-2 rounded-full border border-primary px-3"
            >
              <Text
                className="font-heading text-[18px] text-primary"
                style={{ fontVariant: ['tabular-nums'] }}
              >
                {formatClock(timerSec)}
              </Text>
              <Text className="font-body text-[9px] text-primary">■</Text>
            </Pressable>
          )
        ) : null}

        <Pressable
          onPress={log}
          accessibilityLabel="Log set"
          className="-mt-0.5 h-11 w-11 items-center justify-center rounded-full bg-primary active:opacity-80"
        >
          <Text className="font-body-bold text-[17px] text-primary-foreground">✓</Text>
        </Pressable>
      </View>

      {rest}
    </Pressable>
  );
}
