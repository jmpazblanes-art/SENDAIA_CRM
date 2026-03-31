-- ============================================================
-- MIGRACIÓN 12: CRM Expansion — presupuestos, contratos,
-- notifications, time_entries, ops_changelog
-- ============================================================

-- ========== TABLE 1: presupuestos ==========
CREATE TABLE IF NOT EXISTS public.presupuestos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  numero TEXT NOT NULL,
  titulo TEXT,
  servicios JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC DEFAULT 0,
  iva_percent NUMERIC DEFAULT 21,
  total NUMERIC DEFAULT 0,
  estado TEXT CHECK (estado IN ('borrador','enviado','aceptado','rechazado','facturado')) DEFAULT 'borrador',
  notas TEXT,
  valid_until DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========== TABLE 2: contratos ==========
CREATE TABLE IF NOT EXISTS public.contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  tipo TEXT CHECK (tipo IN ('mercantil','proteccion_datos','nda','otro')) DEFAULT 'mercantil',
  titulo TEXT NOT NULL,
  contenido TEXT,
  estado TEXT CHECK (estado IN ('borrador','enviado','firmado','cancelado')) DEFAULT 'borrador',
  fecha_firma DATE,
  fecha_vencimiento DATE,
  archivo_url TEXT,
  modulos JSONB DEFAULT '[]',
  valor_setup NUMERIC DEFAULT 0,
  valor_mensual NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========== TABLE 3: notifications ==========
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT CHECK (tipo IN ('lead','cita','factura','ops','contrato','presupuesto','sistema')) NOT NULL,
  titulo TEXT NOT NULL,
  mensaje TEXT,
  link TEXT,
  leida BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========== TABLE 4: time_entries ==========
CREATE TABLE IF NOT EXISTS public.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  proyecto TEXT,
  descripcion TEXT,
  horas NUMERIC NOT NULL,
  fecha DATE DEFAULT CURRENT_DATE,
  tarifa_hora NUMERIC DEFAULT 50,
  facturable BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========== TABLE 5: ops_changelog ==========
CREATE TABLE IF NOT EXISTS public.ops_changelog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto TEXT NOT NULL,
  commit_sha TEXT,
  commit_message TEXT,
  commit_author TEXT,
  commit_url TEXT,
  commit_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- RLS: Enable + open policies (same pattern as migration 06)
-- ============================================================

-- ----- presupuestos -----
ALTER TABLE public.presupuestos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "presupuestos_select_policy" ON public.presupuestos
  FOR SELECT USING (true);
CREATE POLICY "presupuestos_insert_policy" ON public.presupuestos
  FOR INSERT WITH CHECK (true);
CREATE POLICY "presupuestos_update_policy" ON public.presupuestos
  FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "presupuestos_delete_policy" ON public.presupuestos
  FOR DELETE USING (true);

-- ----- contratos -----
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contratos_select_policy" ON public.contratos
  FOR SELECT USING (true);
CREATE POLICY "contratos_insert_policy" ON public.contratos
  FOR INSERT WITH CHECK (true);
CREATE POLICY "contratos_update_policy" ON public.contratos
  FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "contratos_delete_policy" ON public.contratos
  FOR DELETE USING (true);

-- ----- notifications -----
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_policy" ON public.notifications
  FOR SELECT USING (true);
CREATE POLICY "notifications_insert_policy" ON public.notifications
  FOR INSERT WITH CHECK (true);
CREATE POLICY "notifications_update_policy" ON public.notifications
  FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "notifications_delete_policy" ON public.notifications
  FOR DELETE USING (true);

-- ----- time_entries -----
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "time_entries_select_policy" ON public.time_entries
  FOR SELECT USING (true);
CREATE POLICY "time_entries_insert_policy" ON public.time_entries
  FOR INSERT WITH CHECK (true);
CREATE POLICY "time_entries_update_policy" ON public.time_entries
  FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "time_entries_delete_policy" ON public.time_entries
  FOR DELETE USING (true);

-- ----- ops_changelog -----
ALTER TABLE public.ops_changelog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ops_changelog_select_policy" ON public.ops_changelog
  FOR SELECT USING (true);
CREATE POLICY "ops_changelog_insert_policy" ON public.ops_changelog
  FOR INSERT WITH CHECK (true);
CREATE POLICY "ops_changelog_update_policy" ON public.ops_changelog
  FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "ops_changelog_delete_policy" ON public.ops_changelog
  FOR DELETE USING (true);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_presupuestos_client_id ON public.presupuestos(client_id);
CREATE INDEX IF NOT EXISTS idx_presupuestos_estado ON public.presupuestos(estado);
CREATE INDEX IF NOT EXISTS idx_contratos_client_id ON public.contratos(client_id);
CREATE INDEX IF NOT EXISTS idx_contratos_estado ON public.contratos(estado);
CREATE INDEX IF NOT EXISTS idx_notifications_leida ON public.notifications(leida);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_time_entries_client_id ON public.time_entries(client_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_fecha ON public.time_entries(fecha);
CREATE INDEX IF NOT EXISTS idx_ops_changelog_producto ON public.ops_changelog(producto);
CREATE INDEX IF NOT EXISTS idx_ops_changelog_commit_date ON public.ops_changelog(commit_date);

-- Confirmación
SELECT 'Migration 12 applied successfully' AS result;
