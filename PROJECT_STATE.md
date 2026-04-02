# SendaIA CRM — Estado del Proyecto

## Última sesión: 2026-04-02

### Estado actual: PRODUCCIÓN ✅
- URL: https://sendaia-crm.vercel.app
- Stack: Next.js + Supabase + Vercel
- Rama: main

---

## Fase actual: MVP funcional en uso

### Funcionalidades activas:
- [x] Login cinematic con logo SendaIA
- [x] Dashboard con KPIs, partículas, efectos gold
- [x] Clientes (CRUD completo)
- [x] Pipeline Kanban
- [x] Revenue Dashboard (Recharts)
- [x] Presupuestos con baremo SendaIA
- [x] Contratos
- [x] Tracking de horas
- [x] Centro de notificaciones
- [x] Ops Center (monitoriza 4 productos: PeritApp, AirConEtc, FisConLab, CRM)
- [x] Cron jobs en Vercel (alertas 08:00 CET)
- [x] Aria chatbot flotante con etiqueta "¿En qué puedo ayudarte?"
- [x] Settings con guardado real en Supabase (agency_settings table)
- [x] Seguridad: solo info@sendaia.es puede acceder (middleware lockdown)

### Lo hecho hoy (2026-04-02):
1. **Settings page** — implementado guardado real con tabla `agency_settings` en Supabase
2. **Aria chatbot** — añadida burbuja de texto "¿En qué puedo ayudarte? / Soy Aria" junto al botón flotante
3. **Cuenta de acceso** — creado usuario `info@sendaia.es` en Supabase Auth
4. **Seguridad CRM** — middleware lockdown: solo info@sendaia.es puede entrar, cualquier otro es echado

---

## Próximo paso sugerido:
- Arreglar permisos de cuenta Supabase (Pachi tiene problemas de permisos en el dashboard)
- Deshabilitar "Allow new users to sign up" en Supabase Auth cuando tenga permisos
- Subir documentos/contratos: activar Supabase Storage + tabla `contratos` (ya migración lista)
- Dominio personalizado: crm.sendaia.es
- Cambiar contraseña de info@sendaia.es (actualmente SendaIA2026!)

---

## Credenciales de acceso:
- CRM: info@sendaia.es / SendaIA2026! ← CAMBIAR
- Supabase project ref: rudolmemxsugxmcbvrwe
- Vercel: sendaia-crm.vercel.app
