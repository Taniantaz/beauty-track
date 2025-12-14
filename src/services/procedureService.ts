// Procedure Service - Supabase Database Operations

import { supabase } from '../lib/supabase';
import { Procedure, Photo, Reminder, Category, ReminderInterval } from '../types';
import {
  uploadToSupabaseStorage,
  deleteProcedurePhotos,
  getPhotoUrl,
} from './photoService';

export interface ProcedureData {
  name: string;
  category: Category;
  date: Date;
  clinic?: string;
  cost?: number;
  notes?: string;
  productBrand?: string;
}

export interface ReminderData {
  interval: ReminderInterval;
  customDays?: number;
  nextDate: Date;
  enabled: boolean;
}

export interface PhotoData {
  uri: string;
  tag: 'before' | 'after';
}

/**
 * Calculate next reminder date based on interval
 */
function calculateNextDate(
  interval: ReminderInterval,
  customDays?: number,
  baseDate?: Date
): Date {
  const date = baseDate || new Date();
  const nextDate = new Date(date);

  switch (interval) {
    case '30days':
      nextDate.setDate(nextDate.getDate() + 30);
      break;
    case '90days':
      nextDate.setDate(nextDate.getDate() + 90);
      break;
    case '6months':
      nextDate.setMonth(nextDate.getMonth() + 6);
      break;
    case '1year':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    case 'custom':
      if (customDays) {
        nextDate.setDate(nextDate.getDate() + customDays);
      }
      break;
  }

  return nextDate;
}

/**
 * Fetch all procedures for a user
 */
export async function fetchProcedures(userId: string): Promise<Procedure[]> {
  try {
    // Fetch procedures with related photos and reminders
    const { data: procedures, error: proceduresError } = await supabase
      .from('procedures')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (proceduresError) {
      throw new Error(`Failed to fetch procedures: ${proceduresError.message}`);
    }

    if (!procedures || procedures.length === 0) {
      return [];
    }

    const procedureIds = procedures.map((p) => p.id);

    // Fetch photos for all procedures
    const { data: photos, error: photosError } = await supabase
      .from('photos')
      .select('*')
      .in('procedure_id', procedureIds);

    if (photosError) {
      throw new Error(`Failed to fetch photos: ${photosError.message}`);
    }

    // Fetch reminders for all procedures
    const { data: reminders, error: remindersError } = await supabase
      .from('reminders')
      .select('*')
      .in('procedure_id', procedureIds);

    if (remindersError) {
      throw new Error(`Failed to fetch reminders: ${remindersError.message}`);
    }

    // Map database records to Procedure objects
    return procedures.map((proc) => {
      const procedurePhotos: Photo[] =
        photos
          ?.filter((p) => p.procedure_id === proc.id)
          .map((p) => ({
            id: p.id,
            uri: getPhotoUrl(p.storage_path),
            tag: p.tag as 'before' | 'after',
            timestamp: new Date(p.created_at),
          })) || [];

      const procedureReminder = reminders?.find(
        (r) => r.procedure_id === proc.id
      );

      const reminder: Reminder | undefined = procedureReminder
        ? {
            id: procedureReminder.id,
            procedureId: proc.id,
            interval: procedureReminder.interval as ReminderInterval,
            customDays: procedureReminder.custom_days || undefined,
            nextDate: new Date(procedureReminder.next_date),
            enabled: procedureReminder.enabled,
          }
        : undefined;

      return {
        id: proc.id,
        name: proc.name,
        category: proc.category as Category,
        date: new Date(proc.date),
        clinic: proc.clinic || undefined,
        cost: proc.cost ? Number(proc.cost) : undefined,
        notes: proc.notes || undefined,
        productBrand: proc.product_brand || undefined,
        photos: procedurePhotos,
        reminder,
        createdAt: new Date(proc.created_at),
        updatedAt: new Date(proc.updated_at),
      };
    });
  } catch (error) {
    console.error('Error fetching procedures:', error);
    throw error;
  }
}

/**
 * Create a new procedure with photos and optional reminder
 */
export async function createProcedure(
  userId: string,
  procedureData: ProcedureData,
  photos: PhotoData[] = [],
  reminderData?: ReminderData
): Promise<Procedure> {
  try {
    // Insert procedure
    const { data: procedure, error: procedureError } = await supabase
      .from('procedures')
      .insert({
        user_id: userId,
        name: procedureData.name,
        category: procedureData.category,
        date: procedureData.date.toISOString(),
        clinic: procedureData.clinic || null,
        cost: procedureData.cost || null,
        notes: procedureData.notes || null,
        product_brand: procedureData.productBrand || null,
      })
      .select()
      .single();

    if (procedureError) {
      throw new Error(`Failed to create procedure: ${procedureError.message}`);
    }

    if (!procedure) {
      throw new Error('Failed to create procedure: No data returned');
    }

    const procedureId = procedure.id;

    // Upload photos
    const uploadedPhotos: Photo[] = [];
    for (const photo of photos) {
      try {
        const uploadResult = await uploadToSupabaseStorage(
          photo.uri,
          userId,
          procedureId,
          photo.tag
        );

        // Insert photo record
        const { data: photoRecord, error: photoError } = await supabase
          .from('photos')
          .insert({
            procedure_id: procedureId,
            storage_path: uploadResult.storagePath,
            tag: photo.tag,
          })
          .select()
          .single();

        if (photoError) {
          console.error('Error saving photo record:', photoError);
          // Continue with other photos even if one fails
          continue;
        }

        if (photoRecord) {
          uploadedPhotos.push({
            id: photoRecord.id,
            uri: uploadResult.publicUrl,
            tag: photo.tag,
            timestamp: new Date(photoRecord.created_at),
          });
        }
      } catch (photoError) {
        console.error('Error uploading photo:', photoError);
        // Continue with other photos
      }
    }

    // Insert reminder if provided
    let reminder: Reminder | undefined;
    if (reminderData) {
      const { data: reminderRecord, error: reminderError } = await supabase
        .from('reminders')
        .insert({
          procedure_id: procedureId,
          interval: reminderData.interval,
          custom_days: reminderData.customDays || null,
          next_date: reminderData.nextDate.toISOString(),
          enabled: reminderData.enabled,
        })
        .select()
        .single();

      if (reminderError) {
        console.error('Error creating reminder:', reminderError);
      } else if (reminderRecord) {
        reminder = {
          id: reminderRecord.id,
          procedureId,
          interval: reminderRecord.interval as ReminderInterval,
          customDays: reminderRecord.custom_days || undefined,
          nextDate: new Date(reminderRecord.next_date),
          enabled: reminderRecord.enabled,
        };
      }
    }

    return {
      id: procedureId,
      name: procedure.name,
      category: procedure.category as Category,
      date: new Date(procedure.date),
      clinic: procedure.clinic || undefined,
      cost: procedure.cost ? Number(procedure.cost) : undefined,
      notes: procedure.notes || undefined,
      productBrand: procedure.product_brand || undefined,
      photos: uploadedPhotos,
      reminder,
      createdAt: new Date(procedure.created_at),
      updatedAt: new Date(procedure.updated_at),
    };
  } catch (error) {
    console.error('Error creating procedure:', error);
    throw error;
  }
}

/**
 * Update an existing procedure
 */
export async function updateProcedure(
  procedureId: string,
  userId: string,
  updates: Partial<ProcedureData>,
  newPhotos: PhotoData[] = [],
  reminderData?: ReminderData
): Promise<Procedure> {
  try {
    // Update procedure
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.date !== undefined) updateData.date = updates.date.toISOString();
    if (updates.clinic !== undefined) updateData.clinic = updates.clinic || null;
    if (updates.cost !== undefined) updateData.cost = updates.cost || null;
    if (updates.notes !== undefined) updateData.notes = updates.notes || null;
    if (updates.productBrand !== undefined)
      updateData.product_brand = updates.productBrand || null;

    const { data: procedure, error: procedureError } = await supabase
      .from('procedures')
      .update(updateData)
      .eq('id', procedureId)
      .eq('user_id', userId)
      .select()
      .single();

    if (procedureError) {
      throw new Error(`Failed to update procedure: ${procedureError.message}`);
    }

    if (!procedure) {
      throw new Error('Procedure not found or access denied');
    }

    // Upload new photos
    const uploadedPhotos: Photo[] = [];
    for (const photo of newPhotos) {
      try {
        const uploadResult = await uploadToSupabaseStorage(
          photo.uri,
          userId,
          procedureId,
          photo.tag
        );

        const { data: photoRecord, error: photoError } = await supabase
          .from('photos')
          .insert({
            procedure_id: procedureId,
            storage_path: uploadResult.storagePath,
            tag: photo.tag,
          })
          .select()
          .single();

        if (photoError) {
          console.error('Error saving photo record:', photoError);
          continue;
        }

        if (photoRecord) {
          uploadedPhotos.push({
            id: photoRecord.id,
            uri: uploadResult.publicUrl,
            tag: photo.tag,
            timestamp: new Date(photoRecord.created_at),
          });
        }
      } catch (photoError) {
        console.error('Error uploading photo:', photoError);
      }
    }

    // Update or create reminder
    if (reminderData !== undefined) {
      // Check if reminder exists
      const { data: existingReminder } = await supabase
        .from('reminders')
        .select('id')
        .eq('procedure_id', procedureId)
        .single();

      if (existingReminder) {
        // Update existing reminder
        await supabase
          .from('reminders')
          .update({
            interval: reminderData.interval,
            custom_days: reminderData.customDays || null,
            next_date: reminderData.nextDate.toISOString(),
            enabled: reminderData.enabled,
          })
          .eq('id', existingReminder.id);
      } else {
        // Create new reminder
        await supabase.from('reminders').insert({
          procedure_id: procedureId,
          interval: reminderData.interval,
          custom_days: reminderData.customDays || null,
          next_date: reminderData.nextDate.toISOString(),
          enabled: reminderData.enabled,
        });
      }
    }

    // Fetch updated procedure with all relations
    const updatedProcedures = await fetchProcedures(userId);
    const updatedProcedure = updatedProcedures.find((p) => p.id === procedureId);

    if (!updatedProcedure) {
      throw new Error('Failed to fetch updated procedure');
    }

    return updatedProcedure;
  } catch (error) {
    console.error('Error updating procedure:', error);
    throw error;
  }
}

/**
 * Delete a procedure and all associated photos and reminders
 */
export async function deleteProcedure(
  procedureId: string,
  userId: string
): Promise<void> {
  try {
    // Get procedure to find user_id and delete photos from storage
    const { data: procedure } = await supabase
      .from('procedures')
      .select('id, user_id')
      .eq('id', procedureId)
      .eq('user_id', userId)
      .single();

    if (!procedure) {
      throw new Error('Procedure not found or access denied');
    }

    // Delete photos from storage (cascade will handle database records)
    try {
      await deleteProcedurePhotos(userId, procedureId);
    } catch (storageError) {
      console.error('Error deleting photos from storage:', storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete procedure (cascade will delete photos and reminders)
    const { error: deleteError } = await supabase
      .from('procedures')
      .delete()
      .eq('id', procedureId)
      .eq('user_id', userId);

    if (deleteError) {
      throw new Error(`Failed to delete procedure: ${deleteError.message}`);
    }
  } catch (error) {
    console.error('Error deleting procedure:', error);
    throw error;
  }
}

/**
 * Delete a single photo
 */
export async function deletePhoto(
  photoId: string,
  storagePath: string
): Promise<void> {
  try {
    // Delete from database (this will cascade if needed)
    const { error: dbError } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId);

    if (dbError) {
      throw new Error(`Failed to delete photo record: ${dbError.message}`);
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('procedure-photos')
      .remove([storagePath]);

    if (storageError) {
      console.error('Error deleting photo from storage:', storageError);
      // Don't throw - database record is already deleted
    }
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw error;
  }
}

/**
 * Helper to calculate next reminder date
 */
export function calculateReminderNextDate(
  interval: ReminderInterval,
  procedureDate: Date,
  customDays?: number
): Date {
  return calculateNextDate(interval, customDays, procedureDate);
}

