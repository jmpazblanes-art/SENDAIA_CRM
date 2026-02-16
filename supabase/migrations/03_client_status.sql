
-- Update Client statuses to match business language
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_status_check;
ALTER TABLE public.clients ADD CONSTRAINT clients_status_check CHECK (status IN ('lead', 'contacted', 'qualified', 'proposal', 'active', 'inactive', 'closed', 'lost'));
