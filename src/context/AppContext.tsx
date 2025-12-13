// App Context - DEPRECATED: Use Zustand stores instead
// This file is kept for reference but should not be used in new code.
// 
// Migration guide:
// - useProcedureStore() instead of useApp().procedures
// - useUserStore() instead of useApp().user
// - useSettingsStore() instead of useApp().hasSeenOnboarding, isDarkMode
//
// See: src/store/ for the new Zustand stores

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Procedure, User, Photo, Category, ReminderInterval } from '../types';
import { MOCK_PROCEDURES, MOCK_USER } from '../data/mockData';

interface AppContextType {
  // User state
  user: User;
  updateUser: (updates: Partial<User>) => void;
  
  // Procedures state
  procedures: Procedure[];
  addProcedure: (procedure: Omit<Procedure, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProcedure: (id: string, updates: Partial<Procedure>) => void;
  deleteProcedure: (id: string) => void;
  getProcedureById: (id: string) => Procedure | undefined;
  
  // App state
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (value: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // User state
  const [user, setUser] = useState<User>(MOCK_USER);
  
  // Procedures state
  const [procedures, setProcedures] = useState<Procedure[]>(MOCK_PROCEDURES);
  
  // App state
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // User actions
  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => ({ ...prev, ...updates }));
  }, []);

  // Procedure actions
  const addProcedure = useCallback((procedure: Omit<Procedure, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProcedure: Procedure = {
      ...procedure,
      id: `procedure_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setProcedures(prev => [newProcedure, ...prev]);
    updateUser({ 
      procedureCount: user.procedureCount + 1,
      photoCount: user.photoCount + procedure.photos.length,
    });
  }, [user.procedureCount, user.photoCount, updateUser]);

  const updateProcedure = useCallback((id: string, updates: Partial<Procedure>) => {
    setProcedures(prev => prev.map(p => 
      p.id === id 
        ? { ...p, ...updates, updatedAt: new Date() }
        : p
    ));
  }, []);

  const deleteProcedure = useCallback((id: string) => {
    const procedure = procedures.find(p => p.id === id);
    if (procedure) {
      setProcedures(prev => prev.filter(p => p.id !== id));
      updateUser({
        procedureCount: Math.max(0, user.procedureCount - 1),
        photoCount: Math.max(0, user.photoCount - procedure.photos.length),
      });
    }
  }, [procedures, user.procedureCount, user.photoCount, updateUser]);

  const getProcedureById = useCallback((id: string) => {
    return procedures.find(p => p.id === id);
  }, [procedures]);

  const value: AppContextType = {
    user,
    updateUser,
    procedures,
    addProcedure,
    updateProcedure,
    deleteProcedure,
    getProcedureById,
    hasSeenOnboarding,
    setHasSeenOnboarding,
    isDarkMode,
    setIsDarkMode,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

/**
 * @deprecated Use Zustand stores instead:
 * - useProcedureStore() for procedures
 * - useUserStore() for user data
 * - useSettingsStore() for app settings
 */
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
