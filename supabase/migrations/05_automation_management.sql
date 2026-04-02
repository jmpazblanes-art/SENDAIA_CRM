
-- 7. MÓDULO DE CONFIGURACIÓN (Control Center)
CREATE TABLE IF NOT EXISTS public.automation_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  is_secret BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.automation_configs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read for authenticated users" ON public.automation_configs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable update for admins" ON public.automation_configs FOR UPDATE TO authenticated USING (true); -- Simplified for MVP

-- Seed initial configs
INSERT INTO public.automation_configs (key, value, description, category) VALUES
('voice_agent_prompt', '{"prompt": "Eres un asistente de voz experto en ventas...", "voice_id": "rachel"}', 'Prompt maestro del agente de voz Retell', 'voice'),
('telegram_bot_settings', '{"welcome_message": "¡Hola! Bienvenido a SendaIA...", "active_hours": "09:00-18:00"}', 'Configuración del bot de Telegram', 'telegram'),
('lead_scoring_rules', '{"high_priority_revenue": 10000, "qualified_on_email": true}', 'Reglas para la calificación automática de leads', 'core'),
('calcom_config', '{"booking_url": "https://cal.com/sendaia", "embed_id": "sendaia-demo"}', 'Configuración de enlaces de reserva externa', 'integration')
ON CONFLICT (key) DO NOTHING;

-- Add category to automation_runs for better filtering
ALTER TABLE public.automation_runs ADD COLUMN IF NOT EXISTS category TEXT;
