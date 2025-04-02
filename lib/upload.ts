import { supabaseClient } from './supabase';

/**
 * Uploads an image to Supabase storage
 * 
 * NOTE: Before using this function, you need to create the 'rooms' bucket in Supabase:
 * 1. Go to your Supabase project dashboard: https://app.supabase.com
 * 2. Navigate to Storage in the left sidebar
 * 3. Click "Create a new bucket" and name it "rooms"
 * 4. Set the bucket permission to "Public" for the uploaded images to be accessible
 * 5. Configure RLS policies to allow uploads (see SUPABASE_STORAGE_SETUP.md)
 */
export async function uploadImage(file: File, bucket: string = 'rooms') {
  try {
    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Create a debug output to help diagnose issues
    console.log("Uploading file:", { name: file.name, size: file.size, type: file.type, bucket });
    
    // Check if file is actually a File object
    if (!(file instanceof File)) {
      throw new Error("Invalid file object provided");
    }

    // Upload the file to Supabase storage
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '0',
        upsert: true, // Changed from false to true to allow overwriting
      });

    if (error) {
      // Handle specific error cases with more helpful messages
      console.error("Storage upload error:", error);
      
      if (error.message.includes('bucket') && error.message.includes('not found')) {
        throw new Error(`Storage bucket "${bucket}" not found. Please create it in your Supabase dashboard.`);
      } else if (
        error.message.includes('403') || 
        error.message.includes('Unauthorized') || 
        error.message.includes('row-level security policy')
      ) {
        throw new Error(
          `Permission denied. You need to disable Row-Level Security for Storage. ` +
          `Please see SUPABASE_STORAGE_SETUP.md for instructions.`
        );
      }
      throw error;
    }

    console.log("Upload successful:", data);

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabaseClient.storage
      .from(bucket)
      .getPublicUrl(filePath);

    console.log("Generated public URL:", publicUrl);
    return { filePath, publicUrl };
  } catch (error: any) {
    console.error('Error uploading image:', error);
    
    // Format the error message to be more user-friendly
    const errorMessage = error.message || 'Unknown error occurred during image upload';
    
    // Rethrow with the formatted message
    throw new Error(errorMessage);
  }
}
