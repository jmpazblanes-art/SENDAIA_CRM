import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getResend, FROM_EMAIL, FROM_NAME } from '@/lib/resend'
import AppointmentReminderEmail from '@/emails/appointment-reminder'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
    try {
        // Auth check: CRON_SECRET must match
        const authHeader = req.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Calculate tomorrow's date range in Europe/Madrid timezone
        const now = new Date()
        // Get tomorrow in Madrid timezone
        const madridFormatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Europe/Madrid',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        })
        // Add 1 day to current Madrid date
        const tomorrowDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
        const tomorrowStr = madridFormatter.format(tomorrowDate) // YYYY-MM-DD

        const tomorrowStart = `${tomorrowStr}T00:00:00`
        const tomorrowEnd = `${tomorrowStr}T23:59:59`

        // Query appointments for tomorrow that are scheduled
        const { data: appointments, error: queryError } = await supabase
            .from('appointments')
            .select('id, title, type, start_time, end_time, client_id, clients(id, first_name, last_name, email)')
            .gte('start_time', tomorrowStart)
            .lte('start_time', tomorrowEnd)
            .eq('status', 'scheduled')

        if (queryError) {
            console.error('[Cron Reminders] Query error:', queryError)
            return NextResponse.json({ error: queryError.message }, { status: 500 })
        }

        if (!appointments || appointments.length === 0) {
            return NextResponse.json({ success: true, message: 'No appointments for tomorrow', sent: 0 })
        }

        const typeLabels: Record<string, string> = {
            demo: 'Demo',
            discovery_call: 'Llamada de Descubrimiento',
            onboarding: 'Onboarding',
            follow_up: 'Seguimiento',
            technical_review: 'Revisión Técnica',
            other: 'Otra',
        }

        let sent = 0
        let failed = 0
        const results: Array<{ appointment_id: string; email: string; status: string }> = []

        for (const appt of appointments) {
            const client = appt.clients as any
            if (!client?.email) {
                results.push({ appointment_id: appt.id, email: 'N/A', status: 'skipped_no_email' })
                continue
            }

            try {
                const startDate = new Date(appt.start_time)
                const dateStr = startDate.toLocaleDateString('es-ES', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Europe/Madrid',
                })
                const timeStr = startDate.toLocaleTimeString('es-ES', {
                    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid',
                })

                // Create email log
                const { data: logData } = await supabase
                    .from('email_logs')
                    .insert({
                        client_id: client.id,
                        to_email: client.email,
                        to_name: client.first_name,
                        subject: 'Recordatorio: Tienes una cita mañana con SendaIA',
                        type: 'appointment_reminder',
                        status: 'pending',
                    })
                    .select('id')
                    .single()

                const logId = logData?.id

                const { data: emailResult, error: emailError } = await getResend().emails.send({
                    from: `${FROM_NAME} <${FROM_EMAIL}>`,
                    to: client.email,
                    subject: 'Recordatorio: Tienes una cita mañana con SendaIA',
                    react: AppointmentReminderEmail({
                        name: client.first_name,
                        date: dateStr,
                        time: timeStr,
                        type: typeLabels[appt.type] || appt.type,
                    }),
                })

                if (logId) {
                    if (emailError) {
                        await supabase.from('email_logs').update({
                            status: 'failed',
                            error_message: emailError.message,
                        }).eq('id', logId)
                        failed++
                        results.push({ appointment_id: appt.id, email: client.email, status: 'failed' })
                    } else {
                        await supabase.from('email_logs').update({
                            status: 'sent',
                            resend_id: emailResult?.id,
                            sent_at: new Date().toISOString(),
                        }).eq('id', logId)
                        sent++
                        results.push({ appointment_id: appt.id, email: client.email, status: 'sent' })
                    }
                }
            } catch (err: any) {
                console.error(`[Cron Reminders] Error sending to ${client.email}:`, err)
                failed++
                results.push({ appointment_id: appt.id, email: client.email, status: 'error' })
            }
        }

        console.log(`[Cron Reminders] Completed: ${sent} sent, ${failed} failed, ${appointments.length} total`)

        return NextResponse.json({
            success: true,
            date: tomorrowStr,
            total_appointments: appointments.length,
            sent,
            failed,
            results,
        })

    } catch (error: any) {
        console.error('[Cron Reminders] Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
