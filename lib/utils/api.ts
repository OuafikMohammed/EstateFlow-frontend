/**
 * API Utility Functions
 */

import { Property, Lead, PropertyStatus, LeadStatus } from '../types/database'
import { PropertyFilterParams, LeadFilterParams, PaginatedList } from '../types/api-responses'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

/**
 * Generic fetch wrapper with error handling
 */
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE_URL}/api${endpoint}`

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}`,
      }))
      throw new Error(error.message || 'API request failed')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error)
    throw error
  }
}

/**
 * Properties API
 */
export const propertiesApi = {
  /**
   * Get all properties with filters
   */
  async getAll(
    params: PropertyFilterParams = {},
  ): Promise<PaginatedList<Property>> {
    const queryParams = new URLSearchParams()

    if (params.page) queryParams.append('page', String(params.page))
    if (params.limit) queryParams.append('limit', String(params.limit))
    if (params.status) queryParams.append('status', params.status)
    if (params.propertyType) queryParams.append('type', params.propertyType)
    if (params.city) queryParams.append('city', params.city)
    if (params.minPrice) queryParams.append('minPrice', String(params.minPrice))
    if (params.maxPrice) queryParams.append('maxPrice', String(params.maxPrice))
    if (params.bedrooms) queryParams.append('bedrooms', String(params.bedrooms))
    if (params.searchQuery) queryParams.append('q', params.searchQuery)
    if (params.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder)

    const query = queryParams.toString()
    const endpoint = `/properties${query ? `?${query}` : ''}`

    return apiCall<PaginatedList<Property>>(endpoint)
  },

  /**
   * Get single property
   */
  async getById(id: string): Promise<Property> {
    return apiCall<Property>(`/properties/${id}`)
  },

  /**
   * Create property
   */
  async create(data: Partial<Property>): Promise<Property> {
    return apiCall<Property>('/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Update property
   */
  async update(id: string, data: Partial<Property>): Promise<Property> {
    return apiCall<Property>(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  /**
   * Delete property
   */
  async delete(id: string): Promise<void> {
    await apiCall(`/properties/${id}`, {
      method: 'DELETE',
    })
  },

  /**
   * Search properties
   */
  async search(query: string): Promise<Property[]> {
    return apiCall<Property[]>(`/properties/search?q=${encodeURIComponent(query)}`)
  },
}

/**
 * Leads API
 */
export const leadsApi = {
  /**
   * Get all leads with filters
   */
  async getAll(params: LeadFilterParams = {}): Promise<PaginatedList<Lead>> {
    const queryParams = new URLSearchParams()

    if (params.page) queryParams.append('page', String(params.page))
    if (params.limit) queryParams.append('limit', String(params.limit))
    if (params.status) queryParams.append('status', params.status)
    if (params.assigned_to) queryParams.append('assignedTo', params.assigned_to)
    if (params.searchQuery) queryParams.append('q', params.searchQuery)
    if (params.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder)

    const query = queryParams.toString()
    const endpoint = `/leads${query ? `?${query}` : ''}`

    return apiCall<PaginatedList<Lead>>(endpoint)
  },

  /**
   * Get single lead
   */
  async getById(id: string): Promise<Lead> {
    return apiCall<Lead>(`/leads/${id}`)
  },

  /**
   * Create lead
   */
  async create(data: Partial<Lead>): Promise<Lead> {
    return apiCall<Lead>('/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Update lead
   */
  async update(id: string, data: Partial<Lead>): Promise<Lead> {
    return apiCall<Lead>(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  /**
   * Delete lead
   */
  async delete(id: string): Promise<void> {
    await apiCall(`/leads/${id}`, {
      method: 'DELETE',
    })
  },

  /**
   * Update lead status
   */
  async updateStatus(id: string, status: LeadStatus): Promise<Lead> {
    return apiCall<Lead>(`/leads/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },
}

/**
 * Dashboard API
 */
export const dashboardApi = {
  /**
   * Get dashboard stats
   */
  async getStats() {
    return apiCall('/dashboard/stats')
  },

  /**
   * Get dashboard overview
   */
  async getOverview() {
    return apiCall('/dashboard/overview')
  },

  /**
   * Get leads timeline chart data
   */
  async getLeadsTimeline(days: number = 30) {
    return apiCall(`/dashboard/leads-timeline?days=${days}`)
  },

  /**
   * Get property type breakdown
   */
  async getPropertyBreakdown() {
    return apiCall('/dashboard/property-breakdown')
  },

  /**
   * Get recent leads
   */
  async getRecentLeads(limit: number = 5) {
    return apiCall(`/dashboard/recent-leads?limit=${limit}`)
  },
}
