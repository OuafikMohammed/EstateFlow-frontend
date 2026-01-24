# Implementation Tasks - Detailed Checklist

**Project**: EstateFlow  
**Document**: Actionable Task Breakdown  
**Created**: January 24, 2026  
**Total Estimated Effort**: ~150 hours

---

## PHASE 1: FOUNDATION & CORE (Week 1-2)

### 1.1 TYPE DEFINITIONS (4-6 hours)

#### Task 1.1.1: Create Database Types
**File**: `lib/types/database.ts`
**Description**: TypeScript types matching Supabase database schema
**Effort**: 2 hours

**Checklist**:
- [ ] Import/generate types from Supabase
- [ ] Define Property type
- [ ] Define Lead type
- [ ] Define Showing type
- [ ] Define Company type
- [ ] Define Profile/User type
- [ ] Export all types
- [ ] Add JSDoc comments

**Sample Code**:
```typescript
// lib/types/database.ts
export type Property = {
  id: string
  company_id: string
  title: string
  description: string
  price: number
  address: string
  city: string
  bedrooms: number
  bathrooms: number
  square_feet: number
  property_type: 'house' | 'condo' | 'commercial' | 'land'
  status: 'available' | 'under_contract' | 'sold' | 'expired'
  images: string[]
  created_at: string
  updated_at: string
  created_by: string
}

export type Lead = {
  id: string
  company_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  status: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'closed_won' | 'closed_lost'
  budget_min?: number
  budget_max?: number
  assigned_to?: string
  created_at: string
  updated_at: string
}
```

---

#### Task 1.1.2: Create API Response Types
**File**: `lib/types/api-responses.ts`
**Description**: Standardized API response envelope types
**Effort**: 1 hour

**Checklist**:
- [ ] Define ApiResponse<T> wrapper
- [ ] Define PaginationMeta type
- [ ] Define PaginatedResponse<T> type
- [ ] Define ErrorResponse type
- [ ] Add error code enums
- [ ] Export types

**Sample Code**:
```typescript
// lib/types/api-responses.ts
export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
  statusCode?: number
}

export type PaginationMeta = {
  page: number
  limit: number
  total: number
  hasMore: boolean
}

export type PaginatedResponse<T> = {
  success: boolean
  data: T[]
  pagination: PaginationMeta
}

export type ErrorResponse = {
  success: false
  error: string
  code?: string
  fields?: Record<string, string[]>
}
```

---

#### Task 1.1.3: Create Filter Types
**File**: `lib/types/filters.ts`
**Description**: Request parameter types for queries
**Effort**: 1 hour

**Checklist**:
- [ ] Define PropertyFilters type
- [ ] Define LeadFilters type
- [ ] Define SearchFilters type
- [ ] Define PaginationParams type
- [ ] Add JSDoc with examples

---

#### Task 1.1.4: Create Entity/Domain Types
**File**: `lib/types/entities.ts`
**Description**: Business logic domain types
**Effort**: 1 hour

**Checklist**:
- [ ] Define User (authenticated user context)
- [ ] Define Company context
- [ ] Define UserRole type
- [ ] Export all types

---

### 1.2 UTILITY HELPERS (6-8 hours)

#### Task 1.2.1: Create API Client Wrapper
**File**: `lib/utils/api-client.ts`
**Description**: Fetch wrapper with error handling and retry logic
**Effort**: 2-3 hours

**Checklist**:
- [ ] Create `apiCall()` wrapper function
- [ ] Add automatic retry logic (3 retries)
- [ ] Add error transformation
- [ ] Add request logging
- [ ] Add type safety
- [ ] Handle rate limiting (429)
- [ ] Add timeout handling
- [ ] Export from lib/utils

**Sample Code**:
```typescript
// lib/utils/api-client.ts
export async function apiCall<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const maxRetries = 3
  let lastError: Error | null = null
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers
        }
      })
      
      if (!response.ok) {
        throw new ApiError(response.status, await response.text())
      }
      
      return await response.json()
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries - 1) {
        await delay(Math.pow(2, i) * 1000) // Exponential backoff
      }
    }
  }
  
  throw lastError
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
```

---

#### Task 1.2.2: Create Query Builder Utilities
**File**: `lib/utils/query-builders.ts`
**Description**: Helper functions for building query URLs
**Effort**: 2 hours

**Checklist**:
- [ ] Create `buildQueryString()` function
- [ ] Create `buildPaginationParams()` function
- [ ] Create `buildFilterParams()` function
- [ ] Create `buildSearchParams()` function
- [ ] Add TypeScript overloads
- [ ] Test with sample filters

**Sample Code**:
```typescript
// lib/utils/query-builders.ts
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()
  
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, String(v)))
      } else {
        searchParams.set(key, String(value))
      }
    }
  }
  
  return searchParams.toString()
}
```

---

#### Task 1.2.3: Create Data Transformers
**File**: `lib/utils/transformers.ts`
**Description**: Data transformation helpers
**Effort**: 1 hour

**Checklist**:
- [ ] Create property formatter
- [ ] Create lead formatter
- [ ] Create date formatters
- [ ] Create currency formatter
- [ ] Handle null values gracefully

---

#### Task 1.2.4: Create Validators
**File**: `lib/utils/validators.ts`
**Description**: Input validation functions
**Effort**: 2 hours

**Checklist**:
- [ ] Create email validator
- [ ] Create phone validator
- [ ] Create price validator
- [ ] Create address validator
- [ ] Create form validators
- [ ] Add error messages

---

### 1.3 BASE HOOKS (6-8 hours)

#### Task 1.3.1: Create useDebounce Hook
**File**: `lib/hooks/useDebounce.ts`
**Description**: Debounce utility for search
**Effort**: 1 hour

**Checklist**:
- [ ] Implement debounce logic
- [ ] Handle cleanup on unmount
- [ ] Add TypeScript generics
- [ ] Add JSDoc with examples

**Sample Code**:
```typescript
// lib/hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => clearTimeout(handler)
  }, [value, delay])
  
  return debouncedValue
}
```

---

#### Task 1.3.2: Create useErrorHandler Hook
**File**: `lib/hooks/useErrorHandler.ts`
**Description**: Common error handling
**Effort**: 2 hours

**Checklist**:
- [ ] Create error state management
- [ ] Create error message mapping
- [ ] Create error recovery methods
- [ ] Add logging
- [ ] Integrate with toast system

---

#### Task 1.3.3: Create useAsync Hook
**File**: `lib/hooks/useAsync.ts`
**Description**: Generic async hook for mutations
**Effort**: 2 hours

**Checklist**:
- [ ] Implement loading state
- [ ] Implement error state
- [ ] Implement success state
- [ ] Add retry logic
- [ ] Add cleanup

---

#### Task 1.3.4: Create useRealtimeSubscription Hook
**File**: `lib/hooks/useRealtimeSubscription.ts`
**Description**: Supabase realtime subscriptions
**Effort**: 2 hours

**Checklist**:
- [ ] Implement channel subscription
- [ ] Add query invalidation on changes
- [ ] Handle unsubscribe cleanup
- [ ] Add error handling
- [ ] Test with React Query

**Sample Code**:
```typescript
// lib/hooks/useRealtimeSubscription.ts
export function useRealtimeSubscription(
  table: string,
  companyId: string,
  queryKey: any[]
) {
  const queryClient = useQueryClient()
  const supabase = createClientComponentClient()
  
  useEffect(() => {
    const channel = supabase.channel(`${table}:${companyId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table,
        filter: `company_id=eq.${companyId}`
      }, () => {
        queryClient.invalidateQueries({ queryKey })
      })
      .subscribe()
    
    return () => {
      channel.unsubscribe()
    }
  }, [table, companyId, queryKey, queryClient, supabase])
}
```

---

#### Task 1.3.5: Create index.ts for hooks
**File**: `lib/hooks/index.ts`
**Description**: Export all hooks
**Effort**: 0.5 hour

**Checklist**:
- [ ] Export all hooks from one place
- [ ] Add JSDoc index comment

---

### 1.4 DATABASE MIGRATIONS (4-6 hours)

#### Task 1.4.1: Review Existing Schema
**File**: `supabase-schema.sql`
**Description**: Verify existing tables and RLS policies
**Effort**: 1 hour

**Checklist**:
- [ ] Review properties table structure
- [ ] Review leads table structure
- [ ] Review showings table structure
- [ ] Review RLS policies
- [ ] Identify any missing columns
- [ ] Document findings

---

#### Task 1.4.2: Add Database Functions
**File**: `supabase-schema.sql` (append)
**Description**: Add SQL functions for queries
**Effort**: 2 hours

**Checklist**:
- [ ] Add `get_leads_stats()` function
- [ ] Add `get_company_properties()` function
- [ ] Add `get_dashboard_stats()` function
- [ ] Test each function
- [ ] Verify performance

---

#### Task 1.4.3: Add Full-Text Search Indexes
**File**: `supabase-schema.sql` (append)
**Description**: Add search capability
**Effort**: 2 hours

**Checklist**:
- [ ] Add search_vector column to properties
- [ ] Add search_vector column to leads
- [ ] Create GIN indexes
- [ ] Create trigger functions for vector update
- [ ] Test search queries

**SQL Example**:
```sql
-- Add to supabase-schema.sql
ALTER TABLE public.properties
ADD COLUMN search_vector tsvector;

CREATE INDEX idx_properties_search ON public.properties
USING GIN(search_vector);

CREATE OR REPLACE FUNCTION update_properties_search()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    COALESCE(NEW.title, '') || ' ' ||
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(NEW.city, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_properties_search_trigger
BEFORE INSERT OR UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION update_properties_search();
```

---

#### Task 1.4.4: Create Performance Indexes
**File**: `supabase-schema.sql` (append)
**Description**: Add indexes for common queries
**Effort**: 1 hour

**Checklist**:
- [ ] Add company_id + status indexes
- [ ] Add scheduled_at indexes
- [ ] Add created_at indexes for sorting
- [ ] Test query plans
- [ ] Verify performance improvement

---

#### Task 1.4.5: Run Migrations in Supabase
**Description**: Execute all SQL changes
**Effort**: 0.5 hour

**Checklist**:
- [ ] Login to Supabase console
- [ ] Go to SQL Editor
- [ ] Copy all new SQL
- [ ] Execute and verify no errors
- [ ] Check all objects created
- [ ] Test basic queries
- [ ] Document any issues

---

### 1.5 DOCUMENTATION (1-2 hours)

#### Task 1.5.1: Create Architecture Doc
**File**: `INTEGRATION_ARCHITECTURE.md`
**Description**: Document the new architecture
**Effort**: 1 hour

**Checklist**:
- [ ] Document data flow
- [ ] Document API design
- [ ] Document error handling
- [ ] Document caching strategy

---

## PHASE 2: PROPERTIES MANAGEMENT (8-10 hours)

### 2.1 Create Hooks (3 hours)

#### Task 2.1.1: Implement useProperties Hook
**File**: `lib/hooks/useProperties.ts`
**Description**: Query hook for properties list
**Effort**: 2 hours

**Checklist**:
- [ ] Create `useProperties(filters)` hook
- [ ] Add pagination support
- [ ] Add filtering (status, type, city, price)
- [ ] Add sorting support
- [ ] Set appropriate staleTime
- [ ] Add error handling
- [ ] Add TypeScript types
- [ ] Write JSDoc

**Sample Implementation**:
```typescript
// lib/hooks/useProperties.ts
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { apiCall } from '@/lib/utils/api-client'
import { Property, PaginatedResponse } from '@/lib/types'

interface PropertyFilters {
  page?: number
  limit?: number
  status?: string
  type?: string
  city?: string
  minPrice?: number
  maxPrice?: number
}

export function useProperties(
  filters: PropertyFilters = {}
): UseQueryResult<PaginatedResponse<Property>> {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () =>
      apiCall<PaginatedResponse<Property>>(
        `/api/properties?${new URLSearchParams(
          Object.entries(filters).map(([k, v]) => [
            k,
            String(v)
          ])
        )}`
      ),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: previousData => previousData,
  })
}
```

---

#### Task 2.1.2: Implement useProperty Hook
**File**: `lib/hooks/useProperties.ts` (add to file)
**Description**: Query hook for single property
**Effort**: 1 hour

**Checklist**:
- [ ] Create `useProperty(id)` hook
- [ ] Add error handling for 404
- [ ] Add TypeScript types
- [ ] Test with invalid ID

---

### 2.2 Create API Routes (3-4 hours)

#### Task 2.2.1: Create /api/properties GET Route
**File**: `app/api/properties/route.ts`
**Description**: Fetch properties with pagination & filters
**Effort**: 2 hours

**Checklist**:
- [ ] Create route handler
- [ ] Extract query parameters
- [ ] Build Supabase query with filters
- [ ] Add pagination with limit/offset
- [ ] Add sorting
- [ ] Get company_id from auth context
- [ ] Apply RLS (automatic via Supabase)
- [ ] Return paginated response
- [ ] Handle errors
- [ ] Add TypeScript

**Sample Implementation**:
```typescript
// app/api/properties/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get user's company
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()
    
    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }
    
    // Parse pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = (page - 1) * limit
    
    // Build query
    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .eq('company_id', profile.company_id)
    
    // Apply filters
    if (searchParams.get('status')) {
      query = query.eq('status', searchParams.get('status'))
    }
    if (searchParams.get('type')) {
      query = query.eq('property_type', searchParams.get('type'))
    }
    if (searchParams.get('city')) {
      query = query.ilike('city', `%${searchParams.get('city')}%`)
    }
    const minPrice = parseInt(searchParams.get('minPrice') || '0')
    const maxPrice = parseInt(searchParams.get('maxPrice') || '999999999')
    query = query.gte('price', minPrice).lte('price', maxPrice)
    
    // Sort and paginate
    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        hasMore: offset + limit < (count || 0)
      }
    })
  } catch (error) {
    console.error('[/api/properties] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get user's company
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()
    
    // Insert property
    const { data, error } = await supabase
      .from('properties')
      .insert({
        company_id: profile.company_id,
        created_by: user.id,
        ...body
      })
      .select()
    
    if (error) throw error
    
    return NextResponse.json({ success: true, data: data[0] }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/properties] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

#### Task 2.2.2: Create /api/properties/[id] Route
**File**: `app/api/properties/[id]/route.ts`
**Description**: Get/update/delete single property
**Effort**: 1 hour

**Checklist**:
- [ ] Create GET handler
- [ ] Create PUT handler
- [ ] Create DELETE handler
- [ ] Verify RLS
- [ ] Return appropriate errors

---

#### Task 2.2.3: Create /api/properties/search Route
**File**: `app/api/properties/search/route.ts`
**Description**: Full-text search endpoint
**Effort**: 1 hour

**Checklist**:
- [ ] Create GET handler
- [ ] Implement full-text search
- [ ] Add pagination
- [ ] Add filtering on top of search
- [ ] Test search quality

---

### 2.3 Update Components (2-3 hours)

#### Task 2.3.1: Update PropertiesPage
**File**: `app/properties/page.tsx`
**Description**: Replace mock data with hook
**Effort**: 1 hour

**Before**:
```typescript
const properties = [
  { id: "1", title: "Modern 3BR...", ... },
  // ... 5 more hardcoded
]
```

**After**:
```typescript
'use client'

import { useState } from 'react'
import { useProperties } from '@/lib/hooks/useProperties'

export default function PropertiesPage() {
  const [filters, setFilters] = useState({})
  const { data: response, isLoading } = useProperties(filters)
  const properties = response?.data || []
  
  return (
    // ... render dynamic properties
  )
}
```

**Checklist**:
- [ ] Replace mock data array
- [ ] Add useProperties hook
- [ ] Add loading skeleton
- [ ] Add error state
- [ ] Add empty state
- [ ] Verify pagination works
- [ ] Test filters

---

#### Task 2.3.2: Update PropertyCard Component
**File**: `components/property/property-card.tsx`
**Description**: Ensure component matches schema
**Effort**: 0.5 hour

**Checklist**:
- [ ] Verify property fields match type
- [ ] Update display fields if needed
- [ ] Test with real data

---

#### Task 2.3.3: Create PropertyList Component
**File**: `components/property/property-list.tsx`
**Description**: Reusable list component
**Effort**: 0.5 hour

**Checklist**:
- [ ] Create wrapper component
- [ ] Add grid/list toggle
- [ ] Add sorting UI
- [ ] Export component

---

### 2.4 Testing (2 hours)

#### Task 2.4.1: Test API Endpoints
**Checklist**:
- [ ] Test GET /api/properties with no auth → 401
- [ ] Test GET /api/properties with auth → 200
- [ ] Test with invalid company → empty results
- [ ] Test pagination: page 1, page 2
- [ ] Test filters: each filter individually
- [ ] Test combined filters
- [ ] Test search with valid query
- [ ] Test search with invalid query
- [ ] Test performance: < 100ms

---

#### Task 2.4.2: Test Components
**Checklist**:
- [ ] Properties page loads
- [ ] Mock data removed
- [ ] Real data displays
- [ ] Filters work
- [ ] Pagination works
- [ ] Loading state shows
- [ ] Error state shows
- [ ] Empty state shows
- [ ] Mobile responsive

---

#### Task 2.4.3: Test RLS
**Checklist**:
- [ ] User sees only company's properties
- [ ] User cannot query other company's properties
- [ ] Admin sees all company properties
- [ ] Cannot bypass RLS with direct query

---

## PHASE 2 Continued: LEADS MANAGEMENT (8-10 hours)

### 2.5 Create Leads Hooks (3 hours)

#### Task 2.5.1: Implement useLeads Hook
**File**: `lib/hooks/useLeads.ts`
**Effort**: 2 hours

Same pattern as useProperties, with leads-specific fields

---

#### Task 2.5.2: Implement useLeadsStats Hook
**File**: `lib/hooks/useLeads.ts` (add to file)
**Effort**: 1 hour

**Checklist**:
- [ ] Create hook
- [ ] Call /api/leads/stats
- [ ] Set refetchInterval 30s
- [ ] Add error handling

---

### 2.6 Create Leads API Routes (3-4 hours)

#### Task 2.6.1: Create /api/leads Route
**File**: `app/api/leads/route.ts`
**Effort**: 2 hours

**Checklist**:
- [ ] Implement GET with pagination
- [ ] Implement POST for create
- [ ] Add filters (status, search, assigned_to)
- [ ] Add company_id context
- [ ] Test endpoints

---

#### Task 2.6.2: Create /api/leads/stats Route
**File**: `app/api/leads/stats/route.ts`
**Effort**: 1 hour

**Checklist**:
- [ ] Call get_leads_stats() function
- [ ] Map response fields
- [ ] Return stats

---

#### Task 2.6.3: Create /api/leads/search Route
**File**: `app/api/leads/search/route.ts`
**Effort**: 1 hour

**Checklist**:
- [ ] Implement search by name/email
- [ ] Add pagination
- [ ] Test search

---

### 2.7 Update Leads Components (2-3 hours)

#### Task 2.7.1: Update LeadsTable
**File**: `components/lead/leads-table.tsx`
**Effort**: 1.5 hours

**Checklist**:
- [ ] Replace mock data
- [ ] Add useLeads hook
- [ ] Add loading/error states
- [ ] Test with real data

---

#### Task 2.7.2: Update LeadsPage
**File**: `app/leads/page.tsx`
**Effort**: 1 hour

**Checklist**:
- [ ] Add useLeadsStats hook
- [ ] Replace hardcoded stats cards
- [ ] Add dynamic card values
- [ ] Test stats update

---

#### Task 2.7.3: Create LeadDetailView
**File**: `components/lead/lead-detail-view.tsx`
**Effort**: 0.5 hour

**Checklist**:
- [ ] Create detail page component
- [ ] Display lead info
- [ ] Show activities (Phase 3)

---

### 2.8 Testing (2 hours)

#### Task 2.8.1: Test Leads API
**Checklist**:
- [ ] GET /api/leads works
- [ ] POST /api/leads works
- [ ] Filters work
- [ ] Stats endpoint returns data
- [ ] Search works
- [ ] RLS restricts data
- [ ] Performance < 100ms

---

#### Task 2.8.2: Test Components
**Checklist**:
- [ ] Leads page loads
- [ ] Table displays leads
- [ ] Stats cards show correct values
- [ ] Pagination works
- [ ] Filters work
- [ ] Mobile responsive

---

## PHASE 2 Continued: DASHBOARD (6-8 hours)

### 2.9 Create Dashboard Hooks (2 hours)

#### Task 2.9.1: Implement useDashboardStats Hook
**File**: `lib/hooks/useDashboard.ts`
**Effort**: 1.5 hours

**Checklist**:
- [ ] Create hook
- [ ] Call /api/dashboard/stats
- [ ] Set refetchInterval 30s
- [ ] Cache stats

---

#### Task 2.9.2: Implement useDashboardTrend Hook
**File**: `lib/hooks/useDashboard.ts` (add)
**Effort**: 0.5 hour

---

### 2.10 Create Dashboard API Routes (2-3 hours)

#### Task 2.10.1: Create /api/dashboard/stats Route
**File**: `app/api/dashboard/stats/route.ts`
**Effort**: 1.5 hours

**Checklist**:
- [ ] Query properties count
- [ ] Query leads count
- [ ] Query showings
- [ ] Calculate metrics
- [ ] Return response

---

#### Task 2.10.2: Create /api/dashboard/leads-trend Route
**File**: `app/api/dashboard/leads-trend/route.ts`
**Effort**: 1 hour

**Checklist**:
- [ ] Group leads by week
- [ ] Return array of week data
- [ ] Format for chart

---

### 2.11 Update Dashboard Components (2-3 hours)

#### Task 2.11.1: Update DashboardPage
**File**: `app/dashboard/page.tsx`
**Effort**: 1.5 hours

**Checklist**:
- [ ] Replace hardcoded stats
- [ ] Add useDashboardStats hook
- [ ] Update stats cards
- [ ] Test dynamic values

---

#### Task 2.11.2: Update ChartSection
**File**: `components/dashboard/chart-section.tsx`
**Effort**: 1 hour

**Checklist**:
- [ ] Replace mock chart data
- [ ] Add useDashboardTrend hook
- [ ] Render charts with real data
- [ ] Test chart rendering

---

### 2.12 Create Materialized View (1-2 hours)

#### Task 2.12.1: Add Dashboard Stats View
**File**: `supabase-schema.sql` (append)
**Effort**: 1.5 hours

**Checklist**:
- [ ] Create materialized view in SQL editor
- [ ] Test query performance
- [ ] Document refresh schedule
- [ ] (Optional) Setup refresh job

---

### 2.13 Testing Phase 2 Complete (2 hours)

#### Task 2.13.1: Full Phase 2 Integration Test
**Checklist**:
- [ ] All 3 features work together
- [ ] Data consistency verified
- [ ] Performance acceptable
- [ ] No 500 errors
- [ ] RLS policies verified
- [ ] Mobile tested
- [ ] Load time under 2 seconds

---

## PHASE 3: ADVANCED FEATURES (12-15 hours)

### 3.1 Lead Activities (5-6 hours)

#### Task 3.1.1: Create useLeadActivities Hook
**File**: `lib/hooks/useLeadActivities.ts`
**Effort**: 1.5 hours

---

#### Task 3.1.2: Create /api/leads/[leadId]/activities Route
**File**: `app/api/leads/[leadId]/activities/route.ts`
**Effort**: 2 hours

**Checklist**:
- [ ] Implement GET (list activities)
- [ ] Implement POST (create activity)
- [ ] Add timestamps
- [ ] Associate with lead
- [ ] Restrict by company

---

#### Task 3.1.3: Create Activity Timeline Component
**File**: `components/lead/activity-timeline.tsx`
**Effort**: 1.5 hours

**Checklist**:
- [ ] Display timeline
- [ ] Show activity icons by type
- [ ] Reverse chronological order
- [ ] Responsive design

---

### 3.2 Showings & Calendar (5-6 hours)

#### Task 3.2.1: Create useShowings Hook
**File**: `lib/hooks/useShowings.ts`
**Effort**: 2 hours

---

#### Task 3.2.2: Create /api/showings Route
**File**: `app/api/showings/route.ts`
**Effort**: 2 hours

**Checklist**:
- [ ] GET: Query by date range
- [ ] POST: Create showing
- [ ] PUT: Update status
- [ ] Add company scoping

---

#### Task 3.2.3: Create Calendar Component
**File**: `components/showing/showing-calendar.tsx`
**Effort**: 1.5 hours

**Checklist**:
- [ ] Integrate calendar library
- [ ] Display showings on dates
- [ ] Click to create
- [ ] Click to view details

---

### 3.3 Real-time Subscriptions (2-3 hours)

#### Task 3.3.1: Integrate useRealtimeSubscription
**Description**: Add to all main data hooks
**Effort**: 2-3 hours

**Checklist**:
- [ ] Add to useProperties
- [ ] Add to useLeads
- [ ] Add to useShowings
- [ ] Test with multiple windows
- [ ] Verify cache invalidation

---

## PHASE 4: SEARCH & ANALYTICS (10-12 hours)

### 4.1 Search Implementation (4-5 hours)

#### Task 4.1.1: Create useSearch Hooks
**File**: `lib/hooks/useSearch.ts`
**Effort**: 2 hours

---

#### Task 4.1.2: Create Search API Routes
**File**: `app/api/[properties|leads]/search/route.ts`
**Effort**: 2 hours (Already started in Phase 2)

---

#### Task 4.1.3: Create Search Component
**File**: `components/search/search-bar.tsx`
**Effort**: 1 hour

---

### 4.2 Analytics Implementation (6-7 hours)

#### Task 4.2.1: Create Analytics Views
**File**: `supabase-schema.sql` (append)
**Effort**: 2 hours

---

#### Task 4.2.2: Create useAnalytics Hooks
**File**: `lib/hooks/useAnalytics.ts`
**Effort**: 2 hours

---

#### Task 4.2.3: Create Analytics API Routes
**File**: `app/api/analytics/*.ts`
**Effort**: 1.5 hours

---

#### Task 4.2.4: Create Analytics Page
**File**: `app/analytics/page.tsx`
**Effort**: 1.5 hours

---

## PHASE 5: TEAM & OTHER FEATURES (8-10 hours)

### 5.1 Team Management (4-5 hours)

#### Task 5.1.1: Create useTeam Hooks
**Effort**: 1 hour

---

#### Task 5.1.2: Create Team API Routes
**Effort**: 2 hours

---

#### Task 5.1.3: Create Team Pages & Components
**Effort**: 1.5 hours

---

### 5.2 Property-Lead Assignments (2-3 hours)

#### Task 5.2.1: Create usePropertyLeadAssignments Hook
**Effort**: 1 hour

---

#### Task 5.2.2: Create Assignment API Routes
**Effort**: 1-2 hours

---

### 5.3 Documentation & Polish (2-3 hours)

#### Task 5.3.1: Complete API Documentation
**Effort**: 1.5 hours

---

#### Task 5.3.2: Complete Component Documentation
**Effort**: 1 hour

---

## TESTING & QA PHASE (8-10 hours)

### Final Testing

#### Functional Testing
- [ ] All CRUD operations work
- [ ] Pagination works at scale
- [ ] Search returns accurate results
- [ ] Filters combine properly
- [ ] Real-time updates sync
- [ ] No console errors
- [ ] No memory leaks

#### Security Testing
- [ ] RLS policies verified
- [ ] Cannot access other company data
- [ ] API validates auth
- [ ] No SQL injection possible
- [ ] Passwords never exposed
- [ ] Sessions managed correctly

#### Performance Testing
- [ ] API response < 100ms
- [ ] Dashboard load < 500ms
- [ ] Search < 200ms
- [ ] FCP < 1s
- [ ] LCP < 2.5s
- [ ] No N+1 queries

#### Cross-browser Testing
- [ ] Chrome ✅
- [ ] Firefox ✅
- [ ] Safari ✅
- [ ] Edge ✅
- [ ] Mobile browsers ✅

#### Accessibility Testing
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast acceptable
- [ ] Focus visible

---

## DEPLOYMENT PHASE (3-4 hours)

### Pre-deployment
- [ ] Feature flags configured
- [ ] Monitoring setup
- [ ] Alerts configured
- [ ] Rollback plan documented
- [ ] Release notes written

### Deployment to Staging
- [ ] Deploy code to staging
- [ ] Run smoke tests
- [ ] Full test suite passes
- [ ] QA signoff

### Canary Release (5% users)
- [ ] Deploy to production
- [ ] Monitor errors (< 1%)
- [ ] Monitor latency (< 200ms p95)
- [ ] Gather user feedback

### Gradual Rollout
- [ ] 25% → 50% → 100%
- [ ] Monitor each step
- [ ] Revert if issues

---

## SUMMARY

**Total Tasks**: ~120  
**Total Effort**: ~150 hours  
**Recommended Team**: 1-2 developers  
**Duration**: 4-5 weeks  

**Week 1**: Foundation + Properties + Leads  
**Week 2**: Dashboard + Testing Phase 2  
**Week 3**: Lead Activities + Showings + Real-time  
**Week 4**: Search + Analytics  
**Week 5**: Team + Documentation + QA + Deploy  

---

**Document Version**: 1.0  
**Status**: Ready to Execute  
**Last Updated**: January 24, 2026
