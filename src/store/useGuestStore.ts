// Guest Store - Manages guest/anonymous user state

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GUEST_USER_ID_KEY = '@beauty_track_guest_user_id';
const GUEST_MODE_KEY = '@beauty_track_guest_mode';

interface GuestState {
  guestUserId: string | null;
  isGuestMode: boolean;
  
  // Actions
  initializeGuest: (supabaseUserId?: string) => Promise<string>;
  setGuestMode: (isGuest: boolean) => Promise<void>;
  clearGuest: () => Promise<void>;
}

export const useGuestStore = create<GuestState>((set, get) => ({
  guestUserId: null,
  isGuestMode: false,
  
  initializeGuest: async (supabaseUserId?: string) => {
    try {
      // First, check if there's an authenticated session - if so, don't initialize guest mode
      const { supabase } = await import('../lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // User is authenticated, clear guest mode
        await get().clearGuest();
        return '';
      }
      
      // If Supabase anonymous user ID is provided, use that (preferred)
      if (supabaseUserId) {
        await AsyncStorage.setItem(GUEST_USER_ID_KEY, supabaseUserId);
        await AsyncStorage.setItem(GUEST_MODE_KEY, 'true');
        set({ 
          guestUserId: supabaseUserId,
          isGuestMode: true,
        });
        return supabaseUserId;
      }
      
      // Check if we already have a guest user ID
      const storedGuestId = await AsyncStorage.getItem(GUEST_USER_ID_KEY);
      const storedGuestMode = await AsyncStorage.getItem(GUEST_MODE_KEY);
      
      if (storedGuestId && storedGuestMode === 'true') {
        set({ 
          guestUserId: storedGuestId,
          isGuestMode: true,
        });
        return storedGuestId;
      }
      
      // Generate new guest user ID (UUID v4 format) - fallback only
      const newGuestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      await AsyncStorage.setItem(GUEST_USER_ID_KEY, newGuestId);
      await AsyncStorage.setItem(GUEST_MODE_KEY, 'true');
      
      set({ 
        guestUserId: newGuestId,
        isGuestMode: true,
      });
      
      return newGuestId;
    } catch (error) {
      console.error('Error initializing guest:', error);
      // Fallback: generate in-memory guest ID
      const fallbackId = supabaseUserId || `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      set({ 
        guestUserId: fallbackId,
        isGuestMode: true,
      });
      return fallbackId;
    }
  },
  
  setGuestMode: async (isGuest: boolean) => {
    try {
      await AsyncStorage.setItem(GUEST_MODE_KEY, isGuest ? 'true' : 'false');
      set({ isGuestMode: isGuest });
    } catch (error) {
      console.error('Error setting guest mode:', error);
      set({ isGuestMode: isGuest });
    }
  },
  
  clearGuest: async () => {
    try {
      await AsyncStorage.removeItem(GUEST_USER_ID_KEY);
      await AsyncStorage.removeItem(GUEST_MODE_KEY);
      set({ guestUserId: null, isGuestMode: false });
    } catch (error) {
      console.error('Error clearing guest:', error);
      set({ guestUserId: null, isGuestMode: false });
    }
  },
}));

