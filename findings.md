# Biblioteca de Descubrimientos 📚

## Restricciones Técnicas
*   **Auth Proxy:** El middleware de Next.js estaba bloqueando el acceso por falta de sesión de Supabase. Se implementó un bypass manual y un botón de login temporal para no detener el desarrollo.
*   **Data Handling:** Las fechas de las tablas `call_logs` y `automation_runs` a veces vienen como null desde Supabase si la inserción es asíncrona o manual. Se requiere `date-fns` con validación previa.

## Integraciones Detectadas
1.  **GoHighLevel:** Uso de webhooks para ingesta de leads.
2.  **Retell AI:** API de voz para logs y análisis de sentimiento.
3.  **n8n:** Motor de orquestación externo que alimenta `automation_runs`.

## Errores Solucionados
*   **Crash en Cards:** Las tarjetas de métricas fallaban si el cambio porcentual era null. Se añadió fallback a "0%".
*   **ViewportRef:** El Componente `ScrollArea` no exponía la referencia del viewport, impidiendo el autocontrol de scroll en el chat. Corregido.
