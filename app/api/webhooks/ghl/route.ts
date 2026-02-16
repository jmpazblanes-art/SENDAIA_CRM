
import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const supabase = await createClient()

        // GHL usually sends a flattened object or a contact object
        // Adjusting to common GHL/Zapier/Webhook patterns
        const payload = {
            first_name: body.first_name || body.firstName || "Nuevo",
            last_name: body.last_name || body.lastName || "Lead GHL",
            email: body.email,
            phone: body.phone,
            company_name: body.company_name || body.companyName || body.company || "Empresa no especificada",
            source: "other",
            status: "lead",
            industry: body.industry || null,
            opportunity_score: body.opportunity_score || 50
        }

        const { data, error } = await supabase
            .from('clients')
            .insert(payload)
            .select()
            .single()

        if (error) {
            console.error("GHL Webhook Error:", error)
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({
            success: true,
            message: "Lead ingressado correctamente desde GHL",
            client: data
        })

    } catch (error: any) {
        console.error("Webhook Internal Error:", error)
        return NextResponse.json({ error: "Invalid payload" }, { status: 500 })
    }
}
