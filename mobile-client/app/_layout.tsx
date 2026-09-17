import '../global.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, DefaultTheme } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  SpaceGrotesk_300Light,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { useFonts } from 'expo-font';
import { router, Stack, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { View } from 'react-native';

import { useAuthStore } from '@/stores/auth-store';
import { RuledBackground } from '@/components/ruled-background';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export const unstable_settings = {
  anchor: '(tabs)',
};

function AuthGuard() {
  const { user, isLoading, initialize } = useAuthStore();
  const segments = useSegments();

  useEffect(() => { initialize(); }, [initialize]);

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = (segments[0] as string) === '(auth)';
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login' as never);
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)' as never);
    }
  }, [user, isLoading, segments]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    SpaceGrotesk_300Light,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });
  const { isLoading } = useAuthStore();

  useEffect(() => {
    if (fontsLoaded && !isLoading) SplashScreen.hideAsync();
  }, [fontsLoaded, isLoading]);

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={DefaultTheme}>
        <View className="flex-1 bg-background">
          <AuthGuard />
          <RuledBackground />
          <Stack
            screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}
          >
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="workout" options={{ presentation: 'modal', gestureEnabled: false }} />
            <Stack.Screen name="session/[id]" />
          </Stack>
          <PortalHost />
          <StatusBar style="dark" />
        </View>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
