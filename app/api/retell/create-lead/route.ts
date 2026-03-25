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

export async function POST(request: Request) {
    try {
        if (!verifyAuth(request)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { name, phone, email, company, notes } = body

        if (!name) {
            return NextResponse.json(
                { error: "Se requiere 'name'" },
                { status: 400 }
            )
        }

        const nameParts = name.trim().split(" ")
        const first_name = nameParts[0] || "Lead"
        const last_name = nameParts.slice(1).join(" ") || ""

        // Check if client already exists by phone
        if (phone) {
            const cleanPhone = phone.replace(/\D/g, "")
            const { data: existing } = await supabase
                .from("clients")
                .select("id, first_name, last_name, phone")
                .ilike("phone", `%${cleanPhone}%`)
                .maybeSingle()

            if (existing) {
                return NextResponse.json({
                    success: true,
                    message: "Cliente ya existente con ese telefono",
                    created: false,
                    client: existing,
                })
            }
        }

        // Create the client
        const { data: client, error: clientError } = await supabase
            .from("clients")
            .insert({
                first_name,
                last_name,
                phone: phone || null,
                email: email || null,
                company_name: company || null,
                source: "phone",
                status: "lead",
            })
            .select("id, first_name, last_name, phone, email, company_name, status")
            .single()

        if (clientError) {
            return NextResponse.json(
                { error: `Error creando lead: ${clientError.message}` },
                { status: 500 }
            )
        }

        // If notes provided, create a chat_message entry
        if (notes && client) {
            const { error: noteError } = await supabase
                .from("chat_messages")
                .insert({
                    client_id: client.id,
                    content: notes,
                    role: "note",
                })

            if (noteError) {
                console.error("[Retell create-lead] Error guardando nota:", noteError)
                // Non-critical, don't fail the whole request
            }
        }

        return NextResponse.json({
            success: true,
            message: "Lead creado correctamente",
            created: true,
            client,
        })
    } catch (error: any) {
        console.error("[Retell create-lead] Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
