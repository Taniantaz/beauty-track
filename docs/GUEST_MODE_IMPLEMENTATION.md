# Guest Mode Implementation - Complete Documentation

This document details all changes made to implement Guest Mode with a soft 3-entry limit for the Beauty Track app.

**Date**: January 2025  
**Version**: 1.0

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Decisions](#architecture-decisions)
3. [New Files Created](#new-files-created)
4. [Modified Files](#modified-files)
5. [Implementation Details](#implementation-details)
6. [User Flow](#user-flow)
7. [Data Migration](#data-migration)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### What Was Implemented

- **Guest Mode**: Users can use the app without authentication
- **Soft Limit**: Guests can create up to 3 timeline entries
- **Local Storage**: Guest data stored locally on device (AsyncStorage)
- **Seamless Migration**: Guest data automatically migrates to Supabase when user signs in
- **Privacy-First**: No forced login, guest option presented equally with sign-in

### Key Requirements Met

✅ No forced login on first launch  
✅ Two equal options: "Continue without account" and "Continue with Google"  
✅ 3-entry soft limit (blocks creation, not browsing/editing)  
✅ Respectful login prompt modal  
✅ Seamless data migration on sign-in  
✅ Privacy-focused (no emails/usernames for guests)

---

## Architecture Decisions

### Why Local Storage Instead of Supabase Anonymous Auth?

**Decision**: Use AsyncStorage for guest data instead of Supabase anonymous authentication.

**Reasons**:
1. **Privacy**: Guest data stays on-device until user signs in
2. **Cost**: No guest users in Supabase database
3. **Simplicity**: No anonymous RLS policies needed
4. **Security**: No anonymous access to database
5. **Offline-First**: Works immediately without network

**Trade-offs**:
- Data lost if app is uninstalled (acceptable for guest mode)
- No cross-device sync for guests (expected behavior)
- Migration complexity (handled by migration service)

---

## New Files Created

### 1. `src/store/useGuestStore.ts`

**Purpose**: Manages guest user state and local storage.

**Key Features**:
- Generates unique guest user IDs
- Persists guest mode state in AsyncStorage
- Checks for existing sessions before initializing guest mode
- Clears guest data when user authenticates

**State**:
```typescript
{
  guestUserId: string | null;
  isGuestMode: boolean;
}
```

**Actions**:
- `initializeGuest(supabaseUserId?)`: Initialize or restore guest mode
- `setGuestMode(isGuest)`: Set guest mode flag
- `clearGuest()`: Clear all guest data

**Storage Keys**:
- `@beauty_track_guest_user_id`: Guest user ID
- `@beauty_track_guest_mode`: Guest mode flag

---

### 2. `src/services/guestProcedureService.ts`

**Purpose**: Handles CRUD operations for guest procedures in local storage.

**Key Functions**:
- `fetchGuestProcedures(guestUserId)`: Fetch all guest procedures
- `createGuestProcedure(...)`: Create new guest procedure
- `updateGuestProcedure(...)`: Update existing guest procedure
- `deleteGuestProcedure(...)`: Delete guest procedure
- `getAllGuestProcedures(guestUserId)`: Get all procedures for migration
- `clearGuestProcedures(guestUserId)`: Clear all guest procedures

**Storage Format**:
- Key: `@beauty_track_guest_procedures_{guestUserId}`
- Value: JSON array of Procedure objects

**Data Structure**:
- Procedures stored as JSON with Date objects serialized
- Photos stored as local file URIs (not uploaded to Supabase)
- Reminders included in procedure objects

---

### 3. `src/services/guestMigrationService.ts`

**Purpose**: Migrates guest data from local storage to Supabase when user signs in.

**Key Functions**:
- `migrateGuestDataToUser(guestUserId, authenticatedUserId)`: Main migration function
- `hasGuestData(guestUserId)`: Check if guest has data to migrate

**Migration Process**:
1. Fetch all guest procedures from local storage
2. For each procedure:
   - Create procedure in Supabase
   - Upload photos to Supabase Storage
   - Create reminder if exists
3. Clear guest procedures from local storage
4. Refresh procedures list

**Error Handling**:
- Continues migration even if individual procedures fail
- Logs errors but doesn't block migration
- Clears local data only after successful migration

---

### 4. `src/components/LoginPromptModal.tsx`

**Purpose**: Modal shown when guest tries to create 4th procedure.

**Design**:
- Calm, respectful, value-based messaging
- No paywall or monetization mentions
- Focus on data protection

**Content**:
- **Title**: "Protect your timeline"
- **Body**: "You've created 3 entries. Create a free account to securely save your timeline and access it anytime."
- **Secondary**: "Takes less than 10 seconds."
- **Primary CTA**: "Create free account"
- **Secondary CTA**: "Maybe later" (optional)

**Props**:
```typescript
{
  visible: boolean;
  onCreateAccount: () => void;
  onMaybeLater: () => void;
}
```

---

## Modified Files

### 1. `src/store/useAuthStore.ts`

**Changes**:
- Added `isGuest: boolean` to state
- Added `setGuestMode(isGuest)` action
- Modified `signInAnonymously()` to not call Supabase (just sets flag)
- Updated `initialize()` to clear guest mode when session exists
- Updated `signOut()` to clear guest mode
- Added guest mode clearing in `onAuthStateChange` listener

**Key Logic**:
```typescript
// Clear guest mode when session detected
if (session) {
  const { clearGuest } = useGuestStore.getState();
  clearGuest().catch(console.error);
}
```

---

### 2. `src/store/useProcedureStore.ts`

**Changes**:
- Added imports for guest procedure service
- Modified `fetchProcedures()` to check guest mode and route to local/Supabase
- Modified `addProcedure()` to use local storage for guests
- Modified `updateProcedure()` to use local storage for guests
- Modified `deleteProcedure()` to use local storage for guests

**Routing Logic**:
```typescript
const { isGuest } = useAuthStore.getState();
const { isGuestMode } = useGuestStore.getState();

if (isGuest || isGuestMode) {
  // Use local storage
} else {
  // Use Supabase
}
```

---

### 3. `src/screens/GoogleSignInScreen.tsx`

**Changes**:
- Updated UI to show two equal options (not primary/secondary)
- Added "Continue without account" button with equal styling
- Removed dependency on Supabase anonymous auth
- Updated `handleContinueAsGuest()` to use local storage
- Added guest data migration on sign-in

**UI Changes**:
- Two buttons with equal visual weight
- Guest button has border to distinguish (not de-emphasize)
- Updated description text to be neutral

**Sign-In Flow**:
1. User chooses guest → Initialize local guest ID
2. User chooses Google → Sign in with Google
3. If guest data exists → Migrate to Supabase
4. Navigate to MainTabs

---

### 4. `src/screens/AddProcedureScreen.tsx`

**Changes**:
- Added guest limit check before creating procedure
- Added `LoginPromptModal` import and state
- Modified `handleSave()` to check guest limit
- Shows modal when guest tries to create 4th procedure

**Limit Check**:
```typescript
if ((isGuest || isGuestMode) && !isEditing) {
  const currentProcedureCount = procedures.length;
  if (currentProcedureCount >= 3) {
    setShowLoginPrompt(true);
    return;
  }
}
```

**Note**: Editing existing procedures is not limited (guests can edit all their procedures).

---

### 5. `src/screens/ProfileScreen.tsx`

**Changes**:
- Added guest mode detection
- Show "Guest" as name for guest users
- Hide email for guest users
- Hide plan badge for guest users
- Keep all other features (Face ID, Dark Mode, etc.)

**Guest Display**:
```typescript
const isGuestUser = isGuest || isGuestMode;
const displayName = isGuestUser ? "Guest" : ...;
const displayEmail = isGuestUser ? null : ...;
```

---

### 6. `src/screens/HomeScreen.tsx`

**Changes**:
- Added guest store import
- Updated to use guest user ID when in guest mode
- Fetches procedures for both guests and authenticated users

**User ID Resolution**:
```typescript
const currentUserId = authUser?.id || (isGuestMode && guestUserId ? guestUserId : null);
```

---

### 7. `src/navigation/AppNavigator.tsx`

**Changes**:
- Added guest store import
- Added navigation ref for reactive navigation
- Added `useEffect` to navigate based on auth state changes
- Updated initial route logic to handle guest mode
- Uses `navigation.reset()` to react to state changes

**Navigation Logic**:
```typescript
useEffect(() => {
  if (!isInitialized || !navigationRef.current) return;
  
  if (session) {
    navigationRef.current?.reset({ routes: [{ name: "MainTabs" }] });
  } else if (isGuestMode && guestUserId) {
    navigationRef.current?.reset({ routes: [{ name: "MainTabs" }] });
  } else {
    navigationRef.current?.reset({ routes: [{ name: "GoogleSignIn" }] });
  }
}, [isInitialized, session, isGuestMode, guestUserId]);
```

**Fixes**:
- Fixed issue where app showed onboarding/sign-in after restart even with session
- Fixed guest mode persisting when session exists
- Made navigation reactive to auth state changes

---

### 8. `src/components/index.ts`

**Changes**:
- Added export for `LoginPromptModal`

---

## Implementation Details

### Guest User ID Format

**Local Guest ID**:
```
guest_{timestamp}_{randomString}
Example: guest_1704067200000_k3j9x2m
```

**Storage**:
- Stored in AsyncStorage as `@beauty_track_guest_user_id`
- Persisted across app restarts
- Cleared when user authenticates

---

### Guest Procedure Storage

**Key Format**:
```
@beauty_track_guest_procedures_{guestUserId}
```

**Data Format**:
```json
[
  {
    "id": "guest_proc_1704067200000_abc123",
    "name": "Lip Filler",
    "category": "face",
    "date": "2024-01-01T00:00:00.000Z",
    "photos": [
      {
        "id": "guest_photo_1704067200000_0",
        "uri": "file:///path/to/photo.jpg",
        "tag": "before",
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    ],
    "reminder": {
      "id": "guest_reminder_1704067200000",
      "procedureId": "guest_proc_1704067200000_abc123",
      "interval": "6months",
      "nextDate": "2024-07-01T00:00:00.000Z",
      "enabled": true
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### Photo Handling

**Guest Mode**:
- Photos stored as local file URIs
- Not uploaded to Supabase Storage
- Format: `file://`, `content://`, or `ph://` URIs

**Migration**:
- Photos uploaded to Supabase Storage during migration
- Storage path: `{authenticatedUserId}/{procedureId}/{timestamp}_{tag}.{ext}`
- Original local files remain (not deleted)

---

### Reminder Handling

**Guest Mode**:
- Reminders stored in procedure objects
- Calculated next dates stored as Date objects
- All reminder functionality works for guests

**Migration**:
- Reminders recreated in Supabase `reminders` table
- Next dates recalculated if needed
- Enabled status preserved

---

## User Flow

### First Launch (New User)

1. **Onboarding Screen** (if not seen)
   - User sees onboarding slides
   - Can skip or continue

2. **Sign-In Screen**
   - Two equal options:
     - "Continue with Google"
     - "Continue without account"
   - User chooses one

3. **If Guest**:
   - Local guest ID generated
   - Guest mode initialized
   - Navigate to MainTabs
   - Can create up to 3 procedures

4. **If Authenticated**:
   - Google OAuth flow
   - Session created
   - Navigate to MainTabs
   - Full access

---

### Guest Creating 4th Procedure

1. User taps "Add Procedure"
2. Fills out form
3. Taps "Save"
4. **Limit Check**:
   - If guest and procedure count >= 3
   - Show `LoginPromptModal`
   - Block creation
5. **User Options**:
   - "Create free account" → Navigate to sign-in
   - "Maybe later" → Close modal, stay on form

---

### Guest Signing In

1. Guest user taps "Sign In with Google" (from Profile or modal)
2. Google OAuth flow
3. **Migration Process**:
   - Check for guest data
   - If exists:
     - Fetch all guest procedures
     - For each procedure:
       - Create in Supabase
       - Upload photos to Storage
       - Create reminder
     - Clear local guest data
   - Refresh procedures list
4. Navigate to MainTabs
5. All data now in Supabase

---

### App Restart (Authenticated User)

1. App initializes
2. Auth store checks for session
3. **If session exists**:
   - Clear guest mode
   - Set authenticated state
   - Navigate to MainTabs
4. **If no session**:
   - Check for guest mode
   - If guest mode: Navigate to MainTabs
   - If not: Navigate to GoogleSignIn

---

## Data Migration

### Migration Trigger

Migration happens automatically when:
- Guest user signs in with Google
- Guest data exists in local storage

### Migration Steps

1. **Check for Guest Data**:
   ```typescript
   const guestProcedures = await getAllGuestProcedures(guestUserId);
   ```

2. **For Each Procedure**:
   - Create procedure in Supabase
   - Upload photos to Supabase Storage
   - Create reminder if exists

3. **Cleanup**:
   - Clear guest procedures from local storage
   - Clear guest mode state

### Error Handling

- Individual procedure failures don't stop migration
- Errors logged but migration continues
- User still signed in even if migration partially fails
- Failed procedures remain in local storage (can retry)

### Migration Service Code

```typescript
export async function migrateGuestDataToUser(
  guestUserId: string,
  authenticatedUserId: string
): Promise<void> {
  // Fetch guest procedures
  const guestProcedures = await getAllGuestProcedures(guestUserId);
  
  // Migrate each procedure
  for (const guestProcedure of guestProcedures) {
    await createProcedureInService(
      authenticatedUserId,
      procedureData,
      photoData, // Photos uploaded here
      reminderData
    );
  }
  
  // Clear guest data
  await clearGuestProcedures(guestUserId);
}
```

---

## Troubleshooting

### Issue: App shows onboarding/sign-in after restart even with session

**Cause**: Navigation not reactive to auth state changes.

**Fix**: Added `useEffect` with `navigation.reset()` to react to auth state.

**File**: `src/navigation/AppNavigator.tsx`

---

### Issue: Guest mode persists when user is authenticated

**Cause**: Guest store not checking for existing sessions.

**Fix**: 
- Auth store clears guest mode when session detected
- Guest store checks for session before initializing

**Files**: 
- `src/store/useAuthStore.ts`
- `src/store/useGuestStore.ts`

---

### Issue: Error "clearGuest is not a function"

**Cause**: Incorrect dynamic import of guest store.

**Fix**: Changed to direct import and use `getState()`:
```typescript
import { useGuestStore } from './useGuestStore';
const { clearGuest } = useGuestStore.getState();
```

**File**: `src/store/useAuthStore.ts`

---

### Issue: Guest data not migrating

**Check**:
1. Guest procedures exist in local storage
2. User successfully authenticated
3. Migration service called
4. Photos are valid file URIs

**Debug**:
```typescript
console.log('Guest procedures:', await getAllGuestProcedures(guestUserId));
console.log('Migration result:', await migrateGuestDataToUser(...));
```

---

### Issue: Photos not uploading during migration

**Cause**: Local file URIs may be invalid or files deleted.

**Fix**: 
- Validate URIs before migration
- Handle errors gracefully
- Log failed photo uploads

**File**: `src/services/guestMigrationService.ts`

---

## Testing Checklist

### Guest Mode
- [ ] Can continue as guest on first launch
- [ ] Guest ID persists across app restarts
- [ ] Can create procedures as guest
- [ ] Can edit procedures as guest
- [ ] Can delete procedures as guest
- [ ] Can view procedure details as guest
- [ ] Can view photos as guest
- [ ] Limit enforced at 3 procedures
- [ ] Login modal appears at limit
- [ ] Can dismiss modal and continue browsing

### Migration
- [ ] Guest data migrates on sign-in
- [ ] Photos upload correctly
- [ ] Reminders preserved
- [ ] Local data cleared after migration
- [ ] Procedures appear in Supabase
- [ ] No data loss during migration

### Navigation
- [ ] App navigates correctly on first launch
- [ ] App navigates correctly after restart (authenticated)
- [ ] App navigates correctly after restart (guest)
- [ ] Sign-out navigates to sign-in screen
- [ ] Sign-in navigates to MainTabs

### Profile Screen
- [ ] Shows "Guest" for guest users
- [ ] Hides email for guest users
- [ ] Hides plan badge for guest users
- [ ] Shows correct info for authenticated users

---

## Future Enhancements

### Potential Improvements

1. **Guest Data Backup**:
   - Optional cloud backup for guest data
   - Warn user before clearing guest data

2. **Migration Retry**:
   - Retry failed migrations
   - Show migration status to user

3. **Guest Analytics**:
   - Track guest conversion rate
   - Monitor guest usage patterns

4. **Guest Limits UI**:
   - Show progress indicator (2/3 procedures)
   - Gentle reminder before limit

5. **Offline Support**:
   - Queue operations when offline
   - Sync when online

---

## Security Considerations

### Guest Data Privacy

- Guest data stored locally only
- No network transmission until user signs in
- Data cleared when user authenticates
- No guest data in Supabase until migration

### Migration Security

- Migration only happens on explicit sign-in
- User must authenticate before migration
- Photos uploaded with authenticated user's credentials
- RLS policies apply after migration

### Storage Security

- AsyncStorage is device-specific
- Data cleared on app uninstall
- No cross-device access for guests
- Guest IDs are unique per device

---

## Performance Considerations

### Local Storage

- AsyncStorage operations are synchronous
- JSON serialization/deserialization
- No network latency for guests
- Fast read/write operations

### Migration Performance

- Migration happens in background
- Photos uploaded sequentially
- Can be slow for many procedures
- Consider batching for large migrations

---

## Code References

### Key Files

- Guest Store: `src/store/useGuestStore.ts`
- Guest Service: `src/services/guestProcedureService.ts`
- Migration Service: `src/services/guestMigrationService.ts`
- Login Modal: `src/components/LoginPromptModal.tsx`
- Auth Store: `src/store/useAuthStore.ts`
- Procedure Store: `src/store/useProcedureStore.ts`
- Navigation: `src/navigation/AppNavigator.tsx`

### Key Functions

- `initializeGuest()`: Initialize guest mode
- `fetchGuestProcedures()`: Get guest procedures
- `migrateGuestDataToUser()`: Migrate to Supabase
- `clearGuest()`: Clear guest data

---

## Conclusion

The Guest Mode implementation provides a privacy-first, user-friendly experience that:

✅ Allows users to try the app without commitment  
✅ Respects user privacy (data stays local)  
✅ Provides clear upgrade path (3-entry limit)  
✅ Seamlessly migrates data on sign-in  
✅ Maintains security and data integrity  

All changes are backward compatible and don't affect existing authenticated users.

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Maintained By**: Development Team

