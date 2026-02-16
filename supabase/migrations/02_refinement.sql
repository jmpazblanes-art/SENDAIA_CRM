
-- Update Appointment types and statuses to match user request
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_status_check;
ALTER TABLE public.appointments ADD CONSTRAINT appointments_status_check CHECK (status IN ('pending', 'confirmed', 'completed', 'no_show', 'cancelled', 'rescheduled'));
ALTER TABLE public.appointments ALTER COLUMN status SET DEFAULT 'pending';

ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_type_check;
ALTER TABLE public.appointments ADD CONSTRAINT appointments_type_check CHECK (type IN ('DEMO', 'DIAGNOSTICO', 'ONBOARDING', 'FOLLOW_UP', 'TECHNICAL_REVIEW', 'OTHER'));

-- Create lead_notes for better tracking
CREATE TABLE IF NOT EXISTS public.lead_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create automation_runs for monitoring
CREATE TABLE IF NOT EXISTS public.automation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'success', 'failed', 'running')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  ended_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS and add basic policies
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for authenticated" ON public.lead_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated" ON public.lead_notes FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable read for authenticated" ON public.automation_runs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated" ON public.automation_runs FOR INSERT TO authenticated WITH CHECK (true);
