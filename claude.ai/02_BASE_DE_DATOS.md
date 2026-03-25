# SendaIA CRM - Base de Datos (Supabase/PostgreSQL)

## Tablas

### clients
Tabla principal del CRM. Almacena leads y clientes.

| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID (PK) | gen_random_uuid() |
| first_name | TEXT | NOT NULL |
| last_name | TEXT | NOT NULL |
| company_name | TEXT | Nombre empresa |
| email | TEXT | UNIQUE |
| phone | TEXT | NOT NULL |
| status | TEXT | lead, contacted, qualified, proposal, active, inactive, closed, lost, client |
| priority | TEXT | low, medium, high, urgent |
| source | TEXT | web, instagram, referral, cold_outreach, event, other, telegram, ghl_funnel, manual, ads, webhook, voice_agent |
| industry | TEXT | Sector |
| company_size | TEXT | 1-5, 6-20, 21-50, 51-200, 200+ |
| monthly_revenue_estimate | DECIMAL(10,2) | |
| website | TEXT | |
| city | TEXT | |
| pain_points | TEXT[] | Array de puntos de dolor |
| opportunity_score | INTEGER | 0-100 |
| estimated_impact_eur | DECIMAL(10,2) | |
| notes | TEXT | |
| last_contact_date | TIMESTAMPTZ | |
| next_follow_up | TIMESTAMPTZ | |
| assigned_to | UUID (FK) | -> employees.id |
| phone2 | TEXT | Telefono secundario |
| linkedin | TEXT | URL LinkedIn |
| tags | TEXT[] | Array de etiquetas |
| webhook_source | TEXT | Origen del webhook |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### employees
Equipo de SendaIA.

| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID (PK) | |
| first_name | TEXT | NOT NULL |
| last_name | TEXT | NOT NULL |
| email | TEXT | UNIQUE, NOT NULL |
| phone | TEXT | |
| avatar_url | TEXT | |
| role | TEXT | founder, sales, operations, technical, admin, partner |
| specialty | TEXT | |
| hire_date | DATE | |
| active | BOOLEAN | default TRUE |
| permissions | JSONB | {view_clients, edit_clients, view_finances, manage_team} |
| clients_assigned | INTEGER | |
| total_deals_closed | INTEGER | |
| total_revenue_generated | DECIMAL(10,2) | |
| linkedin_url | TEXT | |
| bio | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### appointments
Citas con clientes.

| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID (PK) | |
| client_id | UUID (FK) | -> clients.id ON DELETE CASCADE |
| employee_id | UUID (FK) | -> employees.id ON DELETE SET NULL |
| title | TEXT | NOT NULL |
| type | TEXT | DEMO, DIAGNOSTICO, ONBOARDING, FOLLOW_UP, TECHNICAL_REVIEW, OTHER |
| start_time | TIMESTAMPTZ | NOT NULL |
| end_time | TIMESTAMPTZ | NOT NULL |
| location | TEXT | |
| meeting_url | TEXT | |
| status | TEXT | pending, confirmed, completed, no_show, cancelled, rescheduled |
| notes_before | TEXT | |
| notes_after | TEXT | |
| reminder_sent_24h | BOOLEAN | |
| reminder_sent_1h | BOOLEAN | |
| google_event_id | TEXT | ID del evento en Google Calendar |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### invoices
Facturas con calculo automatico de IVA.

| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID (PK) | |
| client_id | UUID (FK) | -> clients.id ON DELETE CASCADE |
| invoice_number | TEXT | UNIQUE, NOT NULL |
| invoice_date | DATE | NOT NULL |
| due_date | DATE | NOT NULL |
| subtotal | DECIMAL(10,2) | NOT NULL |
| tax_rate | DECIMAL(5,2) | default 21.00 |
| tax_amount | DECIMAL(10,2) | GENERATED (subtotal * tax_rate / 100) |
| total | DECIMAL(10,2) | GENERATED (subtotal + tax_amount) |
| status | TEXT | draft, sent, paid, overdue, cancelled |
| payment_method | TEXT | bank_transfer, card, bizum, paypal, other |
| paid_date | DATE | |
| items | JSONB | NOT NULL - lineas de factura |
| pdf_url | TEXT | |
| original_pdf_url | TEXT | |
| notes | TEXT | |
| internal_notes | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### call_logs
Registro de llamadas (agente de voz).

| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID (PK) | |
| client_id | UUID (FK) | -> clients.id |
| employee_id | UUID (FK) | -> employees.id |
| appointment_id | UUID (FK) | -> appointments.id |
| call_sid | TEXT | UNIQUE - ID externo |
| direction | TEXT | inbound, outbound |
| from_number | TEXT | |
| to_number | TEXT | |
| status | TEXT | completed, no_answer, busy, failed, voicemail |
| duration_seconds | INTEGER | |
| recording_url | TEXT | |
| transcript | TEXT | Transcripcion completa |
| sentiment | TEXT | positive, neutral, negative |
| intent | TEXT | Intencion detectada |
| summary | TEXT | Resumen de la llamada |
| next_action | TEXT | Siguiente accion recomendada |
| created_at | TIMESTAMPTZ | |

### chat_messages
Mensajes del chatbot y bot Telegram.

| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID (PK) | |
| employee_id | UUID (FK) | -> employees.id (nullable para Telegram) |
| role | TEXT | user, assistant, note, tool, system |
| content | TEXT | NOT NULL |
| telegram_chat_id | TEXT | ID del chat de Telegram (indexado) |
| created_at | TIMESTAMPTZ | |

### lead_notes
Notas asociadas a clientes.

| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID (PK) | |
| client_id | UUID (FK) | -> clients.id ON DELETE CASCADE |
| employee_id | UUID (FK) | -> employees.id |
| content | TEXT | NOT NULL |
| category | TEXT | general, call, meeting, technical, closing |
| created_at | TIMESTAMPTZ | |

### client_notes
Notas de clientes (usada por MCP connector).

| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID (PK) | |
| client_id | UUID (FK) | -> clients.id |
| content | TEXT | |
| created_at | TIMESTAMPTZ | |

### automation_runs
Registro de ejecuciones de automatizaciones.

| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID (PK) | |
| name | TEXT | NOT NULL |
| status | TEXT | pending, success, failed, running |
| started_at | TIMESTAMPTZ | |
| ended_at | TIMESTAMPTZ | |
| metadata | JSONB | |
| category | TEXT | |
| created_at | TIMESTAMPTZ | |

### automation_configs
Configuraciones del sistema.

| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID (PK) | |
| key | TEXT | UNIQUE, NOT NULL |
| value | JSONB | NOT NULL |
| description | TEXT | |
| category | TEXT | default 'general' |
| is_secret | BOOLEAN | default false |
| updated_at | TIMESTAMPTZ | |

### email_logs
Registro de emails enviados.

| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID (PK) | |
| client_id | UUID (FK) | -> clients.id |
| invoice_id | UUID (FK) | -> invoices.id |
| to_email | TEXT | NOT NULL |
| to_name | TEXT | |
| subject | TEXT | NOT NULL |
| body | TEXT | |
| type | TEXT | manual, invoice, follow_up, reminder, welcome |
| status | TEXT | pending, sent, failed, bounced |
| resend_id | TEXT | ID de Resend para tracking |
| error_message | TEXT | |
| sent_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

## RLS (Row Level Security)

Todas las tablas tienen RLS habilitado. Politicas actuales permiten acceso completo a usuarios autenticados y service_role (necesario para webhooks y bots).
