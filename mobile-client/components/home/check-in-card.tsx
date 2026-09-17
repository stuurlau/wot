import { Pressable, Text, View } from 'react-native';

type CheckInCardProps = {
  onPress: () => void;
};

export function CheckInCard({ onPress }: CheckInCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-6 flex-row items-center justify-between rounded-2xl bg-white px-5 py-4"
    >
      <View>
        <Text className="font-heading text-[20px] leading-[22px] tracking-[-0.4px] text-foreground">
          How&apos;s the body today?
        </Text>
        <Text className="mt-1 font-body text-[10px] uppercase tracking-[2px] text-muted-foreground">
          Sleep · fatigue · soreness
        </Text>
      </View>
      <Text className="font-body text-[14px] text-primary">→</Text>
    </Pressable>
  );
}