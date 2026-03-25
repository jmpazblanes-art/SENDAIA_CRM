# SendaIA CRM - Contexto General

## Que es

CRM propio de SendaIA, una agencia de automatizacion e IA para PYMEs espanolas. Construido como aplicacion web moderna con dashboard completo para gestion comercial.

- **URL produccion**: https://sendaia-crm.vercel.app
- **GitHub**: jmpazblanes-art/SENDAIA_CRM
- **Hosting**: Vercel
- **Base de datos**: Supabase (PostgreSQL)

## Funcionalidades principales

- **Gestion de clientes**: CRUD completo, busqueda, filtros por estado/fuente, pipeline visual
- **Citas**: Programar, reprogramar, cancelar. Sincronizacion con Google Calendar
- **Facturas**: Creacion, envio por email (Resend), estados (borrador, enviada, pagada, vencida)
- **Equipo**: Directorio de empleados, roles, asignacion de clientes
- **Pipeline**: Vista kanban de leads por estado comercial
- **Llamadas**: Registro de llamadas con transcripcion, sentimiento, resumen
- **Automatizaciones**: Monitoreo de workflows, configuracion de agentes
- **Notas**: Sistema de notas por cliente con categorias

## Canales conectados

| Canal | Nombre | Descripcion |
|-------|--------|-------------|
| Telegram Bot | **Aria** | Secretaria virtual con 13 herramientas. Gestiona leads, citas, calendario, notas |
| Agente de voz (Retell) | **Carolina** | Recepcionista telefonica virtual. 9 herramientas, reserva citas via Cal.com |
| MCP Connector | **Claude** | 14 herramientas JSON-RPC para que Claude gestione el CRM directamente |
| Email | **Resend** | Envio de facturas y comunicaciones desde el CRM |

## Stack tecnologico

| Componente | Tecnologia | Version |
|------------|------------|---------|
| Framework | Next.js | 16.1.6 |
| React | React | 19.2.3 |
| Base de datos | Supabase (PostgreSQL) | SDK 2.95.3 |
| Auth | Supabase SSR | 0.8.0 |
| UI Components | Radix UI + shadcn/ui | 1.4.3 |
| Estilos | Tailwind CSS | 4.x |
| Tablas | TanStack React Table | 8.21.3 |
| Graficos | Recharts | 3.7.0 |
| Iconos | Lucide React | 0.563.0 |
| Email | Resend | 6.9.4 |
| Fechas | date-fns | 4.1.0 |
| CSV Import | PapaParse | 5.5.3 |
| Scraping | Cheerio + Axios | - |
| Calendar picker | react-day-picker | 9.13.1 |
| Command palette | cmdk | 1.1.1 |
| Toasts | Sonner | 2.0.7 |
| TypeScript | TypeScript | 5.x |
| Linting | ESLint + eslint-config-next | 9.x |
| Animaciones | tw-animate-css | 1.4.0 |

## Estructura del proyecto

```
app/
  dashboard/          # Paginas del dashboard (clients, appointments, invoices, team, pipeline, calls, automations)
  api/
    mcp/              # MCP connector para Claude (JSON-RPC)
    telegram/         # Webhook del bot Telegram (Aria)
    webhooks/         # Webhooks externos (Google Calendar, Telegram)
components/           # Componentes React (clients, appointments, invoices, etc.)
lib/
  agents/             # Agentes IA (secretary.ts = Aria)
  google-calendar.ts  # Integracion Google Calendar API
  telegram.ts         # Integracion Telegram Bot API
supabase/
  migrations/         # 9 migraciones SQL del schema
```
