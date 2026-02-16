
# 🚀 Guía de Despliegue SendaIA CRM

Este documento detalla los pasos necesarios para desplegar el CRM en **Vercel** y conectar **Supabase**.

## 1. Configuración de Variables de Entorno
En el panel de Vercel (Settings > Environment Variables), añade las siguientes:

| Variable | Descripción |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto en Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon Key de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key (Para acciones de servidor) |
| `OPENROUTER_API_KEY` | API Key para funciones de agentes IA |
| `NEXT_PUBLIC_SITE_URL` | URL de producción (ej: https://crm.sendaia.es) |

## 2. Base de Datos (Supabase)
Antes del primer despliegue, asegúrate de ejecutar las migraciones en el SQL Editor de Supabase en este orden:
1. `01_initial_schema.sql`
2. `02_refinement.sql`
3. `03_client_status.sql`
4. `04_seed_data.sql` (Opcional, para datos demo)

## 3. Comandos de Construcción
Vercel detectará Next.js automáticamente. Los comandos por defecto son:
- **Build Command:** `next build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

## 4. Conexión con n8n (Webhooks)
Para que las automatizaciones funcionen, actualiza las URLs en tus workflows de n8n apuntando a tu dominio de producción:
- `https://tu-dominio.com/api/webhooks/incoming-lead`

## 5. Checklist de Verificación Post-Deploy
- [ ] ¿El login carga correctamente?
- [ ] ¿Los clientes se listan desde la base de datos?
- [ ] ¿El calendario muestra las citas?
- [ ] ¿Las notas se guardan y aparecen en la línea de tiempo?

---
*Autoridad Tranquila • SendaIA 2026*
