import { create } from 'zustand';

import { authClient } from '@/lib/auth-client';

interface AuthState {
  user: { id: string; name: string; email: string } | null;
  token: string | null;
  isLoading: boolean;

  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  initialize: async () => {
    try {
      const { data } = await authClient.getSession();
      set({
        user: data?.user ?? null,
        token: data?.session.token ?? null,
        isLoading: false,
      });
    } catch {
      set({ user: null, token: null, isLoading: false });
    }
  },

  signIn: async (email, password) => {
    const { data, error } = await authClient.signIn.email({ email, password });
    if (error) throw new Error(error.message ?? 'Sign-in failed.');
    set({ user: data.user, token: data.token });
  },

  signUp: async (email, password, name) => {
    const { data, error } = await authClient.signUp.email({ email, password, name });
    if (error) throw new Error(error.message ?? 'Sign-up failed.');
    set({ user: data.user, token: data.token });
  },

  signOut: async () => {
    await authClient.signOut();
    set({ user: null, token: null });
  },
}));
