# Complete Firebase Setup & Firestore Collections Guide

## Table of Contents
1. [Environment Setup](#environment-setup)
2. [Firebase Project Configuration](#firebase-project-configuration)
3. [Firestore Collections Schema](#firestore-collections-schema)
4. [Firestore Rules](#firestore-rules)
5. [Testing & Verification](#testing--verification)
6. [Troubleshooting](#troubleshooting)

---

## Environment Setup

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or select existing project
3. Enable these services:
   - ✅ Authentication
   - ✅ Firestore Database
   - ✅ Cloud Storage

### Step 2: Get Firebase Credentials
1. Go to Project Settings (⚙️ icon)
2. Copy these values:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

### Step 3: Configure Environment Variables
Update `.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

---

## Firebase Project Configuration

### Authentication Setup
1. Go to Authentication > Sign-in method
2. Enable:
   - ✅ Email/Password
   - ✅ Google (optional)
   - ✅ Phone (optional)

### Firestore Database Setup
1. Go to Firestore Database
2. Click "Create database"
3. Start in **Production mode**
4. Select region (closest to your users)
5. Click "Create"

---

## Firestore Collections Schema

### Collection: `users`
**Document ID**: Auto-generated
```typescript
{
  email: string
  password?: string (hashed in backend, not stored)
  roles: string[] // ['admin', 'agent', 'user']
  firstName: string
  lastName: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### Collection: `properties`
**Document ID**: Auto-generated
```typescript
{
  title: string
  description: string
  price: number
  location: string
  images: string[] // URLs from Cloud Storage
  bedrooms: number
  bathrooms: number
  squareFeet: number
  type: string // 'apartment' | 'house' | 'villa' | 'commercial'
  status: string // 'available' | 'sold' | 'rented'
  agentId: string (reference to users document)
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### Collection: `leads`
**Document ID**: Auto-generated
```typescript
{
  name: string
  email: string
  phone: string
  propertyId?: string (reference to properties document)
  status: string // 'new' | 'contacted' | 'qualified' | 'converted'
  notes?: string
  agentId: string (reference to users document)
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### Collection: `transactions`
**Document ID**: Auto-generated
```typescript
{
  propertyId: string (reference to properties document)
  buyerId: string (reference to users document)
  sellerId: string (reference to users document)
  amount: number
  date: Timestamp
  type: string // 'sale' | 'rental'
  status: string // 'pending' | 'completed' | 'cancelled'
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### Collection: `showings` (NEW)
**Document ID**: Auto-generated
```typescript
{
  property_id: string (reference to properties document)
  agent_id: string (reference to users document)
  client_id: string (reference to clients document)
  scheduled_date: Timestamp
  status: string // 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
  created_at: Timestamp
}
```

### Collection: `clients` (NEW)
**Document ID**: Auto-generated
```typescript
{
  name: string
  email: string
  phone: string
  type: string // 'buyer' | 'renter' | 'investor'
  budget_min?: number
  budget_max?: number
  preferred_locations?: string[]
  preferred_property_types?: string[]
  lead_source?: string // 'website' | 'referral' | 'cold_call' | etc.
  properties_viewed?: string[] // array of property IDs
  properties_favorited?: string[] // array of property IDs
  agent_assigned?: string (reference to users document)
  status: string // 'active' | 'inactive' | 'closed_deal'
  created_at: Timestamp
}
```

---

## Firestore Rules

### Production Rules
Update your Firestore Security Rules in the Firebase Console:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow authenticated users to read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow read: if request.auth != null; // Allow agents to view other profiles
    }
    
    // Properties: Agents can write, all authenticated users can read
    match /properties/{propertyId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null && 
        request.auth.token.customClaims.role == 'agent';
    }
    
    // Leads: Agents can manage, authenticated users can view
    match /leads/{leadId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null && 
        request.auth.token.customClaims.role == 'agent';
    }
    
    // Transactions: Only admins can manage
    match /transactions/{transactionId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null && 
        request.auth.token.customClaims.role == 'admin';
    }
    
    // Showings: Agents can manage, authenticated users can view
    match /showings/{showingId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null && 
        request.auth.token.customClaims.role == 'agent';
    }
    
    // Clients: Agents can manage, authenticated users can view
    match /clients/{clientId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null && 
        request.auth.token.customClaims.role == 'agent';
    }
    
    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Testing & Verification

### Step 1: Test Firebase Connection
Create a test file to verify connection:

```bash
npm run dev
```

### Step 2: Create Test Data in Firestore Console
1. Go to Firestore Database
2. Click "Create collection"
3. Create collections:
   - `users`
   - `properties`
   - `leads`
   - `transactions`
   - `showings` (NEW)
   - `clients` (NEW)

### Step 3: Add Sample Documents
#### Sample Client:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1 (555) 123-4567",
  "type": "buyer",
  "status": "active",
  "budget_min": 300000,
  "budget_max": 500000,
  "preferred_locations": ["New York", "Los Angeles"],
  "preferred_property_types": ["apartment", "house"],
  "lead_source": "website",
  "created_at": "2025-01-01T00:00:00Z"
}
```

#### Sample Showing:
```json
{
  "property_id": "prop_123",
  "agent_id": "user_456",
  "client_id": "client_789",
  "scheduled_date": "2025-02-01T14:00:00Z",
  "status": "scheduled",
  "notes": "Meet at property entrance",
  "created_at": "2025-01-01T00:00:00Z"
}
```

### Step 4: Test Frontend Pages
```bash
# Navigate to these URLs
http://localhost:3000/clients
http://localhost:3000/showings
```

You should see:
- ✅ Real-time data from Firestore
- ✅ Search/filter functionality
- ✅ Create buttons that open forms
- ✅ Delete buttons that remove documents

---

## Frontend Implementation Overview

### Services (`lib/firebase/services.ts`)
All CRUD operations are implemented:

```typescript
// Clients
createClient(data)
getClientById(id)
getAllClients(constraints)
updateClient(id, data)
deleteClient(id)
subscribeToClients(callback)

// Showings
createShowing(data)
getShowingById(id)
getAllShowings(constraints)
updateShowing(id, data)
deleteShowing(id)
subscribeToShowings(callback)
```

### Pages
- **`/clients`** - View all clients with real-time updates
- **`/showings`** - View all showings with real-time updates

### Forms
- **CreateClientForm** - Create new clients with validation
- **CreateShowingForm** - Schedule new showings

---

## Troubleshooting

### Issue: "Cannot find module '@/lib/firebase/services'"
**Solution**: Verify `lib/firebase/services.ts` exists and has proper exports

### Issue: "Permission denied" error
**Solution**: 
1. Check Firestore Rules in Firebase Console
2. Ensure user is authenticated
3. Verify user role has permission for operation

### Issue: Real-time data not updating
**Solution**:
1. Check browser console for errors
2. Verify Firestore Rules allow read access
3. Ensure subscription is not unsubscribed

### Issue: Forms not submitting
**Solution**:
1. Check browser Network tab in DevTools
2. Verify all required fields are filled
3. Check browser console for JavaScript errors

### Issue: Timestamp display is incorrect
**Solution**: 
Use the formatDate utility:
```typescript
const formatDate = (date: Date | any) => {
  if (date?.toDate) return date.toDate().toLocaleDateString()
  if (date instanceof Date) return date.toLocaleDateString()
  return new Date(date).toLocaleDateString()
}
```

---

## Next Steps

### 1. Implement User Authentication
```bash
# Check login page at: /login
# Uses Firebase Authentication
```

### 2. Add More Collections
Extend `lib/firebase/services.ts` with your custom collections:
```typescript
// Add new interface
export interface MyCollection {
  id: string
  // ... fields
}

// Add CRUD functions
export const createMyCollection = (data) => createDocument("my_collection", data)
// ... rest of CRUD
```

### 3. Add Real-time Queries with Constraints
```typescript
import { where, orderBy, limit } from "firebase/firestore"

// Get active clients only
getAllClients([where("status", "==", "active")])

// Get recent showings
getAllShowings([orderBy("created_at", "desc"), limit(10)])
```

### 4. Implement Search & Filtering
Examples in components:
- `components/client/clients-table.tsx`
- `components/showing/showings-table.tsx`

---

## Resources

- 📚 [Firebase Documentation](https://firebase.google.com/docs)
- 🔥 [Firestore Guide](https://firebase.google.com/docs/firestore)
- 🛡️ [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/start)
- ⚛️ [Next.js Firebase Integration](https://firebase.google.com/docs/web/setup)

---

## File Structure

```
lib/firebase/
├── auth.ts           # Authentication functions
├── config.ts         # Firebase config
├── database.ts       # Generic CRUD helpers
├── errors.ts         # Error handling
├── index.ts          # Exports
├── services.ts       # Domain-specific services (Users, Properties, Leads, Transactions, Showings, Clients)
└── firestore.rules   # Security rules

components/
├── client/
│   ├── clients-table.tsx
│   └── create-client-form.tsx
├── showing/
│   ├── showings-table.tsx
│   └── create-showing-form.tsx
└── ... (other components)

app/
├── clients/
│   └── page.tsx
├── showings/
│   └── page.tsx
└── ... (other pages)
```

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Network tab in DevTools
3. Verify Firebase credentials in `.env.local`
4. Check Firestore Rules in Firebase Console
5. Review error messages in terminal

---

**Last Updated**: December 28, 2025
**Version**: 2.0 (Added Showings & Clients collections)
