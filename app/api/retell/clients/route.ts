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

async function handleGet(params: { client_id: string }) {
    if (!params.client_id) {
        return NextResponse.json({ error: "Se requiere 'client_id'" }, { status: 400 })
    }

    const { data: client, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", params.client_id)
        .single()

    if (error || !client) {
        return NextResponse.json(
            { error: "Cliente no encontrado", details: error?.message },
            { status: 404 }
        )
    }

    // Also fetch recent appointments
    const { data: appointments } = await supabase
        .from("appointments")
        .select("id, title, type, status, start_time, end_time, notes")
        .eq("client_id", params.client_id)
        .order("start_time", { ascending: false })
        .limit(10)

    return NextResponse.json({
        success: true,
        client,
        appointments: appointments || [],
    })
}

async function handleCreate(params: {
    name: string
    phone?: string
    email?: string
    company?: string
}) {
    if (!params.name) {
        return NextResponse.json({ error: "Se requiere 'name'" }, { status: 400 })
    }

    const nameParts = params.name.trim().split(" ")
    const first_name = nameParts[0] || "Lead"
    const last_name = nameParts.slice(1).join(" ") || ""

    const { data, error } = await supabase
        .from("clients")
        .insert({
            first_name,
            last_name,
            phone: params.phone || null,
            email: params.email || null,
            company_name: params.company || null,
            source: "phone",
            status: "lead",
        })
        .select("id, first_name, last_name, phone, email, company_name, status")
        .single()

    if (error) {
        return NextResponse.json(
            { error: `Error creando cliente: ${error.message}` },
            { status: 500 }
        )
    }

    return NextResponse.json({
        success: true,
        message: "Cliente creado correctamente",
        client: data,
    })
}

async function handleUpdate(params: { client_id: string; [key: string]: any }) {
    if (!params.client_id) {
        return NextResponse.json({ error: "Se requiere 'client_id'" }, { status: 400 })
    }

    const { client_id, action, ...fields } = params
    const updates: Record<string, any> = {}

    // Map incoming fields to DB columns
    if (fields.name) {
        const nameParts = fields.name.trim().split(" ")
        updates.first_name = nameParts[0]
        updates.last_name = nameParts.slice(1).join(" ")
    }
    if (fields.first_name !== undefined) updates.first_name = fields.first_name
    if (fields.last_name !== undefined) updates.last_name = fields.last_name
    if (fields.phone !== undefined) updates.phone = fields.phone
    if (fields.email !== undefined) updates.email = fields.email
    if (fields.company !== undefined) updates.company_name = fields.company
    if (fields.company_name !== undefined) updates.company_name = fields.company_name
    if (fields.status !== undefined) updates.status = fields.status

    if (Object.keys(updates).length === 0) {
        return NextResponse.json(
            { error: "No se proporcionaron campos para actualizar" },
            { status: 400 }
        )
    }

    const { data, error } = await supabase
        .from("clients")
        .update(updates)
        .eq("id", client_id)
        .select("id, first_name, last_name, phone, email, company_name, status")
        .single()

    if (error) {
        return NextResponse.json(
            { error: `Error actualizando cliente: ${error.message}` },
            { status: 500 }
        )
    }

    return NextResponse.json({
        success: true,
        message: "Cliente actualizado correctamente",
        client: data,
    })
}

async function handleDelete(params: { client_id: string }) {
    if (!params.client_id) {
        return NextResponse.json({ error: "Se requiere 'client_id'" }, { status: 400 })
    }

    // First check the client exists and get its name
    const { data: client, error: fetchError } = await supabase
        .from("clients")
        .select("id, first_name, last_name")
        .eq("id", params.client_id)
        .single()

    if (fetchError || !client) {
        return NextResponse.json(
            { error: "Cliente no encontrado", details: fetchError?.message },
            { status: 404 }
        )
    }

    const clientName = `${client.first_name} ${client.last_name}`.trim()

    // Delete associated chat_messages
    await supabase.from("chat_messages").delete().eq("client_id", params.client_id)

    // Delete associated appointments
    await supabase.from("appointments").delete().eq("client_id", params.client_id)

    // Delete associated notes
    await supabase.from("client_notes").delete().eq("client_id", params.client_id)

    // Delete the client
    const { error: deleteError } = await supabase
        .from("clients")
        .delete()
        .eq("id", params.client_id)

    if (deleteError) {
        return NextResponse.json(
            { error: `Error eliminando cliente: ${deleteError.message}` },
            { status: 500 }
        )
    }

    return NextResponse.json({
        success: true,
        message: `Cliente "${clientName}" eliminado correctamente junto con sus datos asociados.`,
    })
}

async function handleSearch(params: { query: string }) {
    if (!params.query) {
        return NextResponse.json({ error: "Se requiere 'query'" }, { status: 400 })
    }

    const q = `%${params.query}%`
    const { data, error } = await supabase
        .from("clients")
        .select("id, first_name, last_name, email, phone, company_name, status, source, created_at")
        .or(`first_name.ilike.${q},last_name.ilike.${q},email.ilike.${q},phone.ilike.${q},company_name.ilike.${q}`)
        .limit(10)

    if (error) {
        return NextResponse.json(
            { error: `Error buscando clientes: ${error.message}` },
            { status: 500 }
        )
    }

    return NextResponse.json({
        success: true,
        count: data?.length ?? 0,
        clients: data ?? [],
    })
}

export async function POST(request: Request) {
    try {
        if (!verifyAuth(request)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { action, ...params } = body

        if (!action) {
            return NextResponse.json(
                { error: "Se requiere 'action': 'get' | 'create' | 'update' | 'search'" },
                { status: 400 }
            )
        }

        switch (action) {
            case "get":
                return handleGet(params as { client_id: string })
            case "create":
                return handleCreate(params as { name: string; phone?: string; email?: string; company?: string })
            case "update":
                return handleUpdate({ ...params, action } as any)
            case "search":
                return handleSearch(params as { query: string })
            case "delete":
                return handleDelete(params as { client_id: string })
            default:
                return NextResponse.json(
                    { error: `Accion desconocida: '${action}'. Usa 'get', 'create', 'update', 'search' o 'delete'` },
                    { status: 400 }
                )
        }
    } catch (error: any) {
        console.error("[Retell clients] Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
