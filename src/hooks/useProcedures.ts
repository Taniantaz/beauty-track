// Custom hook for procedure operations

import { useMemo } from 'react';
import { Procedure, Category } from '../types';
import { MOCK_PROCEDURES } from '../data/mockData';

interface UseProceduresReturn {
  procedures: Procedure[];
  proceduresByCategory: Record<Category, Procedure[]>;
  upcomingReminders: Procedure[];
  totalCost: number;
  totalPhotos: number;
  getProcedureById: (id: string) => Procedure | undefined;
  getBeforeAfterPhotos: (procedureId: string) => {
    before: string[];
    after: string[];
  };
}

export const useProcedures = (procedures: Procedure[] = MOCK_PROCEDURES): UseProceduresReturn => {
  // Group procedures by category
  const proceduresByCategory = useMemo(() => {
    return procedures.reduce((acc, procedure) => {
      if (!acc[procedure.category]) {
        acc[procedure.category] = [];
      }
      acc[procedure.category].push(procedure);
      return acc;
    }, {} as Record<Category, Procedure[]>);
  }, [procedures]);

  // Get procedures with upcoming reminders
  const upcomingReminders = useMemo(() => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return procedures.filter(p => {
      if (!p.reminder?.enabled || !p.reminder.nextDate) return false;
      return p.reminder.nextDate <= thirtyDaysFromNow;
    }).sort((a, b) => {
      const dateA = a.reminder?.nextDate || new Date();
      const dateB = b.reminder?.nextDate || new Date();
      return dateA.getTime() - dateB.getTime();
    });
  }, [procedures]);

  // Calculate total cost
  const totalCost = useMemo(() => {
    return procedures.reduce((sum, p) => sum + (p.cost || 0), 0);
  }, [procedures]);

  // Calculate total photos
  const totalPhotos = useMemo(() => {
    return procedures.reduce((sum, p) => sum + p.photos.length, 0);
  }, [procedures]);

  // Get procedure by ID
  const getProcedureById = (id: string): Procedure | undefined => {
    return procedures.find(p => p.id === id);
  };

  // Get before/after photos for a procedure
  const getBeforeAfterPhotos = (procedureId: string) => {
    const procedure = getProcedureById(procedureId);
    if (!procedure) {
      return { before: [], after: [] };
    }
    
    return {
      before: procedure.photos.filter(p => p.tag === 'before').map(p => p.uri),
      after: procedure.photos.filter(p => p.tag === 'after').map(p => p.uri),
    };
  };

  return {
    procedures,
    proceduresByCategory,
    upcomingReminders,
    totalCost,
    totalPhotos,
    getProcedureById,
    getBeforeAfterPhotos,
  };
};

export default useProcedures;

