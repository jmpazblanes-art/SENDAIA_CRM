# SendaIA CRM - Herramientas MCP

Endpoint: `POST https://sendaia-crm.vercel.app/api/mcp`
Protocolo: JSON-RPC 2.0 (MCP protocol version 2024-11-05)
Autenticacion: Bearer token via header `Authorization`

## Clientes (5 herramientas)

### crm_list_clients
Lista clientes del CRM con filtros opcionales.

**Parametros**:
| Parametro | Tipo | Requerido | Descripcion |
|-----------|------|-----------|-------------|
| status | string | No | Filtrar: lead, prospect, active, inactive, churned |
| source | string | No | Filtrar: website, referral, phone, manual, import, linkedin, other |
| search | string | No | Buscar por nombre, email o empresa |
| limit | number | No | Max resultados (default 20) |

**Ejemplo**: Listar leads recientes
```json
{"name": "crm_list_clients", "arguments": {"status": "lead", "limit": 5}}
```

### crm_get_client
Obtiene perfil completo de un cliente con sus citas y notas recientes.

**Parametros**:
| Parametro | Tipo | Requerido | Descripcion |
|-----------|------|-----------|-------------|
| client_id | string | Si | UUID del cliente |

**Ejemplo**:
```json
{"name": "crm_get_client", "arguments": {"client_id": "abc-123-..."}}
```

### crm_create_client
Crea un nuevo cliente en el CRM.

**Parametros**:
| Parametro | Tipo | Requerido | Descripcion |
|-----------|------|-----------|-------------|
| name | string | Si | Nombre completo (nombre + apellido) |
| email | string | No | Email |
| phone | string | No | Telefono |
| company | string | No | Empresa |
| status | string | No | Estado (default: lead) |
| source | string | No | Fuente (default: manual) |
| notes | string | No | Notas iniciales |

**Ejemplo**:
```json
{"name": "crm_create_client", "arguments": {"name": "Carlos Lopez", "email": "carlos@empresa.com", "company": "Empresa SL", "source": "referral"}}
```

### crm_update_client
Actualiza campos de un cliente existente.

**Parametros**:
| Parametro | Tipo | Requerido | Descripcion |
|-----------|------|-----------|-------------|
| client_id | string | Si | UUID del cliente |
| name | string | No | Nuevo nombre completo |
| email | string | No | Nuevo email |
| phone | string | No | Nuevo telefono |
| company | string | No | Nueva empresa |
| status | string | No | Nuevo estado |
| source | string | No | Nueva fuente |

**Ejemplo**:
```json
{"name": "crm_update_client", "arguments": {"client_id": "abc-123-...", "status": "active"}}
```

### crm_search_clients
Busca clientes por nombre, email, telefono o empresa.

**Parametros**:
| Parametro | Tipo | Requerido | Descripcion |
|-----------|------|-----------|-------------|
| query | string | Si | Texto de busqueda |

**Ejemplo**:
```json
{"name": "crm_search_clients", "arguments": {"query": "Aircontec"}}
```

### crm_delete_client
Elimina un cliente y todos sus datos asociados (citas, notas, mensajes).

**Parametros**:
| Parametro | Tipo | Requerido | Descripcion |
|-----------|------|-----------|-------------|
| client_id | string | Si | UUID del cliente a eliminar |

**Ejemplo**:
```json
{"name": "crm_delete_client", "arguments": {"client_id": "abc-123-..."}}
```

## Citas (4 herramientas)

### crm_list_appointments
Lista citas con filtros opcionales.

**Parametros**:
| Parametro | Tipo | Requerido | Descripcion |
|-----------|------|-----------|-------------|
| date_from | string | No | Fecha inicio (ISO) |
| date_to | string | No | Fecha fin (ISO) |
| status | string | No | scheduled, completed, cancelled, no_show |
| client_id | string | No | UUID del cliente |
| limit | number | No | Max resultados (default 10) |

**Ejemplo**: Citas de esta semana
```json
{"name": "crm_list_appointments", "arguments": {"date_from": "2026-03-23", "date_to": "2026-03-29"}}
```

### crm_create_appointment
Crea una nueva cita para un cliente.

**Parametros**:
| Parametro | Tipo | Requerido | Descripcion |
|-----------|------|-----------|-------------|
| client_id | string | Si | UUID del cliente |
| title | string | Si | Titulo de la cita |
| type | string | Si | demo, discovery_call, onboarding, follow_up, technical_review, other |
| date | string | Si | Fecha/hora inicio ISO (timezone Europe/Madrid) |
| duration | number | No | Duracion en minutos (default 60) |
| notes | string | No | Notas |

**Ejemplo**:
```json
{"name": "crm_create_appointment", "arguments": {"client_id": "abc-123-...", "title": "Demo CRM", "type": "demo", "date": "2026-03-26T10:00:00", "duration": 45}}
```

### crm_update_appointment
Actualiza/reprograma una cita existente.

**Parametros**:
| Parametro | Tipo | Requerido | Descripcion |
|-----------|------|-----------|-------------|
| appointment_id | string | Si | UUID de la cita |
| date | string | No | Nueva fecha/hora (ISO) |
| status | string | No | Nuevo estado |
| type | string | No | Nuevo tipo |
| notes | string | No | Nuevas notas |

**Ejemplo**:
```json
{"name": "crm_update_appointment", "arguments": {"appointment_id": "xyz-456-...", "date": "2026-03-27T11:00:00"}}
```

### crm_cancel_appointment
Cancela una cita por ID.

**Parametros**:
| Parametro | Tipo | Requerido | Descripcion |
|-----------|------|-----------|-------------|
| appointment_id | string | Si | UUID de la cita |

**Ejemplo**:
```json
{"name": "crm_cancel_appointment", "arguments": {"appointment_id": "xyz-456-..."}}
```

## Notas (2 herramientas)

### crm_add_note
Anade una nota a un cliente.

**Parametros**:
| Parametro | Tipo | Requerido | Descripcion |
|-----------|------|-----------|-------------|
| client_id | string | Si | UUID del cliente |
| content | string | Si | Contenido de la nota |

**Ejemplo**:
```json
{"name": "crm_add_note", "arguments": {"client_id": "abc-123-...", "content": "Interesado en paquete BUSINESS. Llamar el jueves."}}
```

### crm_get_client_notes
Obtiene notas de un cliente especifico.

**Parametros**:
| Parametro | Tipo | Requerido | Descripcion |
|-----------|------|-----------|-------------|
| client_id | string | Si | UUID del cliente |
| limit | number | No | Max resultados (default 20) |

**Ejemplo**:
```json
{"name": "crm_get_client_notes", "arguments": {"client_id": "abc-123-..."}}
```

## Dashboard (1 herramienta)

### crm_dashboard_stats
Obtiene estadisticas del CRM: conteo de clientes por estado, citas proximas, resumen del pipeline.

**Parametros**: Ninguno

**Ejemplo**:
```json
{"name": "crm_dashboard_stats", "arguments": {}}
```

**Retorna**:
- total_clients: numero total
- clients_by_status: {lead: N, active: N, ...}
- upcoming_appointments: numero de citas futuras
- appointments_by_status: {scheduled: N, ...}
- next_appointments: 5 proximas citas con nombre del cliente

## Calendario (1 herramienta)

### crm_check_calendar
Consulta disponibilidad en Google Calendar para un rango de fechas.

**Parametros**:
| Parametro | Tipo | Requerido | Descripcion |
|-----------|------|-----------|-------------|
| date | string | No | Fecha (YYYY-MM-DD). Default: hoy |
| days | number | No | Numero de dias a consultar (default 1) |

**Ejemplo**: Ver agenda de manana
```json
{"name": "crm_check_calendar", "arguments": {"date": "2026-03-26", "days": 1}}
```

## Formato de llamada JSON-RPC

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "crm_list_clients",
    "arguments": {"status": "lead", "limit": 5}
  },
  "id": 1
}
```
