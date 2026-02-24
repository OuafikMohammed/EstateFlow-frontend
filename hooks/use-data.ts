/**
 * React Query Hooks for Data Fetching
 * Provides server-state management with automatic caching
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Property, Lead } from '@/lib/types/database'
import { PropertyFilterParams, LeadFilterParams } from '@/lib/types/api-responses'
import { propertiesApi, leadsApi, dashboardApi } from '@/lib/utils/api'

/**
 * Query Keys for consistent cache management
 */
export const queryKeys = {
  properties: {
    all: ['properties'] as const,
    lists: () => [...queryKeys.properties.all, 'list'] as const,
    list: (filters: PropertyFilterParams) =>
      [...queryKeys.properties.lists(), { ...filters }] as const,
    details: () => [...queryKeys.properties.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.properties.details(), id] as const,
    search: (query: string) =>
      [...queryKeys.properties.all, 'search', query] as const,
  },
  leads: {
    all: ['leads'] as const,
    lists: () => [...queryKeys.leads.all, 'list'] as const,
    list: (filters: LeadFilterParams) =>
      [...queryKeys.leads.lists(), { ...filters }] as const,
    details: () => [...queryKeys.leads.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.leads.details(), id] as const,
  },
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    overview: () => [...queryKeys.dashboard.all, 'overview'] as const,
    timeline: (days: number) =>
      [...queryKeys.dashboard.all, 'timeline', days] as const,
    breakdown: () => [...queryKeys.dashboard.all, 'breakdown'] as const,
    recentLeads: (limit: number) =>
      [...queryKeys.dashboard.all, 'recent-leads', limit] as const,
  },
}

/**
 * Properties Hooks
 */

interface UsePropertiesOptions {
  enabled?: boolean
  staleTime?: number
  cacheTime?: number
}

/**
 * Fetch all properties with filters and pagination
 */
export function useProperties(
  filters: PropertyFilterParams = {},
  options: UsePropertiesOptions = {},
) {
  const { enabled = true, staleTime = 5 * 60 * 1000, cacheTime = 10 * 60 * 1000 } =
    options

  return useQuery({
    queryKey: queryKeys.properties.list(filters),
    queryFn: () => propertiesApi.getAll(filters),
    enabled,
    staleTime,
    gcTime: cacheTime, // formerly cacheTime in older versions
  })
}

/**
 * Fetch single property by ID
 */
export function useProperty(id: string, options: UsePropertiesOptions = {}) {
  const { enabled = true, staleTime = 10 * 60 * 1000, cacheTime = 15 * 60 * 1000 } =
    options

  const { data, isLoading, error, ...rest } = useQuery({
    queryKey: queryKeys.properties.detail(id),
    queryFn: () => propertiesApi.getById(id),
    enabled: enabled && !!id,
    staleTime,
    gcTime: cacheTime,
  })

  return {
    property: data,
    loading: isLoading,
    error,
    ...rest,
  }
}

/**
 * Search properties
 */
export function usePropertySearch(query: string) {
  return useQuery({
    queryKey: queryKeys.properties.search(query),
    queryFn: () => propertiesApi.search(query),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Create property mutation
 */
export function useCreateProperty() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<Property>) => propertiesApi.create(data),
    onSuccess: () => {
      // Invalidate all property queries to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.properties.all,
      })
    },
  })
}

/**
 * Update property mutation
 */
export function useUpdateProperty() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Property> }) =>
      propertiesApi.update(id, data),
    onSuccess: (data) => {
      // Update the specific property in cache
      queryClient.setQueryData(
        queryKeys.properties.detail(data.id),
        data,
      )
      // Invalidate list to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.properties.lists(),
      })
    },
  })
}

/**
 * Delete property mutation
 */
export function useDeleteProperty() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => propertiesApi.delete(id),
    onSuccess: () => {
      // Invalidate all property queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.properties.all,
      })
    },
  })
}

/**
 * Leads Hooks
 */

interface UseLeadsOptions {
  enabled?: boolean
  staleTime?: number
  cacheTime?: number
}

/**
 * Fetch all leads with filters and pagination
 */
export function useLeads(
  filters: LeadFilterParams = {},
  options: UseLeadsOptions = {},
) {
  const { enabled = true, staleTime = 5 * 60 * 1000, cacheTime = 10 * 60 * 1000 } =
    options

  return useQuery({
    queryKey: queryKeys.leads.list(filters),
    queryFn: () => leadsApi.getAll(filters),
    enabled,
    staleTime,
    gcTime: cacheTime,
  })
}

/**
 * Fetch single lead by ID
 */
export function useLead(id: string, options: UseLeadsOptions = {}) {
  const { enabled = true, staleTime = 10 * 60 * 1000, cacheTime = 15 * 60 * 1000 } =
    options

  return useQuery({
    queryKey: queryKeys.leads.detail(id),
    queryFn: () => leadsApi.getById(id),
    enabled: enabled && !!id,
    staleTime,
    gcTime: cacheTime,
  })
}

/**
 * Create lead mutation
 */
export function useCreateLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<Lead>) => leadsApi.create(data),
    onSuccess: () => {
      // Invalidate all leads queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.leads.all,
      })
    },
  })
}

/**
 * Update lead mutation
 */
export function useUpdateLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lead> }) =>
      leadsApi.update(id, data),
    onSuccess: (data) => {
      // Update the specific lead in cache
      queryClient.setQueryData(
        queryKeys.leads.detail(data.id),
        data,
      )
      // Invalidate list to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.leads.lists(),
      })
    },
  })
}

/**
 * Delete lead mutation
 */
export function useDeleteLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => leadsApi.delete(id),
    onSuccess: () => {
      // Invalidate all leads queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.leads.all,
      })
    },
  })
}

/**
 * Update lead status mutation
 */
export function useUpdateLeadStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      leadsApi.updateStatus(id, status as any),
    onSuccess: (data) => {
      // Update the specific lead in cache
      queryClient.setQueryData(
        queryKeys.leads.detail(data.id),
        data,
      )
      // Invalidate list to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.leads.lists(),
      })
    },
  })
}

/**
 * Dashboard Hooks
 */

/**
 * Fetch dashboard statistics
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: () => dashboardApi.getStats(),
    staleTime: 0, // Always fetch fresh data
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
    refetchOnMount: 'stale', // Refetch when component mounts if data appears stale
    refetchOnWindowFocus: true, // Refetch when window regains focus
  })
}

/**
 * Fetch dashboard overview
 */
export function useDashboardOverview() {
  return useQuery({
    queryKey: queryKeys.dashboard.overview(),
    queryFn: () => dashboardApi.getOverview(),
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

/**
 * Fetch leads timeline data for charts
 */
export function useLeadsTimeline(days: number = 30) {
  return useQuery({
    queryKey: queryKeys.dashboard.timeline(days),
    queryFn: () => dashboardApi.getLeadsTimeline(days),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

/**
 * Fetch property type breakdown data
 */
export function usePropertyBreakdown() {
  return useQuery({
    queryKey: queryKeys.dashboard.breakdown(),
    queryFn: () => dashboardApi.getPropertyBreakdown(),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  })
}

/**
 * Fetch recent leads
 */
export function useRecentLeads(limit: number = 5) {
  return useQuery({
    queryKey: queryKeys.dashboard.recentLeads(limit),
    queryFn: () => dashboardApi.getRecentLeads(limit),
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  })
}

/**
 * Fetch detailed analytics
 */
export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response = await fetch('/api/analytics')
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: true,
  })
}

/**
 * User Profile Hooks
 */

/**
 * Fetch current authenticated user's profile
 */
export function useCurrentUserProfile() {
  const { data, isLoading, error, ...rest } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const response = await fetch('/api/user/profile')
      if (!response.ok) {
        throw new Error('Failed to fetch user profile')
      }
      return response.json()
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  })

  return {
    userProfile: data,
    loading: isLoading,
    error,
    ...rest,
  }
}
