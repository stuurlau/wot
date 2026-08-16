import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Colors } from '@/constants/theme';

type DataStateProps = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  loading?: boolean;
};

export function DataState({ message, actionLabel, onAction, loading = true }: DataStateProps) {
  return (
    <View className="items-center border border-border bg-background/70 px-6 py-8">
      {loading ? <ActivityIndicator color={Colors.primary} /> : null}
      <Text className="mt-4 text-center font-body text-[12px] leading-5 text-muted-foreground">
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Pressable className="mt-4 border border-primary px-4 py-2" onPress={onAction}>
          <Text className="font-body text-[10px] tracking-[2px] uppercase text-primary">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
