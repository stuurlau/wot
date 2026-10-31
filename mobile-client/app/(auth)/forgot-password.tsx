import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { router, useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/screen';
import { authClient } from '@/lib/auth-client';
import { useAuthStore } from '@/stores/auth-store';

// Forgot password (#35): email → 6-digit code by mail → new password → signed in.
// Backed by better-auth's emailOTP plugin (api/src/lib/auth.ts).
export default function ForgotPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const signIn = useAuthStore((s) => s.signIn);

  async function run(action: () => Promise<void>) {
    setError(null);
    setLoading(true);
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  const sendCode = () =>
    run(async () => {
      const { error } = await authClient.emailOtp.requestPasswordReset({ email: email.trim() });
      if (error) throw new Error(error.message ?? 'Could not send the code.');
      setCodeSent(true);
    });

  const resetPassword = () =>
    run(async () => {
      const { error } = await authClient.emailOtp.resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        password,
      });
      if (error) throw new Error(error.message ?? 'Could not reset the password.');
      await signIn(email.trim(), password);
      router.replace('/(tabs)');
    });

  const canSubmit = codeSent ? otp.trim().length > 0 && password.length > 0 : email.trim().length > 0;

  return (
    <Screen>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-8 pt-12 pb-6">
          <Text className="font-heading-bold text-[44px] leading-[44px] tracking-[-2px] uppercase text-foreground mb-4">
            Forgot{'\n'}password
          </Text>
          <Text className="font-body text-[14px] tracking-[1px] text-muted-foreground mb-10">
            {codeSent
              ? `${'>'} If ${email.trim()} has an account, a 6-digit code is on its way. It expires in 5 minutes.`
              : `${'>'} Enter your email and we'll send you a code.`}
          </Text>

          <View className="gap-6">
            <Field
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              editable={!codeSent}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              onSubmitEditing={codeSent ? undefined : sendCode}
            />
            {codeSent ? (
              <>
                <Field
                  label="Code"
                  placeholder="123456"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  autoComplete="one-time-code"
                  maxLength={6}
                />
                <Field
                  label="New password"
                  placeholder="••••••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="new-password"
                  onSubmitEditing={resetPassword}
                />
              </>
            ) : null}

            {error && <Text className="font-body text-[12px] text-destructive">{error}</Text>}

            <Pressable
              onPress={codeSent ? resetPassword : sendCode}
              disabled={loading || !canSubmit}
              className="bg-primary mt-2 px-6 py-4 flex-row items-center justify-between rounded-2xl active:opacity-80"
              style={{ opacity: canSubmit ? 1 : 0.5 }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text className="font-body-bold text-[11px] tracking-[3px] uppercase text-primary-foreground">
                    {codeSent ? 'Set password & log in' : 'Send code'}
                  </Text>
                  <Text className="font-body-bold text-[16px] text-primary-foreground">→</Text>
                </>
              )}
            </Pressable>

            {codeSent ? (
              <Pressable onPress={sendCode} disabled={loading} hitSlop={8} className="self-center">
                <Text className="font-body text-[10px] tracking-[2px] uppercase text-muted-foreground">
                  Send a new code
                </Text>
              </Pressable>
            ) : null}
          </View>

          <View
            className="flex-row justify-center mt-8 pt-6"
            style={{ borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.08)' }}
          >
            <Pressable onPress={() => router.back()}>
              <Text className="font-body text-[10px] tracking-[2px] uppercase text-muted-foreground">
                Back to log in
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </Screen>
  );
}

function Field({ label, editable = true, ...input }: TextInputProps & { label: string }) {
  return (
    <View>
      <Text className="font-body text-[9px] tracking-[3px] uppercase text-muted-foreground mb-2">
        {label}
      </Text>
      <TextInput
        className="font-body text-[17px] text-foreground pb-2"
        style={{
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(0,0,0,0.15)',
          opacity: editable ? 1 : 0.5,
        }}
        placeholderTextColor="rgba(0,0,0,0.25)"
        editable={editable}
        {...input}
      />
    </View>
  );
}
