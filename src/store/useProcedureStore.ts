// Procedure Store - Zustand

import { create } from 'zustand';
import { Procedure, Photo } from '../types';
import { MOCK_PROCEDURES } from '../data/mockData';
import { useUserStore } from './useUserStore';

interface ProcedureStore {
  procedures: Procedure[];
  
  // Actions
  addProcedure: (procedure: Omit<Procedure, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProcedure: (id: string, updates: Partial<Procedure>) => void;
  deleteProcedure: (id: string) => void;
  getProcedureById: (id: string) => Procedure | undefined;
  
  // Helpers
  reset: () => void;
}

export const useProcedureStore = create<ProcedureStore>((set, get) => ({
  procedures: MOCK_PROCEDURES,
  
  addProcedure: (procedure) => {
    const newProcedure: Procedure = {
      ...procedure,
      id: `procedure_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set((state) => ({
      procedures: [newProcedure, ...state.procedures],
    }));
    
    // Update user stats
    const { updateUser } = useUserStore.getState();
    const currentUser = useUserStore.getState().user;
    updateUser({
      procedureCount: currentUser.procedureCount + 1,
      photoCount: currentUser.photoCount + procedure.photos.length,
    });
  },
  
  updateProcedure: (id, updates) => {
    set((state) => ({
      procedures: state.procedures.map((p) =>
        p.id === id
          ? { ...p, ...updates, updatedAt: new Date() }
          : p
      ),
    }));
  },
  
  deleteProcedure: (id) => {
    const procedure = get().procedures.find((p) => p.id === id);
    if (procedure) {
      set((state) => ({
        procedures: state.procedures.filter((p) => p.id !== id),
      }));
      
      // Update user stats
      const { updateUser } = useUserStore.getState();
      const currentUser = useUserStore.getState().user;
      updateUser({
        procedureCount: Math.max(0, currentUser.procedureCount - 1),
        photoCount: Math.max(0, currentUser.photoCount - procedure.photos.length),
      });
    }
  },
  
  getProcedureById: (id) => {
    return get().procedures.find((p) => p.id === id);
  },
  
  reset: () => {
    set({ procedures: MOCK_PROCEDURES });
  },
}));

