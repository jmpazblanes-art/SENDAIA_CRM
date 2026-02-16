import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const body = await request.json()

        const first_name = (body.first_name || body.name || '').split(' ')[0] || 'Contacto'
        const last_name = (body.last_name || body.name || '').split(' ').slice(1).join(' ') || 'Web'

        const payload = {
            first_name,
            last_name,
            email: body.email || null,
            phone: body.phone || body.telefono || null,
            company_name: body.company || body.empresa || body.company_name || null,
            source: 'web' as const,
            status: 'lead' as const,
            notes: body.message || body.mensaje || body.notes || null,
            priority: 'medium' as const,
        }

        const supabase = await createClient()
        const { data, error } = await supabase.from('clients').insert(payload).select().single()

        if (error) {
            console.error('Webform Error:', error)
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        // Telegram notification via n8n
        await fetch('https://demo-demo-n8n.ixbbes.easypanel.host/webhook/crm-lead-notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        }).catch(() => {})

        return NextResponse.json({ success: true, id: data.id })

    } catch (err: any) {
        return NextResponse.json({ error: 'Invalid payload' }, { status: 500 })
    }
}
