
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. MÓDULO DE CLIENTES (CRM Core)
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Información Básica
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company_name TEXT,
  email TEXT UNIQUE,
  phone TEXT NOT NULL,
  
  -- Clasificación
  status TEXT DEFAULT 'lead' CHECK (status IN ('lead', 'qualified', 'active', 'inactive', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  source TEXT CHECK (source IN ('web', 'instagram', 'referral', 'cold_outreach', 'event', 'other')),
  
  -- Información Comercial
  industry TEXT,
  company_size TEXT CHECK (company_size IN ('1-5', '6-20', '21-50', '51-200', '200+')),
  monthly_revenue_estimate DECIMAL(10,2),
  website TEXT,
  city TEXT,
  
  -- Diagnóstico Operativo
  pain_points TEXT[], 
  opportunity_score INTEGER DEFAULT 0 CHECK (opportunity_score >= 0 AND opportunity_score <= 100),
  estimated_impact_eur DECIMAL(10,2),
  
  -- Seguimiento
  notes TEXT,
  last_contact_date TIMESTAMP WITH TIME ZONE,
  next_follow_up TIMESTAMP WITH TIME ZONE,
  assigned_to UUID, -- REFERENCES public.employees(id) added later to avoid circular dep if needed, or now. Employees table must exist first or forward decl.
  
  -- Sistema
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. MÓDULO DE TRABAJADORES (Team Directory)
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Linked to auth.users.id manually usually, or just a separate table. The prompt implies a custom table. For RLS, we map this to auth.uid(). Ideally id IS auth.uid() or we have a user_id column.
  -- Let's assume id is the Employee ID, and we might link it to Auth User ID via email or another column if they log in. 
  -- Prompt: assigned_to UUID REFERENCES public.employees(id).
  
  -- Información Personal
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  
  -- Información Laboral
  role TEXT NOT NULL CHECK (role IN ('founder', 'sales', 'operations', 'technical', 'admin', 'partner')),
  specialty TEXT,
  hire_date DATE,
  active BOOLEAN DEFAULT TRUE,
  
  -- Permisos y Acceso
  permissions JSONB DEFAULT '{"view_clients": true, "edit_clients": false, "view_finances": false, "manage_team": false}'::jsonb,
  
  -- Métricas
  clients_assigned INTEGER DEFAULT 0,
  total_deals_closed INTEGER DEFAULT 0,
  total_revenue_generated DECIMAL(10,2) DEFAULT 0.00,
  
  -- Información de Contacto Adicional
  linkedin_url TEXT,
  bio TEXT,
  
  -- Sistema
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add foreign key for clients.assigned_to after employees table creation
ALTER TABLE public.clients ADD CONSTRAINT fk_clients_assigned_to FOREIGN KEY (assigned_to) REFERENCES public.employees(id);

-- 3. MÓDULO DE CITAS (Appointments)
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('discovery_call', 'demo', 'onboarding', 'follow_up', 'technical_review', 'other')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  meeting_url TEXT,
  
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'no_show', 'cancelled', 'rescheduled')),
  
  notes_before TEXT,
  notes_after TEXT,
  
  reminder_sent_24h BOOLEAN DEFAULT FALSE,
  reminder_sent_1h BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. MÓDULO DE FACTURACIÓN (Invoices)
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  
  invoice_number TEXT UNIQUE NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  
  subtotal DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 21.00,
  tax_amount DECIMAL(10,2) GENERATED ALWAYS AS (subtotal * tax_rate / 100) STORED,
  total DECIMAL(10,2) GENERATED ALWAYS AS (subtotal + (subtotal * tax_rate / 100)) STORED,
  
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  payment_method TEXT CHECK (payment_method IN ('bank_transfer', 'card', 'bizum', 'paypal', 'other')),
  paid_date DATE,
  
  items JSONB NOT NULL,
  
  pdf_url TEXT,
  original_pdf_url TEXT,
  
  notes TEXT,
  internal_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. AGENTE DE LLAMADAS (Call Logs)
CREATE TABLE IF NOT EXISTS public.call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  
  call_sid TEXT UNIQUE,
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  from_number TEXT,
  to_number TEXT,
  
  status TEXT CHECK (status IN ('completed', 'no_answer', 'busy', 'failed', 'voicemail')),
  duration_seconds INTEGER,
  recording_url TEXT,
  transcript TEXT,
  
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  intent TEXT,
  summary TEXT,
  next_action TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. CHATBOT INTERNO (Messages)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create Policies (Examples - basic setup to allow Founder access to everything)
-- Note: Assuming auth.uid() corresponds to employee.id or we have a mapping.
-- For now, let's create a policy that allows everything for development if user is authenticated/bypass, 
-- or stick to the requirement: Founder (Pachi) sees all.

-- We need a function to get current user role ? 
-- For MVP, let's allow authenticated users to view clients.
CREATE POLICY "Enable read access for authenticated users" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.clients FOR UPDATE TO authenticated USING (true);

-- Repeat simplified policies for other tables for MVP start
CREATE POLICY "Enable read via auth" ON public.employees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read via auth" ON public.appointments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read via auth" ON public.invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read via auth" ON public.call_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read via auth" ON public.chat_messages FOR SELECT TO authenticated USING (true);

