import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import type { CardioSetField, StrengthSetField, UserSettings } from '@wot/types';

import { AppHeader } from '@/components/app-header';
import { Screen } from '@/components/screen';
import { useSettings, useUpdateSettings } from '@/hooks/api';

const STRENGTH_OPTIONS: { key: StrengthSetField; label: string }[] = [
  { key: 'weight', label: 'Weight (kg)' },
  { key: 'reps', label: 'Reps' },
  { key: 'rir', label: 'RIR' },
  { key: 'rpe', label: 'RPE' },
];

const CARDIO_OPTIONS: { key: CardioSetField; label: string }[] = [
  { key: 'distance', label: 'Distance (km)' },
  { key: 'duration', label: 'Duration (min)' },
  { key: 'weight', label: 'Weight (kg)' },
  { key: 'reps', label: 'Reps' },
];

type FieldGroup = keyof UserSettings;

function FieldChips<K extends string>({
  options,
  selected,
  disabled,
  onToggle,
}: {
  options: { key: K; label: string }[];
  selected: readonly K[];
  disabled: boolean;
  onToggle: (key: K) => void;
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option.key);
        return (
          <Pressable
            key={option.key}
            onPress={() => onToggle(option.key)}
            disabled={disabled}
            className={
              active
                ? 'rounded-full bg-primary px-3 py-1.5'
                : 'rounded-full bg-surface-container-low px-3 py-1.5'
            }
          >
            <Text
              className={
                active
                  ? 'font-body text-[11px] uppercase tracking-[2px] text-primary-foreground'
                  : 'font-body text-[11px] uppercase tracking-[2px] text-muted-foreground'
              }
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function SettingsScreen() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const toggle = (group: FieldGroup, key: string) => {
    if (!settings || isLoading) return;
    const current: string[] = settings[group];
    const next = current.includes(key)
      ? current.filter((field) => field !== key)
      : [...current, key];
    // At least one input per mode — a set row with no inputs is unusable.
    if (next.length === 0) return;
    updateSettings.mutate({ ...settings, [group]: next } as UserSettings);
  };

  return (
    <Screen>
      <AppHeader />
      <View className="flex-row items-baseline justify-between px-6 pb-2 pt-1">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text className="font-body text-[11px] uppercase tracking-[2px] text-muted-foreground">
            ‹ Back
          </Text>
        </Pressable>
        <Text className="font-heading text-[22px] tracking-[-0.6px] text-foreground">
          Settings
        </Text>
        <View className="w-12" />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 }}>
        <Text className="mb-6 font-body text-[13px] leading-5 text-muted-foreground">
          Choose which inputs appear when you log a set. Changes save automatically.
        </Text>

        <Text className="mb-2 font-body text-[9px] uppercase tracking-[3px] text-muted-foreground">
          Strength exercises
        </Text>
        <FieldChips
          options={STRENGTH_OPTIONS}
          selected={settings?.strengthFields ?? []}
          disabled={isLoading}
          onToggle={(key) => toggle('strengthFields', key)}
        />
        <Text className="mb-6 mt-2 font-body text-[11px] leading-4 text-muted-foreground">
          Add RIR or RPE to always show an effort input next to weight and reps.
        </Text>

        <Text className="mb-2 font-body text-[9px] uppercase tracking-[3px] text-muted-foreground">
          Cardio exercises
        </Text>
        <FieldChips
          options={CARDIO_OPTIONS}
          selected={settings?.cardioFields ?? []}
          disabled={isLoading}
          onToggle={(key) => toggle('cardioFields', key)}
        />
        <Text className="mt-2 font-body text-[11px] leading-4 text-muted-foreground">
          Combine as needed — distance × duration for runs, weight × duration
          for loaded carries, and so on.
        </Text>

        {updateSettings.isError ? (
          <Text className="mt-4 font-body text-[12px] text-destructive">
            Couldn&apos;t save your settings. They&apos;ll retry on the next change.
          </Text>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
