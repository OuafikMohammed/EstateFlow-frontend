-- ============================================================================
-- MIGRATION: Fix existing users without profiles
-- Purpose: Create missing profiles and companies for legacy users
-- This fixes the "User profile not found" error for existing auth users
-- ============================================================================

-- Step 1: Find users in auth.users that don't have profiles
-- This query shows which users are missing profiles:
-- SELECT au.id, au.email, au.created_at
-- FROM auth.users au
-- LEFT JOIN public.profiles p ON au.id = p.id
-- WHERE p.id IS NULL;

-- Step 2: Create missing companies and profiles for users without profiles
INSERT INTO public.companies (name, email, timezone, created_at, updated_at)
SELECT 
  COALESCE(au.raw_user_meta_data->>'full_name', au.email, 'Default Company') as name,
  au.email,
  'UTC',
  au.created_at,
  au.updated_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT DO NOTHING;

-- Step 3: Create missing profiles
INSERT INTO public.profiles (id, company_id, full_name, role, is_active, created_at, updated_at)
SELECT 
  au.id,
  (
    SELECT c.id 
    FROM public.companies c 
    WHERE c.email = au.email 
    ORDER BY c.created_at DESC 
    LIMIT 1
  ),
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
  'admin',
  true,
  au.created_at,
  au.updated_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
  AND (
    SELECT c.id 
    FROM public.companies c 
    WHERE c.email = au.email 
    ORDER BY c.created_at DESC 
    LIMIT 1
  ) IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- Step 4: Verify the migration worked
-- Run this to check if there are still users without profiles:
-- SELECT au.id, au.email, p.id as profile_exists
-- FROM auth.users au
-- LEFT JOIN public.profiles p ON au.id = p.id
-- WHERE p.id IS NULL;

-- If this returns no rows, all users now have profiles!

-- ============================================================================
-- INFO: This migration:
-- 1. Creates companies for users that don't have one
-- 2. Creates profiles for users that don't have one
-- 3. Links each user to their company by email
-- 4. Sets all recovered users as admin (assuming they were admins)
--
-- BEFORE running: Make sure your current login flow includes the
-- ensureUserProfile() helper function from lib/actions/auth.ts
--
-- After running: All users should be able to login successfully
-- ============================================================================
