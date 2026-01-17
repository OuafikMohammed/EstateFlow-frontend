'use client'

import { useState, useRef } from 'react'
import { uploadPropertyImage, deletePropertyImage, getPropertyImages } from '@/lib/supabase/storage'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'

interface PropertyImageUploaderProps {
  propertyId: string
  companyId: string
  onImagesUploaded?: (urls: string[]) => void
}

export function PropertyImageUploader({
  propertyId,
  companyId,
  onImagesUploaded,
}: PropertyImageUploaderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [images, setImages] = useState<Array<{ url: string; path: string }>>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load existing images
  const handleLoadImages = async () => {
    setIsLoading(true)
    const result = await getPropertyImages(companyId, propertyId)

    if ('error' in result) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      })
    } else {
      setImages(result.urls.map((url) => ({ url, path: '' })))
    }
    setIsLoading(false)
  }

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (!files || files.length === 0) return

    setIsLoading(true)
    setUploadProgress(0)

    const newImages: Array<{ url: string; path: string }> = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const result = await uploadPropertyImage(file, companyId, propertyId, () => {
        setUploadProgress(((i + 1) / files.length) * 100)
      })

      if ('error' in result) {
        toast({
          title: 'Upload Failed',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        newImages.push({
          url: result.url,
          path: result.path,
        })
        toast({
          title: 'Success',
          description: `Image uploaded successfully`,
        })
      }
    }

    const allImages = [...images, ...newImages]
    setImages(allImages)
    onImagesUploaded?.(allImages.map((img) => img.url))

    setIsLoading(false)
    setUploadProgress(0)

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle delete image
  const handleDeleteImage = async (path: string, url: string) => {
    setIsLoading(true)
    const result = await deletePropertyImage(path)

    if ('error' in result) {
      toast({
        title: 'Delete Failed',
        description: result.error,
        variant: 'destructive',
      })
    } else {
      setImages(images.filter((img) => img.url !== url))
      toast({
        title: 'Success',
        description: 'Image deleted successfully',
      })
    }
    setIsLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isLoading}
          className="hidden"
          id="file-input"
        />

        <label htmlFor="file-input" className="cursor-pointer">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 mb-2">
              {isLoading ? `Uploading... ${Math.round(uploadProgress)}%` : 'Click or drag to upload images'}
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF up to 5MB
            </p>
          </div>
        </label>
      </div>

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">
            Uploaded Images ({images.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.url}
                  alt={`Property image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => handleDeleteImage(image.path, image.url)}
                  disabled={isLoading}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length === 0 && (
        <Button
          onClick={handleLoadImages}
          variant="outline"
          disabled={isLoading}
        >
          Load Existing Images
        </Button>
      )}
    </div>
  )
}
