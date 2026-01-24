# Testing & Validation Strategy

**Project**: EstateFlow Integration  
**Document**: Complete QA & Testing Plan  
**Created**: January 24, 2026

---

## TABLE OF CONTENTS

1. [Testing Framework](#testing-framework)
2. [Unit Testing Strategy](#unit-testing-strategy)
3. [Integration Testing Strategy](#integration-testing-strategy)
4. [E2E Testing Strategy](#e2e-testing-strategy)
5. [Performance Testing](#performance-testing)
6. [Security Testing](#security-testing)
7. [Accessibility Testing](#accessibility-testing)
8. [RLS Policy Validation](#rls-policy-validation)
9. [Test Scenarios](#test-scenarios)
10. [Regression Testing](#regression-testing)
11. [Deployment Validation](#deployment-validation)

---

## TESTING FRAMEWORK

### Recommended Tools

| Layer | Tool | Purpose |
|-------|------|---------|
| Unit | Vitest or Jest | Test individual functions |
| Component | React Testing Library | Test components |
| API | Supertest or MSW | Test endpoints |
| E2E | Playwright or Cypress | Full user workflows |
| Performance | Lighthouse, Web Vitals | Monitor metrics |
| Security | Burp Suite, OWASP ZAP | Penetration testing |

### Setup Requirements

```bash
# Install testing dependencies
npm install --save-dev vitest react-testing-library msw playwright

# Setup test structure
mkdir -p __tests__/unit __tests__/integration __tests__/e2e
```

---

## UNIT TESTING STRATEGY

### 1. Utility Functions Tests

**File**: `__tests__/unit/utils.test.ts`

```typescript
describe('api-client', () => {
  describe('apiCall', () => {
    it('should successfully fetch and return data', async () => {
      const data = await apiCall('/api/properties')
      expect(data).toBeDefined()
      expect(data.success).toBe(true)
    })
    
    it('should retry on 5xx errors', async () => {
      // Mock failing first, succeeding on retry
      // Verify retry happened
    })
    
    it('should throw on 4xx errors without retry', async () => {
      // Should not retry 400, 401, 403, 404
    })
    
    it('should handle timeout', async () => {
      // Test timeout handling
    })
  })
  
  describe('buildQueryString', () => {
    it('should build correct query string', () => {
      const result = buildQueryString({
        page: 1,
        limit: 20,
        status: 'available'
      })
      expect(result).toBe('page=1&limit=20&status=available')
    })
    
    it('should skip undefined values', () => {
      const result = buildQueryString({
        page: 1,
        filter: undefined
      })
      expect(result).toBe('page=1')
    })
  })
  
  describe('validators', () => {
    it('should validate email', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('invalid')).toBe(false)
    })
    
    it('should validate phone', () => {
      expect(isValidPhone('1234567890')).toBe(true)
      expect(isValidPhone('abc')).toBe(false)
    })
  })
})
```

### 2. Hook Tests

**File**: `__tests__/unit/hooks.test.ts`

```typescript
describe('useDebounce', () => {
  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(() => useDebounce('test', 300))
    
    expect(result.current).toBe('') // Initial value
    
    // Change value
    rerender()
    
    // Wait for debounce
    await waitFor(() => {
      expect(result.current).toBe('test')
    }, { timeout: 400 })
  })
  
  it('should cancel debounce on unmount', () => {
    // Verify cleanup
  })
})

describe('useErrorHandler', () => {
  it('should set error state', () => {
    const { result } = renderHook(() => useErrorHandler())
    
    act(() => {
      result.current.setError('Test error')
    })
    
    expect(result.current.error).toBe('Test error')
  })
  
  it('should clear error', () => {
    const { result } = renderHook(() => useErrorHandler())
    
    act(() => {
      result.current.setError('Test error')
      result.current.clearError()
    })
    
    expect(result.current.error).toBeNull()
  })
})
```

### 3. Type Validation Tests

**File**: `__tests__/unit/types.test.ts`

```typescript
describe('Type Definitions', () => {
  it('should have all Property required fields', () => {
    const property: Property = {
      id: '1',
      company_id: '1',
      title: 'Test',
      price: 100,
      // ... all required fields
    }
    expect(property).toBeDefined()
  })
  
  it('should allow optional fields', () => {
    const property: Partial<Property> = {
      title: 'Test'
    }
    expect(property.title).toBe('Test')
  })
})
```

---

## INTEGRATION TESTING STRATEGY

### 1. API Route Tests

**File**: `__tests__/integration/api-properties.test.ts`

```typescript
import { createMocks } from 'node-mocks-http'
import { GET, POST } from '@/app/api/properties/route'

describe('GET /api/properties', () => {
  beforeEach(() => {
    // Setup Supabase mock
    // Create test user and company
  })
  
  it('should return 401 without auth', async () => {
    const { req, res } = createMocks({
      method: 'GET'
    })
    
    await GET(req)
    
    expect(res._getStatusCode()).toBe(401)
  })
  
  it('should return properties for authenticated user', async () => {
    // Mock auth
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token'
      }
    })
    
    await GET(req)
    
    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data)).toBe(true)
  })
  
  it('should respect pagination', async () => {
    // Should return page 1 by default (20 items)
    // Should respect limit parameter
    // Should skip to correct offset
  })
  
  it('should filter by status', async () => {
    // Should only return properties with matching status
  })
  
  it('should filter by multiple criteria', async () => {
    // Should AND criteria together
  })
  
  it('should not leak other company data', async () => {
    // User from Company A should not see Company B data
  })
})

describe('POST /api/properties', () => {
  it('should create property with valid data', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        title: 'New Property',
        price: 100000,
        address: '123 Main St',
        city: 'Boston',
        property_type: 'house',
        status: 'available'
      }
    })
    
    await POST(req)
    
    expect(res._getStatusCode()).toBe(201)
    const data = JSON.parse(res._getData())
    expect(data.data.id).toBeDefined()
  })
  
  it('should reject invalid data', async () => {
    // Missing required fields
    // Invalid enums
    // Invalid formats
  })
  
  it('should validate required fields', async () => {
    // title required
    // price required
    // address required
  })
})
```

### 2. Hook Integration Tests

**File**: `__tests__/integration/hooks-integration.test.ts`

```typescript
describe('useProperties Integration', () => {
  beforeEach(() => {
    // Setup React Query client
    // Setup MSW server for API mocks
  })
  
  it('should fetch and cache properties', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useProperties())
    
    expect(result.current.isLoading).toBe(true)
    
    await waitForNextUpdate()
    
    expect(result.current.isLoading).toBe(false)
    expect(result.current.data.data).toHaveLength(20)
  })
  
  it('should apply filters', async () => {
    const { result, rerender } = renderHook(
      ({ filters }) => useProperties(filters),
      { initialProps: { filters: {} } }
    )
    
    await waitFor(() => !result.current.isLoading)
    const initialCount = result.current.data.data.length
    
    // Apply filter
    rerender({ filters: { status: 'sold' } })
    
    await waitFor(() => !result.current.isLoading)
    expect(result.current.data.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ status: 'sold' })
      ])
    )
  })
  
  it('should refetch when filters change', async () => {
    // Verify React Query key invalidation
  })
  
  it('should use cache on repeated calls', async () => {
    // First call fetches
    // Second call returns cached data
    // No duplicate requests
  })
})
```

### 3. Database Function Tests

**File**: `__tests__/integration/db-functions.test.ts`

```typescript
describe('Database Functions', () => {
  beforeEach(async () => {
    // Connect to test Supabase
    // Seed test data
  })
  
  describe('get_leads_stats', () => {
    it('should return correct counts', async () => {
      // Create 5 new leads
      // Create 3 contacted leads
      // Create 2 qualified leads
      
      const stats = await supabase.rpc('get_leads_stats', {
        p_company_id: testCompanyId
      })
      
      expect(stats.data[0].total_leads).toBe(10)
      expect(stats.data[0].new_count).toBe(5)
      expect(stats.data[0].contacted_count).toBe(3)
      expect(stats.data[0].qualified_count).toBe(2)
    })
    
    it('should handle empty company', async () => {
      const stats = await supabase.rpc('get_leads_stats', {
        p_company_id: emptyCompanyId
      })
      
      expect(stats.data[0].total_leads).toBe(0)
    })
  })
  
  describe('Full-text search', () => {
    it('should find properties by title', async () => {
      // Create property with title "Modern Apartment"
      // Search for "modern"
      // Should find it
    })
    
    it('should find properties by city', async () => {
      // Search for city name
      // Should return matching properties
    })
  })
})
```

---

## E2E TESTING STRATEGY

### 1. Critical User Journeys

**File**: `__tests__/e2e/user-journeys.test.ts`

Using Playwright or Cypress:

```typescript
test.describe('Agent Properties Workflow', () => {
  test('should view, filter, and create properties', async ({ page, context }) => {
    // Login as agent
    await page.goto('/login')
    await page.fill('input[name="email"]', 'agent@company.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Wait for navigation
    await page.waitForURL('/dashboard')
    
    // Navigate to properties
    await page.click('a:has-text("Properties")')
    await page.waitForURL('/properties')
    
    // Verify properties displayed
    const propertyCards = await page.locator('[data-testid="property-card"]')
    expect(propertyCards).not.toHaveCount(0)
    
    // Filter by status
    await page.selectOption('[data-testid="status-filter"]', 'available')
    
    // Verify filter applied
    await page.waitForTimeout(500) // Wait for search
    const filteredCards = await page.locator('[data-testid="property-card"]')
    // All cards should have status="available"
    
    // Create new property
    await page.click('button:has-text("New Property")')
    await page.fill('input[name="title"]', 'Beautiful Modern Home')
    await page.fill('input[name="price"]', '500000')
    await page.fill('input[name="address"]', '123 Main St')
    await page.selectOption('select[name="type"]', 'house')
    await page.click('button[type="submit"]')
    
    // Verify success
    await page.waitForURL('/properties')
    expect(page.locator('text=Property created')).toBeVisible()
    
    // Verify new property appears in list
    expect(
      page.locator('text=Beautiful Modern Home')
    ).toBeVisible()
  })
})

test.describe('Lead Management Workflow', () => {
  test('should create, view, and update leads', async ({ page }) => {
    // Login
    await login(page, 'agent@company.com')
    
    // Navigate to leads
    await page.click('a:has-text("Leads")')
    
    // Verify stats are displayed
    expect(page.locator('[data-testid="leads-total"]')).toBeTruthy()
    
    // Create lead
    await page.click('button:has-text("New Lead")')
    await page.fill('input[name="firstName"]', 'John')
    await page.fill('input[name="lastName"]', 'Doe')
    await page.fill('input[name="email"]', 'john@example.com')
    await page.fill('input[name="phone"]', '1234567890')
    await page.click('button[type="submit"]')
    
    // Verify in list
    expect(page.locator('text=John Doe')).toBeVisible()
    
    // Click to view detail
    await page.click('[data-testid="lead-john-doe"]')
    
    // Should see detail page
    expect(page.url()).toContain('/leads/')
    
    // Add activity
    await page.click('button:has-text("Add Activity")')
    await page.selectOption('[name="type"]', 'call')
    await page.fill('[name="title"]', 'Initial conversation')
    await page.click('button[type="submit"]')
    
    // Verify activity in timeline
    expect(page.locator('text=Initial conversation')).toBeVisible()
    
    // Update status
    await page.selectOption('[name="status"]', 'contacted')
    await page.click('button:has-text("Update")')
    
    // Go back to leads
    await page.click('a:has-text("Leads")')
    
    // Verify status updated in list
    expect(
      page.locator('text=John Doe').locator('text=Contacted')
    ).toBeVisible()
  })
})

test.describe('Dashboard Real-time Updates', () => {
  test('should reflect changes in real-time', async ({ context }) => {
    // Open two browser contexts
    const page1 = await context.newPage()
    const page2 = await context.newPage()
    
    // Both login as same user
    await login(page1, 'admin@company.com')
    await login(page2, 'admin@company.com')
    
    // Both on dashboard
    await page1.goto('/dashboard')
    await page2.goto('/dashboard')
    
    // Get initial stats
    const stats1Before = await page1.locator('[data-testid="total-leads"]').textContent()
    const stats2Before = await page2.locator('[data-testid="total-leads"]').textContent()
    
    expect(stats1Before).toBe(stats2Before)
    
    // Create lead in page1
    await page1.click('button:has-text("New Lead")')
    await page1.fill('input[name="firstName"]', 'New')
    await page1.fill('input[name="lastName"]', 'Lead')
    await page1.fill('input[name="email"]', 'new@example.com')
    await page1.fill('input[name="phone"]', '1111111111')
    await page1.click('button[type="submit"]')
    
    // Wait for real-time update in page2
    const stats2After = await page2.locator('[data-testid="total-leads"]')
      .textContent({ timeout: 3000 })
    
    const newCount = parseInt(stats1Before || '0') + 1
    expect(stats2After).toContain(String(newCount))
  })
})
```

### 2. Error Scenarios

**File**: `__tests__/e2e/error-scenarios.test.ts`

```typescript
test.describe('Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    await page.context().setOffline(true)
    
    // Try to fetch properties
    await page.goto('/properties')
    
    // Should show error message
    expect(page.locator('text=Connection error')).toBeVisible()
    
    // Should show retry button
    expect(page.locator('button:has-text("Retry")')).toBeVisible()
    
    // Go back online
    await page.context().setOffline(false)
    
    // Retry should work
    await page.click('button:has-text("Retry")')
    
    // Should load properties
    expect(page.locator('[data-testid="property-card"]')).toBeTruthy()
  })
  
  test('should handle 401 unauthorized', async ({ page }) => {
    // Expire session
    await page.context().clearCookies()
    
    // Try to access protected page
    await page.goto('/properties')
    
    // Should redirect to login
    expect(page.url()).toContain('/login')
  })
  
  test('should handle 404 not found', async ({ page }) => {
    await login(page, 'agent@company.com')
    
    // Try to access non-existent property
    await page.goto('/properties/invalid-id-123')
    
    // Should show error
    expect(page.locator('text=Not found')).toBeVisible()
  })
  
  test('should handle validation errors', async ({ page }) => {
    await login(page, 'agent@company.com')
    await page.goto('/properties/new')
    
    // Submit without filling required fields
    await page.click('button[type="submit"]')
    
    // Should show validation errors
    expect(page.locator('text=Title is required')).toBeVisible()
    expect(page.locator('text=Price is required')).toBeVisible()
  })
})
```

### 3. Performance Tests

**File**: `__tests__/e2e/performance.test.ts`

```typescript
test('should load properties page in under 2 seconds', async ({ page }) => {
  const startTime = Date.now()
  
  await page.goto('/properties')
  await page.waitForLoadState('networkidle')
  
  const loadTime = Date.now() - startTime
  
  expect(loadTime).toBeLessThan(2000)
})

test('should search in under 200ms', async ({ page }) => {
  await page.goto('/properties')
  
  const startTime = Date.now()
  
  // Type search
  await page.fill('input[placeholder="Search..."]', 'modern')
  
  // Wait for results
  await page.waitForFunction(() => {
    const cards = document.querySelectorAll('[data-testid="property-card"]')
    return cards.length > 0
  }, { timeout: 1000 })
  
  const searchTime = Date.now() - startTime
  
  expect(searchTime).toBeLessThan(200)
})
```

---

## PERFORMANCE TESTING

### 1. API Response Times

**Targets**:
- List endpoints: < 100ms (p95)
- Detail endpoints: < 100ms (p95)
- Search: < 200ms (p95)
- Dashboard: < 500ms (p95)

**Measurement**:
```typescript
// Add timing headers to API routes
export async function GET(request: NextRequest) {
  const startTime = performance.now()
  
  // ... query logic ...
  
  const duration = performance.now() - startTime
  
  return NextResponse.json(
    { /* response */ },
    {
      headers: {
        'X-Response-Time-Ms': String(duration)
      }
    }
  )
}

// Monitor in tests
const response = await fetch('/api/properties')
const time = parseFloat(response.headers.get('X-Response-Time-Ms') || '0')
expect(time).toBeLessThan(100)
```

### 2. Web Vitals Monitoring

**Targets**:
- FCP (First Contentful Paint): < 1.0s
- LCP (Largest Contentful Paint): < 2.5s
- CLS (Cumulative Layout Shift): < 0.1
- FID (First Input Delay): < 100ms

```typescript
// In browser console or Vercel Analytics
import { getCLS, getFID, getFCP, getLCP } from 'web-vitals'

getCLS(console.log) // Track layout shift
getFID(console.log) // Track first input delay
getFCP(console.log) // Track first paint
getLCP(console.log) // Track largest paint
```

### 3. Database Query Analysis

```sql
-- Analyze slow queries
EXPLAIN ANALYZE
SELECT * FROM properties
WHERE company_id = 'test-id'
  AND status = 'available'
ORDER BY created_at DESC
LIMIT 20;

-- Should show: Seq Scan using index (not full table scan)
```

---

## SECURITY TESTING

### 1. RLS Policy Validation

**Test Cross-Company Access**:
```typescript
describe('RLS Policies', () => {
  let company1Token: string
  let company2Token: string
  let company1PropertyId: string
  
  beforeEach(async () => {
    // Create two companies
    // Create users in each
    // Create properties in each
  })
  
  it('should prevent cross-company property access', async () => {
    // User from Company 1
    const response = await fetch('/api/properties', {
      headers: { Authorization: `Bearer ${company1Token}` }
    })
    
    const data = await response.json()
    
    // Should only see Company 1 properties
    expect(data.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: company1PropertyId
        })
      ])
    )
    
    // Should not include Company 2 property
    expect(data.data).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: company2PropertyId
        })
      ])
    )
  })
  
  it('should prevent direct Supabase query bypass', async () => {
    const supabase = createClient(url, key)
    
    // Even with direct query, RLS should prevent access
    const { data, error } = await supabase
      .from('properties')
      .select()
      .eq('id', company2PropertyId)
    
    // Should be empty due to RLS
    expect(data).toEqual([])
  })
})
```

### 2. Authentication Testing

```typescript
it('should reject requests without auth', async () => {
  const response = await fetch('/api/properties')
  expect(response.status).toBe(401)
})

it('should reject requests with invalid token', async () => {
  const response = await fetch('/api/properties', {
    headers: { Authorization: 'Bearer invalid-token' }
  })
  expect(response.status).toBe(401)
})

it('should reject requests with expired token', async () => {
  // Create expired token
  const response = await fetch('/api/properties', {
    headers: { Authorization: `Bearer ${expiredToken}` }
  })
  expect(response.status).toBe(401)
})
```

### 3. Input Validation Testing

```typescript
it('should reject SQL injection attempts', async () => {
  const response = await fetch('/api/properties', {
    method: 'POST',
    body: JSON.stringify({
      title: "'; DROP TABLE properties; --",
      price: 100000
    })
  })
  
  expect(response.status).toBe(400)
})

it('should reject XSS attempts', async () => {
  const response = await fetch('/api/properties', {
    method: 'POST',
    body: JSON.stringify({
      title: '<script>alert("xss")</script>',
      price: 100000
    })
  })
  
  // Should either reject or sanitize
  const data = await response.json()
  expect(data.data.title).not.toContain('<script>')
})
```

---

## ACCESSIBILITY TESTING

### 1. WCAG 2.1 AA Compliance

```typescript
test('should have proper heading hierarchy', async ({ page }) => {
  await page.goto('/properties')
  
  // Check h1 exists
  expect(await page.locator('h1').count()).toBeGreaterThan(0)
  
  // Check no skipped heading levels
  const headings = await page.locator('h1, h2, h3, h4, h5, h6')
  // Verify sequence (h1 → h2 → h3, not h1 → h3)
})

test('should have sufficient color contrast', async ({ page }) => {
  await page.goto('/properties')
  
  // Check contrast ratios (using axe-core)
  const results = await runAxe(page)
  expect(results.violations).toEqual([])
})

test('should support keyboard navigation', async ({ page }) => {
  await page.goto('/properties')
  
  // Tab through all interactive elements
  let tabCount = 0
  while (tabCount < 50) {
    await page.keyboard.press('Tab')
    tabCount++
  }
  
  // All buttons should be reachable
  expect(await page.locator('button:focus')).toBeTruthy()
})

test('should work with screen readers', async ({ page }) => {
  // Check ARIA labels
  expect(await page.locator('[aria-label]').count()).toBeGreaterThan(0)
  
  // Check role attributes
  expect(await page.locator('[role]').count()).toBeGreaterThan(0)
})
```

---

## RLS POLICY VALIDATION

### Testing Matrix

| User Role | Action | Company | Result |
|-----------|--------|---------|--------|
| Agent | View | Own | ✅ Allow |
| Agent | View | Other | ❌ Deny |
| Agent | Create | Own | ✅ Allow |
| Agent | Create | Other | ❌ Deny |
| Agent | Update | Own | ✅ Allow (own records) |
| Agent | Update | Other | ❌ Deny |
| Agent | Delete | Own | ❌ Deny |
| Agent | Delete | Other | ❌ Deny |
| Admin | All | Own | ✅ Allow |
| Admin | All | Other | ❌ Deny |
| SuperAdmin | All | All | ✅ Allow |

### Test Template

```typescript
describe('RLS: Properties Table', () => {
  const scenarios = [
    {
      user: 'agent',
      action: 'select',
      filter: { company_id: 'own_company' },
      expected: 'allow'
    },
    {
      user: 'agent',
      action: 'select',
      filter: { company_id: 'other_company' },
      expected: 'deny'
    },
    // ... more scenarios
  ]
  
  scenarios.forEach(({ user, action, filter, expected }) => {
    it(`${user} should ${expected} ${action}`, async () => {
      const result = await testRLS(user, action, filter)
      
      if (expected === 'allow') {
        expect(result.data).toBeDefined()
      } else {
        expect(result.error).toBeDefined()
        expect(result.error.code).toContain('POLICY')
      }
    })
  })
})
```

---

## TEST SCENARIOS

### Scenario 1: New Agent Onboarding

```
1. Admin creates agent account
2. Agent receives invitation email
3. Agent sets password
4. Agent logs in
5. Agent sees empty properties list
6. Admin creates test property
7. Agent sees new property appear (real-time)
8. Agent adds lead
9. Agent creates showing
10. Lead appears in dashboard stats
✅ All working = Pass
```

### Scenario 2: Lead Conversion

```
1. Create lead (status: new)
2. Add call activity
3. Update status → contacted
4. Add email activity
5. Update status → qualified
6. Add meeting activity
7. Update status → proposal_sent
8. View timeline with all activities
9. Stats reflect final status
✅ All working = Pass
```

### Scenario 3: Property Showing

```
1. Create property
2. Create lead
3. Assign property to lead
4. Create showing
5. View on calendar
6. Complete showing
7. Update lead status
8. Verify analytics updated
✅ All working = Pass
```

---

## REGRESSION TESTING

### Before Each Release

Run complete test suite:

```bash
# Unit tests (should take < 5 min)
npm run test:unit

# Integration tests (should take < 10 min)
npm run test:integration

# E2E tests (should take < 20 min)
npm run test:e2e

# Performance tests
npm run test:performance

# Accessibility
npm run test:a11y

# Security
npm run test:security
```

### Critical Features Checklist

Before deploying, verify:

- [ ] Properties CRUD works
- [ ] Leads CRUD works
- [ ] Dashboard stats load
- [ ] Search returns results
- [ ] Filters work
- [ ] Pagination works
- [ ] Real-time updates work
- [ ] RLS policies enforced
- [ ] No console errors
- [ ] No memory leaks
- [ ] Performance acceptable
- [ ] No regression from previous version

---

## DEPLOYMENT VALIDATION

### Pre-Deployment Checklist

```
Code Quality
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] No console.errors or warnings
- [ ] All tests passing

Security
- [ ] RLS policies reviewed
- [ ] Auth validated
- [ ] No secrets in code
- [ ] CORS properly configured
- [ ] Rate limiting configured

Performance
- [ ] API response times < 100ms
- [ ] Dashboard < 500ms
- [ ] FCP < 1.0s
- [ ] LCP < 2.5s

Database
- [ ] Migrations tested
- [ ] Rollback procedure verified
- [ ] Indexes created
- [ ] Functions working

Documentation
- [ ] API docs complete
- [ ] Deployment steps documented
- [ ] Known issues listed
- [ ] Rollback plan written
```

### Monitoring During Rollout

**Metrics to Watch**:
- Error rate: < 1%
- API latency p95: < 200ms
- Database connection pool: < 80%
- Memory usage: stable
- CPU usage: < 80%

**Alerts**:
- Error rate > 5% → Investigate
- Latency p95 > 1s → Investigate
- Memory spike > 100MB → Investigate
- Database connections > 80 → Scale
- CPU > 90% → Scale

**Rollback Trigger**:
- Error rate > 10%
- Latency p95 > 2s
- Database unavailable
- Security issue detected
- Data corruption detected

---

## TEST COVERAGE TARGETS

| Layer | Target | Current |
|-------|--------|---------|
| Unit Tests | 80% | TBD |
| Integration Tests | 60% | TBD |
| E2E Tests | Critical paths | TBD |
| API Routes | 100% coverage | TBD |
| Database Functions | 100% coverage | TBD |

---

## Resources & Tools

### Testing Tools
- Vitest: Fast unit testing
- React Testing Library: Component testing
- Playwright: E2E testing
- MSW: API mocking
- Supertest: HTTP assertions

### Monitoring Tools
- Vercel Analytics: Web vitals
- Supabase Logs: Database & API logs
- Sentry: Error tracking
- DataDog: Performance monitoring

### Documentation
- test-README.md: How to run tests
- TESTING_GUIDE.md: Test writing guide
- RLS_VALIDATION.md: RLS policy testing
- PERFORMANCE_GUIDE.md: Performance testing

---

**Document Version**: 1.0  
**Status**: Ready to Implement  
**Last Updated**: January 24, 2026
