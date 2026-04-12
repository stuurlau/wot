import { Text, View, Pressable } from 'react-native';
import { Fonts, Colors } from '@/constants/theme';

type HeroSectionProps = {
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

export function HeroSection({ streak, recoveryScore }: HeroSectionProps) {
  return (
    <View className="mb-12">
      {/* Timestamp */}
      <Text
        className="mb-4"
        style={{
          fontFamily: Fonts.body,
          fontSize: 9,
          letterSpacing: 3,
          textTransform: 'uppercase',
          color: Colors.primary,
        }}
      >
        {formatTimestamp()}
      </Text>

      {/* Headline */}
      <Text
        className="mb-8"
        style={{
          fontFamily: Fonts.headingBold,
          fontSize: 36,
          lineHeight: 38,
          letterSpacing: -1.5,
          color: Colors.onSurface,
        }}
      >
        Ready to document progress?
      </Text>

      {/* CTA button */}
      <Pressable
        className="self-start mb-10 px-8 py-4"
        style={{ backgroundColor: Colors.primary }}
        onPress={() => {
          // TODO: navigate to session creation
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.bodyMedium,
            fontSize: 12,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: Colors.onPrimary,
          }}
        >
          Initialize Session +
        </Text>
      </Pressable>

      {/* Quick stats row */}
      <View className="flex-row gap-10">
        <View>
          <Text
            style={{
              fontFamily: Fonts.body,
              fontSize: 9,
              letterSpacing: 3,
              textTransform: 'uppercase',
              color: Colors.onSurfaceVariant,
            }}
          >
            Streak_Metric
          </Text>
          <View className="flex-row items-baseline">
            <Text
              style={{
                fontFamily: Fonts.headingBold,
                fontSize: 42,
                letterSpacing: -2,
                color: Colors.onSurface,
                fontVariant: ['tabular-nums'],
              }}
            >
              {streak}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.body,
                fontSize: 10,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: Colors.onSurfaceVariant,
                marginLeft: 4,
              }}
            >
              d
            </Text>
          </View>
        </View>

        <View>
          <Text
            style={{
              fontFamily: Fonts.body,
              fontSize: 9,
              letterSpacing: 3,
              textTransform: 'uppercase',
              color: Colors.onSurfaceVariant,
            }}
          >
            Recovery_State
          </Text>
          <View className="flex-row items-baseline">
            <Text
              style={{
                fontFamily: Fonts.headingBold,
                fontSize: 42,
                letterSpacing: -2,
                color: Colors.primary,
                fontVariant: ['tabular-nums'],
              }}
            >
              {recoveryScore}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.body,
                fontSize: 10,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: Colors.onSurfaceVariant,
                marginLeft: 4,
              }}
            >
              %
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
