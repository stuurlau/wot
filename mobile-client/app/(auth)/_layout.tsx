import { Stack } from 'expo-router';
import { View } from 'react-native';

import { RuledBackground } from '@/components/ruled-background';

export default function AuthLayout() {
  return (
    <View className="flex-1 bg-background">
      <RuledBackground />
      <Stack screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack>
    </View>
  );
}
