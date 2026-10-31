import { Pressable, Text } from 'react-native';

// Design-system "sm" chip: filled pill, 9px uppercase label (workout screen,
// cog sheet). Insights uses its own outlined Chip.
export function PillChip({
  label,
  selected = false,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full px-3 py-1 ${selected ? 'bg-primary' : 'bg-surface-container-low'}`}
    >
      <Text
        className={`font-body text-[9px] uppercase tracking-[2px] ${
          selected ? 'text-primary-foreground' : 'text-muted-foreground'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
