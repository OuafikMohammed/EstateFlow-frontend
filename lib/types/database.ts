/**
 * Database Type Definitions
 * Generated from Supabase schema
 */

export type PropertyType = 'house' | 'condo' | 'townhouse' | 'commercial' | 'land' | 'multi_family' | 'apartment'
export type PropertyStatus = 'available' | 'under_contract' | 'sold' | 'expired' | 'withdrawn'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiating' | 'closed_won' | 'closed_lost'
export type UserRole = 'super_admin' | 'company_admin' | 'agent' | 'client'
export type ActivityType = 'note' | 'call' | 'meeting' | 'email' | 'task' | 'property_viewed'
export type ShowingStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show'

/**
 * Company Entity
 */
export interface Company {
  id: string
  name: string
  email?: string
  phone?: string
  website?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
  logo_url?: string
  timezone?: string
  created_at: string
  updated_at: string
}

/**
 * User Profile
 */
export interface Profile {
  id: string
  company_id: string
  full_name: string
  avatar_url?: string
  phone?: string
  email: string
  role: UserRole
  is_company_admin: boolean
  is_active: boolean
  last_login_at?: string
  created_at: string
  updated_at: string
}

/**
 * Property Listing
 */
export interface Property {
  id: string
  company_id: string
  created_by: string
  title: string
  description?: string
  property_type: PropertyType
  status: PropertyStatus
  price?: number
  price_currency?: string
  address: string
  city: string
  state?: string
  zip_code?: string
  country?: string
  latitude?: number
  longitude?: number
  bedrooms?: number
  bathrooms?: number
  square_feet?: number
  lot_size?: number
  year_built?: number
  hoa_fees?: number
  images?: string[]
  documents?: string[]
  amenities?: string[]
  notes?: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

/**
 * Lead/Prospect
 */
export interface Lead {
  id: string
  company_id: string
  assigned_to?: string
  created_by: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  status: LeadStatus
  budget_min?: number
  budget_max?: number
  interested_types?: PropertyType[]
  preferred_cities?: string[]
  notes?: string
  last_contacted_at?: string
  created_at: string
  updated_at: string
}

/**
 * Lead Activity (Timeline)
 */
export interface LeadActivity {
  id: string
  lead_id: string
  company_id: string
  created_by: string
  activity_type: ActivityType
  title: string
  description?: string
  scheduled_at?: string
  completed_at?: string
  duration_minutes?: number
  created_at: string
  updated_at: string
}

/**
 * Property-Lead Assignment (Many-to-Many)
 */
export interface PropertyLeadAssignment {
  id: string
  property_id: string
  lead_id: string
  company_id: string
  assigned_at: string
  status: string
  notes?: string
  created_at: string
  updated_at: string
}

/**
 * Showing/Appointment
 */
export interface Showing {
  id: string
  property_id: string
  lead_id: string
  company_id: string
  scheduled_by: string
  scheduled_at: string
  duration_minutes?: number
  status: ShowingStatus
  notes?: string
  created_at: string
  updated_at: string
}

/**
 * Team Invitation
 */
export interface TeamInvitation {
  id: string
  company_id: string
  invited_by: string
  email: string
  full_name?: string
  role: Exclude<UserRole, 'super_admin'>
  token: string
  expires_at: string
  accepted_at?: string
  accepted_by?: string
  created_at: string
  updated_at: string
}

/**
 * API Response Types
 */
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
  status: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

/**
 * Dashboard Stats
 */
export interface DashboardStats {
  total_properties: number
  total_leads: number
  not_contacted_leads: number
  contacted_leads: number
  closed_won_leads: number
  properties_sold: number
  total_revenue: number
  avg_property_price?: number
}

/**
 * User with Company
 */
export interface UserWithCompany extends Profile {
  company?: Company
}

/**
 * Property with Creator
 */
export interface PropertyWithCreator extends Property {
  created_by_user?: Profile
}

/**
 * Lead with Assignment
 */
export interface LeadWithAssignment extends Lead {
  assigned_to_user?: Profile
  property_assignments?: PropertyLeadAssignment[]
}
