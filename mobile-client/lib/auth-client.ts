import * as SecureStore from 'expo-secure-store';
import { createAuthClient } from 'better-auth/react';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const authClient = createAuthClient({
  baseURL: BASE_URL,
  storage: {
    getItem: SecureStore.getItemAsync,
    setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
    removeItem: SecureStore.deleteItemAsync,
  },
  fetchOptions: {
    credentials: 'include',
  },
});

export type AuthUser = NonNullable<typeof authClient.$Infer.Session>['user'];
export type AuthSession = NonNullable<typeof authClient.$Infer.Session>['session'];
