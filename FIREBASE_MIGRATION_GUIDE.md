# Firebase Integration Migration Guide

This guide helps you integrate Firebase into your existing components.

## Migrating Authentication

### Before (Without Firebase)
```tsx
const [user, setUser] = useState(null)
const [loading, setLoading] = useState(false)

const handleLogin = async (email, password) => {
  setLoading(true)
  try {
    // Manual API call or local auth
    const response = await fetch('/api/login', { 
      method: 'POST', 
      body: JSON.stringify({ email, password }) 
    })
    const data = await response.json()
    setUser(data.user)
  } catch (error) {
    console.error(error)
  } finally {
    setLoading(false)
  }
}
```

### After (With Firebase)
```tsx
'use client'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const { user, loading, login } = useAuth()
  
  const handleLogin = async (email, password) => {
    try {
      await login(email, password)
      // Navigation handled automatically
    } catch (error) {
      console.error(parseAuthError(error))
    }
  }
}
```

## Migrating Database Operations

### Before (Manual Data Fetching)
```tsx
const [properties, setProperties] = useState([])
const [loading, setLoading] = useState(false)

useEffect(() => {
  setLoading(true)
  fetch('/api/properties')
    .then(r => r.json())
    .then(data => setProperties(data))
    .finally(() => setLoading(false))
}, [])
```

### After (Firebase with Real-time Sync)
```tsx
'use client'
import { useCollectionSubscription } from '@/hooks/useFirebase'
import { subscribeToProperties } from '@/lib/firebase/services'

export default function PropertiesList() {
  const { data: properties, loading } = useCollectionSubscription(subscribeToProperties)
  // Auto-updates when data changes!
}
```

## Migrating CRUD Operations

### Create
```tsx
// Before
const handleCreate = async (data) => {
  const response = await fetch('/api/properties', {
    method: 'POST',
    body: JSON.stringify(data)
  })
  return response.json()
}

// After
import { useMutation } from '@/hooks/useFirebase'
import { createProperty } from '@/lib/firebase/services'

const { mutate } = useMutation(createProperty)
const propertyId = await mutate(data)
```

### Update
```tsx
// Before
await fetch(`/api/properties/${id}`, {
  method: 'PUT',
  body: JSON.stringify(updates)
})

// After
import { useMutation } from '@/hooks/useFirebase'
import { updateProperty } from '@/lib/firebase/services'

const { mutate } = useMutation(
  ({ id, data }) => updateProperty(id, data)
)
await mutate({ id, data: updates })
```

### Delete
```tsx
// Before
await fetch(`/api/properties/${id}`, { method: 'DELETE' })

// After
import { useMutation } from '@/hooks/useFirebase'
import { deleteProperty } from '@/lib/firebase/services'

const { mutate } = useMutation(deleteProperty)
await mutate(id)
```

## Migrating Filtered/Sorted Queries

### Before
```tsx
// Server-side query
const [properties, setProperties] = useState([])

useEffect(() => {
  fetch(`/api/properties?agentId=${agentId}&sort=price`)
    .then(r => r.json())
    .then(data => setProperties(data))
}, [agentId])
```

### After
```tsx
'use client'
import { where, orderBy } from 'firebase/firestore'
import { useCollection } from '@/hooks/useFirebase'
import { getAllProperties } from '@/lib/firebase/services'

export default function AgentProperties({ agentId }) {
  const constraints = [
    where('agentId', '==', agentId),
    orderBy('price', 'desc')
  ]
  
  const { data: properties } = useCollection(
    () => getAllProperties(constraints),
    constraints
  )
}
```

## Step-by-Step Migration Example

### 1. Add 'use client' directive
```tsx
// pages/properties/page.tsx → components/properties-page.tsx
'use client'

import { useCollectionSubscription } from '@/hooks/useFirebase'
import { subscribeToProperties } from '@/lib/firebase/services'
```

### 2. Replace state management
```tsx
// Remove these
// const [properties, setProperties] = useState([])
// const [loading, setLoading] = useState(false)

// Add this
const { data: properties, loading, error } = useCollectionSubscription(
  subscribeToProperties
)
```

### 3. Remove useEffect data fetching
```tsx
// Remove this entire block
// useEffect(() => {
//   fetch('/api/properties')
//     .then(...)
//     .catch(...)
// }, [])

// Firebase hook handles it automatically!
```

### 4. Update error handling
```tsx
// Before
if (error) return <div>Error loading properties</div>

// After
import { parseAuthError } from '@/lib/firebase/errors'

if (error) {
  return <Alert>{error.message}</Alert>
}
```

### 5. Update UI for actions
```tsx
// Before - Multiple state variables
const [saving, setSaving] = useState(false)
const [error, setError] = useState(null)

const handleCreate = async (data) => {
  setSaving(true)
  try {
    await fetch('/api/properties', ...)
  } catch (e) {
    setError(e.message)
  } finally {
    setSaving(false)
  }
}

// After - All in one hook
const { mutate, loading, error } = useMutation(createProperty)

const handleCreate = async (data) => {
  try {
    await mutate(data)
  } catch (e) {
    // Error in hook
  }
}
```

## Common Migration Patterns

### Pattern 1: List with Create
```tsx
'use client'
import { useCollectionSubscription } from '@/hooks/useFirebase'
import { useMutation } from '@/hooks/useFirebase'
import { subscribeToProperties, createProperty } from '@/lib/firebase/services'

export default function PropertyManager() {
  const { data: properties } = useCollectionSubscription(subscribeToProperties)
  const { mutate: create, loading: creating } = useMutation(createProperty)
  
  return (
    <div>
      {properties.map(p => <PropertyItem key={p.id} property={p} />)}
      <button onClick={() => create(newData)} disabled={creating}>
        {creating ? 'Creating...' : 'New Property'}
      </button>
    </div>
  )
}
```

### Pattern 2: Detail View with Edit
```tsx
'use client'
import { useDocumentSubscription } from '@/hooks/useFirebase'
import { useMutation } from '@/hooks/useFirebase'
import { subscribeToDocument, updateProperty } from '@/lib/firebase/services'

export default function PropertyDetail({ id }) {
  const { data: property } = useDocumentSubscription(
    callback => subscribeToDocument('properties', id, callback)
  )
  const { mutate: update } = useMutation(data => updateProperty(id, data))
  
  return (
    <div>
      <h1>{property?.title}</h1>
      <button onClick={() => update({ price: 450000 })}>
        Update Price
      </button>
    </div>
  )
}
```

### Pattern 3: Search/Filter
```tsx
'use client'
import { where, orderBy, limit } from 'firebase/firestore'
import { useCollection } from '@/hooks/useFirebase'
import { getAllProperties } from '@/lib/firebase/services'

export default function SearchProperties({ query, maxPrice }) {
  const constraints = [
    where('price', '<=', maxPrice),
    where('title', '>=', query),
    orderBy('title'),
    limit(20)
  ]
  
  const { data: results } = useCollection(
    () => getAllProperties(constraints),
    constraints
  )
  
  return <div>{results.map(p => <div key={p.id}>{p.title}</div>)}</div>
}
```

## Checklist for Each Component

- [ ] Add `'use client'` directive
- [ ] Import Firebase hooks and services
- [ ] Replace state with Firebase hooks
- [ ] Remove useEffect data fetching
- [ ] Update error handling
- [ ] Test with Firebase data
- [ ] Remove API endpoint calls
- [ ] Update tests if applicable

## Performance Tips

1. **Use subscriptions only when needed** - For real-time data
2. **Use queries for one-off fetches** - For initial data load
3. **Add constraints** - Filter data in Firestore, not in component
4. **Unsubscribe on unmount** - Hooks handle this automatically
5. **Memoize callbacks** - Use useCallback for mutation functions

## Rollback Strategy

If you need to rollback:
1. Keep old API endpoints temporarily
2. Create a feature flag to toggle Firebase
3. Gradually migrate components
4. Monitor error rates
5. Remove old endpoints after validation

```tsx
// Example with feature flag
const useFirebaseData = process.env.NEXT_PUBLIC_USE_FIREBASE === 'true'

if (useFirebaseData) {
  const { data } = useCollectionSubscription(subscribeToProperties)
} else {
  const [data, setData] = useState([])
  useEffect(() => { 
    fetch('/api/properties').then(r => r.json()).then(setData)
  }, [])
}
```

---

**Questions?** Check `FIREBASE_SETUP_GUIDE.md` for more details.
