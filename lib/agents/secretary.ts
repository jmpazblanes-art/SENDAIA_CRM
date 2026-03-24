import { createClient } from "@supabase/supabase-js"
import { listEvents, createEvent } from "@/lib/google-calendar"

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

Reglas:
- Si te faltan datos obligatorios para una acción, pregunta al usuario antes de ejecutar.
- Para citas necesitas: nombre del cliente, tipo (demo/discovery_call/onboarding/follow_up/technical_review/other), fecha y hora de inicio y fin.
- Las fechas siempre en zona horaria Europe/Madrid.
- Sé concisa en tus respuestas. Usa formato Markdown ligero para Telegram.
- Si no entiendes el mensaje o no es una instrucción clara, responde de forma amable preguntando qué necesita.
- Nunca inventes datos que el usuario no te haya dado.`

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

// ── Tool dispatcher ──

async function executeTool(name: string, argsJson: string, chatId: string): Promise<string> {
    const args = JSON.parse(argsJson)
    switch (name) {
        case 'create_lead': return executeCreateLead(args)
        case 'create_appointment': return executeCreateAppointment(args)
        case 'add_note': return executeAddNote(args, chatId)
        case 'list_leads': return executeListLeads(args)
        case 'check_calendar': return executeCheckCalendar(args)
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
