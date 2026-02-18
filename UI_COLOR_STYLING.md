# EstateFlow UI Color Styling Guide

## Overview
EstateFlow uses a luxury brand color system with a dark theme (dark mode). The application features a sophisticated palette of gold, dark grays, and greens, complemented by Tailwind CSS utility colors for status badges and states.

**Color System File:** [app/globals.css](app/globals.css)

---

## Core CSS Variables

### Primary Brand Colors

| Variable | Hex Value | RGB Value | Usage |
|----------|-----------|-----------|-------|
| `--color-primary-gold` | `#c5a059` | rgb(197, 160, 89) | Primary brand color, buttons, highlights, icons |
| `--color-brand-green` | `#1b4332` | rgb(27, 67, 50) | Secondary brand color, chart data, accents |
| `--color-bg-dark` | `#0b0b0b` | rgb(11, 11, 11) | Dark background, main page background |
| `--color-text-light` | `#f8f9fa` | rgb(248, 249, 250) | Light text, foreground text for all content |
| `--color-bg-card` | `#1a1a1a` | rgb(26, 26, 26) | Card backgrounds, input backgrounds, modals |
| `--color-border` | `#2a2a2a` | rgb(42, 42, 42) | Borders, dividers, separators |
| `--color-accent` | `#e8d4a0` | rgb(232, 212, 160) | Light accent, highlights, secondary gold |
| `--color-success` | `#52b788` | rgb(82, 183, 136) | Success states, green accents, positive indicators |
| `--color-danger` | `#ef233c` | rgb(239, 35, 60) | Error states, delete actions, warning colors |

### Semantic CSS Variables (from ShadcnUI)

| Variable | Hex Value | Used For |
|----------|-----------|----------|
| `--background` | `#0b0b0b` | Page background |
| `--foreground` | `#f8f9fa` | Default text color |
| `--card` | `#1a1a1a` | Card and container backgrounds |
| `--card-foreground` | `#f8f9fa` | Text inside cards |
| `--primary` | `#c5a059` | Primary button, accent elements |
| `--primary-foreground` | `#0b0b0b` | Text on primary backgrounds |
| `--secondary` | `#1b4332` | Secondary button states |
| `--secondary-foreground` | `#f8f9fa` | Text on secondary backgrounds |
| `--muted` | `#2a2a2a` | Disabled states, subtle backgrounds |
| `--muted-foreground` | `#a0a0a0` | Subtle/disabled text, placeholders |
| `--accent` | `#e8d4a0` | Accent highlights |
| `--accent-foreground` | `#0b0b0b` | Text on accent backgrounds |
| `--destructive` | `#ef233c` | Delete/dangerous actions |
| `--destructive-foreground` | `#f8f9fa` | Text on destructive backgrounds |
| `--border` | `#2a2a2a` | Borders and dividers |
| `--input` | `#2a2a2a` | Input field backgrounds |
| `--ring` | `#c5a059` | Focus rings, outline rings |

### Chart Colors

| Variable | Hex Value | Purpose |
|----------|-----------|---------|
| `--chart-1` | `#c5a059` | Primary chart/graph color |
| `--chart-2` | `#1b4332` | Secondary chart color |
| `--chart-3` | `#52b788` | Success/positive trend chart |
| `--chart-4` | `#e8d4a0` | Light accent chart color |
| `--chart-5` | `#ef233c` | Danger/negative trend chart |

### Sidebar Colors

| Variable | Hex Value | Used For |
|----------|-----------|----------|
| `--sidebar` | `#1a1a1a` | Sidebar background |
| `--sidebar-foreground` | `#f8f9fa` | Sidebar text |
| `--sidebar-primary` | `#c5a059` | Active sidebar items |
| `--sidebar-primary-foreground` | `#0b0b0b` | Text on active sidebar |
| `--sidebar-accent` | `#2a2a2a` | Sidebar hover states |
| `--sidebar-accent-foreground` | `#f8f9fa` | Text on sidebar hover |
| `--sidebar-border` | `#2a2a2a` | Sidebar dividers |
| `--sidebar-ring` | `#c5a059` | Sidebar focus ring |

### Glass Morphism

| Variable | Value | Usage |
|----------|-------|-------|
| `--glass-bg` | `rgba(26, 26, 26, 0.7)` | Glass effect background (70% opacity) |
| `--glass-border` | `rgba(255, 255, 255, 0.1)` | Glass effect border (10% opacity) |

---

## Color Usage by Page

### Dashboard (`app/dashboard/page.tsx`)

| Element | Color | Hex Value |
|---------|-------|-----------|
| Page Background | `var(--color-bg-dark)` | `#0b0b0b` |
| Card Backgrounds | `var(--color-bg-card)` | `#1a1a1a` |
| Text | `var(--color-text-light)` | `#f8f9fa` |
| Borders | `var(--color-border)` | `#2a2a2a` |
| Stat Cards Gradient (Properties) | `from-[var(--color-brand-green)] to-[var(--color-success)]` | `#1b4332 to #52b788` |
| Stat Cards Gradient (Leads) | `from-[var(--color-bg-dark)] to-[var(--color-primary-gold)]` | `#0b0b0b to #c5a059` |
| Stat Cards Gradient (Sold) | `from-[var(--color-bg-dark)] to-[var(--color-success)]` | `#0b0b0b to #52b788` |
| Chart Section | Uses `--chart-1` through `--chart-5` | Various |
| Muted Text | `var(--color-muted-foreground)` | `#a0a0a0` |

### Properties Manage Page (`app/properties/manage/page.tsx`)

| Element | Color | Hex Value | Usage |
|---------|-------|-----------|-------|
| Page Background | `var(--color-bg-dark)` | `#0b0b0b` | Main background |
| Header Text | `var(--color-text-light)` | `#f8f9fa` | Page title and headings |
| Subtitle Text | `var(--color-muted-foreground)` | `#a0a0a0` | Descriptive text |
| Back Button | `var(--color-text-light)` | `#f8f9fa` | Icon and text |
| New Property Button | `var(--color-primary-gold)` | `#c5a059` | Button background |
| New Property Button Hover | `var(--color-primary-gold-dark)` | Darker gold | Hover state |
| Filter Section Background | glass class | rgba(26, 26, 26, 0.7) | Semi-transparent card |
| Input/Select Backgrounds | `var(--color-bg-card)` | `#1a1a1a` | Form fields |
| Input/Select Borders | `var(--color-border)` | `#2a2a2a` | Form field borders |
| Input/Select Text | `var(--color-text-light)` | `#f8f9fa` | Form field text |
| Search Icon Color | `var(--color-muted-foreground)` | `#a0a0a0` | Subtle icon |
| Loading Spinner | `var(--color-primary-gold)` | `#c5a059` | Spinning animation |
| Error State Background | `bg-red-500/10` | rgba(239, 35, 60, 0.1) | 10% red opacity |
| Error State Border | `border-red-500/20` | rgba(239, 35, 60, 0.2) | 20% red opacity |
| Error State Text | `text-red-500` | `#ef233c` | Error message text |
| Table Hover | `var(--color-bg-hover)` | Darker than card | Row hover effect |
| Edit Button | `var(--color-primary-gold)` | `#c5a059` | Action button |
| Delete Button | `text-red-500` | `#ef233c` | Delete action |

#### Property Status Badges

Used in [app/properties/manage/page.tsx](app/properties/manage/page.tsx) - `getStatusColor()` function:

| Status | Background | Text | Usage |
|--------|------------|------|-------|
| Available | `bg-green-100` | `text-green-800` | Active available properties |
| Under Contract | `bg-blue-100` | `text-blue-800` | Properties with pending offers |
| Sold | `bg-gray-100` | `text-gray-800` | Completed sales |
| Expired | `bg-red-100` | `text-red-800` | Expired listings |
| Withdrawn | `bg-yellow-100` | `text-yellow-800` | Removed listings |
| Default | `bg-gray-100` | `text-gray-800` | Unknown status |

#### Property Type Badges

Used in [app/properties/manage/page.tsx](app/properties/manage/page.tsx) - `getTypeColor()` function:

| Type | Background | Text | Usage |
|------|------------|------|-------|
| House | `bg-blue-100` | `text-blue-800` | Single-family homes |
| Condo | `bg-cyan-100` | `text-cyan-800` | Condominium units |
| Commercial | `bg-orange-100` | `text-orange-800` | Commercial properties |
| Land | `bg-green-100` | `text-green-800` | Land only properties |
| Multi-Family | `bg-indigo-100` | `text-indigo-800` | Multi-unit properties |
| Townhouse | `bg-pink-100` | `text-pink-800` | Townhouse units |
| Default | `bg-gray-100` | `text-gray-800` | Unknown type |

### Login Page (`app/login/page.tsx`)

| Element | Color | Hex Value |
|---------|-------|-----------|
| Page Background Gradient | `from-slate-900 via-slate-800 to-slate-900` | #0f172a to #1e293b |
| Logo Section Background | Transparent | N/A |
| Title | `text-white` | `#ffffff` |
| Subtitle | `text-slate-400` | `#94a3b8` |
| Link Text | `text-blue-400` | `#60a5fa` |
| Link Hover | `hover:text-blue-300` | `#93c5fd` |
| Form Background | Glass effect | Semi-transparent |

### Delete Confirmation Modal

Used in [app/properties/manage/page.tsx](app/properties/manage/page.tsx) - `DeleteConfirmationDialog`:

| Element | Color | Hex Value |
|---------|-------|-----------|
| Modal Background | `var(--color-bg-card)` | `#1a1a1a` |
| Modal Border | `var(--color-border)` | `#2a2a2a` |
| Modal Backdrop | `bg-black/50` | rgba(0, 0, 0, 0.5) |
| Icon | `text-red-500` | `#ef233c` |
| Title Text | `var(--color-text-light)` | `#f8f9fa` |
| Message Text | `var(--color-muted-foreground)` | `#a0a0a0` |
| Warning Box Background | `bg-red-500/10` | rgba(239, 35, 60, 0.1) |
| Warning Box Border | `border-red-500/20` | rgba(239, 35, 60, 0.2) |
| Warning Text | `text-red-500` | `#ef233c` |
| Cancel Button | `var(--color-text-light)` | `#f8f9fa` |
| Confirm Button | `bg-red-600` | `#dc2626` |
| Confirm Button Hover | `hover:bg-red-700` | `#b91c1c` |

### Mobile Card View

Mobile version uses the same color variables but with card layouts instead of table:

| Element | Color | Hex Value |
|---------|-------|-----------|
| Card Background | glass class | rgba(26, 26, 26, 0.7) |
| Card Border | `var(--color-border)` | `#2a2a2a` |
| Title Text | `var(--color-text-light)` | `#f8f9fa` |
| Subtitle Text | `var(--color-muted-foreground)` | `#a0a0a0` |
| Price Text | `var(--color-primary-gold)` | `#c5a059` |
| Card Divider | `border-[var(--color-border)]` | `#2a2a2a` |

### Empty State

| Element | Color | Hex Value |
|---------|-------|-----------|
| Card Background | glass class | rgba(26, 26, 26, 0.7) |
| Title Text | `var(--color-text-light)` | `#f8f9fa` |
| Message Text | `var(--color-muted-foreground)` | `#a0a0a0` |
| CTA Button | `var(--color-primary-gold)` | `#c5a059` |

### Pagination

| Element | Color | Hex Value |
|---------|-------|-----------|
| Button Border | `var(--color-border)` | `#2a2a2a` |
| Default Button Background | transparent | N/A |
| Active Page Button | `var(--color-primary-gold)` | `#c5a059` |
| Button Hover | Lighter than primary | N/A |

---

## Tailwind Color Classes Used

### Text Colors
- `text-white` - Pure white text
- `text-slate-400` - Muted gray text
- `text-slate-900` - Dark text
- `text-blue-400` / `text-blue-300` - Link colors
- `text-red-500` - Error/destructive text
- `text-green-800` - Success text
- And various other Tailwind text colors for badges

### Background Colors
- `bg-gradient-to-br` - Gradient directions
- `from-slate-900` / `via-slate-800` / `to-slate-900` - Gradient stops
- `bg-black/50` - Semi-transparent black overlays
- `bg-red-500/10`, `bg-red-500/20` - Transparent red states
- `bg-[color]/10` - 10% opacity variant

### Border Colors
- `border-[var(--color-border)]` - Using CSS variables
- `border-red-500/20` - Transparent red borders

---

## Color Application Summary

### Primary Buttons
- **Color:** `var(--color-primary-gold)` (#c5a059)
- **Pages:** All pages with actionable CTAs
- **Examples:** "New Property" button, navigation buttons

### Backgrounds
- **Main Background:** `var(--color-bg-dark)` (#0b0b0b)
- **Card/Container Background:** `var(--color-bg-card)` (#1a1a1a)
- **Glass Morphism:** `var(--glass-bg)` (rgba(26, 26, 26, 0.7))

### Text
- **Primary Text:** `var(--color-text-light)` (#f8f9fa)
- **Secondary/Muted Text:** `var(--color-muted-foreground)` (#a0a0a0)

### Borders & Dividers
- **Color:** `var(--color-border)` (#2a2a2a)
- **Usage:** Table rows, card borders, input borders, separators

### Status Indicators
- **Success:** `var(--color-success)` (#52b788) or `bg-green-*` classes
- **Error/Danger:** `var(--color-danger)` (#ef233c) or `bg-red-*` classes
- **Warning:** `bg-yellow-*` classes
- **Info:** `bg-blue-*` classes

---

## Accessibility Notes

- All text colors meet WCAG AA contrast requirements
- `var(--color-text-light)` (#f8f9fa) on dark backgrounds provides excellent contrast
- Status colors use both color and text differences for color-blind accessibility
- Focus rings use `var(--ring)` (#c5a059) for visible keyboard navigation

---

## Dark Mode
The application is designed exclusively for dark mode. All colors are optimized for dark backgrounds with sufficient contrast for readability.

---

## Color Modification Guidelines

To update colors globally:
1. Edit CSS variables in [app/globals.css](app/globals.css) (lines 6-61)
2. Update both `:root` and `.dark` selectors to maintain consistency
3. Update custom color variables (`--color-*`) accordingly
4. No changes needed in component files as they use CSS variables

For component-specific colors:
- Preference order: CSS variables > Tailwind classes > Inline styles
- Use `var(--color-*)` for consistency with brand colors
- Use Tailwind classes (e.g., `bg-red-500`) for semantic states

---

Generated: February 18, 2026
Version: 1.0
