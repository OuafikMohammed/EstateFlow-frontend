# Manage Properties - UI/UX Quick Reference

## Button Location in Properties Page

```
┌────────────────────────────────────────────────────────────┐
│  PROPERTIES                                                 │
│  Browse and view all available properties                  │
│                                                             │
│        [Manage My Properties] [+ New Property]             │
│                                                             │
│  OR on Mobile:                                              │
│  [Manage My Properties]                                    │
│  [+ New Property]                                          │
└────────────────────────────────────────────────────────────┘
```

## Desktop View (Manage Properties Page)

```
┌─────────────────────────────────────────────────────────────┐
│  ← | MANAGE PROPERTIES          [+ New Property]           │
│     Edit and manage your property listings                 │
├─────────────────────────────────────────────────────────────┤
│  [Search...] [Type▼] [Status▼] [Sort▼]                    │
├─────────────────────────────────────────────────────────────┤
│ Property              Type           Status      Price      │
├─────────────────────────────────────────────────────────────┤
│ Luxury Apartment      [Apartment]    [Available] $500,000   │
│ 123 Main St, City                                [E][D]     │
│                                                             │
│ Beautiful House       [House]        [Sold]      $750,000   │
│ 456 Oak Ave, City                                [E][D]     │
│                                                             │
│ Commercial Space      [Commercial]   [Active]    $1,200,000 │
│ 789 Business Dr, City                            [E][D]     │
├─────────────────────────────────────────────────────────────┤
│  [<] [1] [2] [3] [>]                                       │
└─────────────────────────────────────────────────────────────┘
```

## Mobile View (Manage Properties Page)

```
┌─────────────────────────────────┐
│  ← Manage Properties            │
│    Edit and manage your         │
│    property listings            │
│                  [+ New Property]│
├─────────────────────────────────┤
│ [Search...]                     │
│ [Type▼] [Status▼] [Sort▼]      │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ Luxury Apartment            │ │
│ │ 123 Main St, City           │ │
│ │ [Apartment] [Available]     │ │
│ │ $500,000        [✏️] [🗑️]  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Beautiful House             │ │
│ │ 456 Oak Ave, City           │ │
│ │ [House] [Sold]              │ │
│ │ $750,000        [✏️] [🗑️]  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Commercial Space            │ │
│ │ 789 Business Dr, City       │ │
│ │ [Commercial] [Active]       │ │
│ │ $1.2M           [✏️] [🗑️]  │ │
│ └─────────────────────────────┘ │
│                                 │
│ [<] [1] [2] [3] [>]             │
└─────────────────────────────────┘
```

## Delete Confirmation Dialog

```
┌─────────────────────────────────────────┐
│  ⚠️  Delete Property                     │
├─────────────────────────────────────────┤
│                                         │
│  Are you sure you want to delete        │
│  "Luxury Apartment"?                    │
│                                         │
│  ⚠️  This action cannot be undone.     │
│      The property will be permanently   │
│      deleted.                           │
│                                         │
│              [Cancel] [Delete Property] │
└─────────────────────────────────────────┘
```

## Color Codes

### Property Type Badges
```
┌─────────────────────────────────────┐
│  [House]          - Blue bg          │
│  [Apartment]      - Purple bg        │
│  [Commercial]     - Orange bg        │
│  [Condo]          - Cyan bg          │
│  [Land]           - Green bg         │
│  [Multi-Family]   - Indigo bg        │
│  [Townhouse]      - Pink bg          │
└─────────────────────────────────────┘
```

### Property Status Badges
```
┌─────────────────────────────────────┐
│  [Available]      - Green bg         │
│  [Under Contract] - Blue bg          │
│  [Sold]           - Gray bg          │
│  [Expired]        - Red bg           │
│  [Withdrawn]      - Yellow bg        │
└─────────────────────────────────────┘
```

## Empty State

```
┌─────────────────────────────────────┐
│                                     │
│        No properties yet            │
│                                     │
│  You haven't created any            │
│  properties yet. Start by           │
│  creating your first property.      │
│                                     │
│  [+ Create Your First Property]    │
│                                     │
└─────────────────────────────────────┘
```

## Deletion Flow Diagram

```
User on Manage Properties Page
         │
         ▼
   Click Delete Button
         │
         ▼
┌─────────────────────────────┐
│ Delete Confirmation Dialog  │ ← Modal appears
│ Show property name          │
│ [Cancel] [Delete]           │
└─────────────────────────────┘
     │                │
     └──Cancel────→ Dialog closes
                      (no change)
     
     │
     └──Delete──→ Loading state
                      ▼
                  Mutation fires
                      ▼
                  Success/Error
                      ▼
                  Toast notification
                      ▼
                  List refreshes
                      ▼
                  Property removed
```

## Device Breakpoints

```
┌──────────────────────────────────────────┐
│  < 640px   : Mobile             [Card]   │
│  640-768px : Tablet             [Card]   │
│  768px+    : Desktop            [Table]  │
│  1024px+   : Large Desktop      [Table]  │
└──────────────────────────────────────────┘
```

## Touch Target Sizes

```
All buttons:           48px × 44px (min)
Edit/Delete icons:     40px × 40px
Status badges:         Auto (≥24px)
Type badges:          Auto (≥24px)
Search input:         44px height
Dropdown selects:     44px height
```

## Animation Timings

```
Modal appear:         200ms (opacity + scale)
Modal disappear:      200ms
Property card:        100ms fade-in (staggered)
Button hover:         150ms (smooth)
Delete spinner:       Continuous rotate
```

## Responsive Text Sizes

```
Desktop:
  Header (h1):       2.25rem
  Subheader (h3):    1.25rem
  Table text:        0.875-1rem
  Badges:            0.75rem

Mobile:
  Header (h1):       1.875rem
  Subheader (h3):    1.125rem
  Card text:         0.875-1rem
  Badges:            0.75rem
```

## Navigation

### Main Properties Page
```
URL: /properties
Features: 
  - View all company properties
  - Filter and search
  - [Manage My Properties] button
  - [New Property] button
```

### Manage Properties Page
```
URL: /properties/manage
Features:
  - Shows only user's properties
  - All management options
  - [New Property] button
  - Back to Properties link
```

### Links Within Pages
```
From Manage Properties:
  - "← Back" → /properties
  - "[+ New Property]" → /properties/new
  - "[Edit]" button → /properties/{id}/edit
  - "[Delete]" button → Opens modal

From Properties:
  - "[Manage My Properties]" → /properties/manage
  - "[+ New Property]" → /properties/new
```
