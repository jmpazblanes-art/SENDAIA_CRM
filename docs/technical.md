
# Documentación Técnica - SendaIA CRM

## Arquitectura
El sistema sigue una arquitectura moderna basada en Next.js 14 (App Router) y Supabase.

### Componentes Principales
1.  **Frontend**: Next.js 14, Tailwind CSS, Shadcn UI.
2.  **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime).
3.  **Automatización**: n8n (VPS Externo) para orquestación de llamadas y chat.
4.  **IA**: OpenRouter (GPT-4o) y Retell AI (Voz).

### Estructura de Base de Datos
- `clients`: Información core del CRM.
- `appointments`: Citas y reuniones.
- `invoices`: Facturación y conceptos.
- `employees`: Directorio y permisos.
- `call_logs`: Registro de llamadas de IA.
- `chat_messages`: Historial del chatbot interno.

### Variables de Entorno (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENROUTER_API_KEY=...
N8N_WEBHOOK_URL_CALLS=...
N8N_WEBHOOK_URL_CHAT=...
N8N_WEBHOOK_URL_INVOICE_PARSE=...
```

### Webhooks y Automatización
- `POST /api/chat`: Conecta con n8n para el Chatbot.
- `POST /api/calls/start`: Inicia llamadas via n8n -> Retell.
- `POST /api/webhooks/call-completed`: Recibe callbacks de n8n tras una llamada.
- `POST /api/webhooks/invoice-parsed`: Recibe datos extraídos de facturas.

## Despliegue
1.  **Frontend**: Vercel (Recomendado). Configurar env vars.
2.  **Base de Datos**: Supabase. Correr migraciones en `supabase/migrations`.
3.  **n8n**: Importar workflows (no incluidos en este repo, gestionados en VPS).

## Comandos Útiles
- `npm run dev`: Iniciar servidor de desarrollo.
- `npm run build`: Construir para producción.
- `npm run start`: Iniciar servidor de producción.
