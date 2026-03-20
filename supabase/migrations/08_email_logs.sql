-- Tabla de logs de emails enviados desde el CRM
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    to_email TEXT NOT NULL,
    to_name TEXT,
    subject TEXT NOT NULL,
    body TEXT,
    type TEXT DEFAULT 'manual' CHECK (type IN ('manual', 'invoice', 'follow_up', 'reminder', 'welcome')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
    resend_id TEXT,       -- ID de Resend para tracking
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for authenticated" ON public.email_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated" ON public.email_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated" ON public.email_logs FOR UPDATE TO authenticated USING (true);
