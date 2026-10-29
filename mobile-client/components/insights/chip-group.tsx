import { Pressable, Text, View } from 'react-native';

import { cn } from '@/lib/utils';

export type ChipOption = { key: string; label: string };

// Pill chip + single-select chip group (metrics, ranges, comparisons, scope
// picker). `ink` is the dark "Change ▾" button tone.
export function Chip({
  label,
  selected = false,
  tone,
  size = 'sm',
  onPress,
}: {
  label: string;
  selected?: boolean;
  tone?: 'ink';
  size?: 'sm' | 'xs';
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'items-center justify-center rounded-full border',
        size === 'xs' ? 'px-2.5 py-1' : 'px-3 py-1.5',
        tone === 'ink'
          ? 'border-transparent bg-foreground'
          : selected
            ? 'border-primary bg-primary'
            : 'border-border bg-transparent',
      )}
    >
      <Text
        className={cn(
          'font-body-medium',
          size === 'xs' ? 'text-[10px]' : 'text-[12px]',
          tone === 'ink' ? 'text-background' : selected ? 'text-primary-foreground' : 'text-foreground',
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function ChipGroup({
  options,
  value,
  onChange,
  size = 'sm',
}: {
  options: ChipOption[];
  value: string;
  onChange: (key: string) => void;
  size?: 'sm' | 'xs';
}) {
  return (
    <View className="flex-row flex-wrap gap-1.5">
      {options.map((o) => (
        <Chip
          key={o.key}
          label={o.label}
          size={size}
          selected={o.key === value}
          onPress={() => onChange(o.key)}
        />
      ))}
    </View>
  );
}
