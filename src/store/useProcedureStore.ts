// Procedure Store - Zustand with Supabase

import { create } from 'zustand';
import { Procedure, Photo, Category, ReminderInterval } from '../types';
import {
  fetchProcedures as fetchProceduresFromService,
  createProcedure as createProcedureInService,
  updateProcedure as updateProcedureInService,
  deleteProcedure as deleteProcedureInService,
  ProcedureData,
  ReminderData,
  PhotoData,
} from '../services/procedureService';
import {
  fetchGuestProcedures,
  createGuestProcedure,
  updateGuestProcedure,
  deleteGuestProcedure,
} from '../services/guestProcedureService';
import { useUserStore } from './useUserStore';
import { useAuthStore } from './useAuthStore';
import { useGuestStore } from './useGuestStore';

interface ProcedureStore {
  procedures: Procedure[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProcedures: (userId: string) => Promise<void>;
  addProcedure: (
    userId: string,
    procedureData: ProcedureData,
    photos: PhotoData[],
    reminderData?: ReminderData
  ) => Promise<void>;
  updateProcedure: (
    procedureId: string,
    userId: string,
    updates: Partial<ProcedureData>,
    newPhotos?: PhotoData[],
    reminderData?: ReminderData
  ) => Promise<void>;
  deleteProcedure: (procedureId: string, userId: string) => Promise<void>;
  getProcedureById: (id: string) => Procedure | undefined;
  
  // Helpers
  clearError: () => void;
  reset: () => void;
}

export const useProcedureStore = create<ProcedureStore>((set, get) => ({
  procedures: [],
  isLoading: false,
  error: null,
  
  fetchProcedures: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Check if user is in guest mode
      const { isGuest } = useAuthStore.getState();
      const { isGuestMode } = useGuestStore.getState();
      
      let procedures: Procedure[];
      if (isGuest || isGuestMode) {
        // Fetch from local storage for guests
        procedures = await fetchGuestProcedures(userId);
      } else {
        // Fetch from Supabase for authenticated users
        procedures = await fetchProceduresFromService(userId);
      }
      
      set({ procedures, isLoading: false });
      
      // Update user stats based on fetched data
      const { updateUser } = useUserStore.getState();
      const procedureCount = procedures.length;
      const photoCount = procedures.reduce((acc, p) => acc + p.photos.length, 0);
      updateUser({
        procedureCount,
        photoCount,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch procedures';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  addProcedure: async (
    userId: string,
    procedureData: ProcedureData,
    photos: PhotoData[],
    reminderData?: ReminderData
  ) => {
    try {
      set({ isLoading: true, error: null });
      
      // Check if user is in guest mode
      const { isGuest } = useAuthStore.getState();
      const { isGuestMode } = useGuestStore.getState();
      
      let newProcedure: Procedure;
      if (isGuest || isGuestMode) {
        // Create in local storage for guests
        newProcedure = await createGuestProcedure(userId, procedureData, photos, reminderData);
      } else {
        // Create in Supabase for authenticated users
        newProcedure = await createProcedureInService(userId, procedureData, photos, reminderData);
      }
      
      set((state) => ({
        procedures: [newProcedure, ...state.procedures],
        isLoading: false,
      }));
      
      // Update user stats
      const { updateUser } = useUserStore.getState();
      const currentUser = useUserStore.getState().user;
      updateUser({
        procedureCount: currentUser.procedureCount + 1,
        photoCount: currentUser.photoCount + photos.length,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create procedure';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  updateProcedure: async (
    procedureId: string,
    userId: string,
    updates: Partial<ProcedureData>,
    newPhotos: PhotoData[] = [],
    reminderData?: ReminderData
  ) => {
    try {
      set({ isLoading: true, error: null });
      
      // Check if user is in guest mode
      const { isGuest } = useAuthStore.getState();
      const { isGuestMode } = useGuestStore.getState();
      
      let updatedProcedure: Procedure;
      if (isGuest || isGuestMode) {
        // Update in local storage for guests
        updatedProcedure = await updateGuestProcedure(
          userId,
          procedureId,
          updates,
          newPhotos,
          reminderData
        );
      } else {
        // Update in Supabase for authenticated users
        updatedProcedure = await updateProcedureInService(
          procedureId,
          userId,
          updates,
          newPhotos,
          reminderData
        );
      }
      
      set((state) => ({
        procedures: state.procedures.map((p) =>
          p.id === procedureId ? updatedProcedure : p
        ),
        isLoading: false,
      }));
      
      // Update user stats if photos were added
      if (newPhotos.length > 0) {
        const { updateUser } = useUserStore.getState();
        const currentUser = useUserStore.getState().user;
        updateUser({
          photoCount: currentUser.photoCount + newPhotos.length,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update procedure';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  deleteProcedure: async (procedureId: string, userId: string) => {
    try {
      const procedure = get().procedures.find((p) => p.id === procedureId);
      if (!procedure) {
        throw new Error('Procedure not found');
      }
      
      set({ isLoading: true, error: null });
      
      // Check if user is in guest mode
      const { isGuest } = useAuthStore.getState();
      const { isGuestMode } = useGuestStore.getState();
      
      if (isGuest || isGuestMode) {
        // Delete from local storage for guests
        await deleteGuestProcedure(userId, procedureId);
      } else {
        // Delete from Supabase for authenticated users
        await deleteProcedureInService(procedureId, userId);
      }
      
      set((state) => ({
        procedures: state.procedures.filter((p) => p.id !== procedureId),
        isLoading: false,
      }));
      
      // Update user stats
      const { updateUser } = useUserStore.getState();
      const currentUser = useUserStore.getState().user;
      updateUser({
        procedureCount: Math.max(0, currentUser.procedureCount - 1),
        photoCount: Math.max(0, currentUser.photoCount - procedure.photos.length),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete procedure';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  getProcedureById: (id: string) => {
    return get().procedures.find((p) => p.id === id);
  },
  
  clearError: () => {
    set({ error: null });
  },
  
  reset: () => {
    set({ procedures: [], error: null, isLoading: false });
  },
}));

