# Implementation-Prompts Integration Analysis & Plan

**Project**: EstateFlow  
**Date**: January 24, 2026  
**Status**: Ready for Implementation  
**Version**: 1.0

---

## Executive Summary

The `implementation-prompts.md` document contains a **production-ready implementation roadmap** for replacing mock data with Supabase dynamic queries across 10 major features. This document provides:

1. **Current State Analysis** - How the codebase is structured now
2. **Target State Architecture** - How it should be structured after implementation
3. **Detailed Integration Plan** - Step-by-step tasks organized by priority
4. **Database & Schema Changes** - All DDL/migrations required
5. **Testing & Validation Strategy** - QA approach and success criteria
6. **Risk Assessment & Mitigation** - Potential blockers and solutions

---

## SECTION 1: CURRENT CODE STRUCTURE ANALYSIS

### 1.1 Project Architecture Overview

```
EstateFlow/
├── app/                           # Next.js 14 App Router
│   ├── api/                       # API routes (currently minimal)
│   │   └── auth/                  # Auth endpoints only
│   ├── dashboard/                 # Main dashboard (mock data)
│   ├── properties/                # Properties page (mock data)
│   ├── leads/                     # Leads page
│   ├── clients/                   # Clients page
│   ├── showings/                  # Showings page
│   ├── settings/                  # Settings page
│   └── layout.tsx                 # Root layout with auth
│
├── components/                    # React components
│   ├── layout/                    # Layout components
│   ├── property/                  # Property components (PropertyCard)
│   ├── lead/                      # Lead components (LeadsTable)
│   ├── dashboard/                 # Dashboard stats & charts
│   └── ui/                        # Shadcn UI components
│
├── lib/                           # Utilities & hooks
│   ├── supabase/                  # Supabase client setup
│   │   ├── client.ts              # Client component client
│   │   ├── server.ts              # Server component client
│   │   ├── auth-handler.ts        # Auth helpers
│   │   ├── data-fetching.ts       # Data fetching utilities
│   │   ├── storage.ts             # Storage utilities
│   │   └── config-validator.ts    # Config validation
│   ├── utils/                     # Utility functions
│   └── hooks/                     # Custom hooks (currently minimal)
│       ├── use-toast.ts           # Toast hook
│       ├── use-mobile.ts          # Mobile detection
│       └── useAuth.tsx            # Auth hook
│
├── hooks/                         # App-level hooks (duplicate location)
│   └── useAuth.tsx                # Same as above
│
├── types/                         # TypeScript types (empty currently)
│
├── migrations/                    # Database migrations (if any)
│
└── supabase-schema.sql            # Database schema with RLS policies
```

### 1.2 Current Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Framework**: Shadcn/ui, Radix UI, Framer Motion
- **Data Fetching**: TanStack React Query 5.90+
- **Backend**: Next.js API routes, Supabase
- **Database**: PostgreSQL (Supabase)
- **Auth**: NextAuth.js / Supabase Auth
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form
- **Utilities**: Framer Motion (animations)

### 1.3 Existing Mock Data Implementation

#### Properties Page
- **File**: `app/properties/page.tsx`
- **Mock Data**: 6 hardcoded property objects
- **Current Data Shape**:
  ```typescript
  {
    id: string
    title: string
    price: number
    location: string
    bedrooms: number
    bathrooms: number
    area: number
    status: 'Available' | 'Reserved' | 'Sold'
    images: string[]
    type: string
  }
  ```

#### Leads Management
- **Component**: `components/lead/leads-table.tsx`
- **Mock Data**: 4 hardcoded lead objects
- **Status**: Dashboard shows hardcoded stats

#### Dashboard
- **File**: `app/dashboard/page.tsx` (not shown but referenced)
- **Mock Data**: Hardcoded statistics/numbers

### 1.4 Existing Supabase Integration

**Current Setup**:
- Supabase auth helpers configured
- Client/server Supabase clients ready
- Auth middleware implemented
- RLS policies defined in `supabase-schema.sql`
- Database schema complete with tables:
  - `profiles`
  - `companies`
  - `properties`
  - `leads`
  - `showings`
  - `lead_activities`
  - `property_lead_assignments`
  - `team_invitations`

**Gaps**:
- No API routes to fetch properties/leads
- No React Query hooks for data fetching
- No real-time subscription implementations
- No search/filter API endpoints
- No analytics endpoints

---

## SECTION 2: TARGET STATE ARCHITECTURE

### 2.1 Data Flow Architecture

```
┌─────────────────────┐
│  UI Components      │
├─────────────────────┤
│ • PropertiesPage    │
│ • LeadsTable        │
│ • Dashboard         │
│ • SearchBar         │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│   React Query       │ (Cache & State)
│   Custom Hooks      │
├─────────────────────┤
│ • useProperties()   │
│ • useLeads()        │
│ • useDashboard()    │
│ • useSearch()       │
│ • useRealtime()     │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│   API Routes        │ (Next.js)
├─────────────────────┤
│ /api/properties     │
│ /api/leads          │
│ /api/dashboard/*    │
│ /api/search         │
│ /api/showings       │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Supabase Client    │
├─────────────────────┤
│ Auth & Queries      │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  PostgreSQL DB      │ (RLS Protected)
├─────────────────────┤
│ • properties        │
│ • leads             │
│ • showings          │
│ • lead_activities   │
└─────────────────────┘
```

### 2.2 File Structure After Implementation

```
lib/
├── supabase/                 # (existing)
├── utils/                    # (existing)
├── types/
│   ├── database.ts           # NEW - Database types
│   ├── api-responses.ts      # NEW - API response types
│   ├── filters.ts            # NEW - Filter types
│   └── entities.ts           # NEW - Domain model types
│
├── hooks/                    # NEW - All data fetching hooks
│   ├── useProperties.ts
│   ├── useLeads.ts
│   ├── useDashboard.ts
│   ├── useShowings.ts
│   ├── useSearch.ts
│   ├── useAnalytics.ts
│   ├── useTeam.ts
│   ├── usePropertyLeadAssignments.ts
│   ├── useRealtimeSubscription.ts
│   ├── useDebounce.ts
│   └── index.ts              # Export all hooks
│
└── actions/                  # NEW - Server actions (optional)
    ├── properties.ts
    ├── leads.ts
    └── dashboard.ts

app/
├── api/                      # NEW - API endpoints
│   ├── properties/
│   │   ├── route.ts          # GET /api/properties
│   │   ├── search/route.ts   # GET /api/properties/search
│   │   └── [id]/
│   │       ├── route.ts      # GET /api/properties/[id]
│   │       └── interested-leads/route.ts
│   │
│   ├── leads/
│   │   ├── route.ts          # GET POST /api/leads
│   │   ├── search/route.ts   # GET /api/leads/search
│   │   ├── stats/route.ts    # GET /api/leads/stats
│   │   └── [leadId]/
│   │       ├── activities/route.ts
│   │       └── interested-properties/route.ts
│   │
│   ├── dashboard/
│   │   ├── stats/route.ts    # GET /api/dashboard/stats
│   │   ├── leads-trend/route.ts
│   │   └── properties-by-type/route.ts
│   │
│   ├── showings/
│   │   ├── route.ts          # GET POST PUT /api/showings
│   │   └── calendar/route.ts
│   │
│   ├── analytics/
│   │   ├── conversion-funnel/route.ts
│   │   ├── agent-performance/route.ts
│   │   ├── revenue/route.ts
│   │   └── export/route.ts
│   │
│   ├── team/
│   │   ├── members/route.ts
│   │   ├── invite/route.ts
│   │   └── invitations/route.ts
│   │
│   └── property-lead-assignments/
│       └── route.ts

components/
├── property/
│   ├── property-card.tsx     # (existing, may need updates)
│   └── property-list.tsx     # NEW
│
├── lead/
│   ├── leads-table.tsx       # (update to use useLeads)
│   ├── lead-detail-view.tsx  # NEW
│   ├── activity-timeline.tsx # NEW
│   └── add-activity-form.tsx # NEW
│
├── dashboard/
│   ├── chart-section.tsx     # (update)
│   ├── stats-card.tsx        # (existing)
│   ├── recent-leads-table.tsx # (update)
│   └── recent-properties.tsx # NEW
│
├── showing/
│   ├── showing-calendar.tsx  # NEW
│   ├── showing-list.tsx      # NEW
│   └── showing-form.tsx      # NEW
│
├── search/
│   ├── search-bar.tsx        # NEW
│   └── search-results.tsx    # NEW
│
├── team/
│   ├── team-members-list.tsx # NEW
│   ├── invite-modal.tsx      # NEW
│   └── invitation-form.tsx   # NEW
│
├── analytics/
│   ├── conversion-funnel-chart.tsx # NEW
│   ├── agent-performance-table.tsx # NEW
│   └── revenue-chart.tsx     # NEW
│
└── ui/                       # (existing Shadcn components)

app/
├── analytics/
│   └── page.tsx              # NEW
├── properties/
│   ├── page.tsx              # (UPDATED - remove mock data)
│   ├── [id]/
│   │   └── page.tsx          # NEW - property detail
│   └── new/
│       └── page.tsx          # NEW - create property
│
├── leads/
│   ├── page.tsx              # (UPDATED - use dynamic data)
│   ├── [id]/
│   │   └── page.tsx          # NEW - lead detail
│   └── new/
│       └── page.tsx          # NEW - create lead
│
├── showings/
│   ├── page.tsx              # (UPDATED - calendar view)
│   ├── [id]/
│   │   └── page.tsx          # NEW - showing detail
│   └── new/
│       └── page.tsx          # NEW - create showing
│
└── team/
    ├── page.tsx              # NEW
    └── settings.tsx          # NEW
```

### 2.3 State Management Strategy

**Using**: TanStack React Query (already installed)

**Query Key Structure**:
```typescript
// Properties
['properties']
['properties', { filters: {...} }]
['properties', { search: 'term' }]
['properties', propertyId]
['properties', propertyId, 'leads']

// Leads
['leads']
['leads', { filters: {...} }]
['leads', 'stats']
['leads', leadId]
['leads', leadId, 'activities']
['leads', leadId, 'properties']

// Dashboard
['dashboard', 'stats']
['dashboard', 'leads-trend']
['dashboard', 'properties-by-type']

// Real-time
['realtime', 'properties']
['realtime', 'leads']
['realtime', 'showings']
```

---

## SECTION 3: DETAILED INTEGRATION PLAN

### Phase 1: Foundation (Week 1-2)

#### Phase 1.1: Type Definitions
**Files to Create**:
- `lib/types/database.ts` - Database row types (auto-generated from Supabase)
- `lib/types/api-responses.ts` - API endpoint response types
- `lib/types/filters.ts` - Filter parameter types
- `lib/types/entities.ts` - Domain model types

**Priority**: 🔴 CRITICAL - All other code depends on these

#### Phase 1.2: Utility Helpers
**Files to Create**:
- `lib/utils/api-client.ts` - Fetch wrapper with error handling
- `lib/utils/query-builders.ts` - URL parameter builders
- `lib/utils/transformers.ts` - Data transformation functions
- `lib/utils/validators.ts` - Input validation

**Priority**: 🟠 HIGH - Used by all API calls

#### Phase 1.3: Base Hooks
**Files to Create**:
- `lib/hooks/useDebounce.ts` - Debounce utility
- `lib/hooks/useRealtimeSubscription.ts` - Realtime subscriptions
- `lib/hooks/useErrorHandler.ts` - Common error handling

**Priority**: 🟠 HIGH - Dependency for feature hooks

#### Phase 1.4: Database Migration
**Run in Supabase SQL Editor**:
- Create missing database functions
- Create materialized views
- Add full-text search indexes
- Add any missing RLS policies

**File**: `supabase-schema.sql` (additions)

**Priority**: 🔴 CRITICAL - Required before API endpoints work

---

### Phase 2: Core Features (Week 2-3)

#### Phase 2.1: Properties Management ⭐

**Files to Create**:
1. `lib/hooks/useProperties.ts`
   - `useProperties(filters)` - List with pagination
   - `useProperty(id)` - Single property detail
   - `useCreateProperty()` - Mutation for create
   - `useUpdateProperty()` - Mutation for update
   - `useDeleteProperty()` - Mutation for delete

2. `app/api/properties/route.ts`
   - GET: Fetch properties with filters, pagination
   - POST: Create new property

3. `app/api/properties/[id]/route.ts`
   - GET: Fetch single property
   - PUT: Update property
   - DELETE: Delete property

4. `app/api/properties/search/route.ts`
   - GET: Full-text search with filters

**Files to Update**:
- `app/properties/page.tsx` - Replace mock data with hook
- `components/property/property-card.tsx` - Ensure schema alignment

**Database Changes**:
```sql
-- Add full-text search index
ALTER TABLE public.properties
ADD COLUMN search_vector tsvector;

CREATE INDEX idx_properties_search ON public.properties
USING GIN(search_vector);

-- Create trigger for search vector
CREATE TRIGGER update_properties_search_trigger
BEFORE INSERT OR UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION update_properties_search();
```

**Testing Checklist**:
- [ ] List returns paginated properties
- [ ] Filters work (status, type, city, price)
- [ ] Single property loads correctly
- [ ] Create/update/delete work with proper validation
- [ ] Search returns fuzzy matches
- [ ] RLS policies restrict to company
- [ ] Performance < 100ms for list

**Priority**: 🔴 CRITICAL - Foundation for other features

---

#### Phase 2.2: Leads Management ⭐

**Files to Create**:
1. `lib/hooks/useLeads.ts`
   - `useLeads(filters)` - List with pagination
   - `useLead(id)` - Single lead detail
   - `useLeadsStats()` - Aggregated statistics
   - `useCreateLead()` - Mutation
   - `useUpdateLead()` - Mutation

2. `app/api/leads/route.ts`
   - GET: Fetch leads with filters
   - POST: Create lead

3. `app/api/leads/[id]/route.ts`
   - GET: Single lead detail
   - PUT: Update lead
   - DELETE: Delete lead

4. `app/api/leads/stats/route.ts`
   - GET: Lead statistics by status

5. `app/api/leads/search/route.ts`
   - GET: Search by name/email

**Files to Update**:
- `components/lead/leads-table.tsx` - Use dynamic data
- `app/leads/page.tsx` - Use stats hook

**Database Changes**:
```sql
-- Add full-text search index
ALTER TABLE public.leads
ADD COLUMN search_vector tsvector;

CREATE INDEX idx_leads_search ON public.leads
USING GIN(search_vector);

-- Create database function for stats
CREATE OR REPLACE FUNCTION get_leads_stats(p_company_id UUID)
RETURNS TABLE (
  total_leads BIGINT,
  new_count BIGINT,
  contacted_count BIGINT,
  qualified_count BIGINT,
  proposal_sent_count BIGINT,
  negotiating_count BIGINT,
  closed_won_count BIGINT,
  closed_lost_count BIGINT,
  avg_budget NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'new'),
    COUNT(*) FILTER (WHERE status = 'contacted'),
    COUNT(*) FILTER (WHERE status = 'qualified'),
    COUNT(*) FILTER (WHERE status = 'proposal_sent'),
    COUNT(*) FILTER (WHERE status = 'negotiating'),
    COUNT(*) FILTER (WHERE status = 'closed_won'),
    COUNT(*) FILTER (WHERE status = 'closed_lost'),
    AVG(CASE WHEN budget_max IS NOT NULL THEN (budget_min + budget_max) / 2 END)
  FROM public.leads
  WHERE company_id = p_company_id;
END;
$$ LANGUAGE plpgsql;
```

**Testing Checklist**:
- [ ] Leads list loads correctly
- [ ] Pagination works
- [ ] Status filter works
- [ ] Search functionality works
- [ ] Stats endpoint returns correct counts
- [ ] Can create/update/delete leads
- [ ] RLS restricts to company
- [ ] Performance < 100ms

**Priority**: 🔴 CRITICAL - Core CRM feature

---

#### Phase 2.3: Dashboard Aggregations ⭐

**Files to Create**:
1. `lib/hooks/useDashboard.ts`
   - `useDashboardStats()` - Main dashboard stats
   - `useDashboardTrend()` - Lead trends chart
   - `usePropertiesByType()` - Property breakdown

2. `app/api/dashboard/stats/route.ts`
   - GET: All dashboard statistics

3. `app/api/dashboard/leads-trend/route.ts`
   - GET: Weekly lead trend data

4. `app/api/dashboard/properties-by-type/route.ts`
   - GET: Property count by type

**Files to Update**:
- `app/dashboard/page.tsx` - Replace hardcoded stats
- `components/dashboard/chart-section.tsx` - Use dynamic data
- `components/dashboard/recent-leads-table.tsx` - Use hook

**Database Changes**:
```sql
-- Materialized view for performance
CREATE MATERIALIZED VIEW public.company_dashboard_stats AS
SELECT
  c.id as company_id,
  COUNT(DISTINCT p.id) as total_properties,
  COUNT(DISTINCT CASE WHEN p.status = 'available' THEN p.id END) as properties_available,
  COUNT(DISTINCT CASE WHEN p.status = 'sold' THEN p.id END) as properties_sold,
  COUNT(DISTINCT l.id) as total_leads,
  COUNT(DISTINCT CASE WHEN l.status = 'new' THEN l.id END) as leads_new,
  COUNT(DISTINCT CASE WHEN l.status = 'closed_won' THEN l.id END) as leads_closed_won,
  AVG(p.price) as avg_property_price,
  (SELECT COUNT(*) FROM showings WHERE company_id = c.id 
    AND scheduled_at >= NOW() - INTERVAL '30 days'
  ) as showings_this_month
FROM public.companies c
LEFT JOIN public.properties p ON c.id = p.company_id
LEFT JOIN public.leads l ON c.id = l.company_id
GROUP BY c.id
WITH DATA;

CREATE UNIQUE INDEX idx_dashboard_stats_company_id 
  ON company_dashboard_stats(company_id);
```

**Testing Checklist**:
- [ ] Stats load within 500ms
- [ ] Chart data renders correctly
- [ ] All cards show correct values
- [ ] Real-time updates work (30s refresh)
- [ ] No N+1 queries
- [ ] Mobile responsive

**Priority**: 🔴 CRITICAL - User-facing homepage

---

### Phase 3: Advanced Features (Week 3-4)

#### Phase 3.1: Lead Activities & CRM Timeline

**Files to Create**:
1. `lib/hooks/useLeadActivities.ts`
   - `useLeadActivities(leadId)` - Get activities for lead
   - `useCreateActivity()` - Create new activity
   - `useUpdateActivity()` - Update activity

2. `app/api/leads/[leadId]/activities/route.ts`
   - GET: List activities for lead
   - POST: Create activity

3. `components/lead/activity-timeline.tsx` - Display timeline

**Database Changes**:
```sql
-- Create database function for activities
CREATE OR REPLACE FUNCTION get_lead_activities(
  p_lead_id UUID,
  p_limit INT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  activity_type VARCHAR,
  title VARCHAR,
  description TEXT,
  scheduled_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration_minutes INT,
  created_by UUID,
  created_at TIMESTAMP,
  created_by_name VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    la.id, la.activity_type, la.title, la.description,
    la.scheduled_at, la.completed_at, la.duration_minutes,
    la.created_by, la.created_at,
    p.full_name
  FROM public.lead_activities la
  LEFT JOIN public.profiles p ON la.created_by = p.id
  WHERE la.lead_id = p_lead_id
  ORDER BY la.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
```

**Priority**: 🟠 HIGH - Improves CRM experience

---

#### Phase 3.2: Showings & Scheduling

**Files to Create**:
1. `lib/hooks/useShowings.ts`
   - `useShowingsForDateRange(start, end)` - Calendar view
   - `useCreateShowing()` - Schedule showing

2. `app/api/showings/route.ts`
   - GET: Showings for date range
   - POST: Create showing
   - PUT: Update showing

3. `components/showing/showing-calendar.tsx` - Calendar UI

**Database Changes**:
```sql
-- Create database function
CREATE OR REPLACE FUNCTION get_company_showings_for_date_range(
  p_company_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  id UUID,
  property_id UUID,
  lead_id UUID,
  property_title VARCHAR,
  lead_name VARCHAR,
  scheduled_at TIMESTAMP,
  status VARCHAR,
  notes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id, s.property_id, s.lead_id,
    p.title, (l.first_name || ' ' || l.last_name),
    s.scheduled_at, s.status, s.notes
  FROM public.showings s
  JOIN public.properties p ON s.property_id = p.id
  JOIN public.leads l ON s.lead_id = l.id
  WHERE s.company_id = p_company_id
    AND DATE(s.scheduled_at) BETWEEN p_start_date AND p_end_date
  ORDER BY s.scheduled_at;
END;
$$ LANGUAGE plpgsql;
```

**Priority**: 🟠 HIGH - Essential for showings workflow

---

#### Phase 3.3: Real-time Updates

**Files to Create**:
1. `lib/hooks/useRealtimeSubscription.ts` - Already listed in Phase 1.3

**Implementation Pattern**:
```typescript
// Usage in any component
const { data } = useProperties(filters)
useRealtimeSubscription('properties', companyId, ['properties', filters])
```

**Priority**: 🟢 MEDIUM - Enhances UX but not critical

---

### Phase 4: Search & Analytics (Week 4-5)

#### Phase 4.1: Search & Filtering

**Files to Create**:
1. `lib/hooks/useSearch.ts`
   - `usePropertySearch(query, filters)` - Search properties
   - `useLeadSearch(query, filters)` - Search leads

2. `app/api/properties/search/route.ts` - Already in Phase 2.1
3. `app/api/leads/search/route.ts` - Already in Phase 2.2

**Priority**: 🟢 MEDIUM - UX improvement

---

#### Phase 4.2: Analytics & Reporting

**Files to Create**:
1. `lib/hooks/useAnalytics.ts`
   - `useConversionFunnel()` - Leads by status
   - `useAgentPerformance()` - Agent metrics
   - `useRevenueAnalytics()` - Revenue trends

2. `app/analytics/page.tsx` - Analytics dashboard

3. `app/api/analytics/*.ts` - Multiple endpoints

**Database Changes**:
```sql
-- Analytics views
CREATE VIEW public.lead_conversion_funnel AS
SELECT
  company_id,
  status,
  COUNT(*) as lead_count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY company_id), 2) as percentage
FROM public.leads
GROUP BY company_id, status;

CREATE VIEW public.agent_performance AS
SELECT
  p.id as agent_id,
  p.full_name,
  COUNT(DISTINCT l.id) as leads_assigned,
  COUNT(DISTINCT CASE WHEN l.status = 'closed_won' THEN l.id END) as deals_closed
FROM public.profiles p
LEFT JOIN public.leads l ON p.id = l.assigned_to
WHERE p.role = 'agent'
GROUP BY p.id, p.full_name;
```

**Priority**: 🟢 MEDIUM - Advanced reporting feature

---

### Phase 5: Team & Property-Lead Management (Week 5)

#### Phase 5.1: Team Management

**Files to Create**:
1. `lib/hooks/useTeam.ts`
2. `app/api/team/members/route.ts`
3. `app/api/team/invite/route.ts`

**Priority**: 🟢 MEDIUM - Team collaboration

---

#### Phase 5.2: Property-Lead Assignments

**Files to Create**:
1. `lib/hooks/usePropertyLeadAssignments.ts`
2. `app/api/property-lead-assignments/route.ts`

**Priority**: 🟢 MEDIUM - Core relationship tracking

---

## SECTION 4: DATABASE & SCHEMA CHANGES

### 4.1 New Database Functions Required

See Phase breakdown above for specific SQL. Key functions:
- `get_leads_stats()` - Phase 2.2
- `get_lead_activities()` - Phase 3.1
- `get_company_showings_for_date_range()` - Phase 3.2
- `get_dashboard_stats()` - Phase 2.3

### 4.2 New Indexes Required

```sql
-- Full-text search
CREATE INDEX idx_properties_search ON public.properties USING GIN(search_vector);
CREATE INDEX idx_leads_search ON public.leads USING GIN(search_vector);

-- Performance
CREATE INDEX idx_properties_company_status ON public.properties(company_id, status);
CREATE INDEX idx_leads_company_status ON public.leads(company_id, status);
CREATE INDEX idx_showings_scheduled_at ON public.showings(company_id, scheduled_at);
```

### 4.3 New Materialized Views

- `company_dashboard_stats` - Phase 2.3
- (Others in analytics - Phase 4.2)

### 4.4 Refresh Schedule

Materialized views need refresh jobs. Supabase doesn't have built-in scheduling, so use:
1. **Option A**: Edge Function (webhook-triggered)
2. **Option B**: External cron job (GitHub Actions)
3. **Option C**: Real-time queries instead (if performance acceptable)

**Recommendation**: Use real-time queries initially, move to materialized views later if needed.

---

## SECTION 5: API ENDPOINTS SUMMARY

### Complete List of New Endpoints

#### Properties
```
GET    /api/properties              (list with pagination, filters)
POST   /api/properties              (create)
GET    /api/properties/[id]         (single)
PUT    /api/properties/[id]         (update)
DELETE /api/properties/[id]         (delete)
GET    /api/properties/search       (search + filter)
GET    /api/properties/[id]/interested-leads
```

#### Leads
```
GET    /api/leads                   (list with pagination, filters)
POST   /api/leads                   (create)
GET    /api/leads/[id]              (single)
PUT    /api/leads/[id]              (update)
DELETE /api/leads/[id]              (delete)
GET    /api/leads/stats             (aggregated statistics)
GET    /api/leads/search            (search)
GET    /api/leads/[leadId]/activities
POST   /api/leads/[leadId]/activities
GET    /api/leads/[leadId]/interested-properties
```

#### Dashboard
```
GET    /api/dashboard/stats         (main dashboard metrics)
GET    /api/dashboard/leads-trend   (weekly trend)
GET    /api/dashboard/properties-by-type
```

#### Showings
```
GET    /api/showings                (date range query)
POST   /api/showings                (create)
PUT    /api/showings/[id]           (update)
DELETE /api/showings/[id]           (delete)
```

#### Team
```
GET    /api/team/members            (list team)
POST   /api/team/invite             (send invitation)
GET    /api/team/invitations        (list pending)
```

#### Analytics
```
GET    /api/analytics/conversion-funnel
GET    /api/analytics/agent-performance
GET    /api/analytics/revenue
GET    /api/analytics/export        (CSV/PDF)
```

#### Property-Lead Assignments
```
POST   /api/property-lead-assignments
DELETE /api/property-lead-assignments/[id]
GET    /api/properties/[propId]/interested-leads
GET    /api/leads/[leadId]/interested-properties
```

---

## SECTION 6: TESTING & VALIDATION STRATEGY

### 6.1 Testing Pyramid

```
                    E2E Tests
                   /        \
                  /          \
               Integration Tests
              /                 \
             /                   \
          Unit Tests
```

### 6.2 Unit Test Checklist (Per Endpoint)

For each API endpoint:
- [ ] Auth middleware validates user
- [ ] RLS policies restrict data
- [ ] Input validation rejects invalid data
- [ ] Error responses have correct status codes
- [ ] Success responses match schema
- [ ] Pagination works correctly
- [ ] Filters work as expected

### 6.3 Integration Test Checklist

- [ ] Create property → appears in list
- [ ] Update lead → stats update correctly
- [ ] Delete showing → calendar refreshes
- [ ] Search filters return correct subset
- [ ] Real-time updates trigger correctly
- [ ] Multiple users see only their company data

### 6.4 E2E Test Scenarios

**User Journey 1: Agent Views & Filters Properties**
```
1. Login as agent
2. Navigate to Properties page
3. See list of properties (no mock data)
4. Filter by status "Available"
5. Verify count decreased
6. Search for city name
7. Verify results filtered
8. Click property → detail page loads
```

**User Journey 2: Add & Manage Lead**
```
1. Login as agent
2. Navigate to Leads page
3. Click "New Lead"
4. Fill form → submit
5. See lead in table
6. Click lead → detail page
7. Add activity (call/note)
8. See activity in timeline
9. Update lead status
10. Verify stats updated
```

**User Journey 3: Schedule Showing**
```
1. Login as agent
2. Navigate to Showings page
3. Click calendar date
4. Create showing
5. See on calendar
6. Click showing → detail
7. Update status → "Completed"
8. Verify appears in analytics
```

### 6.5 Performance Testing

**Targets**:
- API response time: < 100ms (for list endpoints)
- Dashboard load: < 500ms
- Search: < 200ms
- Real-time update: < 1s

**Tools**:
- React Profiler (browser DevTools)
- Network tab (request timing)
- Vercel Analytics (production)

---

## SECTION 7: ERROR HANDLING & VALIDATION

### 7.1 Common Error Scenarios

| Scenario | HTTP Status | Response | Handling |
|----------|------------|----------|----------|
| Not authenticated | 401 | `{ error: 'Unauthorized' }` | Redirect to login |
| Insufficient permission | 403 | `{ error: 'Forbidden' }` | Show error toast |
| Resource not found | 404 | `{ error: 'Not found' }` | Navigate away |
| Validation failed | 400 | `{ error: '...', fields: {...} }` | Highlight form fields |
| Database error | 500 | `{ error: 'Internal error' }` | Log & retry |
| Rate limited | 429 | `{ error: 'Too many requests' }` | Exponential backoff |

### 7.2 Input Validation Examples

**Property Creation**:
```typescript
{
  title: required, min 5, max 255 chars
  price: required, > 0, <= 999999999
  address: required, min 5 chars
  city: required
  bedrooms: optional, >= 0, integer
  bathrooms: optional, >= 0, decimal
  property_type: required, valid enum
  status: required, valid enum
  images: optional, array of valid URLs
}
```

### 7.3 Retry Strategy

```typescript
// Automatic retries for failed requests
- First failure: immediate retry
- Second failure: wait 1s, retry
- Third failure: wait 5s, retry
- Fourth+ failure: fail and show error

// Don't retry: 400, 401, 403, 404, 422
// Do retry: 429, 500, 502, 503, network errors
```

---

## SECTION 8: IMPLEMENTATION TIMELINE

### Week 1-2: Phase 1 + Phase 2 (Core)
**Deliverables**:
- Properties list, create, update, delete working
- Leads list, stats working
- Dashboard with real data
- Basic search working

**Team**: 1-2 developers

**Effort**: 80 hours

---

### Week 3-4: Phase 3 (Advanced)
**Deliverables**:
- Lead activities/timeline
- Showings calendar
- Real-time updates working

**Team**: 1 developer

**Effort**: 40 hours

---

### Week 5: Phase 4 (Analytics & Refinement)
**Deliverables**:
- Analytics dashboard
- Team management
- Property-lead assignments
- Full-text search optimized

**Team**: 1 developer

**Effort**: 30 hours

---

**Total**: ~150 hours (~4 weeks, 1-2 developers)

---

## SECTION 9: RISK ASSESSMENT & MITIGATION

### Risk 1: RLS Policy Mistakes
**Impact**: 🔴 CRITICAL (data leakage)  
**Probability**: 🟠 MEDIUM  
**Mitigation**:
- Review all RLS policies line-by-line
- Test with multiple company accounts
- Add audit logging
- Use security advisors tool

### Risk 2: N+1 Query Problems
**Impact**: 🟠 HIGH (slow page loads)  
**Probability**: 🟠 MEDIUM  
**Mitigation**:
- Use React Query aggregation
- Always use `select()` to specify columns
- Avoid nested queries
- Monitor query times

### Risk 3: Stale Data in React Query Cache
**Impact**: 🟢 MEDIUM (user confusion)  
**Probability**: 🟡 LOW  
**Mitigation**:
- Set appropriate `staleTime` values
- Use real-time subscriptions for live data
- Manual invalidation on mutations
- Clear cache on logout

### Risk 4: Search Performance
**Impact**: 🟡 MEDIUM (slow search)  
**Probability**: 🟢 LOW  
**Mitigation**:
- Add full-text search indexes early
- Implement pagination (limit 20 results)
- Use debouncing (300ms)
- Monitor query performance

### Risk 5: Real-time Broadcast Storm
**Impact**: 🟠 HIGH (high latency)  
**Probability**: 🟢 LOW  
**Mitigation**:
- Use company-scoped filters in subscriptions
- Batch updates on client
- Use exponential backoff
- Monitor Supabase realtime usage

### Risk 6: Breaking Existing Features
**Impact**: 🟠 HIGH (regression)  
**Probability**: 🟡 MEDIUM  
**Mitigation**:
- Comprehensive testing before deploy
- Gradual rollout (feature flags)
- Have rollback plan
- Monitor error logs

---

## SECTION 10: DEPLOYMENT STRATEGY

### 10.1 Deployment Phases

**Phase 1: Staging**
1. Deploy to staging environment
2. Run full test suite
3. Smoke testing by QA
4. Performance baseline

**Phase 2: Canary (5% of users)**
1. Deploy to production
2. Monitor error rates
3. Check performance metrics
4. Watch user feedback

**Phase 3: Gradual Rollout (25% → 50% → 100%)**
1. Increase traffic gradually
2. Monitor database load
3. Check API response times
4. Revert if issues found

**Phase 4: Full Production**
1. 100% of users
2. Document release notes
3. Monitor metrics for 1 week
4. Close runbook

### 10.2 Rollback Procedure

If critical issue found:
```
1. Revert API code to previous version
2. Clear React Query cache (hard refresh)
3. Verify old mock data shown
4. Communicate to users
5. Post-mortem analysis
```

### 10.3 Feature Flags

Implement toggles for:
- Use dynamic data vs mock data
- Real-time subscriptions on/off
- New search vs old search
- Analytics features

**Example**:
```typescript
const useProperties = () => {
  if (flags.useDynamicProperties) {
    return useDynamicProperties()
  }
  return useMockProperties()
}
```

---

## SECTION 11: DOCUMENTATION REQUIREMENTS

### 11.1 Developer Documentation

For each feature, create:

**1. API Documentation**
```markdown
# GET /api/properties

## Description
Fetch paginated list of properties.

## Parameters
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `status` (string, optional)
- `type` (string, optional)

## Response
```
{
  success: true,
  data: Property[],
  pagination: { page, limit, total, hasMore }
}
```

## Errors
- 400: Invalid parameters
- 401: Not authenticated
- 403: No access to company

## Example
```

**2. Hook Documentation**
```typescript
/**
 * Fetch paginated properties with filters and caching
 * 
 * @param filters - Property filters
 * @returns Query result with data and loading state
 * 
 * @example
 * const { data, isLoading } = useProperties({ status: 'available' })
 */
```

**3. Database Changes**
- Migration script
- Rollback procedure
- Performance impact

### 11.2 User Documentation

- Feature overview video
- Quick start guide
- FAQ

---

## SECTION 12: SUCCESS CRITERIA

### Launch Readiness Checklist

- [ ] All 3 Phase 1 features complete and tested
- [ ] No mock data in production
- [ ] API response times < 100ms
- [ ] RLS policies verified secure
- [ ] Real-time updates working
- [ ] Error handling implemented
- [ ] Monitoring/alerting in place
- [ ] Documentation complete
- [ ] Team trained on new code
- [ ] Rollback procedure tested
- [ ] Security review passed
- [ ] Performance approved
- [ ] User acceptance testing done
- [ ] Release notes prepared

---

## SECTION 13: POST-LAUNCH MONITORING

### Metrics to Track

1. **Performance**
   - API response time (p50, p95, p99)
   - Database query time
   - React Query hit rate
   - Error rate

2. **Usage**
   - Active users
   - Feature adoption rate
   - Search query volume
   - Real-time update frequency

3. **Errors**
   - 5xx errors
   - 4xx client errors
   - Timeout errors
   - RLS policy violations

### Alert Thresholds

- API response time > 500ms: ⚠️ warn, > 2s: 🚨 alert
- Error rate > 1%: ⚠️ warn, > 5%: 🚨 alert
- Database queries > 10s: 🚨 alert

---

## SECTION 14: QUICK START

### To Begin Implementation:

1. **Start here**: Read this entire document
2. **Review**: `implementation-prompts.md` sections 1-3
3. **Create types**: `lib/types/database.ts`, `lib/types/api-responses.ts`
4. **Setup database**: Run migration scripts in Supabase SQL editor
5. **Build Phase 1**: Properties, Leads, Dashboard in order
6. **Test thoroughly**: Follow test checklist before Phase 2
7. **Deploy to staging**: Verify everything works
8. **Gradual rollout**: Monitor metrics closely

### Key Files to Review First

1. `supabase-schema.sql` - Database structure
2. `lib/supabase/*.ts` - Existing Supabase setup
3. `app/properties/page.tsx` - Example of current mock data
4. `components/property/property-card.tsx` - Component structure

---

## Summary

This integration plan provides a **complete roadmap** to transform EstateFlow from a mock-data prototype to a fully functional Supabase-backed application. The phased approach allows for incremental delivery and testing, reducing risk while maintaining momentum.

**Key Success Factors**:
- ✅ Start with proper typing
- ✅ Implement database functions early
- ✅ Test RLS policies thoroughly
- ✅ Monitor performance from day one
- ✅ Gradual rollout to catch issues early
- ✅ Maintain rollback capability

---

**Document Version**: 1.0  
**Last Updated**: January 24, 2026  
**Status**: Ready to Implement  
