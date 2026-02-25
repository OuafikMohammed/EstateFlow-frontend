-- ============================================================================
-- MIGRATION: Add created_by to companies table
-- Purpose: Ensure companies can be traced back to the user who created them
-- This is required byหลาย API routes and the onboarding process
-- ============================================================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='companies' AND column_name='created_by'
    ) THEN
        ALTER TABLE public.companies ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
        CREATE INDEX idx_companies_created_by ON public.companies(created_by);
    END IF;
END $$;
