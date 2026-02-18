-- ============================================================================
-- Migration: Add Soft Delete Support to Properties Table
-- Description: Adds deleted_at column for soft delete functionality
-- ============================================================================

-- Add deleted_at column to properties table
ALTER TABLE public.properties
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index on deleted_at for efficient filtering of active properties
CREATE INDEX idx_properties_deleted_at ON public.properties(deleted_at);

-- Create composite index for common queries (company_id + deleted_at)
CREATE INDEX idx_properties_company_id_not_deleted ON public.properties(company_id)
WHERE deleted_at IS NULL;

-- Create composite index for created_at queries excluding deleted
CREATE INDEX idx_properties_created_at_not_deleted ON public.properties(created_at DESC)
WHERE deleted_at IS NULL;

-- Create composite index for status queries excluding deleted
CREATE INDEX idx_properties_status_not_deleted ON public.properties(status)
WHERE deleted_at IS NULL;
