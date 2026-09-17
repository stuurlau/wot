import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Sheet } from '@/components/ui/sheet';
import { RatingScale } from '@/components/ui/rating-scale';
import { useUpdateTrainingSession } from '@/hooks/api';
import { useActiveSessionStore } from '@/stores/active-session-store';
import { router } from 'expo-router';

type FinishSheetProps = {
  visible: boolean;
  onClose: () => void;
  sessionId: string;
  startedAtMs: number;
  onLogPain: () => void;
};

const SESSION_TYPES = ['strength', 'run', 'ride', 'mobility', 'other'] as const;

export function FinishSheet({ visible, onClose, sessionId, startedAtMs, onLogPain }: FinishSheetProps) {
  const updateSession = useUpdateTrainingSession(sessionId);
  const clear = useActiveSessionStore((s) => s.clear);

  const [durationMin, setDurationMin] = useState('0');
  const [srpe, setSrpe] = useState<number | null>(null);
  const [type, setType] = useState<(typeof SESSION_TYPES)[number]>('strength');
  const [feeling, setFeeling] = useState<'good' | 'tired' | 'pain' | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    const minutes = Math.max(1, Math.round((Date.now() - startedAtMs) / 60000));
    setDurationMin(String(minutes));
    setSrpe(null);
    setFeeling(null);
    setNote('');
    setError(null);
  }, [visible, startedAtMs]);

  const canSave = srpe !== null;

  const save = async () => {
    const minutes = parseInt(durationMin, 10);
    const durationSeconds = Number.isFinite(minutes) && minutes > 0 ? minutes * 60 : 60;
    if (srpe === null) return;
    setError(null);
    try {
      await updateSession.mutateAsync({
        duration: durationSeconds,
        srpe,
        type,
        notes: note.trim() === '' ? undefined : note.trim(),
      });
    } catch {
      setError("Couldn't save. Check your connection and try again — your sets are safe.");
      return;
    }
    clear();
    onClose();
    router.back();
  };

  return (
    <Sheet visible={visible} onClose={onClose}>
      <Text className="mb-4 font-heading text-[24px] tracking-[-0.6px] text-foreground">
        Finish workout
      </Text>

      <View className="mb-5 flex-row items-center justify-between">
        <Text className="font-body text-[10px] uppercase tracking-[2px] text-muted-foreground">
          Duration
        </Text>
        <View className="flex-row items-center gap-1">
          <TextInput
            value={durationMin}
            onChangeText={setDurationMin}
            keyboardType="numeric"
            className="border-b border-border pb-0.5 text-right font-heading text-[24px] text-foreground"
            style={{ fontVariant: ['tabular-nums'], minWidth: 72 }}
          />
          <Text className="font-body text-[11px] text-muted-foreground">min</Text>
        </View>
      </View>

      <View className="mb-5">
        <Text className="mb-2 font-body text-[10px] uppercase tracking-[2px] text-muted-foreground">
          How hard was it?
        </Text>
        <RatingScale
          value={srpe}
          onChange={setSrpe}
          lowLabel="very easy"
          highLabel="max effort"
        />
      </View>

      <View className="mb-5">
        <Text className="mb-2 font-body text-[10px] uppercase tracking-[2px] text-muted-foreground">
          Type
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {SESSION_TYPES.map((t) => (
            <Pressable
              key={t}
              onPress={() => setType(t)}
              className={
                type === t
                  ? 'rounded-full bg-primary px-4 py-2'
                  : 'rounded-full bg-surface-container-low px-4 py-2'
              }
            >
              <Text
                className={
                  type === t
                    ? 'font-body text-[10px] uppercase tracking-[2px] text-primary-foreground'
                    : 'font-body text-[10px] uppercase tracking-[2px] text-muted-foreground'
                }
              >
                {t}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="mb-5">
        <Text className="mb-2 font-body text-[10px] uppercase tracking-[2px] text-muted-foreground">
          Feeling (optional)
        </Text>
        <View className="flex-row gap-2">
          {(
            [
              ['good', 'Good'],
              ['tired', 'Tired'],
              ['pain', 'Something hurts'],
            ] as const
          ).map(([key, label]) => (
            <Pressable
              key={key}
              onPress={() => {
                setFeeling(key);
                if (key === 'pain') onLogPain();
              }}
              className={
                feeling === key
                  ? 'rounded-full bg-primary px-4 py-2'
                  : 'rounded-full bg-surface-container-low px-4 py-2'
              }
            >
              <Text
                className={
                  feeling === key
                    ? 'font-body text-[10px] uppercase tracking-[2px] text-primary-foreground'
                    : 'font-body text-[10px] uppercase tracking-[2px] text-foreground'
                }
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Note (optional)"
        placeholderTextColor="rgba(0,0,0,0.3)"
        className="mb-5 border-b border-border pb-1 font-body text-[16px] text-foreground"
      />

      {error ? (
        <Text className="mb-3 font-body text-[12px] text-destructive">{error}</Text>
      ) : null}

      <Pressable
        onPress={() => void save()}
        disabled={!canSave || updateSession.isPending}
        className="items-center rounded-2xl bg-primary px-6 py-4 active:opacity-80"
      >
        <Text className="font-body-bold text-[11px] uppercase tracking-[3px] text-primary-foreground">
          {updateSession.isPending ? 'Saving…' : 'Save workout'}
        </Text>
      </Pressable>
    </Sheet>
  );
}