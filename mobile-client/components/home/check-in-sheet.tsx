import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Sheet } from '@/components/ui/sheet';
import { RatingScale } from '@/components/ui/rating-scale';
import { useUpsertDailyLog } from '@/hooks/api';

type CheckInSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function CheckInSheet({ visible, onClose }: CheckInSheetProps) {
  const upsert = useUpsertDailyLog();

  const [sleepMinutes, setSleepMinutes] = useState<number | null>(null);
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [fatigue, setFatigue] = useState<number | null>(null);
  const [soreness, setSoreness] = useState<number | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [stress, setStress] = useState<number | null>(null);
  const [motivation, setMotivation] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const todayKey = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const save = async () => {
    setError(null);
    try {
      await upsert.mutateAsync({
        date: todayKey(),
        body: {
          sleepDuration: sleepMinutes ?? undefined,
          sleepQuality: sleepQuality ?? undefined,
          fatigue: fatigue ?? undefined,
          soreness: soreness ?? undefined,
          stress: stress ?? undefined,
          motivation: motivation ?? undefined,
          notes: note.trim() === '' ? undefined : note.trim(),
        },
      });
    } catch {
      setError("Couldn't save your check-in. Try again.");
      return;
    }
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose}>
      <Text className="mb-5 font-heading text-[24px] tracking-[-0.6px] text-foreground">
        Quick check-in
      </Text>

      <View className="mb-5 flex-row items-center justify-between">
        <Text className="font-body text-[10px] uppercase tracking-[2px] text-muted-foreground">
          Sleep duration
        </Text>
        <View className="flex-row items-center gap-4">
          <Pressable
            onPress={() => setSleepMinutes((v) => Math.max(0, (v ?? 0) - 15))}
            className="h-9 w-9 items-center justify-center rounded-full bg-surface-container-low"
          >
            <Text className="font-body-medium text-[16px] text-foreground">−</Text>
          </Pressable>
          <Text
            className="min-w-[72px] text-center font-heading text-[20px] text-foreground"
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {sleepMinutes === null
              ? '—'
              : sleepMinutes >= 60
                ? `${Math.floor(sleepMinutes / 60)}h ${String(sleepMinutes % 60).padStart(2, '0')}m`
                : `${sleepMinutes}m`}
          </Text>
          <Pressable
            onPress={() => setSleepMinutes((v) => Math.min(960, (v ?? 0) + 15))}
            className="h-9 w-9 items-center justify-center rounded-full bg-surface-container-low"
          >
            <Text className="font-body-medium text-[16px] text-foreground">+</Text>
          </Pressable>
        </View>
      </View>

      {(
        [
          ['Sleep quality', sleepQuality, setSleepQuality],
          ['Fatigue', fatigue, setFatigue],
          ['Soreness', soreness, setSoreness],
        ] as const
      ).map(([label, value, setValue]) => (
        <View key={label} className="mb-5">
          <Text className="mb-2 font-body text-[10px] uppercase tracking-[2px] text-muted-foreground">
            {label}
          </Text>
          <RatingScale value={value} onChange={(n) => setValue(n)} />
        </View>
      ))}

      {showMore ? (
        <>
          {(
            [
              ['Stress', stress, setStress],
              ['Motivation', motivation, setMotivation],
            ] as const
          ).map(([label, value, setValue]) => (
            <View key={label} className="mb-5">
              <Text className="mb-2 font-body text-[10px] uppercase tracking-[2px] text-muted-foreground">
                {label}
              </Text>
              <RatingScale value={value} onChange={(n) => setValue(n)} />
            </View>
          ))}

          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Note (optional)"
            placeholderTextColor="rgba(0,0,0,0.3)"
            className="mb-5 border-b border-border pb-1 font-body text-[16px] text-foreground"
          />
        </>
      ) : (
        <Pressable onPress={() => setShowMore(true)} className="mb-5 self-start py-1">
          <Text className="font-body text-[10px] uppercase tracking-[2px] text-muted-foreground">
            More ▾ (stress · motivation · note)
          </Text>
        </Pressable>
      )}

      {error ? (
        <Text className="mb-3 font-body text-[12px] text-destructive">{error}</Text>
      ) : null}

      <Pressable
        onPress={() => void save()}
        disabled={upsert.isPending}
        className="items-center rounded-2xl bg-primary px-6 py-4 active:opacity-80"
      >
        <Text className="font-body-bold text-[11px] uppercase tracking-[3px] text-primary-foreground">
          {upsert.isPending ? 'Saving…' : 'Save'}
        </Text>
      </Pressable>
    </Sheet>
  );
}