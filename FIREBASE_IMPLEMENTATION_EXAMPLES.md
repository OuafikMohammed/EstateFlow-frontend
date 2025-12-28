# Firebase Implementation Examples

Complete working examples for common EstateFlow scenarios.

## 1. Dashboard Page (Real-time Data)

```tsx
// app/dashboard/page.tsx
'use client'

import { useAuth } from '@/hooks/useAuth'
import { useCollectionSubscription } from '@/hooks/useFirebase'
import { subscribeToProperties, subscribeToLeads } from '@/lib/firebase/services'
import { where } from 'firebase/firestore'
import { Spinner } from '@/components/ui/spinner'
import { redirect } from 'next/navigation'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  
  // Real-time properties for this agent
  const propertyConstraints = user ? [where('agentId', '==', user.uid)] : []
  const { data: properties, loading: propsLoading } = useCollectionSubscription(
    subscribeToProperties,
    propertyConstraints
  )
  
  // Real-time leads for this agent
  const leadConstraints = user ? [where('agentId', '==', user.uid)] : []
  const { data: leads, loading: leadsLoading } = useCollectionSubscription(
    subscribeToLeads,
    leadConstraints
  )
  
  if (authLoading) return <Spinner />
  if (!user) return redirect('/login')
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatsCard 
          title="Properties" 
          value={properties.length} 
          loading={propsLoading}
        />
        <StatsCard 
          title="Active Leads" 
          value={leads.filter(l => l.status !== 'converted').length}
          loading={leadsLoading}
        />
        <StatsCard 
          title="Conversions" 
          value={leads.filter(l => l.status === 'converted').length}
          loading={leadsLoading}
        />
      </div>
      
      {/* Properties Grid */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Your Properties</h2>
        {propsLoading ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map(prop => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        )}
      </section>
      
      {/* Recent Leads */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Recent Leads</h2>
        {leadsLoading ? (
          <Spinner />
        ) : (
          <div className="space-y-2">
            {leads.slice(0, 5).map(lead => (
              <LeadRow key={lead.id} lead={lead} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
```

## 2. Login Page with Firebase

```tsx
// app/login/page.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { handleFirebaseError } from '@/lib/firebase/errors'

export default function LoginPage() {
  const router = useRouter()
  const { login, user } = useAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // If already logged in, redirect
  if (user) return router.push('/dashboard')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email')
      return
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    try {
      setLoading(true)
      await login(email, password)
      router.push('/dashboard')
    } catch (err: any) {
      const { message } = handleFirebaseError(err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-2xl font-bold mb-6">Login to EstateFlow</h2>
          
          {error && <Alert variant="destructive">{error}</Alert>}
          
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>
          
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Logging in...' : 'Login'}
          </Button>
          
          <p className="text-sm text-center text-muted-foreground">
            Don't have an account?{' '}
            <a href="/register" className="text-primary hover:underline">
              Register here
            </a>
          </p>
        </form>
      </Card>
    </div>
  )
}
```

## 3. Create Property Form

```tsx
// components/create-property-form.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useMutation } from '@/hooks/useFirebase'
import { createProperty } from '@/lib/firebase/services'
import { handleFirebaseError } from '@/lib/firebase/errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/alert'

export default function CreatePropertyForm() {
  const { user } = useAuth()
  const { mutate, loading } = useMutation(createProperty)
  
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    location: '',
    type: 'house',
    bedrooms: '',
    bathrooms: '',
  })
  
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  if (!user) return <p>Please log in first</p>
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'bedrooms' || name === 'bathrooms' 
        ? parseInt(value) || '' 
        : value
    }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    
    if (!formData.title || !formData.price || !formData.location) {
      setError('Please fill in all required fields')
      return
    }
    
    try {
      await mutate({
        ...formData,
        agentId: user.uid,
        status: 'available',
        images: [],
        description: '',
        squareFeet: 0,
      })
      
      setSuccess(true)
      setFormData({
        title: '',
        price: '',
        location: '',
        type: 'house',
        bedrooms: '',
        bathrooms: '',
      })
      
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      const { message } = handleFirebaseError(err)
      setError(message)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <h2 className="text-2xl font-bold">List New Property</h2>
      
      {error && <Alert variant="destructive">{error}</Alert>}
      {success && <Alert>Property created successfully!</Alert>}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title*</label>
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Luxury Villa in Marrakech"
            disabled={loading}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Price*</label>
          <Input
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            placeholder="500000"
            disabled={loading}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Location*</label>
          <Input
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Marrakech, Morocco"
            disabled={loading}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select name="type" value={formData.type} onChange={handleChange} disabled={loading}>
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Bedrooms</label>
          <Input
            name="bedrooms"
            type="number"
            value={formData.bedrooms}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Bathrooms</label>
          <Input
            name="bathrooms"
            type="number"
            value={formData.bathrooms}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
      </div>
      
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Creating...' : 'Create Property'}
      </Button>
    </form>
  )
}
```

## 4. Properties Search Page

```tsx
// app/properties/page.tsx
'use client'

import { useState, useMemo } from 'react'
import { useCollection } from '@/hooks/useFirebase'
import { getAllProperties } from '@/lib/firebase/services'
import { where, orderBy } from 'firebase/firestore'
import { Input } from '@/components/ui/input'
import { PropertyCard } from '@/components/property/property-card'

export default function PropertiesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [propertyType, setPropertyType] = useState('')
  
  const constraints = useMemo(() => {
    const cons = [orderBy('createdAt', 'desc')]
    
    if (propertyType) {
      cons.push(where('type', '==', propertyType))
    }
    
    if (maxPrice) {
      cons.push(where('price', '<=', parseInt(maxPrice)))
    }
    
    return cons
  }, [propertyType, maxPrice])
  
  const { data: allProperties, loading } = useCollection(
    () => getAllProperties(constraints),
    constraints
  )
  
  // Filter by search term on client (after getting from Firestore)
  const filteredProperties = allProperties.filter(prop =>
    prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prop.location.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Properties</h1>
      
      {/* Filters */}
      <div className="bg-card p-4 rounded-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search by title or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="">All Types</option>
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="commercial">Commercial</option>
          </select>
          
          <Input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>
      
      {/* Results */}
      {loading ? (
        <p>Loading properties...</p>
      ) : filteredProperties.length === 0 ? (
        <p className="text-center text-muted-foreground">No properties found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProperties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  )
}
```

## 5. Protected Route Component

```tsx
// components/protected-route.tsx
'use client'

import { useAuth } from '@/hooks/useAuth'
import { redirect } from 'next/navigation'
import { Spinner } from '@/components/ui/spinner'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    )
  }
  
  if (!user) {
    return redirect('/login')
  }
  
  return <>{children}</>
}
```

Usage:
```tsx
// app/dashboard/page.tsx
import ProtectedRoute from '@/components/protected-route'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      {/* Dashboard content */}
    </ProtectedRoute>
  )
}
```

## 6. Real-time Leads Table

```tsx
// components/leads-table.tsx
'use client'

import { useAuth } from '@/hooks/useAuth'
import { useCollectionSubscription } from '@/hooks/useFirebase'
import { subscribeToLeads, updateLead } from '@/lib/firebase/services'
import { useMutation } from '@/hooks/useFirebase'
import { where } from 'firebase/firestore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function LeadsTable() {
  const { user } = useAuth()
  const { mutate: updateLeadStatus } = useMutation(
    ({ id, status }) => updateLead(id, { status })
  )
  
  const constraints = user ? [where('agentId', '==', user.uid)] : []
  const { data: leads } = useCollectionSubscription(subscribeToLeads, constraints)
  
  const handleStatusChange = (leadId: string, newStatus: string) => {
    updateLeadStatus({ id: leadId, status: newStatus })
  }
  
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b">
          <th className="text-left p-2">Name</th>
          <th className="text-left p-2">Email</th>
          <th className="text-left p-2">Phone</th>
          <th className="text-left p-2">Status</th>
          <th className="text-left p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {leads.map(lead => (
          <tr key={lead.id} className="border-b hover:bg-muted/50">
            <td className="p-2">{lead.name}</td>
            <td className="p-2">{lead.email}</td>
            <td className="p-2">{lead.phone}</td>
            <td className="p-2">
              <Badge>{lead.status}</Badge>
            </td>
            <td className="p-2 space-x-2">
              <select
                value={lead.status}
                onChange={(e) => handleStatusChange(lead.id, e.target.value)}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

---

These examples show real-world usage patterns. Adapt them to your specific needs!
