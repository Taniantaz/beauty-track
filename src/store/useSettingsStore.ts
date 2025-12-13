// Settings Store - Zustand

import { create } from 'zustand';

interface SettingsStore {
  hasSeenOnboarding: boolean;
  isDarkMode: boolean;
  
  // Actions
  setHasSeenOnboarding: (value: boolean) => void;
  setIsDarkMode: (value: boolean) => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  hasSeenOnboarding: false,
  isDarkMode: false,
  
  setHasSeenOnboarding: (value) => {
    set({ hasSeenOnboarding: value });
  },
  
  setIsDarkMode: (value) => {
    set({ isDarkMode: value });
  },
  
  reset: () => {
    set({ hasSeenOnboarding: false, isDarkMode: false });
  },
}));

