import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  avatar: string;
  created_at: string;
}

interface AuthStore {
  // State
  user: User | null;
  profile: Profile | null;
  profiles: Profile[];
  loading: boolean;
  error: string | null;

  // Auth
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  initAuth: () => Promise<void>;

  // Profiles
  selectProfile: (profile: Profile) => void;
  clearProfile: () => void;
  loadProfiles: () => Promise<void>;
  createProfile: (name: string, avatar: string) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  profile: null,
  profiles: [],
  loading: true,
  error: null,

  initAuth: async () => {
    if (!supabase) {
      set({ loading: false });
      return;
    }
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      set({ user: data.session.user });
      await get().loadProfiles();
    }
    set({ loading: false });

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null });
      if (!session?.user) {
        set({ profile: null, profiles: [] });
      }
    });
  },

  signIn: async (email, password) => {
    if (!supabase) return false;
    set({ error: null });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ error: error.message });
      return false;
    }
    const { data } = await supabase.auth.getUser();
    set({ user: data.user });
    await get().loadProfiles();
    return true;
  },

  signUp: async (email, password) => {
    if (!supabase) return false;
    set({ error: null });
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      set({ error: error.message });
      return false;
    }
    // Auto sign-in after signup
    return get().signIn(email, password);
  },

  signOut: async () => {
    if (supabase) await supabase.auth.signOut();
    set({ user: null, profile: null, profiles: [] });
  },

  selectProfile: (profile) => set({ profile }),
  clearProfile: () => set({ profile: null }),

  loadProfiles: async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at');
    set({ profiles: data ?? [] });
  },

  createProfile: async (name, avatar) => {
    if (!supabase) return;
    const user = get().user;
    if (!user) return;
    await supabase.from('profiles').insert({ user_id: user.id, name, avatar });
    await get().loadProfiles();
  },

  deleteProfile: async (id) => {
    if (!supabase) return;
    await supabase.from('profiles').delete().eq('id', id);
    if (get().profile?.id === id) set({ profile: null });
    await get().loadProfiles();
  },
}));
