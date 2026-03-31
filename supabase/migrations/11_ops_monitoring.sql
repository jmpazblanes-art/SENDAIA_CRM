-- =============================================================
-- 11. OPS CENTER - MONITORING & ALERTAS (Ops Monitoring)
-- =============================================================

-- Tabla para el estado actual de cada producto/repo monitorizado
CREATE TABLE IF NOT EXISTS public.ops_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto TEXT NOT NULL,
  repo TEXT,
  url_app TEXT,
  estado TEXT CHECK (estado IN ('ok','warning','error')) DEFAULT 'ok',
  ultimo_error TEXT,
  github_actions_status TEXT,
  github_actions_url TEXT,
  uptime_ok BOOLEAN DEFAULT true,
  coste_anthropic_mes NUMERIC DEFAULT 0,
  coste_openai_mes NUMERIC DEFAULT 0,
  coste_supabase_mes NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT ops_monitoring_producto_unique UNIQUE (producto)
);

-- Enable RLS
ALTER TABLE public.ops_monitoring ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated users can do everything (same pattern as rest of CRM)
CREATE POLICY "Allow all for authenticated" ON public.ops_monitoring
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Index for filtering by estado
CREATE INDEX idx_ops_monitoring_estado ON public.ops_monitoring(estado);


-- =============================================================
-- Tabla de historial de alertas, fixes propuestos y acciones
-- =============================================================

CREATE TABLE IF NOT EXISTS public.ops_alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto TEXT NOT NULL,
  tipo_error TEXT,
  log_error TEXT,
  estado TEXT CHECK (estado IN ('pendiente','en_analisis','fix_propuesto','reparado','ignorado','fallido')) DEFAULT 'pendiente',
  fix_propuesto TEXT,
  fix_aplicado TEXT,
  fix_commit_url TEXT,
  aprobado_por TEXT DEFAULT 'pachi',
  confianza TEXT CHECK (confianza IN ('alta','media','baja')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_resolucion TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.ops_alertas ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated users can do everything (same pattern as rest of CRM)
CREATE POLICY "Allow all for authenticated" ON public.ops_alertas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Indexes for common queries
CREATE INDEX idx_ops_alertas_producto ON public.ops_alertas(producto);
CREATE INDEX idx_ops_alertas_estado ON public.ops_alertas(estado);
CREATE INDEX idx_ops_alertas_created_at ON public.ops_alertas(created_at);


-- =============================================================
-- Seed data: productos iniciales
-- =============================================================

INSERT INTO public.ops_monitoring (producto, repo, url_app)
VALUES
  ('PeritApp', 'jmpazblanes-art/peritapp', NULL),
  ('AirConEtc', 'jmpazblanes-art/airconetc', NULL),
  ('FisConLab', 'jmpazblanes-art/fisconlab', NULL),
  ('CRM', 'jmpazblanes-art/crm-sendaia', NULL)
ON CONFLICT (producto) DO NOTHING;
