// Auth Store - Zustand with Supabase

import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useGuestStore } from './useGuestStore';

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  isGuest: boolean; // Track if user is in guest mode
  
  // Actions
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  signInAnonymously: () => Promise<string | null>; // Returns guest user ID
  signOut: () => Promise<void>;
  setGuestMode: (isGuest: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  isLoading: true,
  isInitialized: false,
  isGuest: false,
  
  setSession: (session) => {
    set({
      session,
      user: session?.user ?? null,
      isGuest: false, // Authenticated users are not guests
    });
  },
  
  setLoading: (loading) => {
    set({ isLoading: loading });
  },
  
  setGuestMode: (isGuest: boolean) => {
    set({ isGuest });
  },
  
  initialize: async () => {
    try {
      set({ isLoading: true });
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      // If we have a session, clear guest mode
      if (session) {
        const { clearGuest } = useGuestStore.getState();
        clearGuest().catch(console.error);
      }
      
      set({
        session,
        user: session?.user ?? null,
        isGuest: false, // Clear guest mode if session exists
        isLoading: false,
        isInitialized: true,
      });
      
      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        // Clear guest mode when session is restored
        if (session) {
          const { clearGuest } = useGuestStore.getState();
          clearGuest().catch(console.error);
        }
        
        set({
          session,
          user: session?.user ?? null,
          isGuest: false, // Clear guest mode when authenticated
        });
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ isLoading: false, isInitialized: true });
    }
  },
  
  signInAnonymously: async () => {
    // Guest mode doesn't use Supabase anonymous auth
    // Instead, we use local storage with a generated guest ID
    // This function is kept for compatibility but doesn't create a Supabase session
    set({ isGuest: true, isLoading: false });
    return null; // Return null to indicate we're using local guest ID
  },
  
  signOut: async () => {
    try {
      set({ isLoading: true });
      await supabase.auth.signOut();
      
      // Clear guest mode when signing out
      const { clearGuest } = useGuestStore.getState();
      await clearGuest();
      
      set({ 
        session: null, 
        user: null, 
        isGuest: false,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error signing out:', error);
      set({ isLoading: false });
    }
  },
}));

