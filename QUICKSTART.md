# Quick Start: Showings & Clients - Get Running in 5 Minutes

## Prerequisites
- ✓ Next.js 14 project (already have)
- ✓ Firebase project created
- ✓ Firebase credentials

---

## Step 1: Configure Firebase (2 minutes)

### 1.1 Get Your Firebase Credentials
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click your project name
3. Go to ⚙️ Project Settings
4. Find "Web" app
5. Copy these values:
   ```
   apiKey
   authDomain
   projectId
   storageBucket
   messagingSenderId
   appId
   ```

### 1.2 Update `.env.local`
Edit `d:\PERSONAL PROJECTS\EstateFlow\.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_value_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_value_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_value_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_value_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_value_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_value_here
```

---

## Step 2: Create Firestore Collections (1 minute)

1. In Firebase Console, go to **Firestore Database**
2. Click **"Create collection"**
3. Create these collections (leave empty, don't add documents yet):
   - `clients`
   - `showings`

---

## Step 3: Start the App (1 minute)

```bash
cd "d:\PERSONAL PROJECTS\EstateFlow"
npm run dev
# or
pnpm dev
```

Visit: http://localhost:3000

---

## Step 4: Test the Features (1 minute)

### Test Clients Page
1. Click **Clients** in sidebar (or visit `/clients`)
2. Click **"New Client"** button
3. Fill in form:
   - Name: `John Doe`
   - Email: `john@example.com`
   - Phone: `+1 (555) 123-4567`
   - Type: `Buyer`
   - Status: `Active`
4. Click **"Create Client"**
5. ✅ Should see success toast & client in table

### Test Showings Page
1. Click **Showings** in sidebar (or visit `/showings`)
2. Click **"New Showing"** button
3. Fill in form:
   - Property ID: `prop_001`
   - Client ID: `(from above client)`
   - Agent ID: `agent_123`
   - Scheduled Date: Pick future date/time
   - Status: `Scheduled`
4. Click **"Create Showing"**
5. ✅ Should see success toast & showing in table

---

## What Was Added

### 📁 New Files

**Components** (4 files):
- `components/client/clients-table.tsx` - Client list table
- `components/client/create-client-form.tsx` - Create client form
- `components/showing/showings-table.tsx` - Showing list table
- `components/showing/create-showing-form.tsx` - Create showing form

**Pages** (2 files):
- `app/clients/page.tsx` - `/clients` route
- `app/showings/page.tsx` - `/showings` route

**Updated Files** (2):
- `lib/firebase/services.ts` - Added Showing & Client interfaces + CRUD
- `components/layout/sidebar.tsx` - Added menu items for Clients & Showings

**Documentation** (3 files):
- `FIREBASE_SHOWINGS_CLIENTS_SETUP.md` - Complete setup guide
- `SHOWINGS_CLIENTS_QUICK_REFERENCE.md` - Developer reference
- `IMPLEMENTATION_COMPLETE.md` - Implementation details

---

## Features Overview

### Clients Page (`/clients`)
✅ Real-time client list  
✅ Search by name/email  
✅ Filter by type (buyer, renter, investor)  
✅ Filter by status (active, inactive, closed_deal)  
✅ Create new client  
✅ Delete client  
✅ Stats cards  
✅ Responsive design  

### Showings Page (`/showings`)
✅ Real-time showings list  
✅ Search by property/client ID  
✅ Filter by status (scheduled, completed, etc.)  
✅ Create new showing  
✅ Delete showing  
✅ Stats cards  
✅ Datetime picker  
✅ Responsive design  

---

## API Usage

### Create a Client
```typescript
import { createClient } from '@/lib/firebase/services'

await createClient({
  name: "Sarah Johnson",
  email: "sarah@example.com",
  phone: "+1 (555) 987-6543",
  type: "buyer",
  status: "active",
  budget_min: 400000,
  budget_max: 600000,
  created_at: new Date(),
})
```

### Create a Showing
```typescript
import { createShowing } from '@/lib/firebase/services'

await createShowing({
  property_id: "prop_001",
  agent_id: "agent_123",
  client_id: "client_abc",
  scheduled_date: new Date("2025-02-01T14:00:00"),
  status: "scheduled",
  notes: "Meet at property",
  created_at: new Date(),
})
```

### Subscribe to Real-time Updates
```typescript
import { subscribeToClients, subscribeToShowings } from '@/lib/firebase/services'

// Clients
const unsubscribe = subscribeToClients(
  (clients) => setClients(clients),
  [], // constraints
  (error) => console.error(error)
)

// Showings
const unsubscribe = subscribeToShowings(
  (showings) => setShowings(showings),
  [], // constraints
  (error) => console.error(error)
)

// Cleanup on unmount
return () => unsubscribe()
```

---

## Firestore Rules (Important!)

Go to Firestore Console > Rules and update:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    match /clients/{clientId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null;
    }
    
    match /showings/{showingId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null;
    }
    
    // ... rest of rules
  }
}
```

---

## Common Issues & Fixes

### Issue: "Permission denied" error
**Fix**: Update Firestore Rules (see above)

### Issue: Data not loading
**Fix**: 
1. Check browser console for errors
2. Verify `.env.local` has correct values
3. Check Firestore Rules allow read access

### Issue: Can't create documents
**Fix**:
1. Check Firestore Rules allow write access
2. Verify user is authenticated
3. Check required fields are filled

### Issue: Real-time updates not working
**Fix**:
1. Verify subscription is active
2. Check browser console for errors
3. Refresh the page

---

## File References

Quick access to key files:

```
Frontend:
├── pages
│   ├── app/clients/page.tsx
│   └── app/showings/page.tsx
├── components
│   ├── components/client/
│   │   ├── clients-table.tsx
│   │   └── create-client-form.tsx
│   ├── components/showing/
│   │   ├── showings-table.tsx
│   │   └── create-showing-form.tsx
│   └── components/layout/sidebar.tsx

Backend:
└── lib/firebase/services.ts

Docs:
├── IMPLEMENTATION_COMPLETE.md
├── FIREBASE_SHOWINGS_CLIENTS_SETUP.md
└── SHOWINGS_CLIENTS_QUICK_REFERENCE.md
```

---

## Testing Checklist

- [ ] `.env.local` configured with Firebase credentials
- [ ] `clients` collection created in Firestore
- [ ] `showings` collection created in Firestore
- [ ] Firestore Rules updated
- [ ] App running: `npm run dev`
- [ ] Can navigate to `/clients`
- [ ] Can navigate to `/showings`
- [ ] Can create a client
- [ ] Can create a showing
- [ ] Can delete a client
- [ ] Can delete a showing
- [ ] Real-time updates work
- [ ] Search/filter works

---

## Database Schema at a Glance

### Clients Collection
```json
{
  "id": "auto-generated",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1 (555) 123-4567",
  "type": "buyer|renter|investor",
  "status": "active|inactive|closed_deal",
  "budget_min": 300000,
  "budget_max": 500000,
  "created_at": "Timestamp"
}
```

### Showings Collection
```json
{
  "id": "auto-generated",
  "property_id": "prop_001",
  "agent_id": "agent_123",
  "client_id": "client_abc",
  "scheduled_date": "Timestamp",
  "status": "scheduled|completed|cancelled|no-show",
  "notes": "Optional notes",
  "created_at": "Timestamp"
}
```

---

## Next Steps

1. ✅ Configure Firebase
2. ✅ Create collections
3. ✅ Run the app
4. ✅ Test features
5. 📝 Read documentation for advanced features
6. 🔒 Configure Firestore Rules for production
7. 🎨 Customize forms as needed
8. 📊 Add more features (edit, export, etc.)

---

## Documentation Links

For more details, see:
- **Setup Guide**: [FIREBASE_SHOWINGS_CLIENTS_SETUP.md](./FIREBASE_SHOWINGS_CLIENTS_SETUP.md)
- **Quick Reference**: [SHOWINGS_CLIENTS_QUICK_REFERENCE.md](./SHOWINGS_CLIENTS_QUICK_REFERENCE.md)
- **Implementation Details**: [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)

---

## Support

Need help?
1. Check browser console for errors
2. Review documentation files
3. Check Firestore Rules
4. Verify Firebase credentials in `.env.local`

---

**Ready to go! Happy coding! 🚀**

Version: 1.0
Updated: December 28, 2025
