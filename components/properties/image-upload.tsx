"use client"

import { useState, useRef } from "react"
import { Upload, X, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useImageUpload } from "@/hooks/use-image-upload"
import { motion, AnimatePresence } from "framer-motion"

interface ImageUploadProps {
  onImagesUploaded: (urls: string[]) => void
  maxFiles?: number
  maxFileSize?: number
  existingImages?: string[]
}

export function ImageUpload({
  onImagesUploaded,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024,
  existingImages = [],
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>(existingImages)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadImages, uploading, uploadProgress } = useImageUpload("properties")

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = async (files: File[]) => {
    try {
      setError(null)

      // Check total file count
      if (images.length + files.length > maxFiles) {
        setError(`Maximum ${maxFiles} photos allowed`)
        return
      }

      // Upload files
      const uploadedUrls = await uploadImages(files)

      // Add uploaded images to state
      const newImages = [...images, ...uploadedUrls]
      setImages(newImages)
      onImagesUploaded(newImages)

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed"
      setError(errorMessage)
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    onImagesUploaded(newImages)
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer ${
          isDragging
            ? "border-[var(--color-primary-gold)] bg-[var(--color-primary-gold)]/5"
            : "border-[var(--color-border)] hover:border-[var(--color-primary-gold)]"
        } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />

        <Upload
          className="w-12 h-12 mx-auto mb-4"
          style={{ color: "var(--color-primary-gold)" }}
        />
        <p className="text-[var(--color-text-light)] font-semibold mb-2">
          Click to upload or drag photos here
        </p>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          PNG, JPG up to 10MB (Required: 3-{maxFiles} photos)
        </p>
        {uploading && (
          <p className="text-sm text-[var(--color-primary-gold)] mt-2">
            Uploading {uploadProgress.filter((p) => p.status === "success").length} of {uploadProgress.length} files...
          </p>
        )}
      </div>

      {/* Error Message */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-red-500">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Progress */}
      <AnimatePresence mode="popLayout">
        {uploadProgress.length > 0 && (
          <div className="space-y-2">
            {uploadProgress.map((progress) => (
              <motion.div
                key={progress.fileName}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 p-3 bg-[var(--color-bg-card)] rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--color-text-light)] truncate">
                    {progress.fileName}
                  </p>
                  {progress.status === "uploading" && (
                    <div className="w-full bg-[var(--color-border)] rounded-full h-1 mt-1">
                      <div
                        className="bg-[var(--color-primary-gold)] h-1 rounded-full transition-all"
                        style={{ width: `${progress.progress}%` }}
                      />
                    </div>
                  )}
                </div>

                {progress.status === "success" && (
                  <Check className="w-5 h-5 text-[var(--color-success)] flex-shrink-0" />
                )}
                {progress.status === "error" && (
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Image Gallery */}
      <AnimatePresence mode="popLayout">
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <motion.div
                key={`${image}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative aspect-video rounded-lg overflow-hidden group"
              >
                <img
                  src={image}
                  alt={`Property ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="w-4 h-4" />
                </Button>

                {/* Counter Badge */}
                <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                  {index + 1}/{images.length}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Image Count */}
      {images.length > 0 && (
        <p className="text-sm text-[var(--color-muted-foreground)]">
          {images.length} of {maxFiles} photos uploaded
        </p>
      )}
    </div>
  )
}
