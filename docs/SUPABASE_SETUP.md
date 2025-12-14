# Supabase Setup Guide

This guide will help you set up the Supabase backend for the Beauty Track app.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Your Supabase project URL and anon key (already configured in `src/lib/supabase.ts`)

## Step 1: Create Database Tables

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `supabase/migrations/001_create_procedures_schema.sql`
5. Run the query

This will create:
- `procedures` table
- `photos` table
- `reminders` table
- Row Level Security (RLS) policies
- Indexes for performance
- Triggers for automatic timestamp updates

## Step 2: Set Up Storage Bucket

1. Go to **Storage** in your Supabase Dashboard
2. Click **New bucket**
3. Name it: `procedure-photos`
4. Set it to **Public** (or Private with signed URLs - see note below)
5. Click **Create bucket**

### Storage Policies

After creating the bucket, you need to set up storage policies:

1. Go to **Storage** → **Policies** → `procedure-photos`
2. Create the following policies:

#### Policy 1: Allow users to upload their own photos
- Policy name: `Users can upload their own photos`
- Allowed operation: `INSERT`
- Policy definition:
```sql
(user_id()::text = (storage.foldername(name))[1])
```

#### Policy 2: Allow users to read their own photos
- Policy name: `Users can read their own photos`
- Allowed operation: `SELECT`
- Policy definition:
```sql
(user_id()::text = (storage.foldername(name))[1])
```

#### Policy 3: Allow users to delete their own photos
- Policy name: `Users can delete their own photos`
- Allowed operation: `DELETE`
- Policy definition:
```sql
(user_id()::text = (storage.foldername(name))[1])
```

**Note**: The folder structure is `{user_id}/{procedure_id}/{filename}`, so the first folder segment is the user ID.

### Alternative: Using SQL for Storage Policies

You can also create these policies using SQL in the SQL Editor:

```sql
-- Allow users to upload to their own folder
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'procedure-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read from their own folder
CREATE POLICY "Users can read their own photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'procedure-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete from their own folder
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'procedure-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## Step 3: Verify Authentication

1. Go to **Authentication** → **Providers**
2. Ensure **Google** provider is enabled
3. Add your Google OAuth credentials (Client ID and Secret)
4. Add redirect URLs:
   - For development: `exp://[your-expo-url]`
   - For production: `beautytrack://` (or your custom scheme)

## Step 4: Test the Setup

1. Run your app: `npm start`
2. Sign in with Google
3. Try creating a procedure with photos
4. Verify data appears in:
   - **Table Editor** → `procedures` table
   - **Table Editor** → `photos` table
   - **Storage** → `procedure-photos` bucket

## Troubleshooting

### Photos not uploading
- Check that the storage bucket exists and is named `procedure-photos`
- Verify storage policies are correctly set up
- Check browser console for error messages

### RLS policies blocking access
- Verify you're signed in (check `auth.users` table)
- Check that RLS policies are enabled on all tables
- Verify the `user_id` in procedures matches `auth.uid()`

### Database errors
- Ensure all migrations have been run
- Check that foreign key constraints are correct
- Verify data types match the schema

## Security Notes

- All tables have Row Level Security (RLS) enabled
- Users can only access their own data
- Storage policies prevent users from accessing other users' photos
- Always use the authenticated Supabase client (already configured)

## Next Steps

After setup, the app will:
- Automatically fetch procedures when a user signs in
- Allow users to create, update, and delete procedures
- Upload photos to Supabase Storage
- Store all data securely with user isolation

