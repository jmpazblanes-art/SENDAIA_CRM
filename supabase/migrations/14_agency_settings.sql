-- =============================================================
-- 14. AGENCY SETTINGS — key-value store for global config
-- =============================================================

CREATE TABLE IF NOT EXISTS public.agency_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.agency_settings ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated users can read and write (same pattern as rest of CRM)
CREATE POLICY "Allow all for authenticated" ON public.agency_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed default values
INSERT INTO public.agency_settings (key, value) VALUES
  ('agency_name', 'SendaIA'),
  ('agency_email', 'hola@sendaia.es')
ON CONFLICT (key) DO NOTHING;
