# Supabase Backend Integration - Complete Implementation Guide

This document provides a comprehensive guide to the Supabase backend integration for the Beauty Track app, including database schema, photo storage, and all service implementations.

## Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Storage Setup](#storage-setup)
4. [Service Layer Architecture](#service-layer-architecture)
5. [Photo Upload Implementation](#photo-upload-implementation)
6. [State Management Integration](#state-management-integration)
7. [Screen Integration](#screen-integration)
8. [Error Handling](#error-handling)
9. [Testing & Troubleshooting](#testing--troubleshooting)
10. [API Reference](#api-reference)

---

## Overview

The Beauty Track app uses Supabase for:
- **Database**: PostgreSQL database for procedures, photos, and reminders
- **Storage**: Supabase Storage for photo files
- **Authentication**: Supabase Auth (already implemented with Google OAuth)
- **Row Level Security**: Automatic user data isolation

### Architecture Flow

```
User Action (Screen)
    ↓
Zustand Store (useProcedureStore)
    ↓
Service Layer (procedureService.ts / photoService.ts)
    ↓
Supabase Client / REST API
    ↓
Supabase Database / Storage
```

---

## Database Schema

### Tables

#### 1. `procedures` Table

Stores the main procedure records.

```sql
CREATE TABLE procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('face', 'skin', 'body', 'hair', 'makeup', 'brows', 'lashes', 'nails', 'tan')),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  clinic TEXT,
  cost NUMERIC(10, 2),
  notes TEXT,
  product_brand TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields:**
- `id`: Unique identifier (UUID)
- `user_id`: Foreign key to authenticated user
- `name`: Procedure name (required)
- `category`: One of 9 predefined categories (required)
- `date`: Procedure date (required)
- `clinic`: Provider/clinic name (optional)
- `cost`: Cost in USD (optional)
- `notes`: Additional notes (optional)
- `product_brand`: Product/brand used (optional)
- `created_at`: Auto-generated timestamp
- `updated_at`: Auto-updated timestamp

#### 2. `photos` Table

Stores photo metadata linked to procedures.

```sql
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  tag TEXT NOT NULL CHECK (tag IN ('before', 'after')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields:**
- `id`: Unique identifier (UUID)
- `procedure_id`: Foreign key to procedure
- `storage_path`: Path in Supabase Storage (e.g., `{user_id}/{procedure_id}/{filename}`)
- `tag`: Either 'before' or 'after'
- `created_at`: Auto-generated timestamp

#### 3. `reminders` Table

Stores reminder settings for procedures.

```sql
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id UUID NOT NULL UNIQUE REFERENCES procedures(id) ON DELETE CASCADE,
  interval TEXT NOT NULL CHECK (interval IN ('30days', '90days', '6months', '1year', 'custom')),
  custom_days INTEGER,
  next_date TIMESTAMP WITH TIME ZONE NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields:**
- `id`: Unique identifier (UUID)
- `procedure_id`: Foreign key to procedure (unique - one reminder per procedure)
- `interval`: Reminder interval type
- `custom_days`: Custom interval in days (if interval is 'custom')
- `next_date`: Next reminder date
- `enabled`: Whether reminder is active
- `created_at`: Auto-generated timestamp
- `updated_at`: Auto-updated timestamp

### Indexes

For optimal query performance:

```sql
CREATE INDEX idx_procedures_user_id ON procedures(user_id);
CREATE INDEX idx_procedures_date ON procedures(date DESC);
CREATE INDEX idx_photos_procedure_id ON photos(procedure_id);
CREATE INDEX idx_reminders_procedure_id ON reminders(procedure_id);
CREATE INDEX idx_reminders_next_date ON reminders(next_date) WHERE enabled = true;
```

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring users can only access their own data:

- **Procedures**: Users can only SELECT/INSERT/UPDATE/DELETE their own procedures
- **Photos**: Access controlled through procedure ownership
- **Reminders**: Access controlled through procedure ownership

See `supabase/migrations/001_create_procedures_schema.sql` for complete RLS policies.

---

## Storage Setup

### Bucket Configuration

1. **Bucket Name**: `procedure-photos`
2. **Visibility**: Public (for easy URL access) or Private with signed URLs
3. **Folder Structure**: `{user_id}/{procedure_id}/{filename}`

### Storage Policies

Storage policies ensure users can only access their own photos:

```sql
-- Upload Policy
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'procedure-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Read Policy
CREATE POLICY "Users can read their own photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'procedure-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Delete Policy
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'procedure-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**Note**: The folder structure uses `{user_id}` as the first folder segment, which is checked by the policies.

---

## Service Layer Architecture

### File Structure

```
src/services/
├── procedureService.ts    # Database operations for procedures
└── photoService.ts        # Storage operations for photos
```

### Service Responsibilities

#### `procedureService.ts`

Handles all database operations:
- `fetchProcedures(userId)` - Fetch all procedures with photos and reminders
- `createProcedure(userId, data, photos, reminder)` - Create new procedure
- `updateProcedure(procedureId, userId, updates, photos, reminder)` - Update procedure
- `deleteProcedure(procedureId, userId)` - Delete procedure and associated data
- `calculateReminderNextDate(interval, date, customDays)` - Helper for reminder dates

#### `photoService.ts`

Handles all storage operations:
- `uploadToSupabaseStorage(fileUri, userId, procedureId, tag)` - Upload photo
- `getPhotoUrl(storagePath)` - Get public URL for photo
- `deleteFromStorage(storagePath)` - Delete single photo
- `deleteProcedurePhotos(userId, procedureId)` - Delete all photos for a procedure

---

## Photo Upload Implementation

### Upload Flow

1. **User selects photo** → `expo-image-picker` returns local file URI
2. **Photo service processes** → Normalizes URI, creates FormData
3. **REST API upload** → Direct fetch to Supabase Storage API
4. **Database record** → Photo metadata saved to `photos` table
5. **Public URL** → Generated and stored for display

### Implementation Details

#### File URI Normalization

```typescript
function normalizeFileUri(uri: string): string {
  // Handle Android file:// URIs that might be missing a slash
  if (uri.startsWith('file:/') && !uri.startsWith('file:///')) {
    return uri.replace('file:/', 'file:///');
  }
  return uri;
}
```

#### FormData Creation

```typescript
const formData = new FormData();
formData.append('file', {
  uri: normalizedUri,
  type: mimeType,  // e.g., 'image/jpeg'
  name: fileName,  // e.g., '1765705234550_before.jpeg'
} as any);
```

#### REST API Upload

```typescript
const uploadUrl = `${supabaseUrl}/storage/v1/object/procedure-photos/${encodeURIComponent(storagePath)}`;
const uploadResponse = await fetch(uploadUrl, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${accessToken}`,
    apikey: supabaseKey,
    // Note: Don't set Content-Type - FormData sets it automatically
  },
  body: formData,
});
```

**Why REST API instead of Supabase Client?**
- Better control over FormData handling in React Native
- More reliable file uploads
- Direct error handling

### Storage Path Format

```
{user_id}/{procedure_id}/{timestamp}_{tag}.{extension}
```

Example:
```
b2142d21-9a0c-4ee0-8a48-0172f2515588/9a9ea349-2bb1-43f4-9dd7-e09ca91dc01e/1765705234550_before.jpeg
```

### MIME Type Detection

```typescript
function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    heic: 'image/heic',
    heif: 'image/heif',
  };
  return mimeTypes[extension.toLowerCase()] || 'image/jpeg';
}
```

---

## State Management Integration

### Zustand Store: `useProcedureStore`

The store manages procedure state and coordinates with services:

```typescript
interface ProcedureStore {
  procedures: Procedure[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProcedures: (userId: string) => Promise<void>;
  addProcedure: (userId, data, photos, reminder) => Promise<void>;
  updateProcedure: (procedureId, userId, updates, photos, reminder) => Promise<void>;
  deleteProcedure: (procedureId: string, userId: string) => Promise<void>;
  getProcedureById: (id: string) => Procedure | undefined;
  clearError: () => void;
  reset: () => void;
}
```

### Data Flow

1. **User Action** → Screen calls store action
2. **Store Action** → Calls service function
3. **Service** → Performs Supabase operation
4. **Store Update** → Updates local state with result
5. **UI Update** → React re-renders with new data

### Example: Creating a Procedure

```typescript
// In AddProcedureScreen
await addProcedure(user.id, procedureData, photoData, reminderData);

// In useProcedureStore
addProcedure: async (userId, procedureData, photos, reminderData) => {
  set({ isLoading: true, error: null });
  const newProcedure = await createProcedureInService(
    userId, 
    procedureData, 
    photos, 
    reminderData
  );
  set((state) => ({
    procedures: [newProcedure, ...state.procedures],
    isLoading: false,
  }));
}
```

---

## Screen Integration

### AddProcedureScreen

**Photo Selection:**
```typescript
const pickImage = async (type: PhotoTag) => {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permissionResult.granted) return;
  
  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  
  if (!result.canceled && result.assets[0]) {
    // Add to local state
    setBeforePhotos([...beforePhotos, result.assets[0].uri]);
  }
};
```

**Saving Procedure:**
```typescript
const handleSave = async () => {
  // Filter only new photos (local file URIs)
  const photoData = beforePhotos
    .filter((uri) => isLocalFile(uri))
    .map((uri) => ({ uri, tag: "before" as const }));
  
  await addProcedure(user.id, procedureData, photoData, reminderData);
  navigation.goBack();
};
```

### HomeScreen

**Fetching Procedures:**
```typescript
useEffect(() => {
  if (authUser?.id) {
    fetchProcedures(authUser.id).catch(console.error);
  }
}, [authUser?.id, fetchProcedures]);
```

**Pull-to-Refresh:**
```typescript
const onRefresh = useCallback(async () => {
  if (!authUser?.id) return;
  setRefreshing(true);
  try {
    await fetchProcedures(authUser.id);
  } finally {
    setRefreshing(false);
  }
}, [authUser?.id, fetchProcedures]);
```

### ProcedureDetailsScreen

**Deleting Procedure:**
```typescript
const handleDelete = () => {
  Alert.alert('Delete Procedure', 'Are you sure?', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Delete',
      style: 'destructive',
      onPress: async () => {
        await deleteProcedure(procedureId, user.id);
        navigation.goBack();
      },
    },
  ]);
};
```

---

## Error Handling

### Service-Level Error Handling

All service functions use try-catch blocks:

```typescript
export async function uploadToSupabaseStorage(...) {
  try {
    // Upload logic
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error; // Re-throw for store to handle
  }
}
```

### Store-Level Error Handling

Store catches errors and updates state:

```typescript
addProcedure: async (...) => {
  try {
    set({ isLoading: true, error: null });
    const newProcedure = await createProcedureInService(...);
    set({ procedures: [...], isLoading: false });
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to create procedure';
    set({ error: errorMessage, isLoading: false });
    throw error; // Re-throw for screen to handle
  }
}
```

### Screen-Level Error Handling

Screens show user-friendly alerts:

```typescript
try {
  await addProcedure(...);
  navigation.goBack();
} catch (error) {
  Alert.alert(
    'Error',
    error instanceof Error 
      ? error.message 
      : 'Failed to save procedure. Please try again.'
  );
}
```

### Common Error Scenarios

1. **Network Errors**: "Network request failed"
   - Check internet connection
   - Verify Supabase URL and key
   - Check storage policies

2. **Permission Errors**: "Failed to upload photo: ..."
   - Verify storage bucket exists
   - Check storage policies
   - Verify user is authenticated

3. **Validation Errors**: Database constraint violations
   - Check required fields
   - Verify data types match schema

---

## Testing & Troubleshooting

### Testing Checklist

- [ ] Create procedure with photos
- [ ] Update procedure details
- [ ] Add new photos to existing procedure
- [ ] Delete procedure (photos should be deleted too)
- [ ] View procedures list
- [ ] Pull-to-refresh works
- [ ] Handle empty state
- [ ] Handle network errors gracefully
- [ ] Verify RLS policies (users can't access others' data)
- [ ] Test photo upload/download
- [ ] Test with multiple users

### Common Issues

#### Photos Not Uploading

**Symptoms**: "Network request failed" error

**Solutions**:
1. Check storage bucket exists: `procedure-photos`
2. Verify storage policies are set correctly
3. Check authentication token is valid
4. Verify file URI format is correct
5. Check network connectivity

#### Database Errors

**Symptoms**: "Failed to create procedure" or constraint violations

**Solutions**:
1. Verify all migrations have been run
2. Check RLS policies are enabled
3. Verify user is authenticated
4. Check data types match schema
5. Verify required fields are provided

#### Photo URLs Not Loading

**Symptoms**: Photos don't display after upload

**Solutions**:
1. Verify bucket is public OR use signed URLs
2. Check storage path is correct
3. Verify photo was actually uploaded to storage
4. Check CORS settings if accessing from web

### Debug Logging

All services include comprehensive logging:

```typescript
console.log('Starting photo upload:', { fileUri, userId, procedureId, tag });
console.log('Normalized URI:', normalizedUri);
console.log('Upload parameters:', { fileName, storagePath, mimeType });
console.log('Upload successful via REST API:', uploadResult);
```

Check console logs to trace the upload flow.

---

## API Reference

### procedureService.ts

#### `fetchProcedures(userId: string): Promise<Procedure[]>`

Fetches all procedures for a user with related photos and reminders.

**Parameters:**
- `userId`: Authenticated user's UUID

**Returns:** Array of Procedure objects

**Example:**
```typescript
const procedures = await fetchProcedures('user-uuid-here');
```

#### `createProcedure(userId, procedureData, photos, reminderData): Promise<Procedure>`

Creates a new procedure with photos and optional reminder.

**Parameters:**
- `userId`: User UUID
- `procedureData`: ProcedureData object
- `photos`: Array of PhotoData objects
- `reminderData`: Optional ReminderData object

**Returns:** Created Procedure object

**Example:**
```typescript
const procedure = await createProcedure(
  userId,
  {
    name: 'Lip Filler',
    category: 'face',
    date: new Date(),
    cost: 650,
  },
  [
    { uri: 'file://...', tag: 'before' },
    { uri: 'file://...', tag: 'after' },
  ],
  {
    interval: '6months',
    nextDate: new Date('2025-06-15'),
    enabled: true,
  }
);
```

#### `updateProcedure(procedureId, userId, updates, newPhotos, reminderData): Promise<Procedure>`

Updates an existing procedure.

**Parameters:**
- `procedureId`: Procedure UUID
- `userId`: User UUID (for authorization)
- `updates`: Partial ProcedureData
- `newPhotos`: Array of new PhotoData to add
- `reminderData`: Optional ReminderData to update

**Returns:** Updated Procedure object

#### `deleteProcedure(procedureId: string, userId: string): Promise<void>`

Deletes a procedure and all associated photos and reminders.

**Parameters:**
- `procedureId`: Procedure UUID
- `userId`: User UUID (for authorization)

### photoService.ts

#### `uploadToSupabaseStorage(fileUri, userId, procedureId, tag): Promise<PhotoUploadResult>`

Uploads a photo to Supabase Storage.

**Parameters:**
- `fileUri`: Local file URI from expo-image-picker
- `userId`: User UUID
- `procedureId`: Procedure UUID
- `tag`: 'before' or 'after'

**Returns:** Object with `storagePath` and `publicUrl`

**Example:**
```typescript
const result = await uploadToSupabaseStorage(
  'file:///path/to/image.jpg',
  'user-uuid',
  'procedure-uuid',
  'before'
);
// Returns: { storagePath: '...', publicUrl: 'https://...' }
```

#### `getPhotoUrl(storagePath: string): string`

Gets the public URL for a storage path.

**Parameters:**
- `storagePath`: Path in Supabase Storage

**Returns:** Public URL string

#### `deleteFromStorage(storagePath: string): Promise<void>`

Deletes a single photo from storage.

**Parameters:**
- `storagePath`: Path in Supabase Storage

#### `deleteProcedurePhotos(userId: string, procedureId: string): Promise<void>`

Deletes all photos for a procedure.

**Parameters:**
- `userId`: User UUID
- `procedureId`: Procedure UUID

---

## Migration from Mock Data

### What Changed

1. **Removed**: `MOCK_PROCEDURES` from store initialization
2. **Added**: `fetchProcedures()` action to load from Supabase
3. **Updated**: All CRUD operations are now async and use Supabase
4. **Added**: Loading and error states in store
5. **Updated**: Screens to handle async operations

### Data Migration

**Note**: Existing mock data is not automatically migrated. Users start with an empty timeline after migration.

To migrate existing data:
1. Export mock data to JSON
2. Create a migration script
3. Import data via service functions

---

## Security Considerations

### Authentication

- All operations require authenticated user
- User ID is verified on every operation
- Session tokens are automatically refreshed

### Data Isolation

- Row Level Security (RLS) ensures users can only access their own data
- Storage policies prevent cross-user file access
- Foreign key constraints maintain data integrity

### File Security

- Photos stored in user-specific folders
- Storage policies enforce access control
- Public URLs only accessible to file owner (if bucket is private, use signed URLs)

---

## Performance Optimization

### Current Implementation

- Procedures fetched once on app launch
- Pull-to-refresh for manual updates
- Photos loaded on-demand (not pre-fetched)
- No real-time sync (simpler, lower battery usage)

### Future Enhancements

- Implement caching for frequently accessed procedures
- Add pagination for large procedure lists
- Optimize photo loading with thumbnails
- Add offline support with local caching

---

## Conclusion

The Supabase integration provides:

✅ **Secure data storage** with RLS and user isolation  
✅ **Scalable photo storage** with organized folder structure  
✅ **Type-safe operations** with TypeScript  
✅ **Error handling** at all levels  
✅ **Clean architecture** with service layer separation  

All procedures and photos are now persisted in Supabase, replacing the previous mock data implementation.

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Maintained By**: Development Team

