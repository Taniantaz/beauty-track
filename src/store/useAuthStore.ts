// Auth Store - Zustand with Supabase

import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Actions
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  isLoading: true,
  isInitialized: false,
  
  setSession: (session) => {
    set({
      session,
      user: session?.user ?? null,
    });
  },
  
  setLoading: (loading) => {
    set({ isLoading: loading });
  },
  
  initialize: async () => {
    try {
      set({ isLoading: true });
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      set({
        session,
        user: session?.user ?? null,
        isLoading: false,
        isInitialized: true,
      });
      
      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({
          session,
          user: session?.user ?? null,
        });
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ isLoading: false, isInitialized: true });
    }
  },
  
  signOut: async () => {
    try {
      set({ isLoading: true });
      await supabase.auth.signOut();
      set({ session: null, user: null, isLoading: false });
    } catch (error) {
      console.error('Error signing out:', error);
      set({ isLoading: false });
    }
  },
}));

