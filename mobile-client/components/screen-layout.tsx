import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, Text, View } from "react-native";

import { RuledBackground } from "./ruled-background";

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
