
-- Insert some employees if not exist
INSERT INTO employees (id, first_name, last_name, role, email)
VALUES 
  ('e1000000-0000-0000-0000-000000000001', 'José María', 'Paz', 'founder', 'josemaria@sendaia.es'),
  ('e1000000-0000-0000-0000-000000000002', 'Ana', 'García', 'sales', 'ana@sendaia.es')
ON CONFLICT (id) DO NOTHING;

-- Insert call logs
INSERT INTO call_logs (name, duration_seconds, status, sentiment, recording_url)
VALUES 
  ('Llamada Prospección - Clínica Dental Sur', 420, 'completed', 'positive', 'https://example.com/recording1'),
  ('Llamada Seguimiento - Asesoría Pérez', 180, 'completed', 'neutral', 'https://example.com/recording2'),
  ('Llamada Perdida - Tech Solutions', 0, 'failed', null, null)
ON CONFLICT DO NOTHING;

-- Insert automation runs
INSERT INTO automation_runs (name, status, log_message)
VALUES 
  ('Lead Processing - Web Form', 'success', 'Processed 1 new lead from website.'),
  ('Voice Agent - Inbound Call', 'success', 'Appointment scheduled for client ID: 1'),
  ('WhatsApp Reminder', 'failed', 'Error sending message: API Timeout')
ON CONFLICT DO NOTHING;

-- Insert demo clients if empty
INSERT INTO clients (first_name, last_name, company_name, email, phone, status, source)
VALUES 
  ('Carlos', 'Sánchez', 'Tech Solutions', 'carlos@tech.com', '+34600111222', 'lead', 'web'),
  ('Marta', 'López', 'Asesoría Pérez', 'marta@perez.es', '+34600333444', 'contacted', 'referral')
ON CONFLICT DO NOTHING;
