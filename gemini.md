# Constitución del Proyecto: SendaIA CRM 🏛️

## 1. Visión y Reglas de Oro
*   **Propósito Dual:** Herramienta interna de SendaIA y plantilla de venta (Showcase) para clientes finales.
*   **Determinismo:** El código debe ser predecible. Las respuestas de IA deben estar enmarcadas en esquemas JSON estrictos.
*   **Autorreparación:** Fallbacks en todas las vistas ante datos nulos o errores de API.
*   **Estética Premium:** UI oscura, uso de gradientes, glassmorphism y micro-animaciones para reflejar una agencia de IA de élite.

## 2. Integraciones Estratégicas
*   **Telegram Assistant:** Sincronización bidireccional para notificaciones de leads y comandos CRM (vía n8n).
*   **Google Ecosystem:** Integración con Calendar (citas) y Sheets (respaldos opcionales).
*   **Supabase:** Única fuente de la verdad para datos operativos.

### Tabla: `clients` (Supabase)
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID | Identificador único |
| `first_name` | String | Nombre del contacto |
| `last_name` | String | Apellidos del contacto |
| `email` | String | Email (único) |
| `phone` | String | Teléfono de contacto |
| `company_name` | String | Nombre de la empresa |
| `status` | Enum | lead, contacted, qualified, proposal, client, inactive |
| `source` | String | ghl_funnel, web, manual, ads |
| `industry` | String | Sector de actividad |
| `opportunity_score`| Int | Puntuación de 0 a 100 |

### Tabla: `call_logs` (Vía Retell AI)
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID | Identificador de la llamada |
| `client_id` | UUID | Relación con la tabla clients |
| `duration_seconds`| Int | Duración total |
| `sentiment` | Enum | positive, neutral, negative |
| `status` | Enum | completed, failed, ringing |
| `recording_url` | String | Enlace al audio |

### Tabla: `automation_runs` (Vía n8n)
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID | ID del flujo |
| `name` | String | Nombre del workflow |
| `status` | Enum | success, error |
| `started_at` | DateTime | Fecha de ejecución |

## 3. Invariantes Arquitectónicas
*   **Framework:** Next.js 15 (App Router).
*   **Auth:** Supabase Auth (Temporalmente en modo Test con bypass).
*   **Estilos:** Tailwind CSS + shadcn/ui.
*   **Integraciones:** n8n (Webhooks), Retell AI (Voz), GoHighLevel (Leads).
