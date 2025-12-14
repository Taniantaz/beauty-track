// Guest Procedure Service - Local Storage for Guest Users

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Procedure, Photo, Reminder, Category, ReminderInterval } from '../types';
import { ProcedureData, ReminderData, PhotoData } from './procedureService';

const GUEST_PROCEDURES_KEY = '@beauty_track_guest_procedures';

/**
 * Fetch all guest procedures from local storage
 */
export async function fetchGuestProcedures(guestUserId: string): Promise<Procedure[]> {
  try {
    const key = `${GUEST_PROCEDURES_KEY}_${guestUserId}`;
    const stored = await AsyncStorage.getItem(key);
    
    if (!stored) {
      return [];
    }
    
    const procedures = JSON.parse(stored);
    
    // Convert date strings back to Date objects
    return procedures.map((proc: any) => ({
      ...proc,
      date: new Date(proc.date),
      createdAt: new Date(proc.createdAt),
      updatedAt: new Date(proc.updatedAt),
      photos: proc.photos.map((photo: any) => ({
        ...photo,
        timestamp: new Date(photo.timestamp),
      })),
      reminder: proc.reminder
        ? {
            ...proc.reminder,
            nextDate: new Date(proc.reminder.nextDate),
          }
        : undefined,
    }));
  } catch (error) {
    console.error('Error fetching guest procedures:', error);
    return [];
  }
}

/**
 * Save guest procedures to local storage
 */
async function saveGuestProcedures(
  guestUserId: string,
  procedures: Procedure[]
): Promise<void> {
  try {
    const key = `${GUEST_PROCEDURES_KEY}_${guestUserId}`;
    await AsyncStorage.setItem(key, JSON.stringify(procedures));
  } catch (error) {
    console.error('Error saving guest procedures:', error);
    throw error;
  }
}

/**
 * Create a new guest procedure
 */
export async function createGuestProcedure(
  guestUserId: string,
  procedureData: ProcedureData,
  photos: PhotoData[] = [],
  reminderData?: ReminderData
): Promise<Procedure> {
  try {
    const existingProcedures = await fetchGuestProcedures(guestUserId);
    
    // Create procedure object
    const newProcedure: Procedure = {
      id: `guest_proc_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      name: procedureData.name,
      category: procedureData.category,
      date: procedureData.date,
      clinic: procedureData.clinic,
      cost: procedureData.cost,
      notes: procedureData.notes,
      productBrand: procedureData.productBrand,
      photos: photos.map((photo, index) => ({
        id: `guest_photo_${Date.now()}_${index}`,
        uri: photo.uri, // Store local file URI
        tag: photo.tag,
        timestamp: new Date(),
      })),
      reminder: reminderData
        ? {
            id: `guest_reminder_${Date.now()}`,
            procedureId: '', // Will be set after procedure is created
            interval: reminderData.interval,
            customDays: reminderData.customDays,
            nextDate: reminderData.nextDate,
            enabled: reminderData.enabled,
          }
        : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Set procedure ID in reminder
    if (newProcedure.reminder) {
      newProcedure.reminder.procedureId = newProcedure.id;
    }
    
    // Add to list and save
    const updatedProcedures = [newProcedure, ...existingProcedures];
    await saveGuestProcedures(guestUserId, updatedProcedures);
    
    return newProcedure;
  } catch (error) {
    console.error('Error creating guest procedure:', error);
    throw error;
  }
}

/**
 * Update a guest procedure
 */
export async function updateGuestProcedure(
  guestUserId: string,
  procedureId: string,
  updates: Partial<ProcedureData>,
  newPhotos: PhotoData[] = [],
  reminderData?: ReminderData
): Promise<Procedure> {
  try {
    const procedures = await fetchGuestProcedures(guestUserId);
    const procedureIndex = procedures.findIndex((p) => p.id === procedureId);
    
    if (procedureIndex === -1) {
      throw new Error('Procedure not found');
    }
    
    const existingProcedure = procedures[procedureIndex];
    
    // Merge updates
    const updatedProcedure: Procedure = {
      ...existingProcedure,
      ...updates,
      updatedAt: new Date(),
    };
    
    // Add new photos (keep existing ones)
    if (newPhotos.length > 0) {
      const newPhotoObjects: Photo[] = newPhotos.map((photo, index) => ({
        id: `guest_photo_${Date.now()}_${index}`,
        uri: photo.uri,
        tag: photo.tag,
        timestamp: new Date(),
      }));
      updatedProcedure.photos = [...existingProcedure.photos, ...newPhotoObjects];
    }
    
    // Update reminder
    if (reminderData) {
      updatedProcedure.reminder = {
        id: existingProcedure.reminder?.id || `guest_reminder_${Date.now()}`,
        procedureId: procedureId,
        interval: reminderData.interval,
        customDays: reminderData.customDays,
        nextDate: reminderData.nextDate,
        enabled: reminderData.enabled,
      };
    }
    
    // Update in array and save
    procedures[procedureIndex] = updatedProcedure;
    await saveGuestProcedures(guestUserId, procedures);
    
    return updatedProcedure;
  } catch (error) {
    console.error('Error updating guest procedure:', error);
    throw error;
  }
}

/**
 * Delete a guest procedure
 */
export async function deleteGuestProcedure(
  guestUserId: string,
  procedureId: string
): Promise<void> {
  try {
    const procedures = await fetchGuestProcedures(guestUserId);
    const filtered = procedures.filter((p) => p.id !== procedureId);
    await saveGuestProcedures(guestUserId, filtered);
  } catch (error) {
    console.error('Error deleting guest procedure:', error);
    throw error;
  }
}

/**
 * Get all guest procedures for migration
 */
export async function getAllGuestProcedures(guestUserId: string): Promise<Procedure[]> {
  return fetchGuestProcedures(guestUserId);
}

/**
 * Clear all guest procedures (after migration)
 */
export async function clearGuestProcedures(guestUserId: string): Promise<void> {
  try {
    const key = `${GUEST_PROCEDURES_KEY}_${guestUserId}`;
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing guest procedures:', error);
  }
}

