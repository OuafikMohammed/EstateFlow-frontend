# Firebase Integration - Quick Reference Card

## 🚀 Installation Status
✅ **Firebase 12.7.0 installed**
✅ **All services configured**
✅ **Ready to use**

---

## 🔥 Quick Import Examples

### Everything
```tsx
import { 
  auth, db, storage,
  loginUser, registerUser,
  getAllProperties, createProperty,
  useMutation
} from '@/lib/firebase'
```

### Auth Only
```tsx
import { useAuth } from '@/hooks/useAuth'
// or
import { loginUser, registerUser, logoutUser } from '@/lib/firebase'
```

### Data Only
```tsx
import { useCollectionSubscription } from '@/hooks/useFirebase'
import { subscribeToProperties } from '@/lib/firebase'
```

---

## 🪝 Hooks Cheat Sheet

### useAuth()
```tsx
const { user, loading, login, register, logout } = useAuth()

// user: { uid, email, displayName, photoURL } | null
// loading: boolean
// login: (email, password) => Promise<void>
// register: (email, password) => Promise<void>
// logout: () => Promise<void>
```

### useCollection()
```tsx
const { data, loading, error } = useCollection(getAllProperties)
// data: T[]
// loading: boolean
// error: Error | null
```

### useCollectionSubscription()
```tsx
const { data, loading, error } = useCollectionSubscription(subscribeToProperties)
// Real-time updates! data auto-refreshes when DB changes
```

### useMutation()
```tsx
const { mutate, loading, error, success } = useMutation(createProperty)

// Call it
await mutate({
  title: 'Villa',
  price: 500000,
  // ...
})
```

---

## 📋 Common Tasks

### 1. Check if User Logged In
```tsx
'use client'
import { useAuth } from '@/hooks/useAuth'

const { user, loading } = useAuth()
if (!user) return <p>Not logged in</p>
```

### 2. Render Real-time List
```tsx
'use client'
import { useCollectionSubscription } from '@/hooks/useFirebase'
import { subscribeToProperties } from '@/lib/firebase'

const { data: properties } = useCollectionSubscription(subscribeToProperties)

return (
  <div>
    {properties.map(p => <div key={p.id}>{p.title}</div>)}
  </div>
)
```

### 3. Create New Item
```tsx
'use client'
import { useMutation } from '@/hooks/useFirebase'
import { createProperty } from '@/lib/firebase'

const { mutate, loading } = useMutation(createProperty)

const handle Click = async () => {
  await mutate({ title: 'New Villa', price: 500000 })
}
```

### 4. Filter Data
```tsx
import { where, orderBy, limit } from 'firebase/firestore'
import { useCollection } from '@/hooks/useFirebase'
import { getAllProperties } from '@/lib/firebase'

const constraints = [
  where('status', '==', 'available'),
  orderBy('price', 'desc'),
  limit(10)
]

const { data } = useCollection(
  () => getAllProperties(constraints),
  constraints
)
```

### 5. Error Handling
```tsx
import { handleFirebaseError } from '@/lib/firebase'

try {
  await loginUser('user@email.com', 'password')
} catch (error) {
  const { code, message } = handleFirebaseError(error)
  alert(message) // User-friendly message
}
```

---

## 🔐 Security Rules Summary

| Operation | Who Can Do It |
|-----------|---------------|
| Read User | Only that user |
| Write User | Only that user |
| Read Property | Anyone (public) |
| Create Property | Any logged-in user |
| Update Property | Property owner |
| Delete Property | Property owner |
| Read Lead | Lead agent or creator |
| Create Lead | Any logged-in user |
| Update Lead | Lead agent |
| Delete Lead | Lead agent |
| Read Transaction | Participants or admin |
| Create Transaction | Backend only |
| Update Transaction | Admin only |
| Delete Transaction | Admin only |

---

## 📊 Collections Schema

### users
```tsx
{
  id: string
  email: string
  roles: string[]
  firstName: string
  lastName: string
  createdAt: Date
}
```

### properties
```tsx
{
  id: string
  title: string
  price: number
  location: string
  type: 'apartment' | 'house' | 'villa' | 'commercial'
  status: 'available' | 'sold' | 'rented'
  agentId: string
  bedrooms: number
  bathrooms: number
  images: string[]
  createdAt: Date
  updatedAt: Date
}
```

### leads
```tsx
{
  id: string
  name: string
  email: string
  phone: string
  propertyId?: string
  status: 'new' | 'contacted' | 'qualified' | 'converted'
  agentId: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}
```

### transactions
```tsx
{
  id: string
  propertyId: string
  buyerId: string
  sellerId: string
  amount: number
  type: 'sale' | 'rental'
  status: 'pending' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}
```

---

## ⚙️ Setup Checklist

- [ ] Create Firebase project
- [ ] Copy credentials to `.env.local`
- [ ] Restart dev server
- [ ] Deploy security rules
- [ ] Create Firestore collections
- [ ] Add AuthProvider to layout ✅ (done)
- [ ] Test login
- [ ] Test create/read/update/delete
- [ ] Test real-time updates

---

## 🚨 Common Errors & Fixes

### "Firebase is not initialized"
```
❌ .env.local missing credentials
✅ Add all 6 values to .env.local
✅ Restart server (npm run dev)
```

### "Permission denied"
```
❌ Security rules not deployed
✅ Deploy rules from lib/firebase/firestore.rules
```

### "User not authenticated"
```
❌ User not logged in
✅ Add login check: if (!user) return <LoginPage />
```

### "Collection not found"
```
❌ Collection doesn't exist in Firestore
✅ Create collection in Firebase Console
```

---

## 📞 Support Files

| File | Purpose |
|------|---------|
| `FIREBASE_QUICKSTART.md` | Get started (5 min) |
| `FIREBASE_SETUP_GUIDE.md` | Full reference (20 min) |
| `FIREBASE_MIGRATION_GUIDE.md` | Upgrade existing code (10 min) |
| `FIREBASE_SETUP_CHECKLIST.md` | Track progress |
| `FIREBASE_INTEGRATION_SUMMARY.md` | Overview |

---

## 🔗 Useful Links

- [Firebase Console](https://console.firebase.google.com)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Auth Docs](https://firebase.google.com/docs/auth)
- [Security Rules](https://firebase.google.com/docs/rules)
- [Next.js Integration](https://nextjs.org/docs)

---

## ✅ You're All Set!

Firebase is installed and ready. Now:

1. **Get credentials** from Firebase Console
2. **Add to .env.local**
3. **Deploy security rules**
4. **Start building!**

For detailed steps, see: **FIREBASE_QUICKSTART.md**

---

**Happy coding! 🚀**
