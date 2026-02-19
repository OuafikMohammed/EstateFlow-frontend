-- ============================================================================
-- MIGRATION: Update showings table to use client_id instead of lead_id
-- Purpose: Align showings with clients table structure for proper CRM flow
-- ============================================================================

-- Drop existing showings table and associated objects
DROP TABLE IF EXISTS public.showings CASCADE;

-- Recreate SHOWINGS table with client_id
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

-- Enable Row Level Security
ALTER TABLE public.showings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for showings
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
    agent_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update showings for their clients"
  ON public.showings FOR UPDATE
  USING (
    agent_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can delete showings they created"
  ON public.showings FOR DELETE
  USING (
    scheduled_by = auth.uid() OR
    agent_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
