# EstateFlow Phase 1 - Quick Reference Guide

**Phase**: Complete Migration from Mock Data to Supabase  
**Duration**: Single Implementation Session  
**Status**: ✅ Complete & Ready for Testing

---

## 📚 New Files Added

### Type Definitions
```
lib/types/
├── database.ts          (Database entity types)
└── api-responses.ts     (API request/response types)
```

### Utilities
```
lib/utils/
└── api.ts               (HTTP client with typed methods)
```

### Hooks
```
hooks/
└── use-data.ts          (React Query hooks - 17 hooks total)
```

### API Routes
```
app/api/
├── dashboard/route.ts
├── leads/route.ts
├── leads/[id]/route.ts
└── properties/[id]/route.ts
```

---

## 🔄 Component Changes

### Files Modified (6 total)

| File | Change | Impact |
|------|--------|--------|
| `app/properties/page.tsx` | Mock → useProperties() | Real properties + pagination |
| `app/dashboard/page.tsx` | Mock stats → useDashboardStats() | Real dashboard stats |
| `app/leads/page.tsx` | Mock stats → useDashboardStats() | Real leads stats |
| `components/lead/leads-table.tsx` | Mock leads → useLeads() | Real leads table + pagination |
| `components/dashboard/recent-leads-table.tsx` | Mock → useRecentLeads() | Real recent leads widget |
| `components/dashboard/chart-section.tsx` | Mock data → useLeadsTimeline() + usePropertyBreakdown() | Real charts |

---

## 🎣 Using the Hooks

### Get Properties List
```typescript
const { data: propertiesData, isLoading, error } = useProperties({
  page: 1,
  limit: 20,
  status: 'available',
  propertyType: 'apartment',
  searchQuery: 'casablanca'
})

const properties = propertiesData?.items || []
```

### Get Leads List
```typescript
const { data: leadsData, isLoading, error } = useLeads({
  page: 1,
  limit: 20,
  status: 'new',
  searchQuery: 'sarah'
})

const leads = leadsData?.items || []
```

### Get Dashboard Stats
```typescript
const { data: stats, isLoading } = useDashboardStats()

// Returns: {
//   total_properties: number,
//   total_leads: number,
//   new_leads: number,
//   closed_won_leads: number,
//   properties_sold: number,
//   total_revenue: number
// }
```

### Get Timeline Data
```typescript
const { data: timelineData, isLoading } = useLeadsTimeline(30)
// Returns array of: { name, leads, ... }
```

### Create Property
```typescript
const mutation = useCreateProperty()

const handleCreate = async () => {
  await mutation.mutate({
    title: "New Property",
    address: "123 Street",
    city: "Casablanca",
    // ... other fields
  })
}
```

### Delete Lead
```typescript
const mutation = useDeleteLead()

const handleDelete = (leadId) => {
  mutation.mutate(leadId)
}
```

---

## 🔗 API Endpoints Reference

### Properties
```
GET    /api/properties?page=1&limit=20&status=available
GET    /api/properties/:id
POST   /api/properties
PUT    /api/properties/:id
DELETE /api/properties/:id
```

### Leads
```
GET    /api/leads?page=1&status=new
GET    /api/leads/:id
POST   /api/leads
PUT    /api/leads/:id
DELETE /api/leads/:id
PATCH  /api/leads/:id/status
```

### Dashboard
```
GET    /api/dashboard
```

---

## 📊 Data Structure Examples

### Property Response
```typescript
{
  id: "uuid",
  title: "Modern Apartment",
  price: 2500000,
  address: "123 Street",
  city: "Casablanca",
  bedrooms: 3,
  bathrooms: 2,
  square_feet: 120,
  property_type: "apartment",
  status: "available",
  images: ["url1", "url2"],
  created_at: "2024-01-24T10:00:00Z",
  updated_at: "2024-01-24T10:00:00Z"
}
```

### Lead Response
```typescript
{
  id: "uuid",
  first_name: "Sarah",
  last_name: "Mohammed",
  email: "sarah@example.com",
  phone: "+212 600 111222",
  status: "new",
  budget_min: 1000000,
  budget_max: 3000000,
  interested_types: ["apartment", "condo"],
  preferred_cities: ["Casablanca", "Rabat"],
  created_at: "2024-01-24T10:00:00Z",
  updated_at: "2024-01-24T10:00:00Z"
}
```

### Dashboard Stats Response
```typescript
{
  total_properties: 47,
  total_leads: 156,
  new_leads: 23,
  closed_won_leads: 12,
  properties_sold: 8,
  total_revenue: 420000000 // in DH
}
```

---

## ⚙️ Configuration

### Cache Times
- **Properties**: 5 min stale, 10 min cache
- **Leads**: 5 min stale, 10 min cache
- **Dashboard**: 15 min stale, 30 min cache
- **Charts**: 30 min stale, 60 min cache

### Pagination
- **Default**: 20 items per page
- **Maximum**: 100 items per page
- **Min**: 1 item per page

### Filters
- **Status**: available, sold, reserved, etc.
- **Type**: apartment, house, commercial, land, condo, multi_family
- **Status**: new, contacted, qualified, proposal_sent, negotiating, closed_won, closed_lost

---

## 🚨 Common Errors & Fixes

### "Unauthorized" Error
**Cause**: User not authenticated  
**Fix**: Check auth.getUser() returns a user, verify JWT token valid

### "User company not found"
**Cause**: Profile record doesn't have company_id  
**Fix**: Ensure profile created with company_id during signup

### "No properties found"
**Cause**: Empty database or wrong company_id  
**Fix**: Create sample data or verify company isolation

### "Too Many Requests"
**Cause**: Rate limit exceeded  
**Fix**: Wait before retrying, reduce request frequency

### Components Show Old Mock Data
**Cause**: Component not updated to use hook  
**Fix**: Remove hardcoded arrays, add useProperties/useLeads hook

---

## 🔍 Debugging Tips

### Check Network Tab
1. Open DevTools → Network tab
2. Look for `/api/properties`, `/api/leads` requests
3. Check response payload
4. Verify response times < 200ms

### Check Console
1. Look for console errors
2. Check for unhandled promise rejections
3. Verify no TypeScript errors

### React Query DevTools
1. Install `@tanstack/react-query-devtools` (optional)
2. See all queries and their state
3. Manually refetch or invalidate

### Supabase Dashboard
1. Go to Supabase console
2. Check Auth → Users (verify login)
3. Check Database → Tables (verify data)
4. Check RLS → Policies (verify permissions)

---

## 📋 Code Snippets

### Error Boundary for Components
```typescript
'use client'

export function MyComponent() {
  const { data, isLoading, error } = useProperties()
  
  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorAlert error={error} />
  if (!data?.items.length) return <EmptyState />
  
  return <DataDisplay items={data.items} />
}
```

### Mutation with Feedback
```typescript
const createMutation = useCreateProperty()

const handleSubmit = async (formData) => {
  try {
    await createMutation.mutateAsync(formData)
    toast.success("Property created!")
    router.push('/properties')
  } catch (error) {
    toast.error("Failed to create property")
  }
}
```

### Filtering with URLSearchParams
```typescript
const [filters, setFilters] = useState({
  page: 1,
  status: undefined,
  searchQuery: ''
})

const { data } = useLeads(filters)

// User selects status
const handleStatusChange = (status) => {
  setFilters(prev => ({ ...prev, status, page: 1 }))
}
```

---

## ✅ Testing Checklist

Before marking as complete:

- [ ] Properties page loads with database data
- [ ] Leads page loads with database data  
- [ ] Dashboard shows correct statistics
- [ ] Charts display real data
- [ ] Pagination works correctly
- [ ] Filters work correctly
- [ ] Search works correctly
- [ ] Loading states show
- [ ] Error states handled
- [ ] Delete actions work
- [ ] No console errors
- [ ] API response times acceptable
- [ ] Mobile responsive
- [ ] RLS policies working

---

## 📞 Need Help?

### Key Files to Reference

**How to add a new endpoint?**
→ See `app/api/properties/route.ts` as example

**How to create a hook?**
→ See `hooks/use-data.ts` useProperties() hook

**Type definitions?**
→ See `lib/types/database.ts` Property interface

**API client pattern?**
→ See `lib/utils/api.ts` propertiesApi object

---

## 🎉 What's Next?

### Phase 2 (Next Sprint)
- [ ] Create Detail Pages (single property, single lead)
- [ ] Implement Create/Edit Forms
- [ ] Add Lead Activities timeline
- [ ] Implement Showings/Calendar
- [ ] Add Real-time updates

### Phase 3 (Following Sprint)
- [ ] Property-Lead assignments
- [ ] Advanced search
- [ ] Analytics dashboard
- [ ] Team management
- [ ] Notifications

---

**Last Updated**: January 24, 2026  
**Status**: Phase 1 Complete ✅  
**Ready For**: Phase 2 Planning
