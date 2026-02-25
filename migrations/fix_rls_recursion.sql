-- ============================================================================
-- MIGRATION: Fix recursive RLS on profiles table
-- Purpose: Allow users to view their own profile even if company_id lookup fails
-- This prevents the "User company not found" error caused by infinite recursion
-- ============================================================================

-- Add policy to allow users to see their own profile record
-- This needs to exist alongside "Users can view own company profiles"
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

-- Optional: Update the company viewing policy to be more robust
DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;
CREATE POLICY "Users can view their own company"
  ON public.companies FOR SELECT
  USING (
    id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()) OR
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
  );
