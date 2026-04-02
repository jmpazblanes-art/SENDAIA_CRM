-- =============================================================
-- 10. MÓDULO DE DOCUMENTOS DE CLIENTES (Client Documents)
-- =============================================================

-- Tabla para documentos/archivos asociados a cada cliente
CREATE TABLE IF NOT EXISTS public.client_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  storage_path TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'contrato', 'propuesta', 'factura', 'presentacion', 'tecnico', 'otro')),
  uploaded_by UUID REFERENCES public.employees(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated users can do everything (same pattern as rest of CRM)
CREATE POLICY "Allow all for authenticated" ON public.client_documents
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Index for fast lookup by client
CREATE INDEX idx_client_documents_client_id ON public.client_documents(client_id);

-- Index for category filtering
CREATE INDEX idx_client_documents_category ON public.client_documents(category);
