/**
 * Storage Bucket Initialization Utility
 * Ensures required Supabase Storage buckets exist
 */

import { createClient } from '@/lib/supabase/client'

/**
 * Ensures the properties bucket exists and is public
 */
export async function ensurePropertiesBucket(): Promise<boolean> {
  try {
    const supabase = createClient()

    // Try to get the bucket info
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error('Could not list buckets:', listError)
      // If we can't list buckets, bucket might already exist, so return true to attempt upload
      return true
    }

    // Check if properties bucket exists
    const bucketExists = buckets?.some((b) => b.name === 'properties')

    if (bucketExists) {
      console.log('Properties bucket already exists')
      return true
    }

    // Create the bucket if it doesn't exist
    console.log('Creating properties bucket...')
    const { data, error: createError } = await supabase.storage.createBucket('properties', {
      public: true,
    })

    if (createError) {
      console.error('Error creating properties bucket:', createError)
      // If bucket creation fails with specific error, it might already exist
      // Try to proceed anyway
      return true
    }

    console.log('Properties bucket created successfully:', data)
    return true
  } catch (error) {
    console.error('Unexpected error ensuring bucket:', error)
    // Return true to attempt upload anyway - the upload itself will provide better error feedback
    return true
  }
}

/**
 * Initialize all required storage buckets
 */
export async function initializeStorageBuckets(): Promise<void> {
  try {
    await ensurePropertiesBucket()
  } catch (error) {
    console.error('Error initializing storage buckets:', error)
  }
}
