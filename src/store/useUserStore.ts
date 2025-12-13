// User Store - Zustand

import { create } from 'zustand';
import { User } from '../types';
import { MOCK_USER } from '../data/mockData';

interface UserStore {
  user: User;
  
  // Actions
  updateUser: (updates: Partial<User>) => void;
  reset: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: MOCK_USER,
  
  updateUser: (updates) => {
    set((state) => ({
      user: { ...state.user, ...updates },
    }));
  },
  
  reset: () => {
    set({ user: MOCK_USER });
  },
}));

