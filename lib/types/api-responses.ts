/**
 * API Response Types
 */

import { Property, Lead, PropertyType, LeadStatus, PropertyStatus } from './database'

/**
 * Generic API Response
 */
export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
}

export interface SuccessResponse<T> {
  success: true
  data: T
  message?: string
}

export interface ErrorResponse {
  success: false
  error: ApiError
}

export type ApiResult<T> = SuccessResponse<T> | ErrorResponse

/**
 * Pagination
 */
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedList<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
}

/**
 * Properties API
 */
export interface PropertyFilterParams extends PaginationParams {
  status?: PropertyStatus
  propertyType?: PropertyType
  city?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  searchQuery?: string
}

export interface PropertyResponse {
  id: string
  title: string
  price?: number
  price_currency?: string
  address: string
  city: string
  bedrooms?: number
  bathrooms?: number
  square_feet?: number
  property_type: PropertyType
  status: PropertyStatus
  images?: string[]
  created_at: string
}

/**
 * Leads API
 */
export interface LeadFilterParams extends PaginationParams {
  status?: LeadStatus
  assigned_to?: string
  searchQuery?: string
}

export interface LeadResponse {
  id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  status: LeadStatus
  budget_min?: number
  budget_max?: number
  created_at: string
}

/**
 * Dashboard API
 */
export interface DashboardResponse {
  totalProperties: number
  newLeads: number
  propertiesSold: number
  revenue: string
  leadsOverTime: Array<{
    name: string
    leads: number
  }>
  propertyTypeBreakdown: Array<{
    name: string
    value: number
    color: string
  }>
  recentLeads: LeadResponse[]
}

/**
 * Create/Update Request Bodies
 */
export interface CreatePropertyRequest {
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
  notes?: string
}

export interface UpdatePropertyRequest extends Partial<CreatePropertyRequest> {}

export interface CreateLeadRequest {
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
}

export interface UpdateLeadRequest extends Partial<CreateLeadRequest> {}
