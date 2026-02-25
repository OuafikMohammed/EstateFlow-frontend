# 🏗️ EstateFlow: MVP Technical & Functional Documentation

Welcome to the **EstateFlow** MVP documentation. This guide is designed to help you understand the architecture, data flow, and functional components of the application. Whether you are a junior developer joining the team or a stakeholder looking for a technical overview, this document will guide you through how EstateFlow works.

---

## 🌟 1. Mission & Vision

**EstateFlow** is a modern, multi-tenant Real Estate CRM (Customer Relationship Management) platform. It is designed to bridge the gap between real estate agencies and their clients by providing a central hub for managing properties, tracking leads, and scheduling showings.

### Core Value Proposition:
- **Efficiency:** Automation of repetitive tasks like lead assignment and showing scheduling.
- **Transparency:** Real-time visibility into the property pipeline for agents and administrators.
- **Scalability:** Built on a "multi-tenant" architecture, meaning many different real estate companies can use the same app while their data remains completely separate and secure.

---

## 🛠️ 2. The Tech Stack (The "Big Three")

EstateFlow is built on a modern, robust stack chosen for speed of development and reliability.

| Layer | Technology | Why we use it? |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 14+ (App Router)** | Provides fast, SEO-friendly rendering and a powerful routing system. |
| **Logic** | **TypeScript** | Adds "types" to JavaScript, catching errors before they happen. |
| **Styling** | **Tailwind CSS & shadcn/ui** | Allows us to build beautiful, responsive interfaces without writing messy custom CSS. |
| **Database** | **Supabase (PostgreSQL)** | A "Backend-as-a-Service" that handles our data, storage, and real-time needs. |
| **Auth** | **NextAuth.js** | Manages user sessions, logins, and identity verification seamlessly. |
| **Validation** | **Zod & React Hook Form** | Ensures that data entered into forms is correct and safe. |

---

## 📁 3. Directory Structure: "Where does it live?"

Understanding the folder structure is key to finding your way around the codebase.

```text
├── /app                # THE FRONTEND: Pages, layouts, and API routes.
│   ├── /onboarding     # The welcome flow for new users.
│   ├── /dashboard      # High-level overview of business health.
│   ├── /properties     # Catalog of real estate listings.
│   ├── /clients        # Database of buyers and sellers.
│   ├── /showings       # Appointment coordination.
│   └── /api            # Backend endpoints for data processing.
├── /components         # UI BRICKS: Reusable buttons, cards, and forms.
├── /lib                # THE ENGINE: Logic, server actions, and utilities.
│   ├── /actions        # Functions that talk directly to the database.
│   ├── /supabase       # Configuration for our database connection.
│   └── /utils          # Small helper functions (date formatting, etc.).
├── /types              # BLUEPRINTS: TypeScript definitions for our data objects.
└── supabase-schema.sql # HEART: The actual SQL code that builds our database.
```

---

## 🗄️ 4. Data Blueprint: How the Database Thinks

We use a **Relational Database** (PostgreSQL). Think of it as a series of connected spreadsheets.

### Core Tables & Relationships:
1.  **Companies:** The top level. Every user and property belongs to a company.
2.  **Profiles:** These are our users (Admins, Agents, or Clients). They are linked to a Company.
3.  **Properties:** The houses/apartments being sold. They are created by Agents.
4.  **Clients / Leads:** Potential buyers. We track their budget and preferences.
5.  **Showings:** The "magic" connection. It links a **Profile** (Agent) + **Property** + **Client** at a specific time.

### Entity Relationship Diagram (Conceptual):
`Company` 1 ➔ N `Profiles`
`Profile` 1 ➔ N `Properties` (as creator)
`Property` 1 ➔ N `Showings`
`Client` 1 ➔ N `Showings`

---

## 🚀 5. The User Journey: From Zero to Pro

### A. Authentication & Onboarding
- **The Gatekeeper:** We use NextAuth for login, supporting both Credentials (email/password) and Google OAuth.
- **The 3-Step Wizard:** 
  1. **Branding:** Upload company logo (stored in Supabase Storage).
  2. **Organization Profile:** Set industry, team size, and contact details.
  3. **Team Growth:** Optional step to invite the first team member via email.
- **Completion:** Once the wizard finishes, it calls `/api/onboarding/complete` to finalize the company record.

### B. The Dashboard
This is the command center. It shows:
- **Stats:** Total properties, active leads, and upcoming showings.
- **Activity:** Recent updates from the team.

---

## 🏗️ 6. Core Modules (The Meat of the App)

### 🏠 Property Management (`/app/properties`)
- **UI/UX Experience:**
  - **Grid/List Component:** Uses a responsive grid of cards for properties, featuring high-quality images and status badges.
  - **Dynamic Filtering:** Real-time search and filter sidebar (by price, type, bedrooms) for quick discovery.
  - **Animations:** Smooth entrance animations using `framer-motion` as users scroll through the portfolio.
- **Supabase Interaction:**
  - **Fetch:** Calls `getProperties()` which queries the `properties` table with RLS filtering for `company_id`.
  - **Creation:** `createProperty()` inserts into Supabase, linking the listing to the current user's `company_id`.
  - **Storage:** Large hi-res images are uploaded to the `property-images` bucket in Supabase Storage.
- **Role Logic:**
  - **Agents:** Can create and edit their own listings.
  - **Admins:** Can view, edit, or delete any property within the company's portfolio.
  - **Clients:** (Read-only) Can browse available properties assigned or shared with them.

### 👥 Client & Lead CRM (`/app/clients`)
- **UI/UX Experience:**
  - **Management Table:** A clean, searchable data table with pagination. Includes "Status Badges" (Hot/Warm/Cold) for instant priority assessment.
  - **Quick Edit:** Inline modals allow agents to update lead status without leaving the main list.
- **Supabase Interaction:**
  - **CRUD:** Operations use the `clients` table.
  - **Soft Delete:** Instead of `DELETE`, it updates the `deleted_at` column.
  - **Search:** Uses PostgreSQL `ilike` filters for high-performance searching across names and emails.
- **Role Logic:**
  - **Agents:** Primarily manage leads they have personally created or been assigned.
  - **Admins:** Oversee the entire pipepline, with the ability to re-assign leads between agents.

### 📅 Showing Scheduler (`/app/showings`)
- **UI/UX Experience:**
  - **Calendar/Timeline View:** Visual representation of upcoming appointments to prevent scheduling conflicts.
  - **Feedback Flow:** Post-showing interface where agents quickly input "Interest Level" (1-5 stars) and client comments.
- **Supabase Interaction:**
  - **Relational Joins:** The showing query pulls data from three tables simultaneously: `showings`, `properties`, and `clients`.
  - **Validation:** Server actions check for double-booking at the database level before confirming a slot.
- **Role Logic:**
  - **Agents:** View their own calendar and schedule new showings for their active properties.
  - **Admins:** View the global company calendar to track agent productivity.

### 📊 Performance Dashboard (`/app/dashboard`)
- **UI/UX Experience:**
  - **Glassmorphism Design:** Subtle transparency and blur effects on cards for a premium, modern feel.
  - **Live Counters:** Animated statistics that count up from zero on page load.
  - **Interactive Charts:** Visual trends for revenue and lead conversion using `recharts`.
- **Supabase Interaction:**
  - **Aggregation Query:** Uses specialized queries or RPCs to calculate company-wide totals on the fly.
- **Role Logic:**
  - **Agents:** See personal stats (Own properties, own leads).
  - **Admins:** See company-wide metrics (Total revenue, team performance).

### 📈 Lead Tracking (`/app/leads`)
- **UI/UX Experience:**
  - **Kanban-style Pipeline:** (Planned) Leads are often viewed in a stage-based flow (New, Contacted, Qualified).
  - **Interaction Timeline:** Each lead has a detail page showing a chronological history of notes and calls.
- **Supabase Interaction:**
  - **Real-time Updates:** Uses Supabase subscriptions to notify agents immediately when a new lead arrives via the website.
  - **Assignments:** The `property_lead_assignments` table links specific properties to interested leads.
- **Role Logic:**
  - **Agents:** View and update their assigned leads.
  - **Admins:** High-level view of conversion rates and total pipeline value.

### ⚙️ Settings & Team (`/app/settings`)
- **UI/UX Experience:**
  - **Tabbed Interface:** Separate sections for Personal Profile, Company Branding, and Team Management.
  - **Invite System:** Modal for sending team invitations with role selection.
- **Supabase Interaction:**
  - **Profile Sync:** Updates the `profiles` table. Authenticated via NextAuth but changes are persisted to Supabase for global app state.
  - **Invitations:** Inserts into `team_invitations` and generates a secure unique token.
- **Role Logic:**
  - **Admins Only:** Only `company_admin` or `super_admin` can access Team Settings and invite new members.

---

## 👥 7. Global User Roles (RBAC Matrix)

| Feature | Super Admin | Company Admin | Agent | Client |
| :--- | :---: | :---: | :---: | :---: |
| **Manage Multiple Companies** | ✅ | ❌ | ❌ | ❌ |
| **Manage Company Settings** | ✅ | ✅ | ❌ | ❌ |
| **Invite Team Members** | ✅ | ✅ | ❌ | ❌ |
| **Create Properties** | ✅ | ✅ | ✅ | ❌ |
| **Delete Any Property** | ✅ | ✅ | ❌ | ❌ |
| **Manage All Leads** | ✅ | ✅ | ❌ | ❌ |
| **Manage Own Leads** | ✅ | ✅ | ✅ | ❌ |
| **Browse Properties** | ✅ | ✅ | ✅ | ✅ |

---

## 🛡️ 8. Security: Keeping Data Private

Because this is a **multi-tenant** app, security is our #1 priority. We use two layers of protection:

1.  **Middleware (App Side):** Before a page loads, we check if the user is logged in. If not, they are kicked back to `/login`.
2.  **Row Level Security (RLS) (Database Side):** This is the most powerful part. Even if a hacker tried to fetch all properties, the database itself would say: *"No! You can only see properties that belong to YOUR company ID."*

---

## 🛠️ 9. Junior Developer's Handbook

### Getting Started:
1.  **Install:** `npm install`
2.  **Env Setup:** Copy `.env.example` to `.env.local` and fill in your Supabase keys.
3.  **Run:** `npm run dev`
4.  **Database:** If you change the schema, remember to update `supabase-schema.sql`.

### Coding Conventions:
- **Server Actions:** Use them for all database mutations (Save/Delete). Find them in `lib/actions`.
- **shadcn Components:** Don't build buttons from scratch. Use `npx shadcn-ui@latest add [component]` to keep the UI consistent.
- **Type Safety:** Always define an interface for your data. Don't use `any`!

---

**Last Updated:** February 24, 2026
**Authored by:** Senior SaaS Architect (Antigravity AI)
