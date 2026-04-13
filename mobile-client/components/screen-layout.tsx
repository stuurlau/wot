import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, Text, View } from "react-native";
import { Svg, Defs, Pattern, Rect, Line } from "react-native-svg";

const LINE_SPACING = 30;

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
              stroke="rgba(0,0,0,0.1)"
              strokeWidth="1"
            />
            <Line
              x1={LINE_SPACING}
              y1="0"
              x2={LINE_SPACING}
              y2="10000"
              stroke="rgba(0,0,0,0.1)"
              strokeWidth="1"
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
    <View className="border-b border-black/5 bg-background">
      <View className="items-center px-6 pt-5 pb-4">
        <Text className="font-heading-bold italic text-[50px] leading-none tracking-[-1.2px] text-foreground">
          WOT
        </Text>
      </View>
    </View>
  );
}

type ScreenLayoutProps = {
  children: React.ReactNode;
  scrollable?: boolean;
};

export function ScreenLayout({
  children,
  scrollable = false,
}: ScreenLayoutProps) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <Header />
      <View className="flex-1 relative">
        <RuledBackground />
        {scrollable ? (
          <ScrollView
            className="flex-1 px-6"
            contentContainerStyle={{ paddingTop: 28, paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View className="flex-1 px-6 pt-7">{children}</View>
        )}
      </View>
    </SafeAreaView>
  );
}
