
# 📘 Manual de Operaciones: SendaIA CRM

Bienvenido al Centro de Control de SendaIA. Este documento detalla cómo operar y mantener tu nuevo ecosistema de gestión comercial.

## 1. Acceso y Navegación
*   **Login:** El sistema cuenta con una pantalla de acceso protegida. Para desarrollo, hay un botón de "Acceso Directo".
*   **Barra Lateral:** Permite navegar entre Dashboard, Clientes, Citas, Equipo, Automatizaciones y Ajustes. Todos los enlaces están 100% operativos.

## 2. Gestión de Clientes y Leads
*   **Pipeline Comercial:** Usa la vista de Kanban para mover leads entre estados (Leads, Cualificados, Activos, Cerrados).
*   **Importación GHL:** El CRM está preparado para recibir leads de GoHighLevel a través del endpoint `/api/webhooks/ghl`. 
*   **IA Score:** Los clientes muestran una puntuación predictiva de cierre generada (simulada) por el motor SendaIA.

## 3. Calendario y Citas
*   **Sincronización:** Usa el botón "Sync Google" en la sección de citas para integrar tus eventos.
*   **Detalles:** Cada cita permite ver el cliente asociado y el tipo de sesión (Diagnóstico, Demo, Seguimiento).

## 4. Motor de IA y Automatizaciones
*   **Prompts Lab:** Repositorio central de las "heurísticas" de tus agentes. Puedes editar y versionar los prompts de sistema.
*   **SendaIA Brain:** El widget de chat inferior derecho está conectado directamente a la API operativa. Úsalo para consultas rápidas sobre la base de datos.

## 5. Mantenimiento y Seguridad
*   **Auth Lockdown:** Para activar el escudo de seguridad total, sigue las instrucciones en `utils/supabase/middleware.ts` (descomentando el bloque de redirección).
*   **Responsividad:** El CRM es 100% Mobile-First. Puedes usarlo desde cualquier smartphone sin pérdida de funcionalidad.

---
*Desarrollado con autoridad por Antigravity para SendaIA.*
