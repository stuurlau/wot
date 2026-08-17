import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/stores/auth-store';
import Constants from 'expo-constants';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const signIn = useAuthStore((s) => s.signIn);

  async function handleSubmit() {
    if (!email || !password) return;
    setError(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-8 pt-12 pb-6">

            {/* Brand section */}
            <View className="mb-10">
              <View className="items-center mb-8">
                <Image
                  source={require('@/assets/images/wot-logo.svg')}
                  style={{ width: 180, height: 55 }}
                  contentFit="contain"
                />
              </View>

              <Text
                className="font-heading-bold text-[52px] leading-[52px] tracking-[-2px] uppercase text-foreground mb-4"
                style={{ letterSpacing: -2 }}
              >
                Welcome{'\n'}to WOT!
              </Text>

              {/* Status lines */}
              <View className="gap-1 mt-2">
                <Text className="font-body text-[14px] tracking-[1px] text-muted-foreground">
                  {'>'} Train smart. Stay happy.
                </Text>
                <Text className="font-body text-[14px] tracking-[1px] text-muted-foreground">
                  {'>'} Let&apos;s log today&apos;s work.
                </Text>
              </View>
            </View>

            {/* Form */}
            <View className="gap-6">
              {/* Email */}
              <View>
                <Text className="font-body text-[9px] tracking-[3px] uppercase text-muted-foreground mb-2">
                  Email
                </Text>
                <TextInput
                  className="font-body text-[17px] text-foreground pb-2"
                  style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.15)' }}
                  placeholder="you@example.com"
                  placeholderTextColor="rgba(0,0,0,0.25)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="next"
                />
              </View>

              {/* Password */}
              <View>
                <Text className="font-body text-[9px] tracking-[3px] uppercase text-muted-foreground mb-2">
                  Password
                </Text>
                <TextInput
                  className="font-body text-[17px] text-foreground pb-2"
                  style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.15)' }}
                  placeholder="••••••••••••"
                  placeholderTextColor="rgba(0,0,0,0.25)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="password"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
              </View>

              {/* Error */}
              {error && (
                <Text className="font-body text-[12px] text-destructive">
                  {error}
                </Text>
              )}

              {/* Submit */}
              <Pressable
                onPress={handleSubmit}
                disabled={loading}
                className="bg-primary mt-2 px-6 py-4 flex-row items-center justify-between rounded-2xl active:opacity-80"
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text className="font-body-bold text-[11px] tracking-[3px] uppercase text-primary-foreground">
                      Log in
                    </Text>
                    <Text className="font-body-bold text-[16px] text-primary-foreground">
                      →
                    </Text>
                  </>
                )}
              </Pressable>
            </View>

            {/* Footer link */}
            <View className="flex-row justify-center mt-8 pt-6" style={{ borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.08)' }}>
              <Link href={'/(auth)/register' as never} asChild>
                <Pressable>
                  <Text className="font-body text-[10px] tracking-[2px] uppercase text-muted-foreground">
                    New to WOT? Create account
                  </Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>

        {/* Version bar */}
        <View
          className="px-8 py-3 flex-row items-center"
          style={{ borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.08)' }}
        >
          <Text className="font-body text-[9px] tracking-[3px] text-muted-foreground uppercase">
            WOT v{Constants.expoConfig?.version ?? '0.0.0'}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
