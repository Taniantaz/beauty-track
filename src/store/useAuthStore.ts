// Auth Store - Zustand with Supabase

import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useGuestStore } from './useGuestStore';

const HAS_EVER_LOGGED_IN_KEY = '@beauty_track_has_ever_logged_in';

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  isGuest: boolean; // Track if user is in guest mode
  hasEverLoggedIn: boolean; // Persistent flag: true if user has ever logged in on this device
  
  // Actions
  setSession: (session: Session | null) => Promise<void>;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  signInAnonymously: () => Promise<string | null>; // Returns guest user ID
  signOut: () => Promise<void>;
  setGuestMode: (isGuest: boolean) => void;
  markHasEverLoggedIn: () => Promise<void>; // Set hasEverLoggedIn to true
  checkHasEverLoggedIn: () => Promise<boolean>; // Check if user has ever logged in
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  isLoading: true,
  isInitialized: false,
  isGuest: false,
  hasEverLoggedIn: false,
  
  setSession: async (session) => {
    // If this is a new session (user just logged in), mark hasEverLoggedIn
    if (session && !get().session) {
      await get().markHasEverLoggedIn();
    }
    
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
      
      // Check if user has ever logged in on this device
      const hasEverLoggedIn = await get().checkHasEverLoggedIn();
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      // If we have a session, clear guest mode and mark as logged in
      if (session) {
        const { clearGuest } = useGuestStore.getState();
        clearGuest().catch(console.error);
        // Mark as logged in if not already marked
        if (!hasEverLoggedIn) {
          await get().markHasEverLoggedIn();
        }
      }
      
      set({
        session,
        user: session?.user ?? null,
        isGuest: false, // Clear guest mode if session exists
        hasEverLoggedIn,
        isLoading: false,
        isInitialized: true,
      });
      
      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (_event, session) => {
        // Clear guest mode when session is restored
        if (session) {
          const { clearGuest } = useGuestStore.getState();
          clearGuest().catch(console.error);
          // Mark as logged in if not already marked
          const currentHasEverLoggedIn = await get().checkHasEverLoggedIn();
          if (!currentHasEverLoggedIn) {
            await get().markHasEverLoggedIn();
          }
        }
        
        set({
          session,
          user: session?.user ?? null,
          isGuest: false, // Clear guest mode when authenticated
          hasEverLoggedIn: session ? true : get().hasEverLoggedIn,
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
      
      // DO NOT clear hasEverLoggedIn - it persists across logouts
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
  
  markHasEverLoggedIn: async () => {
    try {
      await AsyncStorage.setItem(HAS_EVER_LOGGED_IN_KEY, 'true');
      set({ hasEverLoggedIn: true });
    } catch (error) {
      console.error('Error marking hasEverLoggedIn:', error);
    }
  },
  
  checkHasEverLoggedIn: async (): Promise<boolean> => {
    try {
      const value = await AsyncStorage.getItem(HAS_EVER_LOGGED_IN_KEY);
      const hasEverLoggedIn = value === 'true';
      set({ hasEverLoggedIn });
      return hasEverLoggedIn;
    } catch (error) {
      console.error('Error checking hasEverLoggedIn:', error);
      return false;
    }
  },
}));

