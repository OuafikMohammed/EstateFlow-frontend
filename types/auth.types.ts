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
  role?: 'admin' | 'agent' | 'viewer'
  companyId?: string
}

export interface Company {
  id: string
  name: string
  email?: string
  timezone: string
}

export interface UserProfile {
  id: string
  companyId: string
  fullName: string
  role: 'admin' | 'agent' | 'viewer'
  isActive: boolean
}
