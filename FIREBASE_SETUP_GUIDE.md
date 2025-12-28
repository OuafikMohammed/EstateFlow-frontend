# Firebase Integration Guide for EstateFlow

## Overview
This guide provides comprehensive instructions for using Firebase with your EstateFlow Next.js application.

## 📁 Project Structure

```
lib/firebase/
├── config.ts              # Firebase initialization
├── auth.ts                # Authentication functions
├── database.ts            # Generic CRUD operations
├── services.ts            # Domain-specific services
├── errors.ts              # Error handling utilities
└── firestore.rules        # Security rules

hooks/
├── useAuth.tsx            # Auth context provider & hook
├── useFirebase.ts         # Firebase data hooks
└── use-toast.ts           # Existing toast hook

components/
├── auth-status.tsx        # Example: Display auth status
├── login-form-firebase.tsx # Example: Login form
└── properties-list-firebase.tsx  # Example: List properties
```

## 🔧 Setup Instructions

### 1. Environment Variables
Update `.env.local` with your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 2. Deploy Firestore Security Rules
1. Go to Firebase Console → Firestore Database → Rules
2. Copy content from `lib/firebase/firestore.rules`
3. Paste and publish

### 3. Create Firestore Collections
Create these collections in Firebase Console:
- `users`
- `properties`
- `leads`
- `transactions`

### 4. Start Using in Components

## 📚 Usage Examples

### Authentication

#### Login
```tsx
'use client'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const { login, user, loading } = useAuth()
  
  const handleLogin = async () => {
    try {
      await login('user@email.com', 'password')
    } catch (error) {
      console.error('Login failed:', error)
    }
  }
  
  return (
    <button onClick={handleLogin} disabled={loading}>
      {loading ? 'Logging in...' : 'Login'}
    </button>
  )
}
```

#### Register
```tsx
const { register } = useAuth()

await register('newuser@email.com', 'securePassword')
```

#### Logout
```tsx
const { logout } = useAuth()

await logout()
```

### Database Operations

#### Fetch Data
```tsx
import { useCollection } from '@/hooks/useFirebase'
import { getAllProperties } from '@/lib/firebase/services'

export default function Properties() {
  const { data: properties, loading, error } = useCollection(getAllProperties)
  
  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {properties.map(prop => (
        <div key={prop.id}>{prop.title}</div>
      ))}
    </div>
  )
}
```

#### Real-time Subscription
```tsx
import { useCollectionSubscription } from '@/hooks/useFirebase'
import { subscribeToProperties } from '@/lib/firebase/services'

export default function LiveProperties() {
  const { data: properties } = useCollectionSubscription(subscribeToProperties)
  
  return (
    <div>
      {properties.map(prop => (
        <div key={prop.id}>{prop.title}</div>
      ))}
    </div>
  )
}
```

#### Create Document
```tsx
import { useMutation } from '@/hooks/useFirebase'
import { createProperty } from '@/lib/firebase/services'

export default function NewProperty() {
  const { mutate, loading } = useMutation(createProperty)
  
  const handleCreate = async () => {
    try {
      const propertyId = await mutate({
        title: 'Luxury Villa',
        price: 500000,
        location: 'Casablanca',
        agentId: 'user123',
        // ... other fields
      })
      console.log('Created:', propertyId)
    } catch (error) {
      console.error('Failed:', error)
    }
  }
  
  return <button onClick={handleCreate}>{loading ? 'Creating...' : 'Create'}</button>
}
```

#### Update Document
```tsx
import { useMutation } from '@/hooks/useFirebase'
import { updateProperty } from '@/lib/firebase/services'

export default function EditProperty() {
  const { mutate } = useMutation(updateProperty)
  
  const handleUpdate = async () => {
    await mutate({
      propertyId: 'prop123',
      propertyData: { price: 450000 }
    })
  }
  
  return <button onClick={handleUpdate}>Update</button>
}
```

#### Delete Document
```tsx
import { useMutation } from '@/hooks/useFirebase'
import { deleteProperty } from '@/lib/firebase/services'

export default function DeleteProperty() {
  const { mutate } = useMutation(deleteProperty)
  
  const handleDelete = async () => {
    await mutate('prop123')
  }
  
  return <button onClick={handleDelete}>Delete</button>
}
```

### Filtered Queries

```tsx
import { where, orderBy, limit } from 'firebase/firestore'
import { getProperties } from '@/lib/firebase/services'

// Get properties for a specific agent, sorted by price, limit 10
const constraints = [
  where('agentId', '==', 'user123'),
  orderBy('price', 'desc'),
  limit(10)
]

const { data } = useCollection(() => getProperties(constraints), constraints)
```

### Error Handling

```tsx
import { handleFirebaseError } from '@/lib/firebase/errors'

try {
  await createProperty(data)
} catch (error) {
  const { code, message } = handleFirebaseError(error)
  console.log(`Error [${code}]: ${message}`)
}
```

## 🔒 Security Best Practices

1. **Never expose sensitive keys** - Use `NEXT_PUBLIC_` prefix only for public Firebase config
2. **Implement security rules** - Rules in `firestore.rules` prevent unauthorized access
3. **Use authentication** - Require login for sensitive operations
4. **Validate on backend** - Never trust client-side validation alone
5. **Rate limiting** - Consider using Firebase Functions for rate limiting
6. **Data encryption** - Enable encryption for sensitive data

## 📊 Available Collections & Services

### Users
```tsx
import {
  getUserById,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  subscribeToUsers
} from '@/lib/firebase/services'
```

### Properties
```tsx
import {
  getPropertyById,
  getAllProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  subscribeToProperties
} from '@/lib/firebase/services'
```

### Leads
```tsx
import {
  getLeadById,
  getAllLeads,
  createLead,
  updateLead,
  deleteLead,
  subscribeToLeads
} from '@/lib/firebase/services'
```

### Transactions
```tsx
import {
  getTransactionById,
  getAllTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  subscribeToTransactions
} from '@/lib/firebase/services'
```

## 🪝 Available Hooks

### `useAuth()`
```tsx
const { user, loading, error, login, register, logout } = useAuth()
```

### `useDocument<T>()`
Fetch single document
```tsx
const { data, loading, error } = useDocument(() => getUserById('user123'))
```

### `useCollection<T>()`
Fetch multiple documents
```tsx
const { data, loading, error } = useCollection(getAllProperties)
```

### `useDocumentSubscription<T>()`
Real-time single document
```tsx
const { data, loading, error } = useDocumentSubscription(
  (callback) => subscribeToDocument('users', 'user123', callback)
)
```

### `useCollectionSubscription<T>()`
Real-time collection updates
```tsx
const { data, loading, error } = useCollectionSubscription(subscribeToProperties)
```

### `useMutation<TInput, TOutput>()`
Perform create/update/delete
```tsx
const { mutate, loading, error, success } = useMutation(createProperty)
```

## 🐛 Common Issues & Solutions

### Issue: "NEXT_PUBLIC_ variables not found"
**Solution:** Ensure variables are in `.env.local` and restart dev server

### Issue: "Permission denied" errors
**Solution:** Check Firestore security rules and ensure user is authenticated

### Issue: Real-time listeners not updating
**Solution:** Ensure collection name matches Firestore and rules allow read access

### Issue: Auth context not working
**Solution:** Ensure `AuthProvider` is in app layout and components use `'use client'`

## 🚀 Next Steps

1. Replace placeholder credentials in `.env.local`
2. Deploy security rules to Firebase Console
3. Create Firestore collections
4. Update login/register pages with Firebase forms
5. Replace existing components with Firebase-integrated versions
6. Test authentication and data operations
7. Set up Firebase Functions for backend logic (optional)

## 📖 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [React Firebase Hooks](https://github.com/CSFrequency/react-firebase-hooks)

## ✅ Checklist

- [ ] Firebase project created in Firebase Console
- [ ] Environment variables configured
- [ ] Firestore collections created
- [ ] Security rules deployed
- [ ] AuthProvider added to layout
- [ ] Authentication pages integrated
- [ ] Database operations tested
- [ ] Real-time listeners working
- [ ] Error handling implemented
- [ ] Security review completed
