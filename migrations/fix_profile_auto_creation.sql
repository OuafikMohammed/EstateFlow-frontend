-- ============================================================================
-- MIGRATION: Add auto-create profile trigger on auth user signup
-- Purpose: Automatically create user profile and company when new auth user is created
-- This ensures every auth user has a corresponding profile record
-- ============================================================================

-- Drop existing trigger if it exists (safe to run multiple times)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to automatically create user profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_company_id UUID;
BEGIN
  -- Only process if this is a new auth user
  IF NEW.id IS NOT NULL THEN
    BEGIN
      -- Create a default company for the user
      INSERT INTO public.companies (name, email, timezone)
      VALUES (
        COALESCE(NEW.email, 'Default Company'),
        NEW.email,
        'UTC'
      )
      RETURNING id INTO default_company_id;
      
      -- Create profile for the new auth user
      INSERT INTO public.profiles (
        id,
        company_id,
        full_name,
        role,
        is_active,
        created_at,
        updated_at
      )
      VALUES (
        NEW.id,
        default_company_id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        'admin',
        true,
        NOW(),
        NOW()
      );
      
    EXCEPTION WHEN OTHERS THEN
      -- Log error but don't fail - company/profile may already exist
      RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to execute the function when new auth user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- INFO: This migration creates a trigger that:
-- 1. Fires after a new user is created in auth.users
-- 2. Automatically creates a company for the user
-- 3. Automatically creates a profile linked to the company
-- 4. Handles errors gracefully (in case profile already exists)
--
-- Note: The signup() function in lib/actions/auth.ts should still create
-- company and profile explicitly with proper data, but this trigger provides
-- a fallback for users created through other means.
-- ============================================================================
