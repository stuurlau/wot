import { Tabs } from 'expo-router';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { ActiveSessionBar } from '@/components/active-session-bar';
import { VersionFooter } from '@/components/version-footer';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';

function TabIcon({
  name,
  color,
  focused,
}: {
  name: IconSymbolName;
  color: string;
  focused: boolean;
}) {
  return (
    <View
      className={
        focused
          ? 'items-center justify-center rounded-full bg-surface-container-highest px-4 py-1'
          : 'items-center px-4 py-1'
      }
    >
      <IconSymbol size={20} name={name} color={color} />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#9a9793',
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 9,
          letterSpacing: 1,
          textTransform: 'uppercase',
          marginTop: 2,
        },
      }}
      tabBar={(props) => (
        <View>
          <ActiveSessionBar />
          <VersionFooter />
          <BottomTabBar {...props} />
        </View>
      )}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="house.fill" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="clock.arrow.circlepath" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="chart.bar.fill" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
