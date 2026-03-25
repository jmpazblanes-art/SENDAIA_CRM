import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { listEvents } from "@/lib/google-calendar"

// Force dynamic — no caching for this API route
export const dynamic = "force-dynamic"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TIMEZONE = "Europe/Madrid"

// ── Auth ──

function verifyAuth(request: Request): boolean {
  const token = process.env.MCP_AUTH_TOKEN
  if (!token) return true // skip auth if not configured
  const header = request.headers.get("authorization")
  if (!header) return false
  const bearer = header.replace(/^Bearer\s+/i, "")
  return bearer === token
}

// ── JSON-RPC helpers ──

interface JsonRpcRequest {
  jsonrpc: string
  method: string
  params?: Record<string, any>
  id?: number | string | null
}

function jsonrpcSuccess(id: number | string | null | undefined, result: any) {
  return NextResponse.json({ jsonrpc: "2.0", result, id: id ?? null })
}

function jsonrpcError(id: number | string | null | undefined, code: number, message: string) {
  return NextResponse.json({ jsonrpc: "2.0", error: { code, message }, id: id ?? null })
}

function toolResult(data: any) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }
}

function toolError(message: string) {
  return { content: [{ type: "text", text: JSON.stringify({ error: message }, null, 2) }], isError: true }
}

// ── Tool definitions ──

const TOOLS = [
  {
    name: "crm_list_clients",
    description: "List CRM clients with optional filters by status, source, or search term.",
    inputSchema: {
      type: "object" as const,
      properties: {
        status: { type: "string", description: "Filter by status: lead, prospect, active, inactive, churned" },
        source: { type: "string", description: "Filter by source: website, referral, phone, manual, import, linkedin, other" },
        search: { type: "string", description: "Search term to filter by name, email, or company" },
        limit: { type: "number", description: "Max results (default 20)" },
      },
    },
  },
  {
    name: "crm_get_client",
    description: "Get full details of a specific client by ID, including recent appointments and notes.",
    inputSchema: {
      type: "object" as const,
      properties: {
        client_id: { type: "string", description: "UUID of the client" },
      },
      required: ["client_id"],
    },
  },
  {
    name: "crm_create_client",
    description: "Create a new client in the CRM.",
    inputSchema: {
      type: "object" as const,
      properties: {
        name: { type: "string", description: "Full name (first + last)" },
        email: { type: "string", description: "Email address" },
        phone: { type: "string", description: "Phone number" },
        company: { type: "string", description: "Company name" },
        status: { type: "string", description: "Status: lead, prospect, active, inactive, churned. Default: lead" },
        source: { type: "string", description: "Source: website, referral, phone, manual, import, linkedin, other. Default: manual" },
        notes: { type: "string", description: "Initial notes" },
      },
      required: ["name"],
    },
  },
  {
    name: "crm_update_client",
    description: "Update fields of an existing client.",
    inputSchema: {
      type: "object" as const,
      properties: {
        client_id: { type: "string", description: "UUID of the client" },
        name: { type: "string", description: "New full name" },
        email: { type: "string", description: "New email" },
        phone: { type: "string", description: "New phone" },
        company: { type: "string", description: "New company name" },
        status: { type: "string", description: "New status" },
        source: { type: "string", description: "New source" },
      },
      required: ["client_id"],
    },
  },
  {
    name: "crm_search_clients",
    description: "Search clients by name, email, phone, or company.",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Search query" },
      },
      required: ["query"],
    },
  },
  {
    name: "crm_list_appointments",
    description: "List appointments with optional filters.",
    inputSchema: {
      type: "object" as const,
      properties: {
        date_from: { type: "string", description: "Start date (ISO format)" },
        date_to: { type: "string", description: "End date (ISO format)" },
        status: { type: "string", description: "Filter by status: scheduled, completed, cancelled, no_show" },
        client_id: { type: "string", description: "Filter by client UUID" },
        limit: { type: "number", description: "Max results (default 10)" },
      },
    },
  },
  {
    name: "crm_create_appointment",
    description: "Create a new appointment for a client.",
    inputSchema: {
      type: "object" as const,
      properties: {
        client_id: { type: "string", description: "UUID of the client" },
        title: { type: "string", description: "Appointment title" },
        type: { type: "string", description: "Type: demo, discovery_call, onboarding, follow_up, technical_review, other" },
        date: { type: "string", description: "Start date/time in ISO format (Europe/Madrid timezone assumed)" },
        duration: { type: "number", description: "Duration in minutes (default 60)" },
        notes: { type: "string", description: "Notes for the appointment" },
      },
      required: ["client_id", "title", "type", "date"],
    },
  },
  {
    name: "crm_update_appointment",
    description: "Update an existing appointment.",
    inputSchema: {
      type: "object" as const,
      properties: {
        appointment_id: { type: "string", description: "UUID of the appointment" },
        date: { type: "string", description: "New date/time (ISO)" },
        status: { type: "string", description: "New status: scheduled, completed, cancelled, no_show" },
        type: { type: "string", description: "New type" },
        notes: { type: "string", description: "New notes" },
      },
      required: ["appointment_id"],
    },
  },
  {
    name: "crm_cancel_appointment",
    description: "Cancel an appointment by ID.",
    inputSchema: {
      type: "object" as const,
      properties: {
        appointment_id: { type: "string", description: "UUID of the appointment" },
      },
      required: ["appointment_id"],
    },
  },
  {
    name: "crm_add_note",
    description: "Add a note to a client.",
    inputSchema: {
      type: "object" as const,
      properties: {
        client_id: { type: "string", description: "UUID of the client" },
        content: { type: "string", description: "Note content" },
      },
      required: ["client_id", "content"],
    },
  },
  {
    name: "crm_get_client_notes",
    description: "Get notes for a specific client.",
    inputSchema: {
      type: "object" as const,
      properties: {
        client_id: { type: "string", description: "UUID of the client" },
        limit: { type: "number", description: "Max results (default 20)" },
      },
      required: ["client_id"],
    },
  },
  {
    name: "crm_dashboard_stats",
    description: "Get CRM dashboard statistics: client counts by status, recent appointments, pipeline summary.",
    inputSchema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "crm_check_calendar",
    description: "Check Google Calendar availability for a given date range.",
    inputSchema: {
      type: "object" as const,
      properties: {
        date: { type: "string", description: "Date to check (YYYY-MM-DD). Defaults to today." },
        days: { type: "number", description: "Number of days to check (default 1)" },
      },
    },
  },
]

// ── Tool handlers ──

async function handleToolCall(name: string, args: Record<string, any>): Promise<any> {
  switch (name) {
    // ── Clients ──

    case "crm_list_clients": {
      const limit = args.limit ?? 20
      let query = supabase
        .from("clients")
        .select("id, first_name, last_name, email, phone, company_name, status, source, created_at")
        .order("created_at", { ascending: false })
        .limit(limit)

      if (args.status) query = query.eq("status", args.status)
      if (args.source) query = query.eq("source", args.source)
      if (args.search) {
        const q = `%${args.search}%`
        query = query.or(`first_name.ilike.${q},last_name.ilike.${q},email.ilike.${q},company_name.ilike.${q}`)
      }

      const { data, error } = await query
      if (error) return toolError(`Error listing clients: ${error.message}`)
      return toolResult({ count: data?.length ?? 0, clients: data ?? [] })
    }

    case "crm_get_client": {
      const { data: client, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", args.client_id)
        .single()

      if (error || !client) return toolError(`Client not found: ${error?.message}`)

      const { data: appointments } = await supabase
        .from("appointments")
        .select("id, title, type, status, start_time, end_time, notes")
        .eq("client_id", args.client_id)
        .order("start_time", { ascending: false })
        .limit(10)

      const { data: notes } = await supabase
        .from("client_notes")
        .select("id, content, created_at")
        .eq("client_id", args.client_id)
        .order("created_at", { ascending: false })
        .limit(5)

      return toolResult({ client, appointments: appointments ?? [], notes: notes ?? [] })
    }

    case "crm_create_client": {
      const nameParts = (args.name as string).trim().split(" ")
      const first_name = nameParts[0] || "Lead"
      const last_name = nameParts.slice(1).join(" ") || ""

      const { data, error } = await supabase
        .from("clients")
        .insert({
          first_name,
          last_name,
          email: args.email || null,
          phone: args.phone || null,
          company_name: args.company || null,
          status: args.status || "lead",
          source: args.source || "manual",
        })
        .select("id, first_name, last_name, email, phone, company_name, status, source")
        .single()

      if (error) return toolError(`Error creating client: ${error.message}`)

      // If initial notes provided, add them
      if (args.notes && data) {
        await supabase.from("client_notes").insert({
          client_id: data.id,
          content: args.notes,
        })
      }

      return toolResult({ success: true, client: data })
    }

    case "crm_update_client": {
      const { client_id, ...fields } = args
      const updates: Record<string, any> = {}

      if (fields.name) {
        const nameParts = (fields.name as string).trim().split(" ")
        updates.first_name = nameParts[0]
        updates.last_name = nameParts.slice(1).join(" ")
      }
      if (fields.email !== undefined) updates.email = fields.email
      if (fields.phone !== undefined) updates.phone = fields.phone
      if (fields.company !== undefined) updates.company_name = fields.company
      if (fields.status !== undefined) updates.status = fields.status
      if (fields.source !== undefined) updates.source = fields.source

      if (Object.keys(updates).length === 0) return toolError("No fields provided to update")

      const { data, error } = await supabase
        .from("clients")
        .update(updates)
        .eq("id", client_id)
        .select("id, first_name, last_name, email, phone, company_name, status, source")
        .single()

      if (error) return toolError(`Error updating client: ${error.message}`)
      return toolResult({ success: true, client: data })
    }

    case "crm_search_clients": {
      const q = `%${args.query}%`
      const { data, error } = await supabase
        .from("clients")
        .select("id, first_name, last_name, email, phone, company_name, status, source, created_at")
        .or(`first_name.ilike.${q},last_name.ilike.${q},email.ilike.${q},phone.ilike.${q},company_name.ilike.${q}`)
        .limit(20)

      if (error) return toolError(`Error searching clients: ${error.message}`)
      return toolResult({ count: data?.length ?? 0, clients: data ?? [] })
    }

    // ── Appointments ──

    case "crm_list_appointments": {
      const limit = args.limit ?? 10
      let query = supabase
        .from("appointments")
        .select("id, client_id, title, type, status, start_time, end_time, notes, clients(first_name, last_name)")
        .order("start_time", { ascending: false })
        .limit(limit)

      if (args.date_from) query = query.gte("start_time", args.date_from)
      if (args.date_to) query = query.lte("start_time", args.date_to)
      if (args.status) query = query.eq("status", args.status)
      if (args.client_id) query = query.eq("client_id", args.client_id)

      const { data, error } = await query
      if (error) return toolError(`Error listing appointments: ${error.message}`)
      return toolResult({ count: data?.length ?? 0, appointments: data ?? [] })
    }

    case "crm_create_appointment": {
      const duration = args.duration ?? 60
      const startDate = new Date(args.date)
      const endDate = new Date(startDate.getTime() + duration * 60 * 1000)

      const { data, error } = await supabase
        .from("appointments")
        .insert({
          client_id: args.client_id,
          title: args.title,
          type: args.type,
          status: "scheduled",
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
          notes: args.notes || null,
        })
        .select("id, client_id, title, type, status, start_time, end_time, notes")
        .single()

      if (error) return toolError(`Error creating appointment: ${error.message}`)
      return toolResult({ success: true, appointment: data })
    }

    case "crm_update_appointment": {
      const { appointment_id, ...fields } = args
      const updates: Record<string, any> = {}

      if (fields.date) {
        updates.start_time = new Date(fields.date).toISOString()
        // Recalculate end_time assuming same duration — fetch current first
        const { data: current } = await supabase
          .from("appointments")
          .select("start_time, end_time")
          .eq("id", appointment_id)
          .single()
        if (current) {
          const oldDuration = new Date(current.end_time).getTime() - new Date(current.start_time).getTime()
          updates.end_time = new Date(new Date(fields.date).getTime() + oldDuration).toISOString()
        }
      }
      if (fields.status !== undefined) updates.status = fields.status
      if (fields.type !== undefined) updates.type = fields.type
      if (fields.notes !== undefined) updates.notes = fields.notes

      if (Object.keys(updates).length === 0) return toolError("No fields provided to update")

      const { data, error } = await supabase
        .from("appointments")
        .update(updates)
        .eq("id", appointment_id)
        .select("id, client_id, title, type, status, start_time, end_time, notes")
        .single()

      if (error) return toolError(`Error updating appointment: ${error.message}`)
      return toolResult({ success: true, appointment: data })
    }

    case "crm_cancel_appointment": {
      const { data, error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", args.appointment_id)
        .select("id, title, status")
        .single()

      if (error) return toolError(`Error cancelling appointment: ${error.message}`)
      return toolResult({ success: true, appointment: data })
    }

    // ── Notes ──

    case "crm_add_note": {
      const { data, error } = await supabase
        .from("client_notes")
        .insert({
          client_id: args.client_id,
          content: args.content,
        })
        .select("id, client_id, content, created_at")
        .single()

      if (error) return toolError(`Error adding note: ${error.message}`)
      return toolResult({ success: true, note: data })
    }

    case "crm_get_client_notes": {
      const limit = args.limit ?? 20
      const { data, error } = await supabase
        .from("client_notes")
        .select("id, content, created_at")
        .eq("client_id", args.client_id)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) return toolError(`Error fetching notes: ${error.message}`)
      return toolResult({ count: data?.length ?? 0, notes: data ?? [] })
    }

    // ── Dashboard ──

    case "crm_dashboard_stats": {
      const [clientsRes, appointmentsRes, recentRes] = await Promise.all([
        supabase.from("clients").select("status"),
        supabase
          .from("appointments")
          .select("status")
          .gte("start_time", new Date().toISOString()),
        supabase
          .from("appointments")
          .select("id, title, type, status, start_time, clients(first_name, last_name)")
          .gte("start_time", new Date().toISOString())
          .order("start_time", { ascending: true })
          .limit(5),
      ])

      const clients = clientsRes.data ?? []
      const clientsByStatus: Record<string, number> = {}
      for (const c of clients) {
        clientsByStatus[c.status] = (clientsByStatus[c.status] || 0) + 1
      }

      const upcoming = appointmentsRes.data ?? []
      const appointmentsByStatus: Record<string, number> = {}
      for (const a of upcoming) {
        appointmentsByStatus[a.status] = (appointmentsByStatus[a.status] || 0) + 1
      }

      return toolResult({
        total_clients: clients.length,
        clients_by_status: clientsByStatus,
        upcoming_appointments: upcoming.length,
        appointments_by_status: appointmentsByStatus,
        next_appointments: recentRes.data ?? [],
      })
    }

    // ── Calendar ──

    case "crm_check_calendar": {
      const days = args.days ?? 1
      const baseDate = args.date ? new Date(args.date + "T00:00:00") : new Date()

      // Set to start of day in Madrid timezone
      const timeMin = new Date(baseDate)
      timeMin.setHours(0, 0, 0, 0)

      const timeMax = new Date(timeMin)
      timeMax.setDate(timeMax.getDate() + days)

      try {
        const events = await listEvents(timeMin.toISOString(), timeMax.toISOString())
        return toolResult({
          date_range: { from: timeMin.toISOString(), to: timeMax.toISOString() },
          timezone: TIMEZONE,
          event_count: events.length,
          events: events.map((e) => ({
            id: e.id,
            summary: e.summary,
            start: e.start?.dateTime || e.start,
            end: e.end?.dateTime || e.end,
            description: e.description,
          })),
        })
      } catch (err: any) {
        return toolError(`Calendar error: ${err.message}`)
      }
    }

    default:
      return toolError(`Unknown tool: ${name}`)
  }
}

// ── Route handler ──

export async function POST(request: Request) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json(
        { jsonrpc: "2.0", error: { code: -32001, message: "Unauthorized" }, id: null },
        { status: 401 }
      )
    }

    const body: JsonRpcRequest = await request.json()

    if (body.jsonrpc !== "2.0" || !body.method) {
      return jsonrpcError(body.id, -32600, "Invalid JSON-RPC 2.0 request")
    }

    switch (body.method) {
      case "initialize":
        return jsonrpcSuccess(body.id, {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: "sendaia-crm", version: "1.0.0" },
        })

      case "notifications/initialized":
        // Client acknowledgment — no response needed but return success
        return jsonrpcSuccess(body.id, {})

      case "tools/list":
        return jsonrpcSuccess(body.id, { tools: TOOLS })

      case "tools/call": {
        const toolName = body.params?.name
        const toolArgs = body.params?.arguments ?? {}

        if (!toolName) {
          return jsonrpcError(body.id, -32602, "Missing tool name in params.name")
        }

        const found = TOOLS.find((t) => t.name === toolName)
        if (!found) {
          return jsonrpcError(body.id, -32602, `Unknown tool: ${toolName}`)
        }

        const result = await handleToolCall(toolName, toolArgs)
        return jsonrpcSuccess(body.id, result)
      }

      default:
        return jsonrpcError(body.id, -32601, `Method not found: ${body.method}`)
    }
  } catch (error: any) {
    console.error("[MCP] Error:", error)
    return NextResponse.json(
      { jsonrpc: "2.0", error: { code: -32603, message: error.message || "Internal error" }, id: null },
      { status: 500 }
    )
  }
}

// Handle GET for health check / discovery
export async function GET() {
  return NextResponse.json({
    name: "sendaia-crm",
    version: "1.0.0",
    protocol: "MCP",
    protocolVersion: "2024-11-05",
    description: "Sendaia CRM MCP Server — manage clients, appointments, notes, and calendar",
    tools: TOOLS.length,
  })
}
