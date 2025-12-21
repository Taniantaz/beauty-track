// Photo Service - Supabase Storage Operations

import { supabase } from "../lib/supabase";
import * as ImageManipulator from "expo-image-manipulator";

export interface PhotoUploadResult {
  storagePath: string;
  publicUrl: string;
}

/**
 * Normalize file URI for React Native (handle platform differences)
 */
function normalizeFileUri(uri: string): string {
  // Handle Android file:// URIs that might be missing a slash
  if (uri.startsWith("file:/") && !uri.startsWith("file:///")) {
    return uri.replace("file:/", "file:///");
  }
  return uri;
}

/**
 * Get MIME type from file extension
 */
function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    heic: "image/heic",
    heif: "image/heif",
  };
  return mimeTypes[extension.toLowerCase()] || "image/jpeg";
}

/**
 * Compress image for free users (Standard/Optimized tier)
 * Industry-standard settings: 1080-1440px max width, 0.6-0.7 quality
 * Result: 80-90% file size reduction, visually fine on mobile screens
 * @param fileUri - Local file URI
 * @returns Compressed image URI
 */
async function compressImageForFreeUser(fileUri: string): Promise<string> {
  try {
    console.log(
      "📉 Compressing image for FREE user (Standard/Optimized tier):",
      fileUri
    );

    // Industry-standard free tier compression
    // Max width: 1440px (middle of 1080-1440px range)
    // Quality: 0.65 (middle of 0.6-0.7 range)
    // Expected: 80-90% file size reduction
    const manipResult = await ImageManipulator.manipulateAsync(
      fileUri,
      [
        { resize: { width: 1440 } }, // Standard/Optimized: 1440px max width
      ],
      {
        compress: 0.65, // 65% quality (Standard/Optimized tier)
        format: ImageManipulator.SaveFormat.JPEG, // Convert to JPEG for better compression
      }
    );

    console.log(
      "✅ Image compressed successfully (Standard/Optimized):",
      manipResult.uri
    );
    return manipResult.uri;
  } catch (error) {
    console.error("❌ Error compressing image:", error);
    // If compression fails, return original URI
    // This ensures the upload can still proceed
    return fileUri;
  }
}

/**
 * Optimize image for premium users (High Quality/HD tier)
 * Industry-standard settings: 3000-4000px max width, 0.9-1.0 quality
 * Result: 20-40% size reduction, retains fine detail (pores, scars, swelling)
 * @param fileUri - Local file URI
 * @returns Optimized image URI
 */
async function optimizeImageForPremiumUser(fileUri: string): Promise<string> {
  try {
    console.log(
      "📈 Optimizing image for PREMIUM user (High Quality/HD tier):",
      fileUri
    );

    // Industry-standard premium tier optimization
    // Max width: 3500px (middle of 3000-4000px range)
    // Quality: 0.95 (middle of 0.9-1.0 range)
    // Expected: 20-40% size reduction, retains fine detail
    const manipResult = await ImageManipulator.manipulateAsync(
      fileUri,
      [
        { resize: { width: 3500 } }, // High Quality/HD: 3500px max width
      ],
      {
        compress: 0.95, // 95% quality (High Quality/HD tier)
        format: ImageManipulator.SaveFormat.JPEG, // Convert to JPEG for better compression
      }
    );

    console.log(
      "✅ Image optimized successfully (High Quality/HD):",
      manipResult.uri
    );
    return manipResult.uri;
  } catch (error) {
    console.error("❌ Error optimizing image:", error);
    // If optimization fails, return original URI
    // This ensures the upload can still proceed
    return fileUri;
  }
}

/**
 * Upload a photo to Supabase Storage
 * @param fileUri - Local file URI from expo-image-picker
 * @param userId - User ID for folder organization
 * @param procedureId - Procedure ID for folder organization
 * @param tag - Photo tag ('before' or 'after')
 * @param isPremium - Whether user has premium subscription (default: false)
 * @returns Storage path and public URL
 */
export async function uploadToSupabaseStorage(
  fileUri: string,
  userId: string,
  procedureId: string,
  tag: "before" | "after",
  isPremium: boolean = false
): Promise<PhotoUploadResult> {
  try {
    console.log("Starting photo upload:", {
      fileUri,
      userId,
      procedureId,
      tag,
      isPremium,
    });

    // Apply industry-standard compression based on user tier
    let processedUri = fileUri;
    if (!isPremium) {
      // Free users: Standard/Optimized tier (80-90% size reduction)
      console.log(
        "📉 User is on FREE plan - applying Standard/Optimized compression..."
      );
      processedUri = await compressImageForFreeUser(fileUri);
    } else {
      // Premium users: High Quality/HD tier (20-40% size reduction, retains detail)
      console.log(
        "📈 User is on PREMIUM plan - applying High Quality/HD optimization..."
      );
      processedUri = await optimizeImageForPremiumUser(fileUri);
    }

    // Normalize the file URI for React Native
    const normalizedUri = normalizeFileUri(processedUri);
    console.log("Normalized URI:", normalizedUri);

    // Get file extension from URI
    // For compressed images, always use jpg extension
    const fileExtension = isPremium
      ? normalizedUri.split(".").pop() || "jpg"
      : "jpg"; // Compressed images are always JPEG
    const fileName = `${Date.now()}_${tag}.${fileExtension}`;
    const storagePath = `${userId}/${procedureId}/${fileName}`;
    const mimeType = getMimeType(fileExtension);

    console.log("Upload parameters:", {
      fileName,
      storagePath,
      fileExtension,
      mimeType,
    });

    // For React Native, use the Supabase REST API directly with fetch
    // This gives us more control over the upload process
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      throw new Error("No active session. Please sign in again.");
    }

    const accessToken = sessionData.session.access_token;
    // Use the Supabase URL and key from the client configuration
    const supabaseUrl = "https://yelpgrzncstunyfdwmgi.supabase.co";
    const supabaseKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllbHBncnpuY3N0dW55ZmR3bWdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MDcyODQsImV4cCI6MjA4MTE4MzI4NH0.lTkPuRcErQpQ_osy_OtiUpjZDGJtXc9kdfLGlo5RiKU";

    // Create FormData for the file upload
    const formData = new FormData();
    formData.append("file", {
      uri: normalizedUri,
      type: mimeType,
      name: fileName,
    } as any);

    console.log("Uploading file via REST API to Supabase Storage");

    // Upload using the Supabase Storage REST API
    // Note: Don't set Content-Type header - FormData sets it automatically with boundary
    const uploadUrl = `${supabaseUrl}/storage/v1/object/procedure-photos/${encodeURIComponent(
      storagePath
    )}`;
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: supabaseKey,
        // Don't set Content-Type - let FormData set it with boundary
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error("Upload response error:", {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        error: errorText,
      });
      throw new Error(
        `Failed to upload photo: ${uploadResponse.statusText} (${uploadResponse.status})`
      );
    }

    const uploadResult = await uploadResponse.json();
    console.log("Upload successful via REST API:", uploadResult);

    if (!uploadResult) {
      throw new Error("Upload succeeded but no data returned");
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("procedure-photos")
      .getPublicUrl(storagePath);

    if (!urlData?.publicUrl) {
      throw new Error("Failed to get public URL for uploaded photo");
    }

    console.log("Public URL generated:", urlData.publicUrl);

    return {
      storagePath,
      publicUrl: urlData.publicUrl,
    };
  } catch (error) {
    console.error("Error uploading photo - full error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error;
  }
}

/**
 * Get public URL for a storage path
 * @param storagePath - Path in Supabase Storage
 * @returns Public URL
 */
export function getPhotoUrl(storagePath: string): string {
  const { data } = supabase.storage
    .from("procedure-photos")
    .getPublicUrl(storagePath);

  return data?.publicUrl || "";
}

/**
 * Delete a photo from Supabase Storage
 * @param storagePath - Path in Supabase Storage
 */
export async function deleteFromStorage(storagePath: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from("procedure-photos")
      .remove([storagePath]);

    if (error) {
      throw new Error(`Failed to delete photo: ${error.message}`);
    }
  } catch (error) {
    console.error("Error deleting photo:", error);
    throw error;
  }
}

/**
 * Delete all photos for a procedure
 * @param userId - User ID
 * @param procedureId - Procedure ID
 */
export async function deleteProcedurePhotos(
  userId: string,
  procedureId: string
): Promise<void> {
  try {
    const folderPath = `${userId}/${procedureId}`;
    const { data: files, error: listError } = await supabase.storage
      .from("procedure-photos")
      .list(folderPath);

    if (listError) {
      throw new Error(`Failed to list photos: ${listError.message}`);
    }

    if (files && files.length > 0) {
      const filePaths = files.map((file) => `${folderPath}/${file.name}`);
      const { error: deleteError } = await supabase.storage
        .from("procedure-photos")
        .remove(filePaths);

      if (deleteError) {
        throw new Error(`Failed to delete photos: ${deleteError.message}`);
      }
    }
  } catch (error) {
    console.error("Error deleting procedure photos:", error);
    throw error;
  }
}
