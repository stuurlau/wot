import { Pressable, Text, View } from 'react-native';

type RatingScaleProps = {
  value: number | null;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  lowLabel?: string;
  highLabel?: string;
};

export function RatingScale({
  value,
  onChange,
  min = 1,
  max = 10,
  lowLabel,
  highLabel,
}: RatingScaleProps) {
  const values: number[] = [];
  for (let i = min; i <= max; i++) values.push(i);

  return (
    <View>
      <View className="flex-row flex-wrap gap-2">
        {values.map((n) => {
          const selected = value === n;
          return (
            <Pressable
              key={n}
              onPress={() => onChange(n)}
              className={
                selected
                  ? 'h-11 w-11 items-center justify-center rounded-full bg-primary'
                  : 'h-11 w-11 items-center justify-center rounded-full bg-surface-container-low'
              }
            >
              <Text
                className={
                  selected
                    ? 'font-body-bold text-[16px] text-primary-foreground'
                    : 'font-body-medium text-[16px] text-foreground'
                }
                style={{ fontVariant: ['tabular-nums'] }}
              >
                {n}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {(lowLabel || highLabel) && (
        <View className="mt-2 flex-row justify-between">
          {lowLabel ? (
            <Text className="font-body text-[9px] uppercase tracking-[2px] text-muted-foreground">
              {lowLabel}
            </Text>
          ) : (
            <View />
          )}
          {highLabel ? (
            <Text className="font-body text-[9px] uppercase tracking-[2px] text-muted-foreground">
              {highLabel}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
}
