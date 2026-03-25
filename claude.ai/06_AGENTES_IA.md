# SendaIA CRM - Agentes IA

## Aria (Bot de Telegram)

### Descripcion
Secretaria virtual de SendaIA que opera a traves de Telegram. Profesional, amable y eficiente. Responde siempre en espanol.

### Modelo
OpenAI GPT-4o-mini via OpenRouter

### Funciones principales
1. Registrar nuevos leads/clientes en el CRM
2. Agendar citas (demo, diagnostico, onboarding, follow_up, technical_review, other) en el calendario
3. Tomar notas rapidas
4. Consultar la agenda del dia
5. Listar leads recientes
6. Buscar y editar clientes existentes
7. Ver, reprogramar y cancelar citas
8. Obtener perfil completo de un cliente con historial
9. Proporcionar informacion de SendaIA (servicios, precios, paquetes)

### Herramientas (13)

| # | Herramienta | Descripcion |
|---|-------------|-------------|
| 1 | `create_lead` | Crear un nuevo lead/cliente. Requiere: full_name. Opcional: phone, email, company_name |
| 2 | `create_appointment` | Crear cita en CRM + Google Calendar. Requiere: client_name, title, type, start_time, end_time |
| 3 | `add_note` | Guardar una nota rapida en chat_messages |
| 4 | `list_leads` | Listar leads/clientes recientes. Opcional: limit (default 10) |
| 5 | `check_calendar` | Consultar eventos de Google Calendar para un dia. Opcional: date |
| 6 | `search_clients` | Buscar clientes por nombre, email, telefono o empresa |
| 7 | `get_client_details` | Perfil completo del cliente + citas + mensajes recientes |
| 8 | `update_client` | Actualizar datos de un cliente (nombre, email, phone, empresa, status) |
| 9 | `list_appointments` | Listar citas con filtros (fecha, estado, cliente) |
| 10 | `update_appointment` | Reprogramar o actualizar una cita. Sincroniza con Google Calendar |
| 11 | `cancel_appointment` | Cancelar cita + eliminar evento de Google Calendar |
| 12 | `get_company_info` | Devuelve toda la info de SendaIA: servicios, precios, paquetes, contacto |
| 13 | `delete_client` | Eliminar cliente y todos sus datos asociados (citas, notas, mensajes) |

### Arquitectura
- **Webhook**: `/api/telegram/` recibe mensajes de Telegram
- **Motor**: `lib/agents/secretary.ts` - loop de function calling con hasta 5 rondas de herramientas
- **Memoria**: Historial de conversacion almacenado en `chat_messages` (por telegram_chat_id), ultimos 20 mensajes como contexto
- **Calendario**: Sincronizacion bidireccional con Google Calendar (crear, actualizar, eliminar eventos)
- **Temperatura**: 0.4 (respuestas consistentes)

### Reglas de comportamiento
- Si faltan datos obligatorios, pregunta antes de ejecutar
- Fechas siempre en zona horaria Europe/Madrid
- Respuestas concisas con Markdown ligero para Telegram
- Nunca inventa datos que el usuario no haya dado
- Confirma siempre antes de cancelar o reprogramar citas

---

## Carolina (Agente de Voz - Retell)

### Descripcion
Recepcionista telefonica virtual con voz natural. Atiende llamadas entrantes y puede hacer llamadas salientes. Conectada al CRM para consultar y registrar informacion.

### Plataforma
Retell AI (agente de voz con IA)

### Herramientas (9)
Basadas en las funciones del CRM conectadas via API:

| # | Herramienta | Descripcion |
|---|-------------|-------------|
| 1 | Buscar cliente | Busca en el CRM por nombre o telefono del llamante |
| 2 | Crear lead | Registra un nuevo lead con los datos capturados en la llamada |
| 3 | Agendar cita | Reserva cita via Cal.com y la registra en el CRM |
| 4 | Consultar disponibilidad | Verifica huecos en el calendario |
| 5 | Obtener info cliente | Recupera datos del cliente durante la llamada |
| 6 | Tomar nota | Registra notas de la conversacion en el CRM |
| 7 | Transferir llamada | Transfiere al humano si es necesario |
| 8 | Info empresa | Proporciona informacion sobre servicios y precios de SendaIA |
| 9 | Confirmar/reprogramar cita | Gestiona cambios en citas existentes |

### Diferencias con Aria

| Aspecto | Aria (Telegram) | Carolina (Voz) |
|---------|----------------|----------------|
| Canal | Texto (Telegram) | Voz (telefono) |
| Interaccion | Asincrona, el usuario escribe cuando quiere | Sincrona, conversacion en tiempo real |
| Reservas | Directamente en Google Calendar | Via Cal.com (booking externo) |
| Historial | Mantiene contexto de chat (20 mensajes) | Cada llamada es una sesion independiente |
| Registro | Mensajes en chat_messages | Llamadas en call_logs con transcripcion |
| Disponibilidad | 24/7 | 24/7 |

### Que pueden hacer ambos agentes
- Registrar leads nuevos en el CRM
- Agendar y gestionar citas
- Consultar informacion de clientes
- Proporcionar info de servicios y precios de SendaIA
- Tomar notas

### Que NO pueden hacer
- Crear o enviar facturas
- Modificar configuraciones del sistema
- Acceder a datos financieros
- Gestionar el equipo (empleados)
- Ejecutar automatizaciones
- Enviar emails
