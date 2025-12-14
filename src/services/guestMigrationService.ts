// Guest Migration Service - Migrates guest data from local storage to Supabase

import { Procedure, Photo, Reminder } from '../types';
import { supabase } from '../lib/supabase';
import {
  createProcedure as createProcedureInService,
  ProcedureData,
  ReminderData,
  PhotoData,
} from './procedureService';
import { uploadToSupabaseStorage } from './photoService';
import { getAllGuestProcedures, clearGuestProcedures } from './guestProcedureService';

/**
 * Migrate all guest procedures from local storage to Supabase
 * This is called when a guest user signs in
 */
export async function migrateGuestDataToUser(
  guestUserId: string,
  authenticatedUserId: string
): Promise<void> {
  try {
    console.log('Starting guest data migration:', { guestUserId, authenticatedUserId });

    // Fetch all guest procedures from local storage
    const guestProcedures = await getAllGuestProcedures(guestUserId);

    if (!guestProcedures || guestProcedures.length === 0) {
      console.log('No guest procedures to migrate');
      return;
    }

    console.log(`Migrating ${guestProcedures.length} procedures`);

    // Migrate each procedure
    for (const guestProcedure of guestProcedures) {
      try {
        // Prepare procedure data
        const procedureData: ProcedureData = {
          name: guestProcedure.name,
          category: guestProcedure.category,
          date: guestProcedure.date,
          clinic: guestProcedure.clinic,
          cost: guestProcedure.cost,
          notes: guestProcedure.notes,
          productBrand: guestProcedure.productBrand,
        };

        // Prepare photos - upload local file URIs to Supabase Storage
        const photoData: PhotoData[] = guestProcedure.photos.map((photo) => ({
          uri: photo.uri, // Local file URI
          tag: photo.tag,
        }));

        // Prepare reminder data
        let reminderData: ReminderData | undefined;
        if (guestProcedure.reminder) {
          reminderData = {
            interval: guestProcedure.reminder.interval,
            customDays: guestProcedure.reminder.customDays,
            nextDate: guestProcedure.reminder.nextDate,
            enabled: guestProcedure.reminder.enabled,
          };
        }

        // Create procedure in Supabase (this will upload photos)
        await createProcedureInService(
          authenticatedUserId,
          procedureData,
          photoData,
          reminderData
        );

        console.log(`Migrated procedure: ${guestProcedure.name}`);
      } catch (error) {
        console.error(`Error migrating procedure ${guestProcedure.id}:`, error);
        // Continue with other procedures even if one fails
      }
    }

    // Clear guest procedures from local storage after successful migration
    await clearGuestProcedures(guestUserId);

    console.log('Guest data migration completed successfully');
  } catch (error) {
    console.error('Error in guest data migration:', error);
    throw error;
  }
}

/**
 * Check if user has guest data that needs migration
 */
export async function hasGuestData(guestUserId: string): Promise<boolean> {
  try {
    const guestProcedures = await getAllGuestProcedures(guestUserId);
    return guestProcedures.length > 0;
  } catch (error) {
    console.error('Error in hasGuestData:', error);
    return false;
  }
}

