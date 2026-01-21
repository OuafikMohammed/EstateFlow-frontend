# Architecture Diagram & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                            │
│  - React Components                                              │
│  - Forms (Signup, Login)                                         │
│  - Property List, Leads, Clients                                 │
└──────────────────┬──────────────────────────────────────────────┘
                   │ HTTPS Only
                   │
┌──────────────────▼──────────────────────────────────────────────┐
│              NEXT.JS 16 (Edge Runtime)                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Middleware (middleware.ts)                               │  │
│  │  - Route protection                                       │  │
│  │  - Session management                                     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Security Layer (lib/security/)                           │  │
│  │  - Rate Limiter: Token bucket, per-IP, per-user          │  │
│  │  - Validation: Zod schemas                               │  │
│  │  - Security Utils: Headers, CORS, masking                │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  API Routes (app/api/)                                    │  │
│  │  - /auth/signup    [POST, Rate limit 3/hr]               │  │
│  │  - /auth/login     [POST, Rate limit 5/15min]            │  │
│  │  - /properties     [GET/POST, Rate limit 1000/min]       │  │
│  │  - /leads          [GET/POST, Rate limit 1000/min]       │  │
│  │  - /clients        [GET/POST, Rate limit 1000/min]       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Supabase Integration (lib/supabase/)                     │  │
│  │  - Auth Handler: User signup/login                       │  │
│  │  - Data Fetching: Type-safe RLS queries                  │  │
│  │  - Server: Admin operations                              │  │
│  │  - Client: Real-time subscriptions                       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Components (components/)                                 │  │
│  │  - Auth: Signup/Login forms                              │  │
│  │  - Property: List, detail, create                        │  │
│  │  - Leads: List, activity                                 │  │
│  │  - Clients: Table, management                            │  │
│  │  - Dashboard: Stats, charts                              │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
└──────────────────┬──────────────────────────────────────────────┘
                   │ RESTful API
                   │
┌──────────────────▼──────────────────────────────────────────────┐
│            SUPABASE (Backend-as-a-Service)                       │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Authentication (Auth)                                    │  │
│  │  - JWT tokens                                             │  │
│  │  - Email verification                                     │  │
│  │  - Password reset                                         │  │
│  │  - OAuth (Google)                                         │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database                                      │  │
│  │  - profiles (users)                                       │  │
│  │  - companies (multi-tenant)                               │  │
│  │  - properties (listings)                                  │  │
│  │  - leads (lead management)                                │  │
│  │  - lead_activities (activity log)                         │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  RLS Policies (Row Level Security)                        │  │
│  │  - Agents see company data only                           │  │
│  │  - Clients see assigned properties only                   │  │
│  │  - Company admins see all company data                    │  │
│  │  - Enforced at database level                             │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Real-time (Subscriptions)                                │  │
│  │  - Property updates                                       │  │
│  │  - Lead status changes                                    │  │
│  │  - Activity notifications                                 │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌──────────────────┐
│  User Signup     │
└────────┬─────────┘
         │
         ▼
    ┌─────────────────────────────────────┐
    │ POST /api/auth/signup               │
    │ - Validate input (Zod)              │
    │ - Check rate limit                  │
    └────────┬────────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────────┐
    │ Create Auth User (Supabase)          │
    │ - Hash password (bcryptjs)           │
    │ - Generate JWT token                 │
    │ - Mark email unverified              │
    └────────┬─────────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────────┐
    │ Create Company                       │
    │ - From company name input            │
    │ - Set user as admin                  │
    └────────┬─────────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────────┐
    │ Create User Profile                  │
    │ - Link to user ID                    │
    │ - Link to company ID                 │
    │ - Set role (company_admin)           │
    │ - Set active status                  │
    └────────┬─────────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────────┐
    │ Return Success                       │
    │ - User ID                            │
    │ - Message: Confirm email             │
    │ - Status: 201 Created                │
    └──────────────────────────────────────┘
```

## Login Flow

```
┌──────────────────┐
│  User Login      │
└────────┬─────────┘
         │
         ▼
    ┌─────────────────────────────────────┐
    │ POST /api/auth/login                │
    │ - Validate input (Zod)              │
    │ - Check rate limit (5/15min/IP)     │
    └────────┬────────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────────┐
    │ Query Profile by Email               │
    │ - Check if exists                    │
    │ - Check if active                    │
    │ - Timing-safe comparison             │
    └────────┬─────────────────────────────┘
             │
             ├─→ Not found? Return generic error
             │   (prevents user enumeration)
             │
             └─→ Found & Active?
                 │
                 ▼
            ┌──────────────────────────────┐
            │ Return User ID               │
            │ - Status: 200 OK             │
            │ - Browser creates JWT token  │
            │ - Redirect to /dashboard     │
            └──────────────────────────────┘
```

## Data Fetching Flow (Authenticated)

```
┌────────────────────┐
│  User Component    │
│  (e.g., Properties)│
└────────┬───────────┘
         │
         ▼
    ┌──────────────────────────────────┐
    │ Server Component                 │
    │ (app/properties/page.tsx)        │
    └────────┬───────────────────────┘
             │
             ▼
    ┌──────────────────────────────────┐
    │ Get Authenticated User           │
    │ (from JWT cookie)                │
    │ - Verify token validity          │
    │ - Extract user ID                │
    └────────┬───────────────────────┘
             │
             ├─→ Not authenticated?
             │   Redirect to /login
             │
             └─→ Authenticated?
                 │
                 ▼
            ┌──────────────────────────────┐
            │ Fetch User Profile           │
            │ (get company_id)             │
            └────────┬────────────────────┘
                     │
                     ▼
            ┌──────────────────────────────────┐
            │ Query Properties Table with RLS  │
            │ - Filter: company_id = user's    │
            │ - RLS enforces at DB level       │
            │ - Cannot bypass or see others    │
            │ - Pagination (20 per page)       │
            └────────┬─────────────────────────┘
                     │
                     ▼
            ┌──────────────────────────────────┐
            │ Return Results to Component      │
            │ - Type-safe data                 │
            │ - Already filtered by company    │
            │ - Render with loading state      │
            └──────────────────────────────────┘
```

## Security Decision Tree

```
┌─────────────────────────────┐
│ Request Received            │
└────────────┬────────────────┘
             │
             ▼
        ┌────────────────────────────┐
        │ Rate Limit Check           │
        │ (per-IP, per-user)         │
        └─┬──────────────────────────┘
          │
          ├─→ Limit exceeded?
          │   Return 429 Too Many Requests
          │   Include Retry-After header
          │
          └─→ Within limit?
              │
              ▼
         ┌────────────────────────────┐
         │ Input Validation (Zod)     │
         │ - Email format             │
         │ - Password strength        │
         │ - Field constraints        │
         └─┬──────────────────────────┘
           │
           ├─→ Validation failed?
           │   Return 400 Bad Request
           │   Include field-level errors
           │
           └─→ Validation passed?
               │
               ▼
          ┌────────────────────────────┐
          │ Authentication Check       │
          │ (for protected endpoints)  │
          └─┬──────────────────────────┘
            │
            ├─→ No auth or invalid?
            │   Return 401 Unauthorized
            │
            └─→ Valid auth?
                │
                ▼
           ┌────────────────────────────┐
           │ Authorization Check (RLS)  │
           │ - Database enforces access │
           │ - User sees only own data  │
           └─┬──────────────────────────┘
             │
             ├─→ Not authorized?
             │   Return 403 Forbidden
             │
             └─→ Authorized?
                 │
                 ▼
            ┌────────────────────────────┐
            │ Process Request            │
            │ - Execute operation        │
            │ - Return 200/201           │
            └────────────────────────────┘
```

## Database RLS Example

```sql
-- Company Admin sees all company data
CREATE POLICY "company_admin_access" ON public.properties
  FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid())
    = 'company_admin'
    AND company_id = (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Agent sees company data
CREATE POLICY "agent_access" ON public.properties
  FOR SELECT USING (
    company_id = (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Client sees assigned properties only
CREATE POLICY "client_access" ON public.properties
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.client_id = auth.uid()
      AND leads.interested_property_id = properties.id
    )
  );
```

## Error Handling Flow

```
┌──────────────┐
│ Error Occurs │
└────────┬─────┘
         │
         ▼
    ┌─────────────────────────────────────┐
    │ Is it a known error?                │
    │ (validation, rate limit, auth)      │
    └─┬───────────────────────────────────┘
      │
      ├─→ Yes: Return specific error
      │   - 400: Validation Error
      │   - 401: Unauthorized
      │   - 403: Forbidden
      │   - 429: Rate Limited
      │
      └─→ No: Unknown error
          │
          ▼
      ┌───────────────────────────────┐
      │ Log Error Details             │
      │ (with masked sensitive data)  │
      └─┬─────────────────────────────┘
        │
        ▼
      ┌───────────────────────────────┐
      │ Return Generic Error to User  │
      │ "An error occurred"           │
      │ Status: 500                   │
      │ (Prevents info disclosure)    │
      └───────────────────────────────┘
```

---

## Key Improvements Summary

| Area | Before | After |
|------|--------|-------|
| **Auth** | Mock users in code | Supabase with RLS |
| **Rate Limiting** | None | Per-IP & per-user |
| **Validation** | None | Zod schemas |
| **Access Control** | Frontend only | Database RLS |
| **Password Security** | Plain text | bcryptjs (12 rounds) |
| **Data Isolation** | None | Multi-tenant |
| **Error Messages** | Detailed | Generic (safe) |
| **Security Headers** | Missing | Comprehensive |

---

This architecture ensures:
- ✅ No unauthorized access
- ✅ No brute force attacks
- ✅ No injection attacks
- ✅ No user enumeration
- ✅ No data leaks
- ✅ Scalable and maintainable
