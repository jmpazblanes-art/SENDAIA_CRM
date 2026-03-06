-- ============================================================
-- MIGRACIÓN: Fix constraints + RLS para permitir ingesta real
-- ============================================================

-- 1. Eliminar constraint antiguo de source en clients
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_source_check;

-- 2. Crear nuevo constraint ampliado
ALTER TABLE public.clients
  ADD CONSTRAINT clients_source_check
  CHECK (source IN ('web', 'instagram', 'referral', 'cold_outreach', 'event', 'other', 'telegram', 'ghl_funnel', 'manual', 'ads', 'webhook', 'voice_agent'));

-- 3. Eliminar constraint de status para actualizarlo
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_status_check;

-- 4. Nuevo constraint de status (incluye los de la GEMINI.md)
ALTER TABLE public.clients
  ADD CONSTRAINT clients_status_check
  CHECK (status IN ('lead', 'contacted', 'qualified', 'proposal', 'active', 'inactive', 'closed', 'lost', 'client'));

-- 5. Eliminar políticas RLS existentes en clients
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.clients;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.clients;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.clients;
DROP POLICY IF EXISTS "clients_select_policy" ON public.clients;
DROP POLICY IF EXISTS "clients_insert_policy" ON public.clients;
DROP POLICY IF EXISTS "clients_update_policy" ON public.clients;
DROP POLICY IF EXISTS "clients_delete_policy" ON public.clients;

-- 6. Crear políticas RLS que permiten todo a autenticados Y al service role (para el webhook)
CREATE POLICY "clients_select_policy" ON public.clients
  FOR SELECT USING (true);

CREATE POLICY "clients_insert_policy" ON public.clients
  FOR INSERT WITH CHECK (true);

CREATE POLICY "clients_update_policy" ON public.clients
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "clients_delete_policy" ON public.clients
  FOR DELETE USING (true);

-- 7. Mismas políticas abiertas para automation_runs (necesario para el webhook)
DROP POLICY IF EXISTS "automation_runs_select_policy" ON public.automation_runs;
DROP POLICY IF EXISTS "automation_runs_insert_policy" ON public.automation_runs;
DROP POLICY IF EXISTS "automation_runs_update_policy" ON public.automation_runs;

CREATE POLICY "automation_runs_select_policy" ON public.automation_runs
  FOR SELECT USING (true);

CREATE POLICY "automation_runs_insert_policy" ON public.automation_runs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "automation_runs_update_policy" ON public.automation_runs
  FOR UPDATE USING (true) WITH CHECK (true);

-- 8. Añadir columna phone2 y linkedin opcionales si no existen
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS phone2 TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS linkedin TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 9. Añadir webhook_source para trazabilidad  
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS webhook_source TEXT;

-- Confirmación
SELECT 'Migration applied successfully' AS result;
