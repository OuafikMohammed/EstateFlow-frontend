# EstateFlow Implementation Prompts

**Based on**: technical.md - Technical Architecture Document  
**Purpose**: Step-by-step implementation guide for replacing mock data with Supabase  
**Status**: Production-Ready Implementation Plan  
**Last Updated**: January 24, 2026

---

## 1. PROPERTIES MANAGEMENT - Replace Mock Data

### Overview
Replace hardcoded 6 properties array in `app/properties/page.tsx` with dynamic Supabase queries.

### Supabase Tables & RLS Policies

**Tables Required:**
- `public.properties` (already exists)
- `public.companies` (for company context)

**RLS Policies Required:**
```sql
-- Already implemented in supabase-schema.sql:
-- "Users can view company properties"
-- "Agents and COMPANY_ADMIN can create properties"
-- "Company users can update properties"
-- "Users can delete their own properties"
```

**Key Fields to Retrieve:**
```
id, title, price, address, city, bedrooms, bathrooms, 
square_feet, property_type, status, images, 
created_at, created_by, company_id
```

### API Endpoints/Functions Needed

**GET /api/properties**
```typescript
// Request Parameters:
- companyId (from auth context)
- page (default: 1)
- limit (default: 20)
- propertyType (optional: house, condo, etc.)
- status (optional: available, sold, etc.)
- sortBy (default: 'created_at', options: 'price', 'date')
- sortOrder (default: 'desc')

// Response:
{
  success: true,
  data: Property[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    hasMore: boolean
  }
}
```

**POST /api/properties**
```typescript
// Request body:
{
  title: string (required)
  description: string (optional)
  property_type: enum (required)
  status: enum (default: 'available')
  price: number (required)
  address: string (required)
  city: string (required)
  bedrooms: number
  bathrooms: number
  square_feet: number
  images: string[] (URLs)
}

// Response:
{
  success: true,
  data: { id: UUID, created_at: timestamp }
}
```

**Database Function:**
```sql
-- Fetch properties with pagination
CREATE OR REPLACE FUNCTION get_company_properties(
  p_company_id UUID,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  price DECIMAL,
  city VARCHAR,
  bedrooms INT,
  bathrooms DECIMAL,
  square_feet INT,
  property_type property_type,
  status property_status,
  images TEXT[],
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, p.title, p.price, p.city, p.bedrooms,
    p.bathrooms, p.square_feet, p.property_type,
    p.status, p.images, p.created_at
  FROM public.properties p
  WHERE p.company_id = p_company_id
  ORDER BY p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
```

### Migration Steps from Mock Data

**Step 1: Create Supabase Query Hook**
```typescript
// File: lib/hooks/useProperties.ts
import { useQuery } from '@tanstack/react-query'

export function useProperties(filters = {}) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => fetch('/api/properties', {
      params: filters
    }).then(r => r.json())
  })
}
```

**Step 2: Create API Route**
```typescript
// File: app/api/properties/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient()
  
  // Get user company context
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()
  
  // Build query
  let query = supabase
    .from('properties')
    .select('*', { count: 'exact' })
    .eq('company_id', profile.company_id)
  
  // Apply filters
  const { searchParams } = new URL(request.url)
  if (searchParams.get('status')) {
    query = query.eq('status', searchParams.get('status'))
  }
  
  const { data, count } = await query
    .order('created_at', { ascending: false })
    .range(0, 19)
  
  return NextResponse.json({
    success: true,
    data,
    pagination: { total: count }
  })
}
```

**Step 3: Update Component**
```typescript
// File: app/properties/page.tsx (BEFORE)
const properties = [
  { id: "1", title: "Modern 3BR Apartment in Anfa", ... },
  // ... 5 more mock objects
]

// File: app/properties/page.tsx (AFTER)
import { useProperties } from '@/lib/hooks/useProperties'

export default function PropertiesPage() {
  const [filters, setFilters] = useState({})
  const { data: response, isLoading } = useProperties(filters)
  const properties = response?.data || []
  
  return (
    <DashboardLayout>
      {isLoading ? <Skeleton /> : (
        <div className="space-y-6">
          {/* Filters UI */}
          {properties.map(prop => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
```

**Step 4: Test & Verify**
- [ ] Query returns 6 properties from database
- [ ] Pagination works correctly
- [ ] Filters apply without errors
- [ ] Images load properly
- [ ] RLS policies allow access

### Files to Update
- `app/properties/page.tsx` (replace mock)
- `components/property/property-card.tsx` (ensure fields match)
- `lib/hooks/useProperties.ts` (create)
- `app/api/properties/route.ts` (create)

---

## 2. LEADS MANAGEMENT - Replace Mock Data

### Overview
Replace hardcoded 4 leads in `components/lead/leads-table.tsx` with dynamic Supabase queries.

### Supabase Tables & RLS Policies

**Tables Required:**
- `public.leads` (already exists)
- `public.profiles` (for assigned_to agent)

**RLS Policies Required:**
```sql
-- Already implemented:
-- "Users can view company leads based on role"
-- "Agents and COMPANY_ADMIN can create leads"
-- "Company users can update leads"
```

**Key Fields:**
```
id, first_name, last_name, email, phone, status,
budget_min, budget_max, assigned_to, 
created_by, created_at, last_contacted_at
```

### API Endpoints/Functions Needed

**GET /api/leads**
```typescript
// Request Parameters:
- companyId (from auth)
- page (default: 1)
- limit (default: 20)
- status (optional: new, contacted, qualified, etc.)
- assigned_to (optional: filter by agent)
- sortBy (default: 'created_at', options: 'status', 'budget_max')
- search (optional: name or email)

// Response:
{
  success: true,
  data: Lead[],
  pagination: { page, limit, total, hasMore }
}
```

**POST /api/leads**
```typescript
// Request:
{
  first_name: string (required)
  last_name: string (required)
  email: string (required)
  phone: string (required)
  status: enum (default: 'new')
  budget_min: number (optional)
  budget_max: number (optional)
  interested_types: enum[] (optional)
  preferred_cities: string[] (optional)
  assigned_to: UUID (optional)
}

// Response:
{
  success: true,
  data: { id: UUID, created_at: timestamp }
}
```

**GET /api/leads/stats**
```typescript
// Get aggregated stats for dashboard
// Response:
{
  success: true,
  data: {
    total_leads: number,
    new: number,
    contacted: number,
    qualified: number,
    proposal_sent: number,
    negotiating: number,
    closed_won: number,
    closed_lost: number,
    avg_budget: number
  }
}
```

**Database Function:**
```sql
-- Get leads with filters
CREATE OR REPLACE FUNCTION get_company_leads(
  p_company_id UUID,
  p_status lead_status DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  first_name VARCHAR,
  last_name VARCHAR,
  email VARCHAR,
  phone VARCHAR,
  status lead_status,
  budget_min DECIMAL,
  budget_max DECIMAL,
  assigned_to UUID,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id, l.first_name, l.last_name, l.email, l.phone,
    l.status, l.budget_min, l.budget_max, l.assigned_to, l.created_at
  FROM public.leads l
  WHERE l.company_id = p_company_id
    AND (p_status IS NULL OR l.status = p_status)
  ORDER BY l.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Get lead statistics
CREATE OR REPLACE FUNCTION get_leads_stats(p_company_id UUID)
RETURNS TABLE (
  total_leads BIGINT,
  new_count BIGINT,
  contacted_count BIGINT,
  qualified_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'new'),
    COUNT(*) FILTER (WHERE status = 'contacted'),
    COUNT(*) FILTER (WHERE status = 'qualified')
  FROM public.leads
  WHERE company_id = p_company_id;
END;
$$ LANGUAGE plpgsql;
```

### Migration Steps from Mock Data

**Step 1: Create Leads Hook**
```typescript
// File: lib/hooks/useLeads.ts
import { useQuery } from '@tanstack/react-query'

export function useLeads(filters = {}) {
  return useQuery({
    queryKey: ['leads', filters],
    queryFn: () => fetch('/api/leads', {
      params: filters
    }).then(r => r.json()),
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

export function useLeadsStats() {
  return useQuery({
    queryKey: ['leads', 'stats'],
    queryFn: () => fetch('/api/leads/stats').then(r => r.json()),
    refetchInterval: 30 * 1000 // Refresh every 30s
  })
}
```

**Step 2: Create API Routes**
```typescript
// File: app/api/leads/route.ts
export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient()
  const user = await getAuthenticatedUser(supabase)
  const profile = await getUserProfile(supabase, user.id)
  
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20
  const offset = (page - 1) * limit
  
  let query = supabase
    .from('leads')
    .select('*', { count: 'exact' })
    .eq('company_id', profile.company_id)
  
  if (status) query = query.eq('status', status)
  
  const { data, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  return NextResponse.json({
    success: true,
    data,
    pagination: { page, limit, total: count }
  })
}

// File: app/api/leads/stats/route.ts
export async function GET() {
  const supabase = createRouteHandlerClient()
  const profile = await getCurrentUserProfile(supabase)
  
  const { data: stats } = await supabase.rpc('get_leads_stats', {
    p_company_id: profile.company_id
  })
  
  return NextResponse.json({
    success: true,
    data: stats[0]
  })
}
```

**Step 3: Update LeadsTable Component**
```typescript
// File: components/lead/leads-table.tsx (BEFORE)
const leadsData = [
  { id: 1, name: "Sarah Mohammed", ... },
  // ... 3 more mock leads
]

// File: components/lead/leads-table.tsx (AFTER)
import { useLeads } from '@/lib/hooks/useLeads'

export function LeadsTable() {
  const [filters, setFilters] = useState({})
  const { data: response, isLoading } = useLeads(filters)
  const leads = response?.data || []
  
  return (
    <div className="space-y-4">
      {/* Filters: status, search */}
      {isLoading ? (
        <LeadsSkeleton />
      ) : (
        <table>
          <tbody>
            {leads.map(lead => (
              <tr key={lead.id}>
                <td>{lead.first_name} {lead.last_name}</td>
                <td>{lead.email}</td>
                <td>{lead.status}</td>
                {/* ... more fields */}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
```

**Step 4: Update LeadsPage**
```typescript
// File: app/leads/page.tsx
import { useLeadsStats } from '@/lib/hooks/useLeads'

export default function LeadsPage() {
  const { data: statsResponse } = useLeadsStats()
  const stats = statsResponse?.data || {}
  
  // Replace hardcoded stats
  const statsCards = [
    { title: "Total Leads", value: stats.total_leads },
    { title: "New", value: stats.new_count },
    { title: "In Progress", value: stats.contacted_count },
    { title: "Qualified", value: stats.qualified_count },
  ]
  
  return (
    <DashboardLayout>
      {/* Display dynamic stats */}
      {statsCards.map(stat => (
        <StatsCard key={stat.title} {...stat} />
      ))}
      <LeadsTable />
    </DashboardLayout>
  )
}
```

**Step 5: Test & Verify**
- [ ] Query returns leads from database
- [ ] Status filtering works
- [ ] Stats cards update correctly
- [ ] Search functionality operational
- [ ] RLS policies applied correctly

### Files to Update
- `components/lead/leads-table.tsx` (replace mock)
- `app/leads/page.tsx` (use dynamic stats)
- `lib/hooks/useLeads.ts` (create)
- `app/api/leads/route.ts` (create)
- `app/api/leads/stats/route.ts` (create)

---

## 3. DASHBOARD AGGREGATIONS - Stats & Metrics

### Overview
Replace hardcoded dashboard numbers with real aggregated data using SQL queries and materialized views.

### Supabase Tables & RLS Policies

**Tables Required:**
- `public.companies`
- `public.properties`
- `public.leads`
- `public.showings`

**RLS Policies Required:**
- Dashboard stats are user-company-scoped via `company_id`

**Materialized Views to Create:**
```sql
-- High-performance dashboard stats (refreshed hourly)
CREATE MATERIALIZED VIEW public.company_dashboard_stats AS
SELECT
  c.id as company_id,
  c.name as company_name,
  COUNT(DISTINCT p.id) as total_properties,
  COUNT(DISTINCT CASE WHEN p.status = 'sold' THEN p.id END) as properties_sold,
  COUNT(DISTINCT CASE WHEN p.status = 'available' THEN p.id END) as properties_available,
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
GROUP BY c.id, c.name
WITH DATA;

CREATE UNIQUE INDEX idx_dashboard_stats_company_id 
  ON company_dashboard_stats(company_id);

-- Refresh schedule (in separate job)
REFRESH MATERIALIZED VIEW CONCURRENTLY company_dashboard_stats;
```

### API Endpoints/Functions Needed

**GET /api/dashboard/stats**
```typescript
// Response:
{
  success: true,
  data: {
    totalProperties: number,
    propertiesAvailable: number,
    propertiesSold: number,
    totalLeads: number,
    leadsNew: number,
    leadsClosedWon: number,
    avgPropertyPrice: number,
    showingsThisMonth: number,
    revenuePotential: number,
    activeAgents: number
  }
}
```

**GET /api/dashboard/leads-trend**
```typescript
// Get weekly lead trend for chart
// Response:
{
  success: true,
  data: [
    { week: "Week 1", leads: 12 },
    { week: "Week 2", leads: 19 },
    // ... 6 weeks total
  ]
}
```

**GET /api/dashboard/properties-by-type**
```typescript
// Get breakdown by property type
// Response:
{
  success: true,
  data: [
    { name: "Apartments", value: 45 },
    { name: "Houses", value: 30 },
    // ...
  ]
}
```

**Database Functions:**
```sql
-- Get dashboard summary stats
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_company_id UUID)
RETURNS TABLE (
  total_properties BIGINT,
  properties_available BIGINT,
  properties_sold BIGINT,
  total_leads BIGINT,
  leads_new BIGINT,
  leads_closed_won BIGINT,
  avg_price NUMERIC,
  showings_month BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT CASE WHEN p.company_id = p_company_id THEN p.id END),
    COUNT(DISTINCT CASE WHEN p.company_id = p_company_id AND p.status = 'available' THEN p.id END),
    COUNT(DISTINCT CASE WHEN p.company_id = p_company_id AND p.status = 'sold' THEN p.id END),
    COUNT(DISTINCT CASE WHEN l.company_id = p_company_id THEN l.id END),
    COUNT(DISTINCT CASE WHEN l.company_id = p_company_id AND l.status = 'new' THEN l.id END),
    COUNT(DISTINCT CASE WHEN l.company_id = p_company_id AND l.status = 'closed_won' THEN l.id END),
    AVG(CASE WHEN p.company_id = p_company_id THEN p.price END),
    COUNT(DISTINCT CASE WHEN s.company_id = p_company_id AND s.scheduled_at >= NOW() - INTERVAL '30 days' THEN s.id END)
  FROM public.properties p
  FULL OUTER JOIN public.leads l ON l.company_id = p_company_id
  FULL OUTER JOIN public.showings s ON s.company_id = p_company_id;
END;
$$ LANGUAGE plpgsql;

-- Get weekly lead trend
CREATE OR REPLACE FUNCTION get_leads_trend(p_company_id UUID, p_weeks INT DEFAULT 6)
RETURNS TABLE (
  week_start DATE,
  week_number INT,
  lead_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE_TRUNC('week', l.created_at)::DATE,
    EXTRACT(WEEK FROM l.created_at)::INT,
    COUNT(*) as lead_count
  FROM public.leads l
  WHERE l.company_id = p_company_id
    AND l.created_at >= NOW() - INTERVAL '1 week' * p_weeks
  GROUP BY DATE_TRUNC('week', l.created_at)
  ORDER BY week_start DESC;
END;
$$ LANGUAGE plpgsql;
```

### Migration Steps from Mock Data

**Step 1: Create Materialized View**
```sql
-- Run this in Supabase SQL editor
CREATE MATERIALIZED VIEW public.company_dashboard_stats AS
SELECT
  c.id as company_id,
  COUNT(DISTINCT p.id) as total_properties,
  COUNT(DISTINCT CASE WHEN p.status = 'sold' THEN p.id END) as properties_sold,
  COUNT(DISTINCT l.id) as total_leads,
  COUNT(DISTINCT CASE WHEN l.status = 'new' THEN l.id END) as leads_new,
  COUNT(DISTINCT CASE WHEN l.status = 'closed_won' THEN l.id END) as leads_closed_won
FROM public.companies c
LEFT JOIN public.properties p ON c.id = p.company_id
LEFT JOIN public.leads l ON c.id = l.company_id
GROUP BY c.id
WITH DATA;
```

**Step 2: Create Dashboard Hooks**
```typescript
// File: lib/hooks/useDashboard.ts
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => fetch('/api/dashboard/stats').then(r => r.json()),
    refetchInterval: 30 * 1000 // Refresh every 30s
  })
}

export function useDashboardTrend() {
  return useQuery({
    queryKey: ['dashboard', 'leads-trend'],
    queryFn: () => fetch('/api/dashboard/leads-trend').then(r => r.json()),
    staleTime: 10 * 60 * 1000
  })
}

export function usePropertiesByType() {
  return useQuery({
    queryKey: ['dashboard', 'properties-by-type'],
    queryFn: () => fetch('/api/dashboard/properties-by-type').then(r => r.json()),
    staleTime: 15 * 60 * 1000
  })
}
```

**Step 3: Create API Routes**
```typescript
// File: app/api/dashboard/stats/route.ts
export async function GET() {
  const supabase = createRouteHandlerClient()
  const profile = await getCurrentUserProfile(supabase)
  
  const { data: stats } = await supabase.rpc('get_dashboard_stats', {
    p_company_id: profile.company_id
  })
  
  return NextResponse.json({
    success: true,
    data: {
      totalProperties: stats[0].total_properties,
      propertiesAvailable: stats[0].properties_available,
      propertiesSold: stats[0].properties_sold,
      // ... map all fields
    }
  })
}

// File: app/api/dashboard/leads-trend/route.ts
export async function GET() {
  const supabase = createRouteHandlerClient()
  const profile = await getCurrentUserProfile(supabase)
  
  const { data: trend } = await supabase.rpc('get_leads_trend', {
    p_company_id: profile.company_id,
    p_weeks: 6
  })
  
  return NextResponse.json({
    success: true,
    data: trend.map((row, idx) => ({
      week: `Week ${idx + 1}`,
      leads: row.lead_count
    }))
  })
}
```

**Step 4: Update Dashboard Page**
```typescript
// File: app/dashboard/page.tsx (BEFORE)
const stats = [
  { title: "Total Properties", value: 47 },
  { title: "New Leads", value: 23 },
  // ... hardcoded values
]

// File: app/dashboard/page.tsx (AFTER)
import { useDashboardStats, useDashboardTrend } from '@/lib/hooks/useDashboard'

export default function DashboardPage() {
  const { data: statsResponse } = useDashboardStats()
  const { data: trendResponse } = useDashboardTrend()
  
  const statsData = statsResponse?.data || {}
  const stats = [
    {
      title: "Total Properties",
      value: statsData.totalProperties || 0,
      subtitle: "Active Listings"
    },
    {
      title: "New Leads",
      value: statsData.leadsNew || 0,
      subtitle: "This Week"
    },
    {
      title: "Properties Sold",
      value: statsData.propertiesSold || 0,
      subtitle: "This Month"
    },
  ]
  
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map(stat => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </motion.div>
        
        <ChartSection 
          lineData={trendResponse?.data}
          pieData={pieDataResponse?.data}
        />
        
        <RecentLeadsTable />
      </div>
    </DashboardLayout>
  )
}
```

**Step 5: Update Chart Components**
```typescript
// File: components/dashboard/chart-section.tsx (BEFORE)
const lineData = [
  { name: "Week 1", leads: 12 },
  { name: "Week 2", leads: 19 },
  // ... hardcoded
]

// File: components/dashboard/chart-section.tsx (AFTER)
export function ChartSection({ lineData = [], pieData = [] }) {
  if (!lineData.length) return <Skeleton />
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <AreaChart data={lineData} />
      <PieChart data={pieData} />
    </div>
  )
}
```

**Step 6: Test & Verify**
- [ ] Dashboard stats load from database
- [ ] Stats update in real-time or every 30s
- [ ] Charts render with correct data
- [ ] No performance issues (check query times)
- [ ] RLS policies applied

### Files to Update
- `app/dashboard/page.tsx` (replace hardcoded stats)
- `components/dashboard/chart-section.tsx` (replace mock data)
- `components/dashboard/recent-leads-table.tsx` (replace mock leads)
- `lib/hooks/useDashboard.ts` (create)
- `app/api/dashboard/stats/route.ts` (create)
- `app/api/dashboard/leads-trend/route.ts` (create)
- `supabase-schema.sql` (add materialized view)

---

## 4. LEAD ACTIVITIES & CRM TIMELINE

### Overview
Implement activity tracking for leads with full CRM timeline (calls, emails, meetings, notes).

### Supabase Tables & RLS Policies

**Tables Required:**
- `public.lead_activities` (already exists)
- `public.leads` (link to leads)

**RLS Policies Required:**
```sql
-- Already implemented:
-- "Users can view company lead activities"
-- "Users can create activities"
-- "Users can update their activities"
```

**Key Fields:**
```
id, lead_id, activity_type (note, call, meeting, email, task),
title, description, scheduled_at, completed_at, 
duration_minutes, created_by, created_at
```

### API Endpoints/Functions Needed

**GET /api/leads/:leadId/activities**
```typescript
// Response:
{
  success: true,
  data: LeadActivity[],
  pagination: { total }
}
```

**POST /api/leads/:leadId/activities**
```typescript
// Request:
{
  activity_type: 'note' | 'call' | 'meeting' | 'email' | 'task',
  title: string (required)
  description: string
  scheduled_at: timestamp (for future activities)
  duration_minutes: number
}
```

**Database Function:**
```sql
CREATE OR REPLACE FUNCTION get_lead_activities(
  p_lead_id UUID,
  p_limit INT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  activity_type activity_type,
  title VARCHAR,
  description TEXT,
  scheduled_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration_minutes INT,
  created_by UUID,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    la.id, la.activity_type, la.title, la.description,
    la.scheduled_at, la.completed_at, la.duration_minutes,
    la.created_by, la.created_at
  FROM public.lead_activities la
  WHERE la.lead_id = p_lead_id
  ORDER BY la.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
```

### Migration Steps

**Step 1: Create Lead Detail Component with Activities**
```typescript
// File: components/lead/lead-detail-view.tsx
import { useLeadActivities } from '@/lib/hooks/useLeadActivities'

export function LeadDetailView({ leadId }) {
  const { data: activities, isLoading } = useLeadActivities(leadId)
  
  return (
    <div className="space-y-6">
      {/* Lead Info Card */}
      <LeadInfoCard leadId={leadId} />
      
      {/* Activities Timeline */}
      <div className="border-l-2 border-blue-500 pl-6">
        {activities?.map(activity => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>
      
      {/* Add Activity Form */}
      <AddActivityForm leadId={leadId} />
    </div>
  )
}
```

**Step 2: Create API Routes**
```typescript
// File: app/api/leads/[leadId]/activities/route.ts
export async function GET(request, { params }) {
  const supabase = createRouteHandlerClient()
  
  const { data: activities } = await supabase
    .from('lead_activities')
    .select('*')
    .eq('lead_id', params.leadId)
    .order('created_at', { ascending: false })
  
  return NextResponse.json({
    success: true,
    data: activities
  })
}

export async function POST(request, { params }) {
  const supabase = createRouteHandlerClient()
  const user = await getAuthenticatedUser(supabase)
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('lead_activities')
    .insert({
      lead_id: params.leadId,
      activity_type: body.activity_type,
      title: body.title,
      description: body.description,
      created_by: user.id
    })
  
  if (error) return errorResponse(error)
  
  return NextResponse.json({ success: true, data })
}
```

**Step 3: Test & Verify**
- [ ] Activities load for a lead
- [ ] Timeline displays in reverse chronological order
- [ ] Can add new activities
- [ ] Activity types filter correctly

### Files to Create/Update
- `lib/hooks/useLeadActivities.ts` (create)
- `app/api/leads/[leadId]/activities/route.ts` (create)
- `components/lead/lead-detail-view.tsx` (create)
- `components/lead/activity-timeline.tsx` (create)

---

## 5. SHOWINGS & SCHEDULING

### Overview
Manage property showings/viewings with calendar integration and real-time updates.

### Supabase Tables & RLS Policies

**Tables Required:**
- `public.showings` (already exists)
- `public.properties` (link)
- `public.leads` (link)
- `public.profiles` (agent/scheduler)

**RLS Policies Required:**
```sql
-- Already implemented:
-- "Users can view company showings"
-- "Agents can create showings"
-- "Users can update their showings"
```

**Key Fields:**
```
id, property_id, lead_id, scheduled_by, scheduled_at,
duration_minutes, status, notes, created_at
```

### API Endpoints/Functions Needed

**GET /api/showings**
```typescript
// Request params:
- startDate (ISO date)
- endDate (ISO date)
- propertyId (optional)
- leadId (optional)
- status (optional: scheduled, completed, cancelled, no-show)

// Response:
{
  success: true,
  data: Showing[]
}
```

**POST /api/showings**
```typescript
// Request:
{
  property_id: UUID (required)
  lead_id: UUID (required)
  scheduled_at: timestamp (required)
  duration_minutes: number (default: 60)
  notes: string
}
```

**PUT /api/showings/:id**
```typescript
// Update showing status, reschedule
{
  status?: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  scheduled_at?: timestamp
  notes?: string
}
```

**Database Function:**
```sql
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
    s.id,
    s.property_id,
    s.lead_id,
    p.title,
    (l.first_name || ' ' || l.last_name),
    s.scheduled_at,
    s.status,
    s.notes
  FROM public.showings s
  JOIN public.properties p ON s.property_id = p.id
  JOIN public.leads l ON s.lead_id = l.id
  WHERE s.company_id = p_company_id
    AND DATE(s.scheduled_at) BETWEEN p_start_date AND p_end_date
  ORDER BY s.scheduled_at;
END;
$$ LANGUAGE plpgsql;
```

### Migration Steps

**Step 1: Create Showings Hook**
```typescript
// File: lib/hooks/useShowings.ts
export function useShowingsForDateRange(startDate, endDate) {
  return useQuery({
    queryKey: ['showings', startDate, endDate],
    queryFn: () => fetch(`/api/showings?startDate=${startDate}&endDate=${endDate}`)
      .then(r => r.json())
  })
}
```

**Step 2: Create API Routes**
```typescript
// File: app/api/showings/route.ts
export async function GET(request) {
  const supabase = createRouteHandlerClient()
  const profile = await getCurrentUserProfile(supabase)
  
  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  
  const { data } = await supabase.rpc(
    'get_company_showings_for_date_range',
    {
      p_company_id: profile.company_id,
      p_start_date: startDate,
      p_end_date: endDate
    }
  )
  
  return NextResponse.json({ success: true, data })
}

export async function POST(request) {
  const supabase = createRouteHandlerClient()
  const user = await getAuthenticatedUser(supabase)
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('showings')
    .insert({
      ...body,
      scheduled_by: user.id,
      status: 'scheduled'
    })
  
  if (error) return errorResponse(error)
  
  return NextResponse.json({ success: true, data })
}
```

**Step 3: Create Calendar Component**
```typescript
// File: components/showing/showing-calendar.tsx
import { Calendar } from '@/components/ui/calendar'
import { useShowingsForDateRange } from '@/lib/hooks/useShowings'

export function ShowingCalendar() {
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  })
  
  const { data: showings } = useShowingsForDateRange(
    dateRange.start,
    dateRange.end
  )
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <Calendar />
      <ShowingsList showings={showings} />
      <ShowingDetails />
    </div>
  )
}
```

**Step 4: Test & Verify**
- [ ] Showings load for date range
- [ ] Calendar displays correctly
- [ ] Can create new showings
- [ ] Status updates work
- [ ] Real-time updates trigger

### Files to Create/Update
- `lib/hooks/useShowings.ts` (create)
- `app/api/showings/route.ts` (create)
- `components/showing/showing-calendar.tsx` (create)
- `app/showings/page.tsx` (update to use dynamic data)

---

## 6. REAL-TIME UPDATES & SUBSCRIPTIONS

### Overview
Implement Supabase Realtime subscriptions for live updates on properties, leads, and showings.

### Supabase Realtime Configuration

**Channels to Subscribe To:**
```typescript
// Properties channel
supabase.channel('properties:changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'properties',
    filter: `company_id=eq.${companyId}`
  }, (payload) => {
    // Handle property changes
  })
  .subscribe()

// Leads channel
supabase.channel('leads:changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'leads',
    filter: `company_id=eq.${companyId}`
  }, (payload) => {
    // Handle lead changes
  })
  .subscribe()

// Showings channel
supabase.channel('showings:changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'showings',
    filter: `company_id=eq.${companyId}`
  }, (payload) => {
    // Handle showing changes
  })
  .subscribe()
```

### Implementation

**Step 1: Create Realtime Hook**
```typescript
// File: lib/hooks/useRealtimeSubscription.ts
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function useRealtimeSubscription(table, companyId, queryKey) {
  const queryClient = useQueryClient()
  const supabase = createClientComponentClient()
  
  useEffect(() => {
    const channel = supabase.channel(`${table}:changes`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table,
        filter: `company_id=eq.${companyId}`
      }, (payload) => {
        // Invalidate query cache to trigger refetch
        queryClient.invalidateQueries({ queryKey })
      })
      .subscribe()
    
    return () => {
      channel.unsubscribe()
    }
  }, [table, companyId, queryKey, queryClient])
}
```

**Step 2: Integrate into Components**
```typescript
// File: components/lead/leads-table.tsx
export function LeadsTable() {
  const { data: response } = useLeads(filters)
  
  // Enable real-time updates
  useRealtimeSubscription('leads', userCompanyId, ['leads', filters])
  
  return (
    // ... component JSX
  )
}
```

**Step 3: Test & Verify**
- [ ] Open two browser windows
- [ ] Create/update lead in one window
- [ ] Verify other window updates in real-time
- [ ] No manual refresh needed
- [ ] Performance acceptable with live updates

### Files to Create/Update
- `lib/hooks/useRealtimeSubscription.ts` (create)
- Update all data-fetching components

---

## 7. SEARCH & FILTERING

### Overview
Implement full-text search and advanced filtering for properties and leads.

### Database Setup

**Create Full-Text Search Indexes:**
```sql
-- Property search index
ALTER TABLE public.properties
ADD COLUMN search_vector tsvector;

CREATE INDEX idx_properties_search ON public.properties
USING GIN(search_vector);

-- Trigger to update search_vector
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

-- Lead search index
ALTER TABLE public.leads
ADD COLUMN search_vector tsvector;

CREATE INDEX idx_leads_search ON public.leads
USING GIN(search_vector);

-- Similar trigger for leads...
```

### API Endpoints

**GET /api/properties/search**
```typescript
// Request params:
- q: string (search query)
- filters: {
    minPrice?: number,
    maxPrice?: number,
    bedrooms?: number,
    bathrooms?: number,
    propertyType?: string,
    city?: string,
    status?: string
  }
- page: number
- limit: number

// Response: Paginated results
```

**GET /api/leads/search**
```typescript
// Request params:
- q: string (search name/email)
- filters: {
    status?: string,
    minBudget?: number,
    maxBudget?: number,
    assignedTo?: UUID
  }
- page: number
- limit: number
```

### Implementation

**Step 1: Create Search Hooks**
```typescript
// File: lib/hooks/useSearch.ts
export function usePropertySearch(query, filters = {}) {
  return useQuery({
    queryKey: ['properties', 'search', query, filters],
    queryFn: () => fetch(`/api/properties/search`, {
      params: { q: query, ...filters }
    }).then(r => r.json()),
    enabled: query.length > 2, // Debounce
    staleTime: 60 * 1000
  })
}

export function useLeadSearch(query, filters = {}) {
  return useQuery({
    queryKey: ['leads', 'search', query, filters],
    queryFn: () => fetch(`/api/leads/search`, {
      params: { q: query, ...filters }
    }).then(r => r.json()),
    enabled: query.length > 2,
    staleTime: 60 * 1000
  })
}
```

**Step 2: Create API Routes**
```typescript
// File: app/api/properties/search/route.ts
export async function GET(request) {
  const supabase = createRouteHandlerClient()
  const profile = await getCurrentUserProfile(supabase)
  const { searchParams } = new URL(request.url)
  
  const query = searchParams.get('q')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  
  let dbQuery = supabase
    .from('properties')
    .select('*', { count: 'exact' })
    .eq('company_id', profile.company_id)
  
  // Full-text search
  if (query) {
    dbQuery = dbQuery.or(
      `title.ilike.%${query}%,description.ilike.%${query}%,city.ilike.%${query}%`
    )
  }
  
  // Numeric filters
  if (minPrice) dbQuery = dbQuery.gte('price', minPrice)
  if (maxPrice) dbQuery = dbQuery.lte('price', maxPrice)
  
  const { data, count } = await dbQuery.limit(20)
  
  return NextResponse.json({
    success: true,
    data,
    pagination: { total: count }
  })
}
```

**Step 3: Update Search Components**
```typescript
// File: components/shared/search-bar.tsx
import { usePropertySearch } from '@/lib/hooks/useSearch'
import { useDebounce } from '@/lib/hooks/useDebounce'

export function SearchBar({ onResultsChange }) {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)
  const { data: results } = usePropertySearch(debouncedQuery)
  
  useEffect(() => {
    onResultsChange(results?.data || [])
  }, [results])
  
  return (
    <Input
      placeholder="Search properties..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  )
}
```

### Files to Create/Update
- `lib/hooks/useSearch.ts` (create)
- `lib/hooks/useDebounce.ts` (create)
- `app/api/properties/search/route.ts` (create)
- `app/api/leads/search/route.ts` (create)
- `components/shared/search-bar.tsx` (update)

---

## 8. PROPERTY-LEAD ASSIGNMENTS

### Overview
Manage which leads are interested in which properties (many-to-many relationships).

### Supabase Tables & RLS Policies

**Table Required:**
- `public.property_lead_assignments` (already exists)

**RLS Policies Required:**
```sql
-- Already implemented:
-- "Users can view company assignments"
-- "COMPANY_ADMIN can create assignments"
-- "COMPANY_ADMIN can update assignments"
```

### API Endpoints

**GET /api/properties/:propertyId/interested-leads**
```typescript
// Get all leads interested in a property
```

**GET /api/leads/:leadId/interested-properties**
```typescript
// Get all properties a lead is interested in
```

**POST /api/property-lead-assignments**
```typescript
// Assign property to lead
{
  property_id: UUID,
  lead_id: UUID,
  notes: string
}
```

**DELETE /api/property-lead-assignments/:id**
```typescript
// Remove assignment
```

### Implementation

**Step 1: Create Assignment Hooks**
```typescript
// File: lib/hooks/usePropertyLeadAssignments.ts
export function useLeadInterestedProperties(leadId) {
  return useQuery({
    queryKey: ['leads', leadId, 'properties'],
    queryFn: () => fetch(`/api/leads/${leadId}/interested-properties`)
      .then(r => r.json())
  })
}

export function usePropertyInterestedLeads(propertyId) {
  return useQuery({
    queryKey: ['properties', propertyId, 'leads'],
    queryFn: () => fetch(`/api/properties/${propertyId}/interested-leads`)
      .then(r => r.json())
  })
}
```

**Step 2: Create API Routes**
```typescript
// File: app/api/leads/[leadId]/interested-properties/route.ts
export async function GET(request, { params }) {
  const supabase = createRouteHandlerClient()
  
  const { data: assignments } = await supabase
    .from('property_lead_assignments')
    .select(`
      *,
      properties (id, title, price, city, bedrooms)
    `)
    .eq('lead_id', params.leadId)
  
  return NextResponse.json({
    success: true,
    data: assignments.map(a => a.properties)
  })
}
```

**Step 3: Update Lead Detail View**
```typescript
// Show interested properties in lead profile
export function LeadDetailView({ leadId }) {
  const { data: properties } = useLeadInterestedProperties(leadId)
  
  return (
    <div>
      <h3>Interested Properties</h3>
      <PropertyList properties={properties} />
    </div>
  )
}
```

### Files to Create/Update
- `lib/hooks/usePropertyLeadAssignments.ts` (create)
- `app/api/property-lead-assignments/route.ts` (create)
- `app/api/leads/[leadId]/interested-properties/route.ts` (create)

---

## 9. TEAM MANAGEMENT & INVITATIONS

### Overview
Manage team members, roles, and invitation system.

### Supabase Tables & RLS Policies

**Tables Required:**
- `public.profiles` (user profiles)
- `public.team_invitations` (invitations)

**RLS Policies Required:**
```sql
-- Already implemented:
-- "Company admin can view company invitations"
-- "Company admin can create invitations"
```

### API Endpoints

**GET /api/team/members**
```typescript
// Get company team members
```

**POST /api/team/invite**
```typescript
// Send invitation
{
  email: string,
  fullName: string,
  role: 'agent' | 'company_admin'
}
```

**GET /api/team/invitations/:token**
```typescript
// Verify invitation token
```

**POST /api/team/accept-invitation**
```typescript
// Accept invitation and create account
{
  token: string,
  password: string,
  fullName: string
}
```

### Implementation

**Step 1: Create Team Hooks**
```typescript
// File: lib/hooks/useTeam.ts
export function useTeamMembers() {
  return useQuery({
    queryKey: ['team', 'members'],
    queryFn: () => fetch('/api/team/members').then(r => r.json())
  })
}

export function useTeamInvitations() {
  return useQuery({
    queryKey: ['team', 'invitations'],
    queryFn: () => fetch('/api/team/invitations').then(r => r.json())
  })
}
```

**Step 2: Create API Routes**
```typescript
// File: app/api/team/members/route.ts
export async function GET() {
  const supabase = createRouteHandlerClient()
  const profile = await getCurrentUserProfile(supabase)
  
  const { data: members } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, is_active')
    .eq('company_id', profile.company_id)
  
  return NextResponse.json({ success: true, data: members })
}

// File: app/api/team/invite/route.ts
export async function POST(request) {
  const supabase = createRouteHandlerClient()
  const user = await getAuthenticatedUser(supabase)
  const profile = await getCurrentUserProfile(supabase)
  const body = await request.json()
  
  // Generate invitation token
  const token = generateSecureToken()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  
  const { data, error } = await supabase
    .from('team_invitations')
    .insert({
      company_id: profile.company_id,
      invited_by: user.id,
      email: body.email,
      full_name: body.fullName,
      role: body.role,
      token,
      expires_at: expiresAt
    })
  
  if (error) return errorResponse(error)
  
  // Send invitation email
  await sendInvitationEmail(body.email, token)
  
  return NextResponse.json({ success: true, data })
}
```

### Files to Create/Update
- `lib/hooks/useTeam.ts` (create)
- `app/api/team/members/route.ts` (create)
- `app/api/team/invite/route.ts` (create)
- `components/team/team-members-list.tsx` (create)

---

## 10. ANALYTICS & REPORTING

### Overview
Advanced analytics dashboard with custom reports and data exports.

### Database Setup

**Create Analytics Views:**
```sql
-- Lead conversion funnel
CREATE VIEW public.lead_conversion_funnel AS
SELECT
  company_id,
  status,
  COUNT(*) as lead_count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY company_id), 2) as percentage
FROM public.leads
GROUP BY company_id, status
ORDER BY company_id, FIELD(status, 'new', 'contacted', 'qualified', 'proposal_sent', 'closed_won');

-- Agent performance
CREATE VIEW public.agent_performance AS
SELECT
  p.id as agent_id,
  p.full_name,
  COUNT(DISTINCT l.id) as leads_assigned,
  COUNT(DISTINCT CASE WHEN l.status = 'closed_won' THEN l.id END) as deals_closed,
  COUNT(DISTINCT s.id) as showings_scheduled,
  COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.id END) as showings_completed
FROM public.profiles p
LEFT JOIN public.leads l ON p.id = l.assigned_to
LEFT JOIN public.showings s ON p.id = s.scheduled_by
WHERE p.role = 'agent'
GROUP BY p.id, p.full_name;

-- Revenue analytics
CREATE VIEW public.revenue_analytics AS
SELECT
  company_id,
  DATE_TRUNC('month', created_at)::DATE as month,
  COUNT(DISTINCT CASE WHEN status = 'sold' THEN id END) as properties_sold,
  COALESCE(SUM(CASE WHEN status = 'sold' THEN price END), 0) as total_revenue,
  AVG(CASE WHEN status = 'sold' THEN price END) as avg_sale_price
FROM public.properties
GROUP BY company_id, DATE_TRUNC('month', created_at)
ORDER BY company_id, month DESC;
```

### API Endpoints

**GET /api/analytics/conversion-funnel**
```typescript
// Response: Lead status breakdown with percentages
```

**GET /api/analytics/agent-performance**
```typescript
// Response: Agent productivity metrics
```

**GET /api/analytics/revenue**
```typescript
// Response: Monthly revenue trends
```

**GET /api/analytics/export**
```typescript
// Request params:
- format: 'csv' | 'pdf'
- reportType: 'properties' | 'leads' | 'revenue'
- dateRange: { start, end }

// Response: File download
```

### Implementation

**Step 1: Create Analytics Hooks**
```typescript
// File: lib/hooks/useAnalytics.ts
export function useConversionFunnel() {
  return useQuery({
    queryKey: ['analytics', 'conversion-funnel'],
    queryFn: () => fetch('/api/analytics/conversion-funnel').then(r => r.json())
  })
}

export function useAgentPerformance() {
  return useQuery({
    queryKey: ['analytics', 'agent-performance'],
    queryFn: () => fetch('/api/analytics/agent-performance').then(r => r.json())
  })
}
```

**Step 2: Create API Routes**
```typescript
// File: app/api/analytics/conversion-funnel/route.ts
export async function GET() {
  const supabase = createRouteHandlerClient()
  const profile = await getCurrentUserProfile(supabase)
  
  const { data } = await supabase
    .from('lead_conversion_funnel')
    .select('*')
    .eq('company_id', profile.company_id)
  
  return NextResponse.json({ success: true, data })
}

// File: app/api/analytics/export/route.ts
export async function GET(request) {
  const supabase = createRouteHandlerClient()
  const { searchParams } = new URL(request.url)
  
  const format = searchParams.get('format') // csv or pdf
  const reportType = searchParams.get('reportType')
  
  // Fetch data based on reportType
  // Generate CSV/PDF
  // Return file
}
```

**Step 3: Create Analytics Dashboard**
```typescript
// File: app/analytics/page.tsx
export default function AnalyticsPage() {
  const { data: funnelData } = useConversionFunnel()
  const { data: agentData } = useAgentPerformance()
  
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <ConversionFunnelChart data={funnelData} />
        <AgentPerformanceTable data={agentData} />
        <ExportReportButton />
      </div>
    </DashboardLayout>
  )
}
```

### Files to Create/Update
- `lib/hooks/useAnalytics.ts` (create)
- `app/api/analytics/conversion-funnel/route.ts` (create)
- `app/api/analytics/agent-performance/route.ts` (create)
- `app/api/analytics/export/route.ts` (create)
- `app/analytics/page.tsx` (create)
- Add analytics views to `supabase-schema.sql`

---

## Implementation Checklist

### Phase 1: Core Features (Weeks 1-2)
- [ ] 1. Properties Management
- [ ] 2. Leads Management
- [ ] 3. Dashboard Aggregations

### Phase 2: Advanced Features (Weeks 3-4)
- [ ] 4. Lead Activities & CRM Timeline
- [ ] 5. Showings & Scheduling
- [ ] 6. Real-time Updates & Subscriptions

### Phase 3: Polish & Scale (Weeks 5-6)
- [ ] 7. Search & Filtering
- [ ] 8. Property-Lead Assignments
- [ ] 9. Team Management & Invitations

### Phase 4: Analytics (Week 7)
- [ ] 10. Analytics & Reporting

---

## Quality Assurance Checklist

For each implementation prompt:
- [ ] All TypeScript types defined
- [ ] API endpoints documented
- [ ] RLS policies verified working
- [ ] Error handling implemented
- [ ] Loading states in UI
- [ ] Real-time subscriptions tested
- [ ] Performance measured (<100ms queries)
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] Accessibility reviewed (WCAG 2.1)
- [ ] Mobile responsiveness verified
- [ ] Error messages user-friendly

---

## Testing Scenarios

For each feature, test:
1. **Happy Path**: User performs intended action
2. **Error Handling**: API returns error
3. **Edge Cases**: Empty results, large datasets
4. **Performance**: Measure response time
5. **RLS**: User can only access own company data
6. **Real-time**: Open multiple windows, verify sync
7. **Offline**: Graceful degradation without internet
8. **Mobile**: Touch interactions, small screens

---

## Performance Targets

| Feature | Target | Tool |
|---------|--------|------|
| Property list load | <100ms | React Profiler |
| Search response | <200ms | Network tab |
| Dashboard stats | <500ms | Vercel Analytics |
| Real-time update | <1s | Dev tools |
| Page FCP | <1s | Vercel Analytics |
| Page LCP | <2.5s | Vercel Analytics |

---

## Documentation Requirements

For each implementation:
1. API endpoint documentation (request/response)
2. Database schema changes documented
3. RLS policies explained
4. Error codes documented
5. Hook usage examples provided
6. Component prop types documented
7. Deployment instructions
8. Rollback procedures

---

**Next Steps:**
1. Review and approve these implementation prompts
2. Begin with Prompt #1 (Properties Management)
3. Follow the migration steps sequentially
4. Test each implementation thoroughly
5. Move to next prompt only after QA pass
6. Track progress using checklist above

---

**Document Control:**
- Version: 1.0
- Status: Ready for Implementation
- Last Updated: January 24, 2026
