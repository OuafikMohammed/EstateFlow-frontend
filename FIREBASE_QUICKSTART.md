# Firebase Setup Quick Start

## 🎯 What's Been Set Up

Your EstateFlow Next.js app now has complete Firebase integration ready to use!

### ✅ Installed
- Firebase SDK
- All required authentication & database utilities
- Custom React hooks for Firebase
- Error handling system
- Type-safe services

### 📁 Created Files
- `lib/firebase/config.ts` - Firebase initialization
- `lib/firebase/auth.ts` - Authentication logic
- `lib/firebase/database.ts` - Generic CRUD operations
- `lib/firebase/services.ts` - Domain-specific services (Users, Properties, Leads, Transactions)
- `lib/firebase/errors.ts` - Error handling
- `hooks/useAuth.tsx` - Auth context provider
- `hooks/useFirebase.ts` - Data hooks
- `.env.local` - Environment configuration template

### 📚 Example Components
- `components/auth-status.tsx` - Show login status
- `components/login-form-firebase.tsx` - Login form example
- `components/properties-list-firebase.tsx` - Real-time properties list

## 🚀 Getting Started (3 Steps)

### Step 1: Set Up Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use existing)
3. Enable Authentication (Email/Password)
4. Enable Firestore Database
5. Go to Project Settings
6. Copy all values from "firebaseConfig"

### Step 2: Add Credentials to .env.local
Edit `.env.local` in your project root:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT_ID.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
```

Then restart your dev server (`npm run dev`)

### Step 3: Deploy Security Rules
1. In Firebase Console → Firestore Database → Rules
2. Replace the rules with content from `lib/firebase/firestore.rules`
3. Click "Publish"

### Step 4 (Optional): Create Collections
In Firebase Console → Firestore Database → Collections, create:
- `users` - For user profiles
- `properties` - For property listings
- `leads` - For customer leads
- `transactions` - For sales/rentals

## 💡 Quick Examples

### Use in Your Pages
```tsx
'use client'
import { useAuth } from '@/hooks/useAuth'
import { useCollectionSubscription } from '@/hooks/useFirebase'
import { subscribeToProperties } from '@/lib/firebase/services'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: properties } = useCollectionSubscription(subscribeToProperties)
  
  return (
    <div>
      <h1>Welcome, {user?.email}</h1>
      <p>You have {properties.length} properties</p>
    </div>
  )
}
```

### Create New Property
```tsx
import { useMutation } from '@/hooks/useFirebase'
import { createProperty } from '@/lib/firebase/services'

const { mutate } = useMutation(createProperty)

await mutate({
  title: 'Luxury Villa',
  price: 500000,
  location: 'Marrakech',
  agentId: user.uid,
  type: 'villa',
  status: 'available'
})
```

### Update Property
```tsx
import { updateProperty } from '@/lib/firebase/services'

await updateProperty('propertyId', { 
  price: 450000, 
  status: 'sold' 
})
```

## 🔐 Security Rules Explained

The rules automatically restrict:
- ✅ Users can only access their own data
- ✅ Properties are publicly readable
- ✅ Only property owners can edit/delete
- ✅ Leads are private to agent/creator
- ✅ Transactions require admin privileges

## ⚠️ Important Notes

1. **Environment Variables:** Must start with `NEXT_PUBLIC_` to be available in browser
2. **Security Rules:** Always deploy rules before production
3. **Authentication:** Users must be logged in for protected operations
4. **Firestore:** Read/write operations count against quota (free tier: 50k/day)

## 🆘 Troubleshooting

### Error: "Firebase is not initialized"
- Check `.env.local` has all values
- Restart dev server
- Verify NEXT_PUBLIC_ prefix

### Error: "Permission denied"
- Check Firestore security rules are deployed
- Ensure user is authenticated
- Verify uid matches in rules

### Real-time data not updating
- Verify listener is subscribed
- Check network tab for Firestore requests
- Confirm read permissions in rules

## 📖 See Full Guide
For comprehensive documentation, see `FIREBASE_SETUP_GUIDE.md`

## 🎓 Learn More
- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Next.js Firebase Integration](https://nextjs.org/docs)

---

**Ready to use!** Start building with Firebase now! 🚀
