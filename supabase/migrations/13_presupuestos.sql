-- =============================================================
-- 13. MODULO DE PRESUPUESTOS (Quotes / Proposals)
-- =============================================================

CREATE TABLE IF NOT EXISTS public.presupuestos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  numero TEXT NOT NULL UNIQUE,
  titulo TEXT NOT NULL,
  servicios JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  iva_percent NUMERIC(5,2) NOT NULL DEFAULT 21,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'borrador'
    CHECK (estado IN ('borrador','enviado','aceptado','rechazado','facturado')),
  notas TEXT,
  valid_until DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.presupuestos ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated users can do everything (same pattern as rest of CRM)
CREATE POLICY "Allow all for authenticated" ON public.presupuestos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX idx_presupuestos_client_id ON public.presupuestos(client_id);
CREATE INDEX idx_presupuestos_estado ON public.presupuestos(estado);
CREATE INDEX idx_presupuestos_created_at ON public.presupuestos(created_at DESC);
