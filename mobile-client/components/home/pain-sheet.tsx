import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Sheet } from '@/components/ui/sheet';
import { RatingScale } from '@/components/ui/rating-scale';
import { useCreatePainLog, useRecentExercises } from '@/hooks/api';

type PainSheetProps = {
  visible: boolean;
  onClose: () => void;
};

const FIXED_REGIONS = ['shoulders', 'knees', 'hips', 'back', 'elbow', 'ankle', 'other'];

function todayDateKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function PainSheet({ visible, onClose }: PainSheetProps) {
  const { data: recents = [] } = useRecentExercises(20);
  const createPainLog = useCreatePainLog();

  const suggestedRegions = useMemo(() => {
    const fromRecents = recents.flatMap((r) => r.bodyRegions ?? []);
    return Array.from(new Set([...fromRecents, ...FIXED_REGIONS]));
  }, [recents]);

  const [region, setRegion] = useState<string | null>(null);
  const [customRegion, setCustomRegion] = useState('');
  const [severity, setSeverity] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const effectiveRegion = customRegion.trim() !== '' ? customRegion.trim() : region;

  const canSave = effectiveRegion !== null && effectiveRegion.length > 0 && severity !== null;

  const save = async () => {
    if (!canSave) return;
    setError(null);
    try {
      await createPainLog.mutateAsync({
        date: todayDateKey(),
        bodyRegion: effectiveRegion,
        severity,
        notes: note.trim() === '' ? undefined : note.trim(),
      });
    } catch {
      setError("Couldn't save. Try again.");
      return;
    }
    setRegion(null);
    setCustomRegion('');
    setSeverity(null);
    setNote('');
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose}>
      <Text className="mb-4 font-heading text-[24px] tracking-[-0.6px] text-foreground">
        Log pain
      </Text>

      <Text className="mb-2 font-body text-[10px] uppercase tracking-[2px] text-muted-foreground">
        Body region
      </Text>
      <View className="mb-3 flex-row flex-wrap gap-2">
        {suggestedRegions.map((r) => (
          <Pressable
            key={r}
            onPress={() => {
              setRegion(r);
              setCustomRegion('');
            }}
            className={
              region === r
                ? 'rounded-full bg-primary px-4 py-2'
                : 'rounded-full bg-surface-container-low px-4 py-2'
            }
          >
            <Text
              className={
                region === r
                  ? 'font-body text-[10px] uppercase tracking-[2px] text-primary-foreground'
                  : 'font-body text-[10px] uppercase tracking-[2px] text-muted-foreground'
              }
            >
              {r}
            </Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        value={customRegion}
        onChangeText={(t) => {
          setCustomRegion(t);
          if (t.trim() !== '') setRegion(null);
        }}
        placeholder="Or type a custom region…"
        placeholderTextColor="rgba(0,0,0,0.3)"
        autoCapitalize="words"
        className="mb-5 border-b border-border pb-1 font-body text-[16px] text-foreground"
      />

      <Text className="mb-2 font-body text-[10px] uppercase tracking-[2px] text-muted-foreground">
        Severity
      </Text>
      <View className="mb-5">
        <RatingScale
          value={severity}
          onChange={setSeverity}
          lowLabel="annoying"
          highLabel="can't train"
        />
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
        disabled={!canSave || createPainLog.isPending}
        className="items-center rounded-2xl bg-primary px-6 py-4 active:opacity-80"
      >
        <Text className="font-body-bold text-[11px] uppercase tracking-[3px] text-primary-foreground">
          {createPainLog.isPending ? 'Saving…' : 'Save'}
        </Text>
      </Pressable>
    </Sheet>
  );
}