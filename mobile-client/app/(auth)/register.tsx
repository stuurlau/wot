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

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const signUp = useAuthStore((s) => s.signUp);

  async function handleSubmit() {
    if (!name || !email || !password) return;
    setError(null);
    setLoading(true);
    try {
      await signUp(email.trim(), password, name.trim());
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed.');
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
                className="font-heading-bold text-[52px] leading-[52px] uppercase text-foreground mb-4"
                style={{ letterSpacing: -2 }}
              >
                Start{'\n'}your log
              </Text>

              <View className="gap-1 mt-2">
                <Text className="font-body text-[14px] tracking-[1px] text-muted-foreground">
                  {'>'} Set up your account
                </Text>
                <Text className="font-body text-[14px] tracking-[1px] text-muted-foreground">
                  {'>'} Start tracking today
                </Text>
              </View>
            </View>

            {/* Form */}
            <View className="gap-6">
              {/* Name */}
              <View>
                <Text className="font-body text-[9px] tracking-[3px] uppercase text-muted-foreground mb-2">
                  Name
                </Text>
                <TextInput
                  className="font-body text-[17px] text-foreground pb-2"
                  style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.15)' }}
                  placeholder="Your name"
                  placeholderTextColor="rgba(0,0,0,0.25)"
                  value={name}
                  onChangeText={setName}
                  autoComplete="name"
                  returnKeyType="next"
                />
              </View>

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
                  autoComplete="new-password"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
              </View>

              {error && (
                <Text className="font-body text-[12px] text-destructive">{error}</Text>
              )}

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
                      Create account
                    </Text>
                    <Text className="font-body-bold text-[16px] text-primary-foreground">
                      →
                    </Text>
                  </>
                )}
              </Pressable>
            </View>

            {/* Footer links */}
            <View
              className="flex-row justify-between mt-8 pt-6"
              style={{ borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.08)' }}
            >
              <Link href={'/(auth)/login' as never} asChild>
                <Pressable>
                  <Text className="font-body text-[10px] tracking-[2px] uppercase text-muted-foreground">
                    Already logging? Sign in
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
