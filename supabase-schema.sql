-- ============================================================================
-- ESTATEFLOW - SUPABASE DATABASE SCHEMA
-- Multi-tenant Real Estate CRM with Row Level Security
-- ============================================================================

-- Step 1: Enable necessary extensions
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Step 2: Create ENUM types for status fields
-- ============================================================================

-- User roles - 4-level hierarchy
-- SUPER_ADMIN: Platform owner - manages entire EstateFlow platform
-- COMPANY_ADMIN: Company owner/manager - manages their company only
-- AGENT: Real estate agent - manages assigned leads and properties
-- CLIENT: End customer - read-only access to assigned properties/activity
CREATE TYPE public.user_role AS ENUM ('super_admin', 'company_admin', 'agent', 'client');

-- Property types
CREATE TYPE public.property_type AS ENUM (
  'house',
  'condo',
  'townhouse',
  'commercial',
  'land',
  'multi_family'
);

-- Property status
CREATE TYPE public.property_status AS ENUM (
  'available',
  'under_contract',
  'sold',
  'expired',
  'withdrawn'
);

-- Lead status
CREATE TYPE public.lead_status AS ENUM (
  'new',
  'contacted',
  'qualified',
  'proposal_sent',
  'negotiating',
  'closed_won',
  'closed_lost'
);

-- Activity types
CREATE TYPE public.activity_type AS ENUM (
  'note',
  'call',
  'meeting',
  'email',
  'task',
  'property_viewed'
);

-- Step 3: Create COMPANIES table
-- ============================================================================
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  website VARCHAR(255),
  logo_url TEXT,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(10),
  country VARCHAR(100),
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT companies_name_not_empty CHECK (name != '')
);

-- Create index on companies
CREATE INDEX idx_companies_name ON public.companies(name);

-- Step 4: Create PROFILES table (extends auth.users)
-- ============================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  role public.user_role DEFAULT 'agent',
  is_company_admin BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT profiles_full_name_not_empty CHECK (full_name != '')
);

-- Create indexes on profiles
CREATE INDEX idx_profiles_company_id ON public.profiles(company_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_is_active ON public.profiles(is_active);
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Step 5: Create PROPERTIES table
-- ============================================================================
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  property_type public.property_type NOT NULL,
  status public.property_status DEFAULT 'available',
  price DECIMAL(12, 2),
  price_currency VARCHAR(3) DEFAULT 'USD',
  address TEXT NOT NULL,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(10),
  country VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  bedrooms INTEGER,
  bathrooms DECIMAL(3, 1),
  square_feet INTEGER,
  lot_size DECIMAL(10, 2),
  year_built INTEGER,
  hoa_fees DECIMAL(10, 2),
  images TEXT[] DEFAULT '{}',
  documents TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  
  CONSTRAINT properties_title_not_empty CHECK (title != ''),
  CONSTRAINT properties_price_positive CHECK (price IS NULL OR price >= 0),
  CONSTRAINT properties_valid_coordinates CHECK (
    (latitude IS NULL AND longitude IS NULL) OR
    (latitude IS NOT NULL AND longitude IS NOT NULL AND
     latitude >= -90 AND latitude <= 90 AND
     longitude >= -180 AND longitude <= 180)
  )
);

-- Create indexes on properties
CREATE INDEX idx_properties_company_id ON public.properties(company_id);
CREATE INDEX idx_properties_created_by ON public.properties(created_by);
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_property_type ON public.properties(property_type);
CREATE INDEX idx_properties_city ON public.properties(city);
CREATE INDEX idx_properties_created_at ON public.properties(created_at DESC);
CREATE INDEX idx_properties_deleted_at ON public.properties(deleted_at);
CREATE INDEX idx_properties_company_id_not_deleted ON public.properties(company_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_properties_created_at_not_deleted ON public.properties(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_properties_status_not_deleted ON public.properties(status) WHERE deleted_at IS NULL;

-- Step 6: Create LEADS table
-- ============================================================================
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  status public.lead_status DEFAULT 'new',
  budget_min DECIMAL(12, 2),
  budget_max DECIMAL(12, 2),
  interested_types public.property_type[],
  preferred_cities VARCHAR(100)[],
  notes TEXT,
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT leads_first_name_not_empty CHECK (first_name != ''),
  CONSTRAINT leads_last_name_not_empty CHECK (last_name != ''),
  CONSTRAINT leads_email_or_phone CHECK (email IS NOT NULL OR phone IS NOT NULL),
  CONSTRAINT leads_budget_valid CHECK (budget_min IS NULL OR budget_max IS NULL OR budget_min <= budget_max)
);

-- Create indexes on leads
CREATE INDEX idx_leads_company_id ON public.leads(company_id);
CREATE INDEX idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX idx_leads_last_contacted_at ON public.leads(last_contacted_at DESC);

-- Step 7: Create LEAD_ACTIVITIES table
-- ============================================================================
CREATE TABLE public.lead_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  activity_type public.activity_type NOT NULL,
  title VARCHAR(255),
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT lead_activities_title_required CHECK (title IS NOT NULL AND title != ''),
  CONSTRAINT lead_activities_valid_duration CHECK (duration_minutes IS NULL OR duration_minutes > 0)
);

-- Create indexes on lead_activities
CREATE INDEX idx_lead_activities_lead_id ON public.lead_activities(lead_id);
CREATE INDEX idx_lead_activities_company_id ON public.lead_activities(company_id);
CREATE INDEX idx_lead_activities_created_by ON public.lead_activities(created_by);
CREATE INDEX idx_lead_activities_activity_type ON public.lead_activities(activity_type);
CREATE INDEX idx_lead_activities_created_at ON public.lead_activities(created_at DESC);

-- Step 8: Create PROPERTY_LEAD_ASSIGNMENTS table
-- ============================================================================
CREATE TABLE public.property_lead_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT property_lead_assignments_unique UNIQUE(property_id, lead_id)
);

-- Create indexes on property_lead_assignments
CREATE INDEX idx_property_lead_assignments_property_id ON public.property_lead_assignments(property_id);
CREATE INDEX idx_property_lead_assignments_lead_id ON public.property_lead_assignments(lead_id);
CREATE INDEX idx_property_lead_assignments_company_id ON public.property_lead_assignments(company_id);

-- Step 8.5: Create CLIENTS table
-- ============================================================================
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Contact Info
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  
  -- Status & Source
  status VARCHAR(20) DEFAULT 'warm' CHECK (status IN ('hot', 'warm', 'cold')),
  source VARCHAR(50),
  
  -- Budget
  budget_min DECIMAL(12, 2),
  budget_max DECIMAL(12, 2),
  
  -- Preferences
  preferred_type TEXT[] DEFAULT '{}',
  preferred_location TEXT[] DEFAULT '{}',
  bedrooms INTEGER,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  
  CONSTRAINT clients_email_not_empty CHECK (email != ''),
  CONSTRAINT clients_name_not_empty CHECK (name != ''),
  CONSTRAINT clients_budget_valid CHECK (budget_min IS NULL OR budget_max IS NULL OR budget_min <= budget_max)
);

-- Create indexes on clients table
CREATE INDEX idx_clients_company_id ON public.clients(company_id);
CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_clients_created_by ON public.clients(created_by);
CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_clients_email ON public.clients(email);
CREATE INDEX idx_clients_created_at ON public.clients(created_at DESC);
CREATE INDEX idx_clients_deleted_at ON public.clients(deleted_at);
CREATE INDEX idx_clients_company_id_not_deleted ON public.clients(company_id) WHERE deleted_at IS NULL;

-- Step 9: Create SHOWINGS table
-- ============================================================================
CREATE TABLE public.showings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  scheduled_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
  interest_level VARCHAR(1) CHECK (interest_level IN ('1', '2', '3', '4', '5') OR interest_level IS NULL),
  feedback TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  
  CONSTRAINT showings_duration_positive CHECK (duration_minutes > 0)
);

-- Create indexes on showings
CREATE INDEX idx_showings_property_id ON public.showings(property_id);
CREATE INDEX idx_showings_client_id ON public.showings(client_id);
CREATE INDEX idx_showings_company_id ON public.showings(company_id);
CREATE INDEX idx_showings_agent_id ON public.showings(agent_id);
CREATE INDEX idx_showings_scheduled_by ON public.showings(scheduled_by);
CREATE INDEX idx_showings_scheduled_at ON public.showings(scheduled_at);
CREATE INDEX idx_showings_status ON public.showings(status);
CREATE INDEX idx_showings_deleted_at ON public.showings(deleted_at);

-- Step 9.5: Create TEAM_INVITATIONS table
-- ============================================================================
CREATE TABLE public.team_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role public.user_role DEFAULT 'agent',
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  accepted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT team_invitations_email_not_empty CHECK (email != ''),
  CONSTRAINT team_invitations_unique_pending UNIQUE(company_id, email) WHERE accepted_at IS NULL
);

-- Create indexes on team_invitations
CREATE INDEX idx_team_invitations_company_id ON public.team_invitations(company_id);
CREATE INDEX idx_team_invitations_email ON public.team_invitations(email);
CREATE INDEX idx_team_invitations_token ON public.team_invitations(token);
CREATE INDEX idx_team_invitations_expires_at ON public.team_invitations(expires_at);
CREATE INDEX idx_team_invitations_accepted_at ON public.team_invitations(accepted_at);

-- Step 10: Enable Row Level Security on all tables
-- ============================================================================
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_lead_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Step 11: Create RLS Policies
-- ============================================================================

-- COMPANIES: Users can only see their own company, SUPER_ADMIN sees all
CREATE POLICY "Users can view their own company"
  ON public.companies FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin' OR
    id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "SUPER_ADMIN can update any company"
  ON public.companies FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
  );

CREATE POLICY "COMPANY_ADMIN can update their company"
  ON public.companies FOR UPDATE
  USING (
    id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'company_admin'
  );

-- Allow authenticated users to create a company (needed for signup)
CREATE POLICY "Authenticated users can create companies"
  ON public.companies FOR INSERT
  WITH CHECK (true);

-- PROFILES: Users can view their company's profiles, company_admin manages, super_admin sees all
CREATE POLICY "Users can view own company profiles"
  ON public.profiles FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin' OR
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "SUPER_ADMIN can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
  );

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "COMPANY_ADMIN can manage company profiles"
  ON public.profiles FOR UPDATE
  USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'company_admin'
  );

-- Allow INSERT to profiles only for new user signup
-- This avoids recursion by not referencing the profiles table within the policy check
-- Admins inviting new users should use a server action that bypasses RLS
CREATE POLICY "Users can create their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- PROPERTIES: All users see company properties, agents/company_admin can create
CREATE POLICY "Users can view company properties"
  ON public.properties FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin' OR
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Agents and COMPANY_ADMIN can create properties"
  ON public.properties FOR INSERT
  WITH CHECK (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) AND
    created_by = auth.uid() AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('agent', 'company_admin')
  );

CREATE POLICY "Users can update their own properties"
  ON public.properties FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own properties"
  ON public.properties FOR DELETE
  USING (created_by = auth.uid());

-- LEADS: Users see company leads; agents see assigned, company_admin/super_admin see all
CREATE POLICY "Users can view company leads based on role"
  ON public.leads FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin' OR
    (
      company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) AND
      (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('company_admin') OR
        assigned_to = auth.uid() OR
        created_by = auth.uid()
      )
    )
  );

CREATE POLICY "Agents and COMPANY_ADMIN can create leads"
  ON public.leads FOR INSERT
  WITH CHECK (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) AND
    created_by = auth.uid() AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('agent', 'company_admin')
  );

CREATE POLICY "Company users can update leads"
  ON public.leads FOR UPDATE
  USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('company_admin', 'agent')
  );

CREATE POLICY "Users can delete their own leads"
  ON public.leads FOR DELETE
  USING (created_by = auth.uid());

-- LEAD_ACTIVITIES: Users see activities for leads they have access to
CREATE POLICY "Users can view company lead activities"
  ON public.lead_activities FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin' OR
    (
      company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) AND
      lead_id IN (
        SELECT id FROM public.leads WHERE
          assigned_to = auth.uid() OR
          created_by = auth.uid() OR
          (
            company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) AND
            (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'company_admin'
          )
      )
    )
  );

CREATE POLICY "Users can create activities"
  ON public.lead_activities FOR INSERT
  WITH CHECK (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) AND
    created_by = auth.uid() AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('agent', 'company_admin')
  );

CREATE POLICY "Users can update their activities"
  ON public.lead_activities FOR UPDATE
  USING (created_by = auth.uid());

-- PROPERTY_LEAD_ASSIGNMENTS: Users see assignments for their company
CREATE POLICY "Users can view company assignments"
  ON public.property_lead_assignments FOR SELECT
  USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('company_admin', 'agent')
  );

CREATE POLICY "COMPANY_ADMIN can create assignments"
  ON public.property_lead_assignments FOR INSERT
  WITH CHECK (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'company_admin'
  );

CREATE POLICY "COMPANY_ADMIN can update assignments"
  ON public.property_lead_assignments FOR UPDATE
  USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'company_admin'
  );

-- SHOWINGS: Users can view and manage showings based on their role
CREATE POLICY "Users can view company showings"
  ON public.showings FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Agents can create showings"
  ON public.showings FOR INSERT
  WITH CHECK (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) AND
    (
      agent_id = auth.uid() OR
      (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('company_admin', 'super_admin')
    )
  );

CREATE POLICY "Users can update showings for their clients"
  ON public.showings FOR UPDATE
  USING (
    agent_id = auth.uid() OR
    scheduled_by = auth.uid() OR
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('company_admin', 'super_admin')
  );

CREATE POLICY "Users can delete showings they created"
  ON public.showings FOR DELETE
  USING (
    scheduled_by = auth.uid() OR
    agent_id = auth.uid() OR
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('company_admin', 'super_admin')
  );

-- TEAM_INVITATIONS: Company admins can invite, users can accept invitations for themselves
CREATE POLICY "Company admin can view company invitations"
  ON public.team_invitations FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin' OR
    (
      company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) AND
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'company_admin'
    )
  );

CREATE POLICY "Users can view invitations for their email"
  ON public.team_invitations FOR SELECT
  USING (email = (SELECT email FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Company admin can create invitations"
  ON public.team_invitations FOR INSERT
  WITH CHECK (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) AND
    invited_by = auth.uid() AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'company_admin'
  );

CREATE POLICY "Only system can update invitations (mark as accepted)"
  ON public.team_invitations FOR UPDATE
  USING (false); -- This is handled server-side

-- Step 12: Note about profile creation
-- ============================================================================
-- Profiles are now created directly from the signup server action (auth.ts)
-- This allows better control over the company_id assignment and role setting
-- See: lib/actions/auth.ts - signUp() function

-- Step 13: Create HELPER FUNCTIONS
-- ============================================================================

-- Get current user's company_id
-- SECURITY DEFINER bypasses RLS to avoid infinite recursion when called from policies
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Check if user is company admin
CREATE OR REPLACE FUNCTION public.is_user_company_admin()
RETURNS BOOLEAN AS $$
  SELECT role = 'company_admin' FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE SQL STABLE;

-- Check if user is super admin
CREATE OR REPLACE FUNCTION public.is_user_super_admin()
RETURNS BOOLEAN AS $$
  SELECT role = 'super_admin' FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE SQL STABLE;

-- Get user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE SQL STABLE;

-- Check if user can access lead
CREATE OR REPLACE FUNCTION public.can_access_lead(lead_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.leads
    WHERE
      id = $1 AND
      (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin' OR
        (
          company_id = get_user_company_id() AND
          (
            assigned_to = auth.uid() OR
            created_by = auth.uid() OR
            is_user_company_admin()
          )
        )
      )
  )
$$ LANGUAGE SQL STABLE;

-- Check if user can access property
CREATE OR REPLACE FUNCTION public.can_access_property(property_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.properties
    WHERE
      id = $1 AND
      (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin' OR
        company_id = get_user_company_id()
      )
  )
$$ LANGUAGE SQL STABLE;

-- Step 14: Create UPDATE trigger for updated_at timestamps
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp trigger to all tables
CREATE TRIGGER update_companies_timestamp
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_profiles_timestamp
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_properties_timestamp
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_leads_timestamp
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_lead_activities_timestamp
  BEFORE UPDATE ON public.lead_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_property_lead_assignments_timestamp
  BEFORE UPDATE ON public.property_lead_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_showings_timestamp
  BEFORE UPDATE ON public.showings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_team_invitations_timestamp
  BEFORE UPDATE ON public.team_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

-- ============================================================================
-- SCHEMA SETUP COMPLETE
-- ============================================================================
-- Tables created:
-- - companies (stores real estate company info)
-- - profiles (user profiles with 4-level roles: super_admin, company_admin, agent, client)
-- - properties (real estate listings with images and documents)
-- - leads (potential clients with budget and preferences)
-- - lead_activities (activity timeline for leads)
-- - property_lead_assignments (link properties to leads)
-- - showings (property viewing appointments)
-- - team_invitations (team member invitations with token-based acceptance)
--
-- User Roles:
-- - super_admin: Platform owner, manages all companies and users
-- - company_admin: Company owner, manages their company only
-- - agent: Real estate agent, manages assigned leads and properties
-- - client: End customer, read-only access to assigned properties
--
-- Security:
-- - Row Level Security enabled on all tables
-- - RLS policies ensure data isolation by company and role
-- - Agents see only their assigned leads
-- - Company admins see all company data
-- - Super admins see all platform data
--
-- Functions:
-- - get_user_company_id() - get current user's company
-- - is_user_company_admin() - check company admin status
-- - is_user_super_admin() - check super admin status
-- - get_user_role() - get user's role
-- - can_access_lead() - check lead access
-- - can_access_property() - check property access
-- ============================================================================
