# Setting Up Supabase Storage for Room Images

Before using the image upload feature in the admin room management, you need to set up a storage bucket in your Supabase project.

## Steps to Create a Storage Bucket

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Sign in with your credentials
3. Select your project
4. Navigate to "Storage" in the left sidebar
5. Click "Create a new bucket"
6. Enter the name "rooms" for the bucket (important: the name must be exactly "rooms")
7. Make sure to set the bucket to "Public" for the room images to be publicly accessible
8. Click "Create bucket"

## Disable RLS for the Storage Bucket

The "403 Unauthorized" error occurs because Row-Level Security is enabled by default. The simplest solution is to disable RLS for the storage bucket:

1. Go to the "Authentication" section in your Supabase dashboard
2. Click on "Policies" in the sidebar
3. Find "storage.objects" in the list of tables
4. Toggle "Enable RLS" to OFF for this table
   - Note: This will make all your storage buckets public, so only do this if you're not storing sensitive information
   - If you have other buckets with sensitive data, consider using specific policies instead

Alternatively, if you want to keep RLS enabled but allow public access to only the "rooms" bucket:

1. Stay on the "Policies" page for "storage.objects"
2. Click "New Policy"
3. Choose "Create a policy from scratch"
4. Name it "Public access to rooms bucket"
5. In the "USING expression" field, enter: `bucket_id = 'rooms'`
6. Select "ALL" for the operation to allow all operations (insert, select, update, delete)
7. Click "Save policy"

## Configure CORS (Optional but Recommended)

To ensure that your application can properly upload files to the bucket:

1. Go to the "rooms" bucket you just created
2. Click on "Bucket Settings" in the dropdown menu for the bucket
3. Scroll down to the CORS settings
4. Add the following CORS configuration:

```json
{
  "origins": ["*"],
  "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  "headers": ["Content-Type", "Authorization", "x-client-info"]
}
```

5. Click "Save"

## Verifying the Setup

After completing the setup, you should be able to:

1. Upload room images from the admin room management page
2. See the images displayed correctly in both the admin view and the public rooms page

If you encounter any issues with image uploads, please check the browser console for error messages related to Supabase storage permissions.
