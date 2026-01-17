// File: lib/actions/auth.ts
// Purpose: Server actions for authentication (signup, signin, signout)
// Note: All functions must be marked with 'use server' directive

'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type {
  SignUpFormData,
  SignInFormData,
  AuthResponse,
  SignUpResponse,
  SignInResponse,
} from '@/types/auth.types'

/**
 * Sign up a new user with company creation
 *
 * Flow:
 * 1. Validate inputs
 * 2. Create Supabase auth user
 * 3. Create company record
 * 4. Update user profile with company_id and admin role
 * 5. Return success with user and company details
 *
 * Note: The auth.users trigger auto-creates a profile record
 * We then update it with the correct company_id
 */
export async function signUp(
  formData: SignUpFormData
): Promise<SignUpResponse> {
  try {
    // Step 1: Validate inputs
    if (!formData.companyName?.trim()) {
      return {
        success: false,
        error: 'Company name is required',
      }
    }

    if (!formData.fullName?.trim()) {
      return {
        success: false,
        error: 'Full name is required',
      }
    }

    if (!formData.email?.trim()) {
      return {
        success: false,
        error: 'Email is required',
      }
    }

    if (!formData.password || formData.password.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters',
      }
    }

    // Validate email format
    if (!formData.email.includes('@') || !formData.email.includes('.') || formData.email.length < 5) {
      return {
        success: false,
        error: 'Please enter a valid email address',
      }
    }

    const supabase = await createClient()

    // Step 2: Check if email already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', formData.email.toLowerCase())
      .single()

    if (existingUser) {
      return {
        success: false,
        error: 'Email already registered',
      }
    }

    // Step 3: Create Supabase auth user with standard signup
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email.toLowerCase(),
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
        },
      },
    })

    if (authError || !authData.user) {
      console.error('Auth signup error:', authError)
      return {
        success: false,
        error: authError?.message || 'Failed to create account',
      }
    }

    const userId = authData.user.id

    // Step 4 & 5: Create company and profile using API route with service role access
    // This bypasses RLS restrictions since the newly created user doesn't have a valid session yet
    try {
      const response = await fetch('/api/auth/create-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          companyName: formData.companyName,
          email: formData.email,
          fullName: formData.fullName,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Company/Profile creation error:', errorData)
        
        // Clean up: delete the auth user if company/profile creation fails
        try {
          await supabase.auth.admin.deleteUser(userId)
        } catch (deleteError) {
          console.error('Error deleting auth user:', deleteError)
        }

        return {
          success: false,
          error: errorData.error || 'Failed to create company and profile',
        }
      }

      const result = await response.json()
      const companyId = result.companyId
    } catch (apiError) {
      console.error('API call error:', apiError)
      
      // Clean up: delete the auth user
      try {
        await supabase.auth.admin.deleteUser(userId)
      } catch (deleteError) {
        console.error('Error deleting auth user:', deleteError)
      }

      return {
        success: false,
        error: 'Failed to set up company and profile',
      }
    }

    // Step 6: Revalidate and redirect to dashboard
    revalidatePath('/')
    revalidatePath('/login')
    revalidatePath('/dashboard')
    
    redirect('/dashboard')
  } catch (error) {
    console.error('Signup error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}

/**
 * Sign in an existing user
 *
 * Flow:
 * 1. Validate inputs
 * 2. Authenticate with Supabase
 * 3. Fetch user profile with company info
 * 4. Verify profile exists and is active
 * 5. Return success with user details
 */
export async function signIn(
  formData: SignInFormData
): Promise<SignInResponse> {
  try {
    // Step 1: Validate inputs
    if (!formData.email?.trim()) {
      return {
        success: false,
        error: 'Email is required',
      }
    }

    if (!formData.password) {
      return {
        success: false,
        error: 'Password is required',
      }
    }

    const supabase = await createClient()

    // Step 2: Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword(
      {
        email: formData.email.toLowerCase(),
        password: formData.password,
      }
    )

    if (authError || !authData.user) {
      console.error('Auth signin error:', authError)
      return {
        success: false,
        error: 'Invalid email or password',
      }
    }

    const userId = authData.user.id

    // Step 3: Fetch user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, company_id, role, is_active')
      .eq('id', userId)
      .single()

    if (profileError || !profileData) {
      console.error('Profile fetch error:', profileError)
      return {
        success: false,
        error: 'User profile not found',
      }
    }

    // Step 4: Verify profile is active
    if (!profileData.is_active) {
      // Sign out inactive user
      await supabase.auth.signOut()
      return {
        success: false,
        error: 'Your account has been deactivated',
      }
    }

    // Step 5: Revalidate and redirect to dashboard
    revalidatePath('/')
    revalidatePath('/login')
    revalidatePath('/dashboard')
    
    // Redirect to dashboard after successful login
    redirect('/dashboard')
  } catch (error) {
    console.error('Signin error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}

/**
 * Sign out the current user
 * Clears the session and redirects to login page
 */
export async function signOut(): Promise<AuthResponse> {
  try {
    const supabase = await createClient()

    // Clear the session
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Signout error:', error)
      return {
        success: false,
        error: 'Failed to sign out',
      }
    }

    // Revalidate paths
    revalidatePath('/')
    revalidatePath('/login')
    revalidatePath('/dashboard')

    // Redirect to login
    redirect('/login')
  } catch (error) {
    console.error('Unexpected signout error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

/**
 * Get current user session (for checking auth status)
 * Used in components to verify if user is logged in
 */
export async function getCurrentUser() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    // Fetch full profile data
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, full_name, company_id, role, is_active')
      .eq('id', user.id)
      .single()

    return {
      id: user.id,
      email: user.email,
      fullName: profileData?.full_name,
      companyId: profileData?.company_id,
      role: profileData?.role,
      isActive: profileData?.is_active,
    }
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  updates: {
    fullName?: string
    avatarUrl?: string
    phone?: string
  }
): Promise<AuthResponse> {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required',
      }
    }

    const supabase = await createClient()

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (updates.fullName?.trim()) {
      updateData.full_name = updates.fullName.trim()
    }

    if (updates.avatarUrl?.trim()) {
      updateData.avatar_url = updates.avatarUrl.trim()
    }

    if (updates.phone?.trim()) {
      updateData.phone = updates.phone.trim()
    }

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)

    if (error) {
      console.error('Profile update error:', error)
      return {
        success: false,
        error: 'Failed to update profile',
      }
    }

    revalidatePath('/settings')
    revalidatePath('/dashboard')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Update profile error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

/**
 * Change password
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<AuthResponse> {
  try {
    if (!currentPassword) {
      return {
        success: false,
        error: 'Current password is required',
      }
    }

    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        error: 'New password must be at least 6 characters',
      }
    }

    if (currentPassword === newPassword) {
      return {
        success: false,
        error: 'New password must be different from current password',
      }
    }

    const supabase = await createClient()

    // Verify current password by attempting to sign in
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user?.email) {
      return {
        success: false,
        error: 'Failed to verify current password',
      }
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: authData.user.email,
      password: currentPassword,
    })

    if (signInError) {
      return {
        success: false,
        error: 'Current password is incorrect',
      }
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      console.error('Password update error:', updateError)
      return {
        success: false,
        error: 'Failed to update password',
      }
    }

    revalidatePath('/settings')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Change password error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}
