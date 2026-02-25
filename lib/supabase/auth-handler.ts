/**
 * Supabase Authentication Handler
 * OWASP A01:2021 - Broken Access Control
 * OWASP A07:2021 - Identification and Authentication Failures
 *
 * Replaces NextAuth mock database with Supabase authentication
 * Provides secure credential handling and session management
 */

import { createAdminClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

interface SignUpData {
  email: string
  password: string
  fullName: string
  companyName: string
}

interface SignInData {
  email: string
  password: string
}

/**
 * Hash password with bcrypt
 * Cost factor: 12 (higher is slower, more secure)
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

/**
 * Verify password against hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Sign up new user with Supabase
 * Creates company, user auth, and user profile in transaction-like manner
 */
export async function signUpUser(data: SignUpData) {
  const admin = createAdminClient()

  // Validate input
  if (!data.email || !data.password || !data.fullName || !data.companyName) {
    throw new Error('Missing required fields: email, password, fullName, companyName')
  }

  try {
    // Step 1: Create Supabase Auth User
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true, // Auto-confirm for development; change to false and implement email verification for production
    })

    if (authError || !authData.user) {
      // Check for specific error types
      if (authError?.message.includes('already signed up')) {
        throw new Error('Email already signed up. Please sign in instead.')
      }
      if (authError?.message.includes('Invalid API key') || authError?.message.includes('invalid')) {
        throw new Error('Database connection error - Invalid API key. Please check your Supabase configuration.')
      }
      if (authError?.message.includes('email')) {
        throw new Error(`Invalid email format: ${authError.message}`)
      }
      throw new Error(`Failed to create user account: ${authError?.message || 'Unknown error'}`)
    }

    const userId = authData.user.id

    try {
      // Step 2: Create Company
      const { data: companyData, error: companyError } = await admin
        .from('companies')
        .insert({
          name: data.companyName,
          email: data.email,
          created_by: userId,
        })
        .select()
        .single()

      if (companyError) {
        // Rollback: Delete created user
        await admin.auth.admin.deleteUser(userId)
        throw new Error(`Failed to create company: ${companyError.message}`)
      }

      const companyId = companyData.id

      // Step 3: Create User Profile
      const { error: profileError } = await admin
        .from('profiles')
        .insert({
          id: userId,
          company_id: companyId,
          full_name: data.fullName,
          email: data.email,
          role: 'company_admin', // First user is company admin
          is_company_admin: true,
          is_active: true,
        })

      if (profileError) {
        // Rollback: Delete user and company
        await admin.auth.admin.deleteUser(userId)
        await admin.from('companies').delete().eq('id', companyId)
        throw new Error(`Failed to create user profile: ${profileError.message}`)
      }

      return {
        success: true,
        userId,
        companyId,
        message: 'Please confirm your email to activate your account',
      }
    } catch (error) {
      // Ensure user is deleted on profile creation failure
      try {
        await admin.auth.admin.deleteUser(userId)
      } catch (deleteError) {
        console.error('[AUTH] Failed to rollback user deletion:', deleteError)
      }
      throw error
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Signup failed'
    throw new Error(message)
  }
}
  

/**
 * Sign in user with email and password
 * SECURITY: Only validates user exists and is active
 * Password verification is performed by Supabase Auth on the client
 * 
 * This approach ensures:
 * 1. Supabase Auth is the single source of truth for credentials
 * 2. Server validates account status (active/disabled)
 * 3. Client performs the actual authentication
 */
export async function signInUser(data: SignInData) {
  const admin = createAdminClient()

  try {
    // Lookup user in profiles table
    const { data: userData, error: lookupError } = await admin
      .from('profiles')
      .select('id, is_active')
      .eq('email', data.email)
      .single()

    if (lookupError || !userData) {
      // User doesn't exist - generic error message (prevents user enumeration)
      throw new Error('Invalid email or password')
    }

    // Check if user account is active
    if (!userData.is_active) {
      throw new Error('This account has been disabled. Please contact support.')
    }

    // User exists and is active - client can now authenticate with Supabase Auth
    return {
      success: true,
      userId: userData.id,
      message: 'User verified.',
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Sign in failed'
    throw new Error(message)
  }
}

/**
 * Get user profile with company information
 */
export async function getUserProfile(userId: string) {
  const admin = createAdminClient()

  try {
    const { data, error } = await admin
      .from('profiles')
      .select(
        `
        id,
        full_name,
        email,
        role,
        is_active,
        avatar_url,
        companies (
          id,
          name,
          email,
          website
        )
      `
      )
      .eq('id', userId)
      .single()

    if (error) {
      throw new Error('Failed to fetch user profile')
    }

    return data
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch profile'
    throw new Error(message)
  }
}

/**
 * Request password reset
 * Generates reset token in Supabase Auth
 */
export async function requestPasswordReset(email: string) {
  const admin = createAdminClient()

  try {
    // Supabase handles password reset flow
    const { error } = await admin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    })

    if (error) {
      throw error
    }

    return {
      success: true,
      message: 'Password reset link sent to your email',
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send reset email'
    // Don't reveal whether email exists
    return {
      success: true,
      message: 'If the email exists, a reset link has been sent',
    }
  }
}

/**
 * Verify email confirmation token
 */
export async function verifyEmailToken(token: string) {
  const admin = createAdminClient()

  try {
    const { data, error } = await admin.auth.verifyOtp({
      token_hash: token,
      type: 'email',
    })

    if (error) {
      throw new Error('Invalid or expired token')
    }

    return {
      success: true,
      user: data.user,
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Token verification failed'
    throw new Error(message)
  }
}

/**
 * Disable user account
 * Should only be called for account deletion or deactivation
 */
export async function disableUserAccount(userId: string) {
  const admin = createAdminClient()

  try {
    const { error } = await admin
      .from('profiles')
      .update({ is_active: false })
      .eq('id', userId)

    if (error) {
      throw new Error('Failed to disable account')
    }

    return { success: true, message: 'Account disabled' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to disable account'
    throw new Error(message)
  }
}
