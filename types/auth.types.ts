// File: types/auth.types.ts
// Purpose: TypeScript types for authentication

export interface SignUpFormData {
  companyName: string
  fullName: string
  email: string
  password: string
}

export interface SignInFormData {
  email: string
  password: string
}

export interface AuthResponse<T = null> {
  success: boolean
  error?: string
  data?: T
}

export interface SignUpResponse extends AuthResponse<{
  userId: string
  companyId: string
  email: string
}> {}

export interface SignInResponse extends AuthResponse<{
  userId: string
  email: string
  fullName?: string
}> {}

export interface AuthUser {
  id: string
  email: string
  fullName?: string
  role?: 'super_admin' | 'company_admin' | 'agent' | 'client'
  companyId?: string
  isActive?: boolean
}

export interface Company {
  id: string
  name: string
  email?: string
  timezone: string
}

export interface UserProfile {
  id: string
  fullName: string
  email: string
  role: 'super_admin' | 'company_admin' | 'agent' | 'client'
  companyId: string
  isActive: boolean
}

/**
 * Team Invitation Types
 */
export interface TeamInvitation {
  id: string
  companyId: string
  email: string
  fullName?: string
  role: 'agent' | 'company_admin'
  token: string
  expiresAt: string
  acceptedAt?: string
  acceptedBy?: string
  createdAt: string
  invitedBy: string
}

export interface InvitationDetails {
  email: string
  fullName?: string
  role: 'agent' | 'company_admin'
  companyName: string
}

export interface AcceptInvitationFormData {
  password: string
  confirmPassword: string
}

export interface AcceptInvitationResponse extends AuthResponse<{
  email: string
  message: string
}> {}

/**
 * Google OAuth Types
 */
export interface GoogleAuthProvider {
  clientId: string
  clientSecret?: string
}

export interface OAuth2Error {
  error: string
  error_description?: string
  error_uri?: string
}
