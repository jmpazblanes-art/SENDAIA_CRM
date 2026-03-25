import { createClient } from "@supabase/supabase-js"
import { listEvents, createEvent, updateEvent, deleteEvent } from "@/lib/google-calendar"
import { getResend, FROM_EMAIL, FROM_NAME } from "@/lib/resend"
import AppointmentConfirmationEmail from "@/emails/appointment-confirmation"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── System prompt ──

const SYSTEM_PROMPT = `Eres la secretaria virtual de SendaIA, una agencia de automatización e IA.
Tu nombre es Aria. Eres profesional, amable y eficiente. Respondes siempre en español.

Tu trabajo es:
1. Registrar nuevos leads/clientes en el CRM cuando alguien te lo pida.
2. Agendar citas (DEMO, DIAGNOSTICO, ONBOARDING) en el calendario.
3. Tomar notas rápidas.
4. Consultar la agenda del día.
5. Listar leads recientes.
6. Buscar y editar clientes existentes en el CRM.
7. Ver y gestionar citas: listar, reprogramar y cancelar.
8. Obtener el perfil completo de un cliente con su historial de citas y mensajes.
9. Proporcionar información completa sobre SendaIA: servicios, precios, paquetes y propuesta de valor.

Reglas:
- Si te faltan datos obligatorios para una acción, pregunta al usuario antes de ejecutar.
- Para citas necesitas: nombre del cliente, tipo (demo/discovery_call/onboarding/follow_up/technical_review/other), fecha y hora de inicio y fin.
- Las fechas siempre en zona horaria Europe/Madrid.
- Sé concisa en tus respuestas. Usa formato Markdown ligero para Telegram.
- Si no entiendes el mensaje o no es una instrucción clara, responde de forma amable preguntando qué necesita.
- Nunca inventes datos que el usuario no te haya dado.
- Cuando alguien pregunte por información de la empresa, usa la herramienta get_company_info.
- Para cancelar o reprogramar citas, confirma siempre con el usuario antes de ejecutar.`

// ── Tool definitions for OpenAI function calling ──

const TOOLS = [
    {
        type: 'function' as const,
        function: {
            name: 'create_lead',
            description: 'Crear un nuevo lead/cliente en el CRM',
            parameters: {
                type: 'object',
                properties: {
                    full_name: { type: 'string', description: 'Nombre completo del lead' },
                    phone: { type: 'string', description: 'Teléfono' },
                    email: { type: 'string', description: 'Email' },
                    company_name: { type: 'string', description: 'Nombre de la empresa' },
                },
                required: ['full_name'],
            },
        },
    },
    {
        type: 'function' as const,
        function: {
            name: 'create_appointment',
            description: 'Crear una cita en el calendario y el CRM',
            parameters: {
                type: 'object',
                properties: {
                    client_name: { type: 'string', description: 'Nombre del cliente' },
                    title: { type: 'string', description: 'Título de la cita' },
                    type: { type: 'string', enum: ['demo', 'discovery_call', 'onboarding', 'follow_up', 'technical_review', 'other'], description: 'Tipo de cita (demo, discovery_call, onboarding, follow_up, technical_review, other)' },
                    start_time: { type: 'string', description: 'Fecha/hora inicio ISO 8601' },
                    end_time: { type: 'string', description: 'Fecha/hora fin ISO 8601' },
                },
                required: ['client_name', 'title', 'type', 'start_time', 'end_time'],
            },
        },
    },
    {
        type: 'function' as const,
        function: {
            name: 'add_note',
            description: 'Guardar una nota rápida',
            parameters: {
                type: 'object',
                properties: {
                    content: { type: 'string', description: 'Contenido de la nota' },
                },
                required: ['content'],
            },
        },
    },
    {
        type: 'function' as const,
        function: {
            name: 'list_leads',
            description: 'Listar leads/clientes recientes del CRM',
            parameters: {
                type: 'object',
                properties: {
                    limit: { type: 'number', description: 'Cantidad máxima de resultados (default 10)' },
                },
            },
        },
    },
    {
        type: 'function' as const,
        function: {
            name: 'check_calendar',
            description: 'Consultar eventos del calendario para un día',
            parameters: {
                type: 'object',
                properties: {
                    date: { type: 'string', description: 'Fecha en formato YYYY-MM-DD. Si no se da, usa hoy.' },
                },
            },
        },
    },
    {
        type: 'function' as const,
        function: {
            name: 'search_clients',
            description: 'Buscar clientes por nombre, email, teléfono o empresa',
            parameters: {
                type: 'object',
                properties: {
                    query: { type: 'string', description: 'Texto de búsqueda (nombre, email, teléfono o empresa)' },
                },
                required: ['query'],
            },
        },
    },
    {
        type: 'function' as const,
        function: {
            name: 'get_client_details',
            description: 'Obtener perfil completo de un cliente con sus citas y mensajes recientes',
            parameters: {
                type: 'object',
                properties: {
                    client_id: { type: 'string', description: 'ID del cliente' },
                },
                required: ['client_id'],
            },
        },
    },
    {
        type: 'function' as const,
        function: {
            name: 'update_client',
            description: 'Actualizar datos de un cliente existente',
            parameters: {
                type: 'object',
                properties: {
                    client_id: { type: 'string', description: 'ID del cliente' },
                    first_name: { type: 'string', description: 'Nuevo nombre' },
                    last_name: { type: 'string', description: 'Nuevo apellido' },
                    phone: { type: 'string', description: 'Nuevo teléfono' },
                    email: { type: 'string', description: 'Nuevo email' },
                    company_name: { type: 'string', description: 'Nueva empresa' },
                    status: { type: 'string', description: 'Nuevo estado (lead, active, inactive, etc.)' },
                },
                required: ['client_id'],
            },
        },
    },
    {
        type: 'function' as const,
        function: {
            name: 'list_appointments',
            description: 'Listar citas del CRM con filtros opcionales',
            parameters: {
                type: 'object',
                properties: {
                    date_from: { type: 'string', description: 'Fecha inicio filtro YYYY-MM-DD' },
                    date_to: { type: 'string', description: 'Fecha fin filtro YYYY-MM-DD' },
                    status: { type: 'string', enum: ['scheduled', 'completed', 'cancelled', 'no_show'], description: 'Filtrar por estado' },
                    client_id: { type: 'string', description: 'Filtrar por ID de cliente' },
                    limit: { type: 'number', description: 'Máximo de resultados (default 10)' },
                },
            },
        },
    },
    {
        type: 'function' as const,
        function: {
            name: 'update_appointment',
            description: 'Actualizar/reprogramar una cita existente',
            parameters: {
                type: 'object',
                properties: {
                    appointment_id: { type: 'string', description: 'ID de la cita' },
                    start_time: { type: 'string', description: 'Nueva fecha/hora inicio ISO 8601' },
                    end_time: { type: 'string', description: 'Nueva fecha/hora fin ISO 8601' },
                    status: { type: 'string', enum: ['scheduled', 'completed', 'cancelled', 'no_show'], description: 'Nuevo estado' },
                    type: { type: 'string', enum: ['demo', 'discovery_call', 'onboarding', 'follow_up', 'technical_review', 'other'], description: 'Nuevo tipo' },
                    title: { type: 'string', description: 'Nuevo título' },
                },
                required: ['appointment_id'],
            },
        },
    },
    {
        type: 'function' as const,
        function: {
            name: 'cancel_appointment',
            description: 'Cancelar una cita y eliminar el evento de Google Calendar',
            parameters: {
                type: 'object',
                properties: {
                    appointment_id: { type: 'string', description: 'ID de la cita a cancelar' },
                },
                required: ['appointment_id'],
            },
        },
    },
    {
        type: 'function' as const,
        function: {
            name: 'get_company_info',
            description: 'Obtener información sobre SendaIA, sus servicios y contacto',
            parameters: {
                type: 'object',
                properties: {},
            },
        },
    },
    {
        type: 'function' as const,
        function: {
            name: 'delete_client',
            description: 'Eliminar un cliente del CRM y todos sus datos asociados (citas, notas)',
            parameters: {
                type: 'object',
                properties: {
                    client_id: { type: 'string', description: 'ID del cliente a eliminar' },
                },
                required: ['client_id'],
            },
        },
    },
]

// ── Tool implementations ──

async function executeCreateLead(args: {
    full_name: string
    phone?: string
    email?: string
    company_name?: string
}): Promise<string> {
    const nameParts = args.full_name.trim().split(' ')
    const first_name = nameParts[0] || 'Lead'
    const last_name = nameParts.slice(1).join(' ') || 'Telegram'

    const { data, error } = await supabase
        .from('clients')
        .insert({
            first_name,
            last_name,
            phone: args.phone || null,
            email: args.email || null,
            company_name: args.company_name || null,
            source: 'telegram',
            status: 'lead',
        })
        .select('id, first_name, last_name')
        .single()

    if (error) throw new Error(`Error creando lead: ${error.message}`)
    return JSON.stringify({ success: true, client_id: data.id, name: `${data.first_name} ${data.last_name}` })
}

async function executeCreateAppointment(args: {
    client_name: string
    title: string
    type: string
    start_time: string
    end_time: string
}): Promise<string> {
    // Buscar o crear el cliente
    const nameParts = args.client_name.trim().split(' ')
    const searchName = nameParts[0]

    let clientId: string | null = null

    const { data: existing } = await supabase
        .from('clients')
        .select('id, first_name, last_name')
        .ilike('first_name', `%${searchName}%`)
        .limit(1)
        .maybeSingle()

    if (existing) {
        clientId = existing.id
    } else {
        const first_name = nameParts[0] || 'Cliente'
        const last_name = nameParts.slice(1).join(' ') || 'Telegram'
        const { data: newClient, error } = await supabase
            .from('clients')
            .insert({ first_name, last_name, source: 'telegram', status: 'lead' })
            .select('id')
            .single()
        if (error) throw new Error(`Error creando cliente: ${error.message}`)
        clientId = newClient.id
    }

    // Crear evento en Google Calendar
    let calendarEvent = null
    try {
        calendarEvent = await createEvent({
            summary: `${args.type.toUpperCase()}: ${args.title}`,
            description: `Cliente: ${args.client_name}\nTipo: ${args.type}\nCreado via Telegram Bot`,
            start: args.start_time,
            end: args.end_time,
        })
    } catch (err) {
        console.error('[Secretary] Error creando evento en Google Calendar:', err)
    }

    // Insertar cita en el CRM
    const { data: appointment, error: apptError } = await supabase
        .from('appointments')
        .insert({
            client_id: clientId,
            title: args.title,
            type: args.type,
            start_time: args.start_time,
            end_time: args.end_time,
            status: 'scheduled',
            google_event_id: calendarEvent?.id || null,
        })
        .select('id')
        .single()

    if (apptError) throw new Error(`Error creando cita: ${apptError.message}`)

    // Auto-send appointment confirmation email if client has an email
    try {
        const { data: clientData } = await supabase
            .from('clients')
            .select('email, first_name')
            .eq('id', clientId)
            .single()

        if (clientData?.email) {
            const startDate = new Date(args.start_time)
            const endDate = new Date(args.end_time)
            const dateStr = startDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Europe/Madrid' })
            const timeStr = startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' })
            const durationMin = Math.round((endDate.getTime() - startDate.getTime()) / 60000)

            const typeLabels: Record<string, string> = {
                demo: 'Demo', discovery_call: 'Llamada de Descubrimiento', onboarding: 'Onboarding',
                follow_up: 'Seguimiento', technical_review: 'Revisión Técnica', other: 'Otra',
            }

            const { data: logData } = await supabase
                .from('email_logs')
                .insert({
                    client_id: clientId,
                    to_email: clientData.email,
                    to_name: clientData.first_name,
                    subject: 'Tu cita con SendaIA ha sido confirmada',
                    type: 'appointment_confirmation',
                    status: 'pending',
                })
                .select('id')
                .single()

            const logId = logData?.id

            const { data: emailResult, error: emailError } = await getResend().emails.send({
                from: `${FROM_NAME} <${FROM_EMAIL}>`,
                to: clientData.email,
                subject: 'Tu cita con SendaIA ha sido confirmada',
                react: AppointmentConfirmationEmail({
                    name: clientData.first_name,
                    date: dateStr,
                    time: timeStr,
                    type: typeLabels[args.type] || args.type,
                    duration: durationMin > 0 ? durationMin : undefined,
                }),
            })

            if (logId) {
                if (emailError) {
                    await supabase.from('email_logs').update({ status: 'failed', error_message: emailError.message }).eq('id', logId)
                } else {
                    await supabase.from('email_logs').update({ status: 'sent', resend_id: emailResult?.id, sent_at: new Date().toISOString() }).eq('id', logId)
                }
            }

            console.log('[Secretary] Confirmation email sent to:', clientData.email)
        }
    } catch (emailErr) {
        console.error('[Secretary] Error sending appointment confirmation email:', emailErr)
        // Don't block the tool response
    }

    return JSON.stringify({
        success: true,
        appointment_id: appointment.id,
        google_event_id: calendarEvent?.id || null,
        calendar_link: calendarEvent?.htmlLink || null,
    })
}

async function executeAddNote(args: { content: string }, chatId: string): Promise<string> {
    const { error } = await supabase
        .from('chat_messages')
        .insert({
            content: args.content,
            role: 'note',
            telegram_chat_id: chatId,
        })

    if (error) throw new Error(`Error guardando nota: ${error.message}`)
    return JSON.stringify({ success: true })
}

async function executeListLeads(args: { limit?: number }): Promise<string> {
    const limit = args.limit || 10
    const { data, error } = await supabase
        .from('clients')
        .select('id, first_name, last_name, email, phone, company_name, status, created_at')
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) throw new Error(`Error listando leads: ${error.message}`)
    return JSON.stringify(data)
}

async function executeCheckCalendar(args: { date?: string }): Promise<string> {
    const targetDate = args.date || new Date().toISOString().split('T')[0]
    const timeMin = `${targetDate}T00:00:00+01:00`
    const timeMax = `${targetDate}T23:59:59+01:00`

    try {
        const events = await listEvents(timeMin, timeMax)
        if (!events.length) return JSON.stringify({ message: 'No hay eventos para ese día', events: [] })
        return JSON.stringify(events.map(e => ({
            summary: e.summary,
            start: e.start?.dateTime,
            end: e.end?.dateTime,
            link: e.htmlLink,
        })))
    } catch (err) {
        console.error('[Secretary] Error consultando calendario:', err)
        return JSON.stringify({ error: 'No se pudo consultar el calendario' })
    }
}

// ── New tool implementations ──

async function executeSearchClients(args: { query: string }): Promise<string> {
    const q = `%${args.query}%`
    const { data, error } = await supabase
        .from('clients')
        .select('id, first_name, last_name, email, phone, company_name, status, source, created_at')
        .or(`first_name.ilike.${q},last_name.ilike.${q},email.ilike.${q},phone.ilike.${q},company_name.ilike.${q}`)
        .limit(10)

    if (error) throw new Error(`Error buscando clientes: ${error.message}`)
    return JSON.stringify(data)
}

async function executeGetClientDetails(args: { client_id: string }): Promise<string> {
    const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', args.client_id)
        .single()

    if (clientError) throw new Error(`Error obteniendo cliente: ${clientError.message}`)

    const { data: appointments } = await supabase
        .from('appointments')
        .select('id, title, type, status, start_time, end_time, notes, created_at')
        .eq('client_id', args.client_id)
        .order('start_time', { ascending: false })
        .limit(10)

    const { data: messages } = await supabase
        .from('chat_messages')
        .select('id, role, content, created_at')
        .eq('client_id', args.client_id)
        .order('created_at', { ascending: false })
        .limit(10)

    return JSON.stringify({
        client,
        appointments: appointments || [],
        recent_messages: messages || [],
    })
}

async function executeUpdateClient(args: {
    client_id: string
    first_name?: string
    last_name?: string
    phone?: string
    email?: string
    company_name?: string
    status?: string
}): Promise<string> {
    const { client_id, ...fields } = args
    // Remove undefined fields
    const updates: Record<string, any> = {}
    if (fields.first_name !== undefined) updates.first_name = fields.first_name
    if (fields.last_name !== undefined) updates.last_name = fields.last_name
    if (fields.phone !== undefined) updates.phone = fields.phone
    if (fields.email !== undefined) updates.email = fields.email
    if (fields.company_name !== undefined) updates.company_name = fields.company_name
    if (fields.status !== undefined) updates.status = fields.status

    if (Object.keys(updates).length === 0) {
        return JSON.stringify({ error: 'No se proporcionaron campos para actualizar' })
    }

    const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', client_id)
        .select('id, first_name, last_name, email, phone, company_name, status')
        .single()

    if (error) throw new Error(`Error actualizando cliente: ${error.message}`)
    return JSON.stringify({ success: true, client: data })
}

async function executeListAppointments(args: {
    date_from?: string
    date_to?: string
    status?: string
    client_id?: string
    limit?: number
}): Promise<string> {
    let query = supabase
        .from('appointments')
        .select('id, title, type, status, start_time, end_time, google_event_id, notes, created_at, clients(id, first_name, last_name)')
        .order('start_time', { ascending: true })
        .limit(args.limit || 10)

    if (args.date_from) {
        query = query.gte('start_time', `${args.date_from}T00:00:00`)
    } else {
        // Default: upcoming appointments from now
        query = query.gte('start_time', new Date().toISOString())
    }
    if (args.date_to) {
        query = query.lte('start_time', `${args.date_to}T23:59:59`)
    }
    if (args.status) {
        query = query.eq('status', args.status)
    }
    if (args.client_id) {
        query = query.eq('client_id', args.client_id)
    }

    const { data, error } = await query

    if (error) throw new Error(`Error listando citas: ${error.message}`)
    return JSON.stringify(data)
}

async function executeUpdateAppointment(args: {
    appointment_id: string
    start_time?: string
    end_time?: string
    status?: string
    type?: string
    title?: string
}): Promise<string> {
    const { appointment_id, ...fields } = args
    const updates: Record<string, any> = {}
    if (fields.start_time !== undefined) updates.start_time = fields.start_time
    if (fields.end_time !== undefined) updates.end_time = fields.end_time
    if (fields.status !== undefined) updates.status = fields.status
    if (fields.type !== undefined) updates.type = fields.type
    if (fields.title !== undefined) updates.title = fields.title

    if (Object.keys(updates).length === 0) {
        return JSON.stringify({ error: 'No se proporcionaron campos para actualizar' })
    }

    // Get current appointment to check for google_event_id
    const { data: current, error: fetchError } = await supabase
        .from('appointments')
        .select('google_event_id, title, type')
        .eq('id', appointment_id)
        .single()

    if (fetchError) throw new Error(`Error obteniendo cita: ${fetchError.message}`)

    // Update Google Calendar if date changed and google_event_id exists
    if (current?.google_event_id && (fields.start_time || fields.end_time || fields.title)) {
        try {
            const calUpdates: Record<string, any> = {}
            if (fields.start_time) calUpdates.start = fields.start_time
            if (fields.end_time) calUpdates.end = fields.end_time
            if (fields.title) calUpdates.summary = `${(fields.type || current.type).toUpperCase()}: ${fields.title}`
            else if (fields.type) calUpdates.summary = `${fields.type.toUpperCase()}: ${current.title}`
            await updateEvent(current.google_event_id, calUpdates)
        } catch (err) {
            console.error('[Secretary] Error actualizando evento en Google Calendar:', err)
        }
    }

    const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', appointment_id)
        .select('id, title, type, status, start_time, end_time')
        .single()

    if (error) throw new Error(`Error actualizando cita: ${error.message}`)
    return JSON.stringify({ success: true, appointment: data })
}

async function executeCancelAppointment(args: { appointment_id: string }): Promise<string> {
    // Get the appointment to find google_event_id
    const { data: appointment, error: fetchError } = await supabase
        .from('appointments')
        .select('id, google_event_id, title')
        .eq('id', args.appointment_id)
        .single()

    if (fetchError) throw new Error(`Error obteniendo cita: ${fetchError.message}`)

    // Delete Google Calendar event if exists
    if (appointment?.google_event_id) {
        try {
            await deleteEvent(appointment.google_event_id)
        } catch (err) {
            console.error('[Secretary] Error eliminando evento de Google Calendar:', err)
        }
    }

    // Update status to cancelled
    const { data, error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', args.appointment_id)
        .select('id, title, status')
        .single()

    if (error) throw new Error(`Error cancelando cita: ${error.message}`)
    return JSON.stringify({ success: true, appointment: data })
}

async function executeDeleteClient(args: { client_id: string }): Promise<string> {
    // First get client name for confirmation message
    const { data: client, error: fetchError } = await supabase
        .from('clients')
        .select('id, first_name, last_name')
        .eq('id', args.client_id)
        .single()

    if (fetchError || !client) {
        return JSON.stringify({ error: `Cliente no encontrado: ${fetchError?.message || 'No existe un cliente con ese ID'}` })
    }

    const clientName = `${client.first_name} ${client.last_name}`.trim()

    // Delete associated chat_messages
    await supabase.from('chat_messages').delete().eq('client_id', args.client_id)

    // Delete associated appointments
    await supabase.from('appointments').delete().eq('client_id', args.client_id)

    // Delete associated notes
    await supabase.from('client_notes').delete().eq('client_id', args.client_id)

    // Delete the client
    const { error: deleteError } = await supabase
        .from('clients')
        .delete()
        .eq('id', args.client_id)

    if (deleteError) throw new Error(`Error eliminando cliente: ${deleteError.message}`)

    return JSON.stringify({ success: true, message: `Cliente "${clientName}" eliminado correctamente junto con todos sus datos asociados.` })
}

function executeGetCompanyInfo(): string {
    return JSON.stringify({
        nombre: 'SendaIA',
        lema: 'Tu tiempo es oro. Nosotros ponemos el sistema.',
        descripcion: 'Agencia especializada en automatización e IA para PYMEs españolas. Diseñamos sistemas operativos con IA que eliminan tareas manuales.',
        servicios: [
            { nombre: 'Automatización de Procesos (n8n)', descripcion: 'Conectamos apps y herramientas para que los procesos fluyan solos.', setup: '500-15.000€', mensual: '59-799€/mes' },
            { nombre: 'Agentes IA Conversacionales', descripcion: 'Asistentes 24/7 por WhatsApp, Telegram o web.', setup: '600-6.000€', mensual: '79-499€/mes' },
            { nombre: 'Agentes de Voz con IA', descripcion: 'Recepcionistas telefónicas virtuales con voz natural.', setup: '1.500-6.000€', mensual: '199-599€/mes' },
            { nombre: 'Automatización Documental', descripcion: 'OCR de facturas, expedientes, documentos con IA.', setup: '800-7.000€', mensual: '99-499€/mes' },
            { nombre: 'Desarrollo Web con IA', descripcion: 'Landings, SaaS a medida con IA integrada.', setup: '500-20.000€', mensual: '0-799€/mes' },
            { nombre: 'Consultoría y Auditoría', descripcion: 'Análisis de procesos y hoja de ruta.', precio: '300-1.500€ (se descuenta del proyecto)' },
        ],
        paquetes: [
            { nombre: 'STARTER', contenido: '1-2 workflows + 1 agente', setup: '1.500-2.500€', mensual: 'desde 149€/mes' },
            { nombre: 'BUSINESS', contenido: '3-5 workflows + agente + CRM + docs', setup: '4.000-8.000€', mensual: 'desde 349€/mes' },
            { nombre: 'PRO', contenido: 'Sistema completo multi-proceso + voz + chat + WhatsApp', setup: '8.000-15.000€', mensual: 'desde 699€/mes' },
        ],
        ideal_para: 'Clínicas, despachos, inmobiliarias, peritos, franquicias, academias, e-commerce, hostelería',
        contacto: {
            email: 'info@sendaia.es',
            web: 'sendaia.es',
            demo: 'demo.sendaia.es',
            ubicacion: 'Granada, España (remoto toda España)',
        },
        proceso: 'Investigación → Diagnóstico → Propuesta → Implementación → Entrega/Formación → Mantenimiento',
        modelo_negocio: 'Setup + Retainer mensual. Sin costes ocultos. Presupuesto cerrado. La auditoría inicial es gratuita y se descuenta si contratas.',
    })
}

// ── Tool dispatcher ──

async function executeTool(name: string, argsJson: string, chatId: string): Promise<string> {
    const args = JSON.parse(argsJson)
    switch (name) {
        case 'create_lead': return executeCreateLead(args)
        case 'create_appointment': return executeCreateAppointment(args)
        case 'add_note': return executeAddNote(args, chatId)
        case 'list_leads': return executeListLeads(args)
        case 'check_calendar': return executeCheckCalendar(args)
        case 'search_clients': return executeSearchClients(args)
        case 'get_client_details': return executeGetClientDetails(args)
        case 'update_client': return executeUpdateClient(args)
        case 'list_appointments': return executeListAppointments(args)
        case 'update_appointment': return executeUpdateAppointment(args)
        case 'cancel_appointment': return executeCancelAppointment(args)
        case 'get_company_info': return executeGetCompanyInfo()
        case 'delete_client': return executeDeleteClient(args)
        default: return JSON.stringify({ error: `Herramienta desconocida: ${name}` })
    }
}

// ── Conversation memory ──

async function getConversationHistory(chatId: string, limit = 20): Promise<{ role: string; content: string }[]> {
    const { data } = await supabase
        .from('chat_messages')
        .select('role, content')
        .eq('telegram_chat_id', chatId)
        .neq('role', 'note')
        .order('created_at', { ascending: false })
        .limit(limit)

    if (!data || !data.length) return []

    return data.reverse().map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
    }))
}

async function saveMessage(chatId: string, role: string, content: string) {
    await supabase
        .from('chat_messages')
        .insert({ telegram_chat_id: chatId, role, content })
}

// ── Main agent function ──

export async function runSecretary(
    chatId: string,
    userMessage: string
): Promise<{ reply: string; action_taken: string | null }> {
    // Guardar mensaje del usuario
    await saveMessage(chatId, 'user', userMessage)

    // Cargar historial
    const history = await getConversationHistory(chatId)

    const messages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...history,
    ]

    // Llamar a la API de OpenAI (vía OpenRouter)
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) throw new Error('OPENROUTER_API_KEY no configurado')

    const baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'
    const model = process.env.SECRETARY_MODEL || 'openai/gpt-4o-mini'

    let actionTaken: string | null = null
    const MAX_TOOL_ROUNDS = 5

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
        const res = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages,
                tools: TOOLS,
                tool_choice: 'auto',
                temperature: 0.4,
                max_tokens: 1024,
            }),
        })

        if (!res.ok) {
            const errText = await res.text()
            console.error('[Secretary] LLM API error:', errText)
            throw new Error(`Error del modelo: ${res.status}`)
        }

        const data = await res.json()
        const choice = data.choices?.[0]
        if (!choice) throw new Error('Respuesta vacía del modelo')

        const assistantMessage = choice.message

        // Add assistant message to conversation
        messages.push(assistantMessage)

        // Si no hay tool calls, es la respuesta final
        if (!assistantMessage.tool_calls?.length) {
            const reply = assistantMessage.content || 'Lo siento, no pude procesar tu mensaje.'
            await saveMessage(chatId, 'assistant', reply)
            return { reply, action_taken: actionTaken }
        }

        // Ejecutar cada tool call
        for (const toolCall of assistantMessage.tool_calls) {
            const fnName = toolCall.function.name
            const fnArgs = toolCall.function.arguments

            console.log(`[Secretary] Ejecutando tool: ${fnName}`)
            let result: string
            try {
                result = await executeTool(fnName, fnArgs, chatId)
                actionTaken = fnName
            } catch (err: any) {
                console.error(`[Secretary] Error en tool ${fnName}:`, err)
                result = JSON.stringify({ error: err.message })
            }

            messages.push({
                role: 'tool' as const,
                tool_call_id: toolCall.id,
                content: result,
            } as any)
        }
    }

    // Si llegamos aqui, se agotaron las rondas
    const fallback = 'Disculpa, la operación requiere demasiados pasos. Intenta simplificar tu solicitud.'
    await saveMessage(chatId, 'assistant', fallback)
    return { reply: fallback, action_taken: actionTaken }
}
