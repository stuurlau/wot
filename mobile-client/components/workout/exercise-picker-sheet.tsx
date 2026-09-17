import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Sheet } from '@/components/ui/sheet';
import { useCreateExercise, useRecentExercises } from '@/hooks/api';
import type { RecentExercise } from '@/lib/api';

type ExercisePickerSheetProps = {
  visible: boolean;
  onClose: () => void;
  sessionId: string;
  nextSortOrder: number;
};

function formatLast(recent: RecentExercise): string | null {
  const { weight, reps } = recent.lastSet;
  if (weight != null || reps != null) return `${weight ?? '—'} × ${reps ?? '—'}`;
  return null;
}

export function ExercisePickerSheet({
  visible,
  onClose,
  sessionId,
  nextSortOrder,
}: ExercisePickerSheetProps) {
  const { data: recents = [], isLoading } = useRecentExercises(20);
  const createExercise = useCreateExercise(sessionId);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recents;
    return recents.filter((r) => r.name.toLowerCase().includes(q));
  }, [recents, query]);

  const exactMatch = filtered.some((r) => r.name.toLowerCase() === query.trim().toLowerCase());
  const canCreate = query.trim().length > 0 && !exactMatch;

  const pick = async (name: string, bodyRegions: string[]) => {
    setError(null);
    try {
      await createExercise.mutateAsync({
        name,
        bodyRegions: bodyRegions.length > 0 ? bodyRegions : undefined,
        sortOrder: nextSortOrder,
      });
      setQuery('');
      onClose();
    } catch {
      setError("Couldn't add the exercise. Try again.");
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose}>
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="font-heading text-[24px] tracking-[-0.6px] text-foreground">
          Add exercise
        </Text>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text className="font-body text-[14px] text-muted-foreground">✕</Text>
        </Pressable>
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search or create…"
        placeholderTextColor="rgba(0,0,0,0.3)"
        autoCapitalize="words"
        className="mb-4 border-b border-border pb-1 font-body text-[17px] text-foreground"
      />

      {isLoading && recents.length === 0 ? (
        <Text className="py-6 text-center font-body text-[12px] text-muted-foreground">
          Loading…
        </Text>
      ) : null}

      {recents.length === 0 && !isLoading ? (
        <Text className="py-6 text-center font-body text-[12px] text-muted-foreground">
          No exercises yet. Create your first one.
        </Text>
      ) : null}

      {filtered.length > 0 ? (
        <View>
          <Text className="mb-2 font-body text-[9px] uppercase tracking-[3px] text-muted-foreground">
            Recent
          </Text>
          {filtered.map((recent) => (
            <Pressable
              key={recent.name}
              onPress={() => void pick(recent.name, recent.bodyRegions)}
              className="flex-row items-center justify-between py-3"
            >
              <Text className="font-body-medium text-[16px] text-foreground">{recent.name}</Text>
              {formatLast(recent) ? (
                <Text
                  className="font-body text-[12px] text-muted-foreground"
                  style={{ fontVariant: ['tabular-nums'] }}
                >
                  {formatLast(recent)}
                </Text>
              ) : null}
            </Pressable>
          ))}
        </View>
      ) : null}

      {canCreate ? (
        <Pressable
          onPress={() => void pick(query.trim(), [])}
          className="mt-2 flex-row items-center justify-between py-3"
        >
          <Text className="font-body-medium text-[16px] text-primary">
            Create &quot;{query.trim()}&quot;
          </Text>
          <Text className="font-body text-[14px] text-primary">+</Text>
        </Pressable>
      ) : null}
      {error ? (
        <Text className="mt-2 font-body text-[12px] text-destructive">{error}</Text>
      ) : null}
    </Sheet>
  );
}