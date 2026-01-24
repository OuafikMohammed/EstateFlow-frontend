/**
 * Hook for uploading images to Supabase Storage via backend API
 */

'use client'

import { useState } from 'react'

interface UploadProgress {
  fileName: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export function useImageUpload(bucket: string = 'properties') {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    const MAX_FILES = 10
    const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg']

    // Validation
    if (files.length > MAX_FILES) {
      throw new Error(`Maximum ${MAX_FILES} photos allowed`)
    }

    const validFiles: File[] = []
    const progressMap: { [key: string]: UploadProgress } = {}

    // Validate each file
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(`Invalid file type: ${file.type}. Only PNG and JPG allowed`)
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File ${file.name} exceeds 10MB limit`)
      }

      validFiles.push(file)
      progressMap[file.name] = {
        fileName: file.name,
        progress: 0,
        status: 'pending',
      }
    }

    setUploadProgress(Object.values(progressMap))
    setUploading(true)

    try {
      // Create FormData for backend upload
      const formData = new FormData()
      for (const file of validFiles) {
        formData.append('files', file)
      }

      // Update progress for all files
      setUploadProgress((prev) =>
        prev.map((p) => ({
          ...p,
          status: 'uploading',
          progress: 50,
        }))
      )

      console.log(`Uploading ${validFiles.length} files to backend API`)

      // Send to backend API
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Upload failed with status ${response.status}`)
      }

      const result = await response.json()

      if (!result.success || !result.urls) {
        throw new Error('Invalid response from upload API')
      }

      console.log(`Files uploaded successfully`)

      // Update progress
      setUploadProgress((prev) =>
        prev.map((p) => ({
          ...p,
          status: 'success',
          progress: 100,
        }))
      )

      return result.urls
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'

      setUploadProgress((prev) =>
        prev.map((p) => ({
          ...p,
          status: 'error',
          error: errorMessage,
        }))
      )

      throw error
    } finally {
      setUploading(false)
    }
  }

  return {
    uploadImages,
    uploading,
    uploadProgress,
  }
}
