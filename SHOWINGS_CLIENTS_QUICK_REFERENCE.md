# Showings & Clients - Quick Reference Guide

## Overview

Two new Firestore collections have been added to EstateFlow:
- **Clients**: Customer/prospect management
- **Showings**: Property viewing schedule management

## Collections

### Clients Collection

**Location**: `/clients` page
**Firestore**: `collections/clients`

#### Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✓ | Auto-generated document ID |
| `name` | string | ✓ | Client's full name |
| `email` | string | ✓ | Client's email address |
| `phone` | string | ✓ | Client's phone number |
| `type` | enum | ✓ | 'buyer' \| 'renter' \| 'investor' |
| `status` | enum | ✓ | 'active' \| 'inactive' \| 'closed_deal' |
| `budget_min` | number | ✗ | Minimum budget in currency units |
| `budget_max` | number | ✗ | Maximum budget in currency units |
| `preferred_locations` | string[] | ✗ | Array of preferred areas |
| `preferred_property_types` | string[] | ✗ | Array of property types |
| `lead_source` | string | ✗ | How client was acquired |
| `properties_viewed` | string[] | ✗ | Array of property IDs viewed |
| `properties_favorited` | string[] | ✗ | Array of favorited property IDs |
| `agent_assigned` | string | ✗ | Assigned agent ID |
| `created_at` | Timestamp | ✓ | Document creation timestamp |

#### Example Document
```json
{
  "id": "client_abc123",
  "name": "Sarah Johnson",
  "email": "sarah.johnson@example.com",
  "phone": "+1 (555) 987-6543",
  "type": "buyer",
  "status": "active",
  "budget_min": 450000,
  "budget_max": 750000,
  "preferred_locations": ["Downtown", "Riverside"],
  "preferred_property_types": ["house", "townhouse"],
  "lead_source": "website_inquiry",
  "properties_viewed": ["prop_001", "prop_002", "prop_003"],
  "properties_favorited": ["prop_001", "prop_003"],
  "agent_assigned": "agent_user_123",
  "created_at": Timestamp("2025-01-15T10:30:00Z")
}
```

### Showings Collection

**Location**: `/showings` page
**Firestore**: `collections/showings`

#### Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✓ | Auto-generated document ID |
| `property_id` | string | ✓ | Reference to property document |
| `agent_id` | string | ✓ | Reference to agent/user document |
| `client_id` | string | ✓ | Reference to client document |
| `scheduled_date` | Timestamp | ✓ | Date and time of showing |
| `status` | enum | ✓ | 'scheduled' \| 'completed' \| 'cancelled' \| 'no-show' |
| `notes` | string | ✗ | Additional notes about showing |
| `created_at` | Timestamp | ✓ | Document creation timestamp |

#### Example Document
```json
{
  "id": "showing_xyz789",
  "property_id": "prop_001",
  "agent_id": "agent_user_123",
  "client_id": "client_abc123",
  "scheduled_date": Timestamp("2025-02-01T14:00:00Z"),
  "status": "scheduled",
  "notes": "Bring keys from front desk, check water heater",
  "created_at": Timestamp("2025-01-15T11:45:00Z")
}
```

## Service Functions

### Client Services

```typescript
import {
  createClient,
  getClientById,
  getAllClients,
  updateClient,
  deleteClient,
  subscribeToClients,
} from '@/lib/firebase/services'

// Create a new client
await createClient({
  name: "John Doe",
  email: "john@example.com",
  phone: "+1 (555) 123-4567",
  type: "buyer",
  status: "active",
  budget_min: 300000,
  budget_max: 500000,
  created_at: new Date(),
})

// Get single client
const client = await getClientById("client_id")

// Get all clients
const clients = await getAllClients()

// Get active clients only
import { where } from "firebase/firestore"
const activeClients = await getAllClients([
  where("status", "==", "active")
])

// Update client
await updateClient("client_id", {
  status: "inactive"
})

// Delete client
await deleteClient("client_id")

// Real-time subscription
const unsubscribe = subscribeToClients(
  (clients) => {
    console.log("Clients updated:", clients)
    setClients(clients)
  },
  [], // constraints
  (error) => console.error(error)
)

// Cleanup
unsubscribe()
```

### Showing Services

```typescript
import {
  createShowing,
  getShowingById,
  getAllShowings,
  updateShowing,
  deleteShowing,
  subscribeToShowings,
} from '@/lib/firebase/services'

// Create a new showing
await createShowing({
  property_id: "prop_001",
  agent_id: "agent_123",
  client_id: "client_abc123",
  scheduled_date: new Date("2025-02-01T14:00:00Z"),
  status: "scheduled",
  notes: "Meet at property entrance",
  created_at: new Date(),
})

// Get single showing
const showing = await getShowingById("showing_id")

// Get all showings
const showings = await getAllShowings()

// Get scheduled showings only
import { where } from "firebase/firestore"
const scheduled = await getAllShowings([
  where("status", "==", "scheduled")
])

// Get showings for a specific client
const clientShowings = await getAllShowings([
  where("client_id", "==", "client_id")
])

// Update showing
await updateShowing("showing_id", {
  status: "completed"
})

// Delete showing
await deleteShowing("showing_id")

// Real-time subscription
const unsubscribe = subscribeToShowings(
  (showings) => {
    console.log("Showings updated:", showings)
    setShowings(showings)
  },
  [], // constraints
  (error) => console.error(error)
)

// Cleanup
unsubscribe()
```

## Page Routes

### Clients Page
**Route**: `/clients`
**Features**:
- ✓ Real-time client list
- ✓ Search by name or email
- ✓ Filter by type (buyer, renter, investor)
- ✓ Filter by status (active, inactive, closed_deal)
- ✓ Create new client form (modal dialog)
- ✓ View/Delete buttons
- ✓ Stats cards showing totals

### Showings Page
**Route**: `/showings`
**Features**:
- ✓ Real-time showings list
- ✓ Search by client or property ID
- ✓ Filter by status (scheduled, completed, cancelled, no-show)
- ✓ Create new showing form (modal dialog)
- ✓ View/Delete buttons
- ✓ Stats cards showing totals by status
- ✓ Date/time display with proper formatting

## Form Usage

### CreateClientForm

```typescript
import { CreateClientForm } from '@/components/client/create-client-form'

export default function Page() {
  return (
    <Dialog>
      <DialogTrigger>New Client</DialogTrigger>
      <DialogContent>
        <CreateClientForm onSuccess={() => {
          // Handle success
        }} />
      </DialogContent>
    </Dialog>
  )
}
```

**Form Validations**:
- ✓ Name (required, min 2 chars)
- ✓ Email (required, valid format)
- ✓ Phone (required)
- ✓ Type (required, enum)
- ✓ Status (required, enum)
- ✓ Budget values (optional, numeric)

### CreateShowingForm

```typescript
import { CreateShowingForm } from '@/components/showing/create-showing-form'

export default function Page() {
  return (
    <Dialog>
      <DialogTrigger>New Showing</DialogTrigger>
      <DialogContent>
        <CreateShowingForm onSuccess={() => {
          // Handle success
        }} />
      </DialogContent>
    </Dialog>
  )
}
```

**Form Validations**:
- ✓ Property ID (required)
- ✓ Client ID (required)
- ✓ Agent ID (required)
- ✓ Scheduled Date (required, datetime)
- ✓ Status (required, enum)
- ✓ Notes (optional)

## Real-Time Updates

Both collections support real-time subscriptions via `useEffect`:

```typescript
useEffect(() => {
  const unsubscribe = subscribeToClients(
    (data) => setClients(data),
    [],
    (error) => setError(error.message)
  )
  
  return () => unsubscribe()
}, [])
```

**Features**:
- ✓ Automatic data sync with Firestore
- ✓ Instant UI updates
- ✓ Error handling
- ✓ Proper cleanup on unmount

## Common Tasks

### Find clients by agent
```typescript
import { where } from "firebase/firestore"

const agentClients = await getAllClients([
  where("agent_assigned", "==", "agent_user_123")
])
```

### Get upcoming showings (next 7 days)
```typescript
import { where, orderBy } from "firebase/firestore"

const today = new Date()
const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

const upcomingShowings = await getAllShowings([
  where("scheduled_date", ">=", today),
  where("scheduled_date", "<=", nextWeek),
  where("status", "==", "scheduled"),
  orderBy("scheduled_date", "asc"),
])
```

### Update client properties viewed
```typescript
const client = await getClientById("client_id")

await updateClient("client_id", {
  properties_viewed: [
    ...(client.properties_viewed || []),
    "new_property_id"
  ]
})
```

### Mark showing as completed
```typescript
await updateShowing("showing_id", {
  status: "completed"
})
```

## Firestore Indexes

For optimal performance with multiple filters, create indexes:

1. **clients collection**:
   - `status` ✓ `created_at` (Descending)
   - `type` ✓ `status` ✓ `created_at`

2. **showings collection**:
   - `status` ✓ `scheduled_date` (Ascending)
   - `agent_id` ✓ `scheduled_date`

Firestore will prompt you to create these when you run queries.

## Sidebar Navigation

Both new pages are added to the sidebar:
- 📋 **Clients** - Navigate to `/clients`
- 📅 **Showings** - Navigate to `/showings`

The sidebar is located at `components/layout/sidebar.tsx`.

## Styling & Theme

All components use the project's existing theme:
- Color palette: CSS custom properties (--color-*)
- Glass morphism design
- Motion/animations via Framer Motion
- Responsive grid layouts

## Error Handling

All forms and tables include:
- ✓ Error alerts with user-friendly messages
- ✓ Loading states during operations
- ✓ Toast notifications for success/failure
- ✓ Proper error logging

## Browser DevTools Debugging

To debug real-time data:

```typescript
// In browser console
firebase.firestore().collection('clients').onSnapshot(snap => {
  console.log('Clients:', snap.docs.map(d => d.data()))
})
```

## Permissions Note

Ensure your Firestore Rules allow:
- ✓ Agents can create/update/delete clients and showings
- ✓ Authenticated users can read all data
- ✓ Follow the security rules in `FIREBASE_SHOWINGS_CLIENTS_SETUP.md`

---

**Version**: 1.0
**Last Updated**: December 28, 2025
