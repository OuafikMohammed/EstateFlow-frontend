// File: lib/supabase/storage.ts
// Purpose: Helper functions for Supabase Storage operations
// Handles image uploads, URL generation, and deletion

import { createClient } from './client'

const BUCKET_NAME = 'property-images'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * Upload a property image to Supabase Storage
 * Images are stored in: property-images/{company_id}/{property_id}/{filename}
 */
export async function uploadPropertyImage(
  file: File,
  companyId: string,
  propertyId: string,
  onProgress?: (progress: number) => void
): Promise<{ path: string; url: string } | { error: string }> {
  try {
    // Validate file
    if (!file) {
      return { error: 'No file provided' }
    }

    if (file.size > MAX_FILE_SIZE) {
      return { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` }
    }

    if (!file.type.startsWith('image/')) {
      return { error: 'File must be an image' }
    }

    const supabase = createClient()

    // Generate unique filename
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 9)
    const fileExt = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomStr}.${fileExt}`

    // Build storage path: property-images/{company_id}/{property_id}/{filename}
    const filePath = `${companyId}/${propertyId}/${fileName}`

    // Upload file
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return { error: error.message }
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)

    return {
      path: filePath,
      url: publicData.publicUrl,
    }
  } catch (error) {
    console.error('Unexpected upload error:', error)
    return { error: 'Failed to upload image' }
  }
}

/**
 * Upload multiple images at once
 */
export async function uploadPropertyImages(
  files: File[],
  companyId: string,
  propertyId: string,
  onProgress?: (current: number, total: number) => void
): Promise<{ paths: string[]; urls: string[] } | { error: string }> {
  try {
    const results = await Promise.all(
      files.map((file, index) =>
        uploadPropertyImage(file, companyId, propertyId, (progress) => {
          onProgress?.(index + 1, files.length)
        })
      )
    )

    const paths: string[] = []
    const urls: string[] = []

    for (const result of results) {
      if ('error' in result) {
        console.error('Upload error:', result.error)
      } else {
        paths.push(result.path)
        urls.push(result.url)
      }
    }

    if (urls.length === 0) {
      return { error: 'Failed to upload any images' }
    }

    return { paths, urls }
  } catch (error) {
    console.error('Unexpected error uploading multiple images:', error)
    return { error: 'Failed to upload images' }
  }
}

/**
 * Get public URL for an image
 * Useful if you have the file path stored in database
 */
export function getPublicImageUrl(filePath: string): string {
  const supabase = createClient()
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)
  return data.publicUrl
}

/**
 * Delete a single image from storage
 */
export async function deletePropertyImage(
  filePath: string
): Promise<{ success: boolean } | { error: string }> {
  try {
    if (!filePath) {
      return { error: 'No file path provided' }
    }

    const supabase = createClient()

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected delete error:', error)
    return { error: 'Failed to delete image' }
  }
}

/**
 * Delete multiple images at once
 */
export async function deletePropertyImages(
  filePaths: string[]
): Promise<{ success: boolean } | { error: string }> {
  try {
    if (!filePaths || filePaths.length === 0) {
      return { error: 'No files to delete' }
    }

    const supabase = createClient()

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(filePaths)

    if (error) {
      console.error('Delete error:', error)
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected delete error:', error)
    return { error: 'Failed to delete images' }
  }
}

/**
 * Delete all images for a property
 * Useful when deleting a property
 */
export async function deletePropertyImages_(
  companyId: string,
  propertyId: string
): Promise<{ success: boolean } | { error: string }> {
  try {
    const supabase = createClient()

    // List all files in the property folder
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list(`${companyId}/${propertyId}`)

    if (listError) {
      console.error('List error:', listError)
      return { error: listError.message }
    }

    if (!files || files.length === 0) {
      return { success: true } // Nothing to delete
    }

    // Build full paths
    const filePaths = files.map(
      (file) => `${companyId}/${propertyId}/${file.name}`
    )

    // Delete all files
    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(filePaths)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return { error: deleteError.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error deleting property images:', error)
    return { error: 'Failed to delete property images' }
  }
}

/**
 * Get all images for a property
 */
export async function getPropertyImages(
  companyId: string,
  propertyId: string
): Promise<{ urls: string[] } | { error: string }> {
  try {
    const supabase = createClient()

    const { data: files, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(`${companyId}/${propertyId}`)

    if (error) {
      console.error('List error:', error)
      return { error: error.message }
    }

    if (!files || files.length === 0) {
      return { urls: [] }
    }

    const urls = files.map((file) => {
      const filePath = `${companyId}/${propertyId}/${file.name}`
      return getPublicImageUrl(filePath)
    })

    return { urls }
  } catch (error) {
    console.error('Unexpected error fetching property images:', error)
    return { error: 'Failed to fetch images' }
  }
}
