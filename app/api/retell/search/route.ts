import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function verifyAuth(request: Request): boolean {
    const secret = process.env.RETELL_WEBHOOK_SECRET
    if (!secret) return true
    const header = request.headers.get("x-retell-secret")
    return header === secret
}

async function searchClients(query: string) {
    const q = `%${query}%`
    const { data, error } = await supabase
        .from("clients")
        .select("id, first_name, last_name, email, phone, company_name, status, source")
        .or(`first_name.ilike.${q},last_name.ilike.${q},email.ilike.${q},phone.ilike.${q},company_name.ilike.${q}`)
        .limit(10)

    if (error) throw new Error(`Error buscando clientes: ${error.message}`)
    return data ?? []
}

async function searchAppointments(query: string) {
    const q = `%${query}%`

    // Search by title or by client name via join
    const { data, error } = await supabase
        .from("appointments")
        .select("id, title, type, status, start_time, end_time, notes, clients(id, first_name, last_name, phone)")
        .or(`title.ilike.${q},notes.ilike.${q}`)
        .neq("status", "cancelled")
        .order("start_time", { ascending: false })
        .limit(10)

    if (error) throw new Error(`Error buscando citas: ${error.message}`)

    // Also search appointments by client name match
    const clientResults = await searchClients(query)
    const clientIds = clientResults.map(c => c.id)

    let clientAppointments: any[] = []
    if (clientIds.length > 0) {
        const { data: byClient } = await supabase
            .from("appointments")
            .select("id, title, type, status, start_time, end_time, notes, clients(id, first_name, last_name, phone)")
            .in("client_id", clientIds)
            .neq("status", "cancelled")
            .order("start_time", { ascending: false })
            .limit(10)

        clientAppointments = byClient ?? []
    }

    // Merge and deduplicate
    const allAppointments = [...(data ?? [])]
    for (const appt of clientAppointments) {
        if (!allAppointments.find((a: any) => a.id === appt.id)) {
            allAppointments.push(appt)
        }
    }

    return allAppointments.map((a: any) => ({
        appointment_id: a.id,
        title: a.title,
        type: a.type,
        status: a.status,
        date: a.start_time,
        end_time: a.end_time,
        notes: a.notes,
        client_name: a.clients
            ? `${a.clients.first_name} ${a.clients.last_name}`
            : "Desconocido",
        client_phone: a.clients?.phone || null,
    }))
}

export async function POST(request: Request) {
    try {
        if (!verifyAuth(request)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { query, type } = body

        if (!query) {
            return NextResponse.json(
                { error: "Se requiere 'query'" },
                { status: 400 }
            )
        }

        const searchType = type || "all"
        const results: Record<string, any> = { success: true, query }

        if (searchType === "clients" || searchType === "all") {
            results.clients = await searchClients(query)
            results.clients_count = results.clients.length
        }

        if (searchType === "appointments" || searchType === "all") {
            results.appointments = await searchAppointments(query)
            results.appointments_count = results.appointments.length
        }

        return NextResponse.json(results)
    } catch (error: any) {
        console.error("[Retell search] Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
