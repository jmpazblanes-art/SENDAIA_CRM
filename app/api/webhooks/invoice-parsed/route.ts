
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { invoice_number, date, total, items, client_name, pdf_url } = body

        // Logic to find client or create? For now assume client_id passed or resolved by n8n.
        // Let's assume n8n passes resolved client_id if possible, or we insert without it.

        const { error } = await supabase
            .from('invoices')
            .insert({
                invoice_number,
                invoice_date: date,
                due_date: date, // Default
                subtotal: total, // Simplified
                total: total,
                items,
                pdf_url,
                status: 'draft',
                notes: `Extracted for ${client_name}`
            })

        if (error) throw error

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
