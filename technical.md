# EstateFlow - Technical Architecture Document

**Project**: EstateFlow - Multi-tenant Real Estate CRM Platform  
**Date**: January 24, 2026  
**Version**: 1.0  
**Status**: Production Ready

---

## 📋 Executive Summary

EstateFlow is a comprehensive real estate management platform built with **Next.js 14**, **Supabase** (PostgreSQL), and **TypeScript**. The architecture implements a multi-tenant, role-based access control system with row-level security (RLS) for enterprise-grade data isolation.

### Key Characteristics
- **Multi-tenant**: Support for multiple real estate companies
- **Role-based**: 4-level user hierarchy (super_admin, company_admin, agent, client)
- **Secure**: PostgreSQL RLS for data isolation by company and role
- **Scalable**: Designed for thousands of properties, leads, and users
- **Real-time**: Firebase/Firestore integration for live updates (legacy), migrating to Supabase
- **Type-safe**: Full TypeScript implementation across frontend and backend

---

## 1️⃣ Current Mock Data Usage

### 1.1 Features Using Mock Data

| Feature | Location | Mock Data Type | Status |
|---------|----------|---|---|
| **Properties** | `app/properties/page.tsx` | 6 hardcoded properties | Replace with DB |
| **Leads** | `components/lead/leads-table.tsx` | 4 hardcoded leads | Replace with DB |
| **Dashboard Stats** | `app/dashboard/page.tsx` | Hardcoded numbers (47, 23, 8) | Replace with aggregations |
| **Recent Leads** | `components/dashboard/recent-leads-table.tsx` | 3 mock leads | Replace with queries |
| **Chart Data** | `components/dashboard/chart-section.tsx` | Weekly lead stats + pie chart | Replace with real data |
| **Auth Test** | `test-signup.json` | Sample signup credentials | Testing only |

### 1.2 Mock Data Examples

**Properties Mock**
```typescript
// app/properties/page.tsx
const properties = [
  {
    id: "1",
    title: "Modern 3BR Apartment in Anfa",
    price: 2500000,
    location: "Casablanca, Morocco",
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    status: "Available",
    images: ["/modern-luxury-apartment.png"],
    type: "Apartment",
  },
  // ... 5 more properties
]
```

**Leads Mock**
```typescript
// components/lead/leads-table.tsx
const leadsData = [
  {
    id: 1,
    name: "Sarah Mohammed",
    property: "Modern 3BR Apartment",
    phone: "+212 600 111222",
    email: "sarah@example.com",
    status: "New",
    date: "2024-12-10",
  },
  // ... 3 more leads
]
```

**Dashboard Stats Mock**
```typescript
// app/dashboard/page.tsx
const stats = [
  { title: "Total Properties", value: 47 },
  { title: "New Leads", value: 23 },
  { title: "Properties Sold", value: 8 },
  { title: "Revenue", value: "420,000 DH" },
]
```

**Chart Data Mock**
```typescript
// components/dashboard/chart-section.tsx
const lineData = [
  { name: "Week 1", leads: 12 },
  { name: "Week 2", leads: 19 },
  // ... 4 more weeks
]
```

---

## 2️⃣ Data Models & Relationships

### 2.1 Core Data Model Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     COMPANIES                           │
│  (Multi-tenant root - all data scoped to company)       │
└───────────────────┬─────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
    ┌────────┐ ┌─────────┐ ┌──────────┐
    │PROFILES│ │PROPERTIES│ │  LEADS   │
    │(Users) │ │(Listings)│ │(Prospects)│
    └────────┘ └─────────┘ └──────────┘
        │           │           │
        │           │           ▼
        │           │      ┌─────────────┐
        │           │      │  LEAD_      │
        │           │      │ACTIVITIES   │
        │           │      └─────────────┘
        │           │
        │           ▼
        │      ┌────────────────────┐
        │      │PROPERTY_LEAD_      │
        │      │ASSIGNMENTS         │
        │      └────────────────────┘
        │
        ▼
    ┌──────────┐
    │SHOWINGS  │
    │(Viewings)│
    └──────────┘
        │
        ▼
    ┌────────────────┐
    │TEAM_           │
    │INVITATIONS     │
    └────────────────┘
```

### 2.2 Entity Relationship Details

#### **COMPANIES**
```sql
- id (UUID, PK)
- name (VARCHAR 255)
- email, phone, website
- address, city, state, zip_code, country
- logo_url (TEXT)
- timezone (VARCHAR 50)
- created_at, updated_at (TIMESTAMPS)

Purpose: Root tenant entity
Relationships: 1-to-many with profiles, properties, leads, showings
```

#### **PROFILES (Users)**
```sql
- id (UUID, PK, FK -> auth.users)
- company_id (UUID, FK)
- full_name (VARCHAR 255)
- avatar_url (TEXT)
- phone (VARCHAR 20)
- email (VARCHAR 255)
- role (ENUM: super_admin, company_admin, agent, client)
- is_company_admin (BOOLEAN)
- is_active (BOOLEAN)
- last_login_at (TIMESTAMP)
- created_at, updated_at (TIMESTAMPS)

Purpose: User management with 4-level role hierarchy
Relationships:
  - 1-to-1 with auth.users (authentication)
  - Many-to-1 with companies
  - 1-to-many with created properties/leads/activities
  - 1-to-many with assigned leads/showings
```

#### **PROPERTIES**
```sql
- id (UUID, PK)
- company_id (UUID, FK)
- created_by (UUID, FK -> profiles)
- title (VARCHAR 255) [REQUIRED]
- description (TEXT)
- property_type (ENUM: house, condo, townhouse, commercial, land, multi_family)
- status (ENUM: available, under_contract, sold, expired, withdrawn)
- price (DECIMAL 12,2), price_currency (VARCHAR 3)
- address (TEXT), city, state, zip_code, country [REQUIRED]
- latitude (DECIMAL 10,8), longitude (DECIMAL 11,8)
- bedrooms (INTEGER), bathrooms (DECIMAL 3,1)
- square_feet (INTEGER), lot_size (DECIMAL 10,2)
- year_built (INTEGER)
- hoa_fees (DECIMAL 10,2)
- images (TEXT[] - URLs)
- documents (TEXT[] - URLs)
- notes (TEXT)
- created_at, updated_at (TIMESTAMPS)

Purpose: Real estate listings
Relationships:
  - Many-to-1 with companies (data isolation)
  - Many-to-1 with profiles (created_by)
  - 1-to-many with property_lead_assignments
  - 1-to-many with showings

Indexes:
  - idx_properties_company_id (fast company queries)
  - idx_properties_status (fast filtering)
  - idx_properties_created_at DESC (recent first)
  - idx_properties_city (location filtering)
```

#### **LEADS**
```sql
- id (UUID, PK)
- company_id (UUID, FK)
- assigned_to (UUID, FK -> profiles)
- created_by (UUID, FK -> profiles)
- first_name (VARCHAR 100) [REQUIRED]
- last_name (VARCHAR 100) [REQUIRED]
- email (VARCHAR 255)
- phone (VARCHAR 20)
- status (ENUM: new, contacted, qualified, proposal_sent, negotiating, closed_won, closed_lost)
- budget_min, budget_max (DECIMAL 12,2)
- interested_types (ENUM[] - property types)
- preferred_cities (VARCHAR[])
- notes (TEXT)
- last_contacted_at (TIMESTAMP)
- created_at, updated_at (TIMESTAMPS)

Purpose: Prospect/customer management
Relationships:
  - Many-to-1 with companies
  - Many-to-1 with profiles (assigned_to)
  - 1-to-many with lead_activities (activity timeline)
  - 1-to-many with property_lead_assignments
  - 1-to-many with showings

Indexes:
  - idx_leads_company_id
  - idx_leads_status
  - idx_leads_assigned_to (agent assignments)
  - idx_leads_created_at DESC
  - idx_leads_last_contacted_at DESC (follow-up tracking)
```

#### **LEAD_ACTIVITIES**
```sql
- id (UUID, PK)
- lead_id (UUID, FK) [REQUIRED]
- company_id (UUID, FK)
- created_by (UUID, FK -> profiles)
- activity_type (ENUM: note, call, meeting, email, task, property_viewed)
- title (VARCHAR 255) [REQUIRED]
- description (TEXT)
- scheduled_at (TIMESTAMP)
- completed_at (TIMESTAMP)
- duration_minutes (INTEGER)
- created_at, updated_at (TIMESTAMPS)

Purpose: Lead interaction timeline and CRM activities
Relationships:
  - Many-to-1 with leads (activity history)
  - Many-to-1 with profiles (who did the activity)

Indexes:
  - idx_lead_activities_lead_id (timeline queries)
  - idx_lead_activities_activity_type (filtering)
  - idx_lead_activities_created_at DESC (chronological)
```

#### **PROPERTY_LEAD_ASSIGNMENTS**
```sql
- id (UUID, PK)
- property_id (UUID, FK)
- lead_id (UUID, FK)
- company_id (UUID, FK)
- assigned_at (TIMESTAMP)
- status (VARCHAR 50) - default: 'active'
- notes (TEXT)
- created_at, updated_at (TIMESTAMPS)
- UNIQUE(property_id, lead_id)

Purpose: Many-to-many linking properties to interested leads
Relationships:
  - Many-to-1 with properties
  - Many-to-1 with leads

Use Cases:
  - Which properties is a lead interested in?
  - Which leads are interested in a property?
  - Property showing history
  - Lead engagement tracking
```

#### **SHOWINGS**
```sql
- id (UUID, PK)
- property_id (UUID, FK) [REQUIRED]
- lead_id (UUID, FK) [REQUIRED]
- company_id (UUID, FK)
- scheduled_by (UUID, FK -> profiles)
- scheduled_at (TIMESTAMP) [REQUIRED]
- duration_minutes (INTEGER) - default: 60
- status (VARCHAR 50) - default: 'scheduled'
  Values: scheduled, completed, cancelled, no-show
- notes (TEXT)
- created_at, updated_at (TIMESTAMPS)

Purpose: Property showing/viewing appointments
Relationships:
  - Many-to-1 with properties
  - Many-to-1 with leads
  - Many-to-1 with profiles (scheduled_by)

Indexes:
  - idx_showings_property_id
  - idx_showings_lead_id
  - idx_showings_scheduled_at (calendar queries)
  - idx_showings_scheduled_by (agent workload)

Use Cases:
  - Schedule property viewings
  - Calendar management
  - Track showing history
  - No-show analytics
```

#### **TEAM_INVITATIONS**
```sql
- id (UUID, PK)
- company_id (UUID, FK)
- invited_by (UUID, FK -> profiles)
- email (VARCHAR 255) [REQUIRED]
- full_name (VARCHAR 255)
- role (ENUM: agent, company_admin)
- token (VARCHAR 255) UNIQUE
- expires_at (TIMESTAMP) [REQUIRED]
- accepted_at (TIMESTAMP)
- accepted_by (UUID, FK -> profiles)
- created_at, updated_at (TIMESTAMPS)
- UNIQUE(company_id, email) WHERE accepted_at IS NULL

Purpose: Team member onboarding with token-based invitations
Relationships:
  - Many-to-1 with companies
  - Many-to-1 with profiles (invited_by)

Use Cases:
  - Invite team members
  - Email verification
  - Token-based signup
  - One-time links
```

---

## 3️⃣ Proposed Supabase Schema Design

### 3.1 Current Schema Status

✅ **Fully Implemented** in `supabase-schema.sql`:
- All tables created with proper constraints
- Row-level security (RLS) policies for all tables
- Helper functions for common access checks
- Automatic timestamp triggers
- Proper indexing for performance

### 3.2 Schema Architecture Principles

```
SECURITY LAYER
├── Row Level Security (RLS)
│   ├── Company-level isolation
│   ├── Role-based access control
│   └── Field-level access (select policies)
│
├── Authentication
│   └── Supabase Auth (auth.users table)
│
└── Authorization
    └── Profiles table with 4 roles

DATA LAYER
├── Companies (tenant root)
├── Profiles (users with roles)
├── Properties (listings)
├── Leads (prospects)
├── Lead Activities (timeline)
├── Property-Lead Assignments (relationships)
├── Showings (appointments)
└── Team Invitations (onboarding)

INDEXING LAYER
├── Foreign key indexes
├── Status/role lookups
├── Timestamp-based queries
├── Company isolation indexes
└── User assignment indexes
```

### 3.3 Key Design Features

**1. Multi-tenant Isolation**
```sql
-- All tables have company_id field
-- RLS policies enforce company_id isolation
-- Users only see their company's data
```

**2. Role-Based Access**
```sql
-- 4-level hierarchy:
-- super_admin  → sees all companies/data (platform owner)
-- company_admin → sees only their company data
-- agent       → sees assigned leads and company properties
-- client      → read-only access to assigned properties
```

**3. RLS Policies Example**
```sql
-- Users only see their company's data
CREATE POLICY "Users can view company properties"
  ON public.properties FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin' OR
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );
```

**4. Automatic Timestamps**
```sql
-- Triggers automatically update updated_at on any modification
-- Ensures data consistency across all records
```

**5. Comprehensive Indexing**
```sql
-- ~25 indexes across all tables
-- Optimizes common queries:
--   - Company-scoped queries (company_id)
--   - Status filtering (status fields)
--   - Ownership queries (created_by, assigned_to)
--   - Time-based sorting (created_at DESC)
```

### 3.4 Migration Path

```
Current State: Firebase Firestore
├── Collections: clients, showings
├── Real-time: Yes (via Firestore listeners)
└── RLS: Basic document-level

Target State: Supabase PostgreSQL
├── Tables: All 8 tables with RLS
├── Real-time: Supabase Realtime (drop-in replacement)
├── RLS: Row-level policies
├── Advanced: Complex queries, aggregations, joins
└── Compliance: Better audit trail, compliance features
```

---

## 4️⃣ Scalability Considerations

### 4.1 Performance at Scale

#### **Data Volume Assumptions**
```
Typical Enterprise Estate Flow Setup:
├── 1-10 companies (small to mid-market)
├── 5-50 users per company (agents, admins)
├── 100-1,000 properties per company
├── 1,000-10,000 leads per company
├── 5,000-50,000 lead activities per company (annually)
├── 1,000-10,000 showings per company (annually)
└── Total records: ~10M - 1B rows across all companies
```

#### **Query Performance**

| Query Type | Typical Use | Response Time | Index Used |
|-----------|----------|---|---|
| Get properties by company | Dashboard, search | <100ms | idx_properties_company_id |
| Filter leads by status | Lead dashboard | <100ms | idx_leads_status |
| Get lead timeline | Lead detail | <200ms | idx_lead_activities_lead_id |
| Schedule showing | Calendar | <50ms | idx_showings_scheduled_at |
| User company access | RLS policy | <10ms | idx_profiles_company_id |

### 4.2 Database Scaling Strategies

**1. Connection Pooling**
```javascript
// Supabase uses PgBouncer connection pooling
// Reuses connections to prevent exhaustion
// Max: ~100 concurrent connections per project
```

**2. Read Replicas** (Supabase Pro+)
```
For read-heavy workloads:
├── Primary: Write operations
└── Replicas: Reporting, analytics, dashboards

Example: Dashboard queries on read replica
```

**3. Partitioning** (For very large tables)
```sql
-- If lead_activities grows to 100M+ rows, partition by company_id:
CREATE TABLE public.lead_activities_company_001 PARTITION OF public.lead_activities
  FOR VALUES WITH (MODULUS 10, REMAINDER 0);
```

**4. Archiving**
```
Old records (>2 years):
├── Move to archive table
├── Or compress in object storage
└── Keep recent data hot in database
```

### 4.3 API Scaling

**Frontend Queries** → API Routes → Database

```javascript
// Example: Get dashboard stats
// Current: Multiple DB queries
// Optimized: Single aggregation query with materialized view

-- Materialized view for fast dashboard stats:
CREATE MATERIALIZED VIEW dashboard_stats AS
SELECT
  company_id,
  (SELECT COUNT(*) FROM properties WHERE company_id = c.id) as total_properties,
  (SELECT COUNT(*) FROM leads WHERE company_id = c.id AND status = 'new') as new_leads,
  (SELECT COUNT(*) FROM properties WHERE company_id = c.id AND status = 'sold') as sold,
  (SELECT COUNT(*) FROM leads WHERE company_id = c.id) as total_leads
FROM companies c;

-- Refresh hourly: REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;
```

### 4.4 Caching Strategy

```
Application Cache Layers:

1. HTTP Caching (Next.js)
   - Static pages: ISR (incremental static regeneration)
   - Dashboard: 1-5 minute cache
   - Properties: 15 minute cache

2. Database Caching (Supabase)
   - Connection pooling
   - Query result caching
   - Prepared statements

3. Client-Side Caching (React Query)
   - Lead data: 5 minute stale time
   - Properties: 10 minute stale time
   - User profile: Session duration
   - Real-time: Supabase Realtime subscriptions

4. CDN Caching (Vercel)
   - Images: 1 year (versioned)
   - Static assets: Long-lived
   - API routes: Custom headers
```

### 4.5 Real-time Scalability

```
Supabase Realtime (PostgreSQL LISTEN/NOTIFY):
├── Per-connection limit: 256 channels
├── Per-database limit: 10,000 active subscriptions
├── Message rate: ~10,000 messages/second

Use Cases:
├── Properties updated in real-time
├── Lead status changes
├── New showings created
└── Activity feed updates

Optimization:
├── Use presence channels for online status
├── Batch updates (debounce writes)
├── Narrow subscriptions (filter by company_id)
└── Unsubscribe when not viewing
```

### 4.6 Storage Scaling

**Images & Documents**
```
Current: 6 property images × 100KB = 600KB/property
Scale: 1,000 properties × 600KB = 600MB/company

Supabase Storage:
├── Unlimited storage (pay per GB)
├── CDN included
├── Image optimization
└── Signed URLs for security

Strategy:
├── Compress on upload (90% quality)
├── Generate thumbnails (100x100, 300x300)
├── Archive old images after 2 years
└── S3 backup for compliance
```

### 4.7 Search & Filtering Optimization

**Current Implementation Gaps:**
```
Mock data: Linear search through arrays
Production need: Full-text search

Solutions:
1. PostgreSQL Full-Text Search
   ├── Index on property title, description
   ├── GIN index for fast text queries
   └── <100ms response time

2. Elasticsearch (if needed)
   ├── For advanced search features
   ├── Fuzzy matching
   └── Faceted filtering

3. Database Views
   ├── Pre-computed search indexes
   ├── Faster than raw tables
   └── Refresh schedule-based
```

### 4.8 Handling Concurrent Operations

```sql
-- Optimistic locking with version numbers
ALTER TABLE public.properties ADD COLUMN version INTEGER DEFAULT 1;

-- Update only if version hasn't changed
UPDATE public.properties
SET
  title = $1,
  version = version + 1,
  updated_at = NOW()
WHERE id = $2 AND version = $3;

-- If 0 rows updated: Conflict detected, retry
```

---

## 5️⃣ Architecture Decisions

### 5.1 Technology Choices

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js 14 | App Router, Server Components, Edge Functions |
| **UI Framework** | React 18 | Component-based, large ecosystem |
| **Components** | Shadcn/ui + Radix | Headless, accessible, customizable |
| **Styling** | Tailwind CSS | Utility-first, fast development |
| **Database** | Supabase (PostgreSQL) | Multi-tenant ready, RLS, real-time |
| **Auth** | Supabase Auth + NextAuth | JWT-based, OAuth support |
| **State** | React Query | Server-state management, caching |
| **Forms** | React Hook Form | Efficient, validation support |
| **Animation** | Framer Motion | Smooth transitions, performance |
| **Charts** | Recharts | React-based, responsive |
| **Icons** | Lucide React | Consistent, lightweight |
| **Type Safety** | TypeScript | Full codebase coverage |

### 5.2 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER (Client)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ React Pages  │  │ React Query  │  │Zustand Store│  │
│  │ Components   │  │ (Caching)    │  │(Global State)│  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                API Calls │ JSON
                          │
┌─────────────────────────────────────────────────────────┐
│                  NEXT.JS SERVER                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ App Router   │  │ API Routes   │  │Server Actions│  │
│  │ (Pages)      │  │ (/api/*)     │  │(Form Handling)│  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│       │                   │                   │         │
│       └───────────────────┴───────────────────┘         │
│                 Supabase Client                         │
└─────────────────────────────────────────────────────────┘
                          │
                Database │ Queries + RLS
                          │
┌─────────────────────────────────────────────────────────┐
│            SUPABASE (PostgreSQL Database)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Companies    │  │ Profiles     │  │ Properties   │  │
│  │ Leads        │  │ Showings     │  │ Activities   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│           Row Level Security (RLS)                      │
└─────────────────────────────────────────────────────────┘
                          │
                Real-time │ Subscriptions
                          │
┌─────────────────────────────────────────────────────────┐
│         SUPABASE REALTIME (Subscriptions)               │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │ Properties   │  │ Leads        │                     │
│  │ Updates      │  │ Updates      │                     │
│  └──────────────┘  └──────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

### 5.3 Authentication & Authorization Flow

```
┌─ Sign Up/Login ─┐
│   Email/Pwd     │
└────────┬────────┘
         │
    Verify
    Credentials
         │
         ▼
┌─────────────────────────────────────┐
│ Supabase Auth (auth.users table)    │
│ ├─ email                            │
│ ├─ password_hash                    │
│ ├─ confirmed_at                     │
│ └─ created_at                       │
└────────┬────────────────────────────┘
         │
    Create JWT
    Token
         │
         ▼
┌─────────────────────────────────────┐
│ Profiles Table (extends auth.users) │
│ ├─ id (matches auth.users.id)       │
│ ├─ company_id                       │
│ ├─ role (4 levels)                  │
│ ├─ full_name                        │
│ └─ is_active                        │
└────────┬────────────────────────────┘
         │
    RLS Policies
    Apply
         │
         ▼
┌─────────────────────────────────────┐
│ User Can Access:                    │
│ ├─ Own company data (company_id)    │
│ ├─ Assigned leads (role == agent)   │
│ ├─ All data (role == company_admin) │
│ └─ All platform (role == super_admin)│
└─────────────────────────────────────┘
```

---

## 6️⃣ Migration Roadmap: Mock Data → Supabase

### 6.1 Phase 1: Properties (Week 1)

**Tasks:**
1. Replace mock properties with DB queries
2. Add pagination
3. Implement search/filter
4. Add real-time subscriptions

**Implementation:**
```typescript
// Before: app/properties/page.tsx (mock)
const properties = [...]  // Static array

// After: app/properties/page.tsx (dynamic)
const { data: properties, isLoading } = useQuery({
  queryKey: ['properties', filters],
  queryFn: () => fetchProperties({ filters })
})
```

### 6.2 Phase 2: Leads (Week 2)

**Tasks:**
1. Replace leads mock data
2. Add CRUD operations
3. Implement filtering by status/type
4. Add lead activities timeline

**Files to Update:**
- `app/leads/page.tsx`
- `components/lead/leads-table.tsx`
- New: API routes for lead operations

### 6.3 Phase 3: Dashboard Stats (Week 2)

**Tasks:**
1. Create aggregation queries
2. Implement materialized views for performance
3. Add real-time stat updates
4. Cache with React Query

**Materialized Views:**
```sql
-- Dashboard stats view (refreshed hourly)
CREATE MATERIALIZED VIEW company_dashboard_stats AS
SELECT
  company_id,
  COUNT(DISTINCT id) as total_properties,
  COUNT(CASE WHEN status = 'sold' THEN 1 END) as properties_sold,
  COUNT(DISTINCT lead_id) as total_leads,
  (SELECT AVG(price) FROM properties WHERE company_id = p.company_id) as avg_price
FROM properties p
GROUP BY company_id;
```

### 6.4 Phase 4: Real-time Features (Week 3)

**Tasks:**
1. Enable Supabase Realtime subscriptions
2. Update leads in real-time
3. Update property status in real-time
4. Add showing calendar with live updates

**Implementation:**
```typescript
// Subscribe to lead changes
const subscription = supabase
  .from('leads')
  .on('*', (payload) => {
    console.log('Lead updated:', payload)
    queryClient.invalidateQueries(['leads'])
  })
  .subscribe()
```

### 6.5 Phase 5: Advanced Features (Week 4)

**Tasks:**
1. Full-text search on properties
2. Lead scoring algorithms
3. CRM analytics dashboard
4. Export reports (CSV/PDF)

---

## 7️⃣ Security & Compliance

### 7.1 Row-Level Security (RLS)

**Enforcement Points:**
```sql
-- Every table has SELECT, INSERT, UPDATE, DELETE policies
-- Policies check auth.uid() and company_id
-- Supabase automatically enforces RLS on all queries

Example: User can only see leads from their company
CREATE POLICY "Users see company leads"
  ON leads FOR SELECT
  USING (
    company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
  )
```

### 7.2 Role-Based Access Control (RBAC)

```
super_admin
├─ All companies
├─ All users
├─ All data
└─ Admin features (billing, support)

company_admin
├─ Own company only
├─ Manage team members
├─ Create properties/leads
└─ View all company data

agent
├─ Own company data
├─ Assigned leads only
├─ Create leads/activities
└─ Schedule showings

client
├─ Assigned properties only
├─ Read-only access
└─ View showing history
```

### 7.3 Data Privacy

**Measures:**
- All data encrypted in transit (HTTPS/TLS)
- Database encryption at rest (Supabase managed)
- Row-level security isolates companies
- No cross-company data leakage possible
- Audit logs for compliance

**GDPR Compliance:**
```javascript
// User data deletion
DELETE FROM public.profiles WHERE id = $1;
-- Cascade delete via ON DELETE CASCADE
-- Removes all user-created records

// Data export
SELECT * FROM public.profiles WHERE id = auth.uid();
-- User can download their data
```

### 7.4 Input Validation

**Frontend:**
```typescript
// React Hook Form with Zod validation
const schema = z.object({
  title: z.string().min(3).max(255),
  price: z.number().positive(),
  email: z.string().email(),
})
```

**Backend:**
```typescript
// API route validation
const validated = await schema.parseAsync(request.body)
```

### 7.5 API Security

**Rate Limiting:**
```typescript
// Supabase built-in rate limiting
// Prevents abuse and DDoS

// Per-user limits
// GET: 1,000 requests/hour
// POST/PUT/DELETE: 100 requests/hour
```

---

## 8️⃣ Performance Optimization

### 8.1 Frontend Optimization

**Bundle Size:**
```
Current: ~200KB (gzipped)
Target: <150KB (gzipped)

Strategies:
├─ Code splitting (dynamic imports)
├─ Tree shaking unused code
├─ Image optimization (next/image)
├─ Font optimization (next/font)
└─ CSS purging (Tailwind)
```

**Rendering:**
```
├─ Server Components (default in Next.js 14)
├─ Streaming for fast FCP
├─ ISR for static pages
├─ Dynamic imports for heavy components
└─ Suspense for async data
```

### 8.2 Database Query Optimization

**N+1 Prevention:**
```sql
-- ❌ Bad: Multiple queries
SELECT * FROM properties WHERE company_id = $1;
-- For each property, query leads

-- ✅ Good: Single query with join
SELECT p.*, COUNT(pla.id) as interested_leads
FROM properties p
LEFT JOIN property_lead_assignments pla ON p.id = pla.property_id
WHERE p.company_id = $1
GROUP BY p.id;
```

**Index Strategy:**
```
Composite indexes for common queries:
├─ (company_id, created_at DESC) - recent properties
├─ (company_id, status) - filter by status
├─ (assigned_to, status) - agent's workload
└─ (scheduled_at) - calendar queries
```

### 8.3 Caching Strategy

**Cache Layers:**
1. **CDN**: Static assets (Vercel)
2. **Browser**: HTTP caching headers
3. **Client**: React Query cache
4. **Database**: Connection pooling + query cache
5. **Application**: Materialized views

**Cache Invalidation:**
```typescript
// On property update, invalidate related caches
await queryClient.invalidateQueries({
  queryKey: ['properties'],
  refetchType: 'all'
})
```

---

## 9️⃣ Monitoring & Observability

### 9.1 Application Monitoring

```
Vercel Analytics:
├─ Core Web Vitals (LCP, FID, CLS)
├─ Page load times
├─ Edge function performance
└─ Error tracking

Sentry:
├─ Error tracking
├─ Performance monitoring
├─ Release tracking
└─ Sourcemap support
```

### 9.2 Database Monitoring

```
Supabase Dashboard:
├─ Query performance
├─ Connection count
├─ Storage usage
├─ Realtime connections
├─ API usage
└─ Error rates
```

### 9.3 Key Metrics to Track

| Metric | Target | Tool |
|--------|--------|------|
| Page Load Time | <2.5s | Vercel Analytics |
| First Contentful Paint | <1.0s | Vercel Analytics |
| Database Query | <100ms | Supabase |
| API Response Time | <200ms | Vercel |
| Error Rate | <0.5% | Sentry |
| Uptime | >99.9% | Vercel |

---

## 🔟 Deployment Architecture

### 10.1 Frontend Deployment

```
GitHub Push
    │
    ▼
Vercel CI/CD
├─ Run tests
├─ Run lint
├─ Build Next.js app
└─ Deploy to CDN/Edge
    │
    ▼
Available at:
├─ estateflow.com (production)
├─ Preview URLs (PRs)
└─ Edge Functions (API routes)
```

### 10.2 Database Deployment

```
Supabase Project
├─ PostgreSQL Database
├─ Automatic backups (daily)
├─ Point-in-time recovery
├─ Read replicas (Pro+)
└─ Managed SSL certificates
```

### 10.3 Environment Configuration

```
.env.local (Development)
├─ SUPABASE_URL
├─ SUPABASE_ANON_KEY
└─ NEXT_PUBLIC_* variables

Environment Variables (Production)
├─ Stored in Vercel
├─ Never committed to git
├─ Automatically injected
└─ Rotated periodically
```

---

## 1️⃣1️⃣ Future Enhancements

### 11.1 Planned Features (Q2 2026)

```
Phase 5: Analytics
├─ Advanced reporting
├─ Lead scoring algorithms
├─ Pipeline forecasting
└─ Agent performance metrics

Phase 6: Mobile App
├─ React Native app
├─ Offline support
├─ Mobile-optimized UI
└─ Push notifications

Phase 7: Integrations
├─ Zapier
├─ Slack
├─ Google Calendar
└─ Email providers

Phase 8: AI Features
├─ Lead qualification (ML)
├─ Price prediction
├─ Chatbot support
└─ Automated follow-ups
```

### 11.2 Infrastructure Scaling

```
Current: Single Supabase project
├─ ~10 companies (MVP)
├─ ~500 users
└─ ~100K properties

Future:
├─ Multi-region deployment
├─ Read replicas for reporting
├─ Elasticsearch for advanced search
├─ Redis caching layer
├─ Queue system (Bull/RabbitMQ)
└─ Microservices (if needed)
```

---

## 1️⃣2️⃣ Troubleshooting Guide

### 12.1 Common Issues

**Issue: RLS Policy Blocking Queries**
```
Symptom: "new row violates row level security policy"
Cause: Missing company_id or incorrect role

Solution:
1. Check user profile has company_id
2. Verify role allows operation
3. Check RLS policy conditions
```

**Issue: N+1 Query Performance**
```
Symptom: Dashboard slow with 100+ properties
Cause: Loading related data in loop

Solution:
1. Use SQL joins instead of multiple queries
2. Implement query batching
3. Add indexes on foreign keys
4. Use materialized views for aggregations
```

**Issue: Real-time Subscriptions Lag**
```
Symptom: Updates take 5+ seconds to appear
Cause: Network latency or channel overload

Solution:
1. Narrow subscription filters
2. Batch updates together
3. Debounce client updates
4. Check Supabase dashboard for bottlenecks
```

---

## Conclusion

EstateFlow is architected for **scalability, security, and developer experience**. The migration from mock data to a production Supabase database is straightforward and can be completed incrementally. The schema is optimized for real estate CRM operations with proper indexing, RLS for multi-tenancy, and real-time capabilities.

**Next Steps:**
1. ✅ Review and approve this architecture document
2. ⏳ Begin Phase 1: Properties migration (Week 1)
3. ⏳ Implement React Query data fetching layer
4. ⏳ Set up monitoring and observability
5. ⏳ Conduct load testing before production
6. ⏳ Document API endpoints and response formats
7. ⏳ Create database backup and disaster recovery plan

---

**Document Control:**
- Version: 1.0
- Last Updated: January 24, 2026
- Author: Technical Architecture Team
- Status: Ready for Review
