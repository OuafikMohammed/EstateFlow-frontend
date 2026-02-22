-- Add amenities column to properties table
-- Allows storing property amenities as a TEXT array
-- Default empty array for backward compatibility

ALTER TABLE public.properties
ADD COLUMN amenities TEXT[] DEFAULT '{}';

-- Create index on amenities for faster filtering if needed
CREATE INDEX idx_properties_amenities ON public.properties USING GIN(amenities);
