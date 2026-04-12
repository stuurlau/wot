import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, Text, View } from 'react-native';
import { Svg, Defs, Pattern, Rect, Line } from 'react-native-svg';

const LINE_SPACING = 28;

function RuledBackground() {
  return (
    <View className="absolute inset-0" pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern
            id="lines"
            x="0"
            y="0"
            width={LINE_SPACING}
            height={LINE_SPACING}
            patternUnits="userSpaceOnUse"
          >
            <Line
              x1="0"
              y1={LINE_SPACING}
              x2="10000"
              y2={LINE_SPACING}
              stroke="#e4e2e0"
              strokeWidth="0.5"
            />
            <Line
              x1={LINE_SPACING}
              y1="0"
              x2={LINE_SPACING}
              y2="10000"
              stroke="#e4e2e0"
              strokeWidth="0.5"
            />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#lines)" />
      </Svg>
    </View>
  );
}

function Header() {
  return (
    <View className="items-center pt-2 pb-4">
      <Text
        style={{
          fontFamily: 'SpaceGrotesk_700Bold',
          fontSize: 22,
          letterSpacing: -0.8,
          color: '#1A1A1A',
        }}
      >
        WOT
      </Text>
    </View>
  );
}

type ScreenLayoutProps = {
  children: React.ReactNode;
  scrollable?: boolean;
};

export function ScreenLayout({ children, scrollable = false }: ScreenLayoutProps) {
  const content = (
    <>
      <Header />
      {children}
    </>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#faf9f8]">
      <RuledBackground />
      {scrollable ? (
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        <View className="flex-1 px-6">{content}</View>
      )}
    </SafeAreaView>
  );
}
