import { createClient } from "@/utils/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { getResend, FROM_EMAIL, FROM_NAME } from "@/lib/resend"
import WelcomeEmail from "@/emails/welcome"

const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

        // Auto-send welcome email if the lead has an email
        if (payload.email) {
            try {
                const { data: logData } = await supabaseAdmin
                    .from('email_logs')
                    .insert({
                        client_id: data.id,
                        to_email: payload.email,
                        to_name: `${first_name} ${last_name}`.trim(),
                        subject: 'Bienvenido a SendaIA',
                        type: 'welcome',
                        status: 'pending',
                    })
                    .select('id')
                    .single()

                const logId = logData?.id

                const { data: emailResult, error: emailError } = await getResend().emails.send({
                    from: `${FROM_NAME} <${FROM_EMAIL}>`,
                    to: payload.email,
                    subject: 'Bienvenido a SendaIA',
                    react: WelcomeEmail({ name: first_name, company: payload.company_name || undefined }),
                })

                if (logId) {
                    if (emailError) {
                        await supabaseAdmin.from('email_logs').update({
                            status: 'failed',
                            error_message: emailError.message,
                        }).eq('id', logId)
                    } else {
                        await supabaseAdmin.from('email_logs').update({
                            status: 'sent',
                            resend_id: emailResult?.id,
                            sent_at: new Date().toISOString(),
                        }).eq('id', logId)
                    }
                }

                console.log('[Webform] Welcome email sent to:', payload.email)
            } catch (emailErr) {
                console.error('[Webform] Error sending welcome email:', emailErr)
                // Don't block the webhook response
            }
        }

        return NextResponse.json({ success: true, id: data.id })

    } catch (err: any) {
        return NextResponse.json({ error: 'Invalid payload' }, { status: 500 })
    }
}
