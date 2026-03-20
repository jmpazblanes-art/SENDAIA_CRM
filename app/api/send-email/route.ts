import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resend, FROM_EMAIL, FROM_NAME } from '@/lib/resend'
import InvoiceEmail from '@/emails/invoice'
import FollowUpEmail from '@/emails/follow-up'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { type, to_email, to_name, subject, client_id, invoice_id, templateData } = body

        if (!to_email || !subject) {
            return NextResponse.json({ error: 'to_email y subject son obligatorios' }, { status: 400 })
        }

        // Crear log inicial en estado pending
        const { data: logData } = await supabase
            .from('email_logs')
            .insert({
                client_id: client_id || null,
                invoice_id: invoice_id || null,
                to_email,
                to_name: to_name || null,
                subject,
                type: type || 'manual',
                status: 'pending',
            })
            .select('id')
            .single()

        const logId = logData?.id

        // Construir el contenido según el tipo
        let emailPayload: any = {
            from: `${FROM_NAME} <${FROM_EMAIL}>`,
            to: to_email,
            subject,
        }

        if (type === 'invoice' && templateData) {
            emailPayload.react = InvoiceEmail(templateData)
        } else if (type === 'follow_up' && templateData) {
            emailPayload.react = FollowUpEmail(templateData)
        } else {
            // Email manual con HTML básico
            emailPayload.html = templateData?.html || `<p>${templateData?.message || subject}</p>`
        }

        // Enviar con idempotency key para evitar duplicados
        const { data, error } = await resend.emails.send(emailPayload, {
            headers: logId ? { 'Idempotency-Key': `crm-email-${logId}` } : undefined,
        })

        if (error) {
            // Actualizar log a failed
            if (logId) {
                await supabase
                    .from('email_logs')
                    .update({ status: 'failed', error_message: error.message })
                    .eq('id', logId)
            }
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        // Actualizar log a sent
        if (logId) {
            await supabase
                .from('email_logs')
                .update({
                    status: 'sent',
                    resend_id: data?.id,
                    sent_at: new Date().toISOString(),
                })
                .eq('id', logId)
        }

        return NextResponse.json({ success: true, id: data?.id })

    } catch (error: any) {
        console.error('[send-email] Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
