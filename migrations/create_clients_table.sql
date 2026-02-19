-- ============================================================================
-- MIGRATION: Create clients table with RLS policies
-- Purpose: Create clients table for CRM with proper security policies
-- ============================================================================

-- Drop existing table and policies if they exist (safe migration)
DROP TABLE IF EXISTS public.clients CASCADE;

-- Create CLIENTS table
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

-- Enable Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- CLIENTS RLS Policies: All users see company clients; agents see assigned, company_admin/super_admin see all
CREATE POLICY "Users can view company clients based on role"
  ON public.clients FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin' OR
    (
      company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) AND
      (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('company_admin', 'admin') OR
        created_by = auth.uid()
      )
    )
  );

CREATE POLICY "Agents and COMPANY_ADMIN can create clients"
  ON public.clients FOR INSERT
  WITH CHECK (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) AND
    created_by = auth.uid() AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('agent', 'company_admin', 'admin')
  );

CREATE POLICY "Company users can update clients"
  ON public.clients FOR UPDATE
  USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('company_admin', 'agent', 'admin')
  );

CREATE POLICY "Users can delete their own clients"
  ON public.clients FOR DELETE
  USING (created_by = auth.uid());

-- Create timestamp trigger for clients table
CREATE TRIGGER update_clients_timestamp
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

-- ============================================================================
-- MIGRATION COMPLETE
-- Clients table created with RLS policies for multi-tenant isolation
-- ============================================================================
