# 🏠 EstateFlow: Enterprise Real Estate CRM

![EstateFlow Banner](C:\Users\PC G.M.T\.gemini\antigravity\brain\6db20182-e9ef-4f5d-928b-e809927a10e5\estateflow_banner_1777490253248.png)

## 🌟 Mission & Vision

**EstateFlow** is a modern, multi-tenant Real Estate CRM (Customer Relationship Management) platform designed to bridge the gap between agencies and their clients. It provides a central hub for managing properties, tracking leads, and scheduling showings with a focus on speed, transparency, and scalability.

---

## 🚀 Key Features

### 🏢 Multi-Tenant Architecture
- **Data Isolation:** Complete separation of company data using PostgreSQL Row Level Security (RLS).
- **Role-Based Access Control (RBAC):** Granular permissions for Super Admins, Company Admins, Agents, and Clients.

### 🏠 Property Portfolio Management
- **Visual Catalog:** Responsive grid and list views with high-quality image support.
- **Dynamic Filtering:** Advanced search by price, type, location, and amenities.
- **Media Management:** Integrated image storage via Supabase Storage.

### 👥 Client & Lead CRM
- **Pipeline Tracking:** Manage leads through stages (New, Qualified, Negotiating).
- **Priority Management:** Instant status badges (Hot, Warm, Cold) for lead assessment.
- **Interaction Timeline:** Full chronological history of notes, calls, and activities.

### 📅 Intelligent Scheduler
- **Showing Coordination:** Visual timeline for property viewings to avoid conflicts.
- **Feedback Loop:** Post-showing feedback system with interest-level ratings.

### 📊 Performance Analytics
- **Live Metrics:** Animated counters for total properties, active leads, and revenue.
- **Trend Visualization:** Interactive charts for conversion rates and portfolio growth.

![EstateFlow Features](C:\Users\PC G.M.T\.gemini\antigravity\brain\6db20182-e9ef-4f5d-928b-e809927a10e5\estateflow_features_collage_1777490277035.png)

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | [Next.js 16](https://nextjs.org/) (App Router), React 19 |
| **Logic** | [TypeScript](https://www.typescriptlang.org/) |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL) |
| **Authentication** | [NextAuth.js](https://next-auth.js.org/) + Supabase JWT |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Validation** | [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/) |
| **Data Fetching** | [TanStack Query v5](https://tanstack.com/query/latest) |

---

## 📁 Project Structure

```text
├── /app                # Next.js Pages & API Routes
│   ├── /auth           # Authentication flow
│   ├── /dashboard      # Business health overview
│   ├── /properties     # Real estate listings
│   ├── /clients        # Buyer/Seller CRM
│   └── /api            # Backend endpoints
├── /components         # UI Component Library (shadcn/ui)
├── /lib                # Core Logic & Server Actions
│   ├── /actions        # Database mutations
│   ├── /supabase       # Connection configuration
│   └── /security       # JWT & Middleware logic
├── /public             # Static Assets
└── supabase-schema.sql # Database Schema & RLS Policies
```

---

## 🛡️ Security & Multi-Tenancy

EstateFlow implements a robust "Defense in Depth" strategy:

1.  **Middleware Protection:** Route-level authentication checks via NextAuth.
2.  **Row Level Security (RLS):** Database-enforced isolation. Users can **only** access data where `company_id` matches their profile.
3.  **JWT Authentication:** Stateless security tokens for cross-service verification.

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+ 
- Supabase Project

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/EstateFlow.git
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file based on `.env.example`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   NEXTAUTH_SECRET=your_secret
   ```

4. **Initialize Database:**
   Apply the `supabase-schema.sql` to your Supabase SQL Editor.

5. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to see the result.

---

## 📧 Support & Contact

For technical inquiries or feature requests, please refer to the `DOCUMENTATION.md` or contact the development team.

---

**Last Updated:** April 2026  
**Developed by:** Senior SaaS Architect (Antigravity AI)
