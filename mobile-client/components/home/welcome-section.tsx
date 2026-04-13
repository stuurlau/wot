import { Text, View, Pressable } from 'react-native';

type WelcomeSectionProps = {
  streak: number;
  recoveryScore: number;
};

function formatTimestamp(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `LOG ENTRY // ${y}.${m}.${d}_T${h}:${min}`;
}

export function WelcomeSection({ streak, recoveryScore }: WelcomeSectionProps) {
  return (
    <View className="mb-12">
      <Text className="mb-4 font-body text-[9px] tracking-[3px] uppercase text-primary">
        {formatTimestamp()}
      </Text>

      <Text className="mb-8 font-heading text-[44px] leading-[42px] tracking-[-1.8px] text-foreground">
        Log anything, anytime.
      </Text>

      <Pressable
        className="self-start mb-10 px-8 py-4 bg-primary"
        onPress={() => {
          // TODO: navigate to session creation
        }}
      >
        <Text className="font-body text-xs tracking-[2px] uppercase text-primary-foreground">
          Initialize Session +
        </Text>
      </Pressable>

      <View className="flex-row gap-10">
        <View>
          <Text className="font-body text-[9px] tracking-[3px] uppercase text-muted-foreground">
            Streak_Metric
          </Text>
          <View className="flex-row items-baseline">
            <Text
              className="font-heading text-[46px] tracking-[-2px] text-foreground"
              style={{ fontVariant: ['tabular-nums'] }}
            >
              {streak}
            </Text>
            <Text className="font-body text-[10px] tracking-[2px] uppercase text-muted-foreground ml-1">
              d
            </Text>
          </View>
        </View>

        <View>
          <Text className="font-body text-[9px] tracking-[3px] uppercase text-muted-foreground">
            Recovery_State
          </Text>
          <View className="flex-row items-baseline">
            <Text
              className="font-heading text-[46px] tracking-[-2px] text-primary"
              style={{ fontVariant: ['tabular-nums'] }}
            >
              {recoveryScore}
            </Text>
            <Text className="font-body text-[10px] tracking-[2px] uppercase text-muted-foreground ml-1">
              %
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
