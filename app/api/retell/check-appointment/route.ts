import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function verifyAuth(request: Request): boolean {
    const secret = process.env.RETELL_WEBHOOK_SECRET
    if (!secret) return true // Skip auth if not configured
    const header = request.headers.get("x-retell-secret")
    return header === secret
}

export async function POST(request: Request) {
    try {
        if (!verifyAuth(request)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { name, phone, date } = body

        if (!name && !phone) {
            return NextResponse.json(
                { error: "Se requiere al menos 'name' o 'phone' para buscar citas" },
                { status: 400 }
            )
        }

        // Step 1: Find matching clients
        const clientIds: string[] = []

        if (phone) {
            const cleanPhone = phone.replace(/\D/g, "")
            const { data: phoneClients } = await supabase
                .from("clients")
                .select("id")
                .ilike("phone", `%${cleanPhone}%`)

            if (phoneClients?.length) {
                clientIds.push(...phoneClients.map((c: any) => c.id))
            }
        }

        if (name) {
            const q = `%${name}%`
            const { data: nameClients } = await supabase
                .from("clients")
                .select("id")
                .or(`first_name.ilike.${q},last_name.ilike.${q}`)

            if (nameClients?.length) {
                for (const c of nameClients) {
                    if (!clientIds.includes(c.id)) clientIds.push(c.id)
                }
            }
        }

        if (clientIds.length === 0) {
            return NextResponse.json({
                success: true,
                found: false,
                message: "No se encontraron clientes con esos datos",
                appointments: [],
            })
        }

        // Step 2: Find appointments for those clients
        let query = supabase
            .from("appointments")
            .select("id, title, type, start_time, end_time, status, notes, clients(id, first_name, last_name, phone)")
            .in("client_id", clientIds)
            .neq("status", "cancelled")
            .order("start_time", { ascending: true })
            .limit(10)

        if (date) {
            // Filter by date (Europe/Madrid timezone aware)
            query = query
                .gte("start_time", `${date}T00:00:00+01:00`)
                .lte("start_time", `${date}T23:59:59+01:00`)
        }

        const { data: appointments, error } = await query

        if (error) {
            console.error("[Retell check-appointment] Error:", error)
            return NextResponse.json({ error: `Error buscando citas: ${error.message}` }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            found: (appointments?.length ?? 0) > 0,
            count: appointments?.length ?? 0,
            appointments: appointments?.map((a: any) => ({
                appointment_id: a.id,
                title: a.title,
                type: a.type,
                date: a.start_time,
                end_time: a.end_time,
                status: a.status,
                notes: a.notes,
                client_name: a.clients
                    ? `${a.clients.first_name} ${a.clients.last_name}`
                    : "Desconocido",
                client_phone: a.clients?.phone || null,
            })) ?? [],
        })
    } catch (error: any) {
        console.error("[Retell check-appointment] Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
