import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
    let runId: string | null = null
    try {
        const body = await request.json()
        console.log("Google Calendar Webhook Received:", body)

        const { data: runData } = await supabase
            .from('automation_runs')
            .insert({
                name: 'Sincronización Google Calendar',
                status: 'running',
                category: 'integration',
                metadata: { trigger: body.summary || 'google_calendar' }
            })
            .select('id')
            .single()
        runId = runData?.id

        const {
            summary,
            description,
            start_time,
            end_time,
            location,
            attendees,
            status,
            htmlLink,
            iCalUID
        } = body

        let clientEmail: string | null = null
        let clientName: string | null = null

        if (attendees && attendees.length > 0) {
            const client = attendees.find((a: any) => !a.organizer && !a.self)
            if (client) {
                clientEmail = client.email
                clientName = client.displayName || client.email.split('@')[0]
            }
        }

        let finalClientId: string | null = null

        if (clientEmail) {
            const { data: clientData } = await supabase
                .from('clients')
                .select('id')
                .eq('email', clientEmail)
                .maybeSingle()

            if (clientData) {
                finalClientId = clientData.id
            } else if (clientName) {
                const { data: newClient } = await supabase
                    .from('clients')
                    .insert({
                        first_name: clientName.split(' ')[0],
                        last_name: clientName.split(' ').slice(1).join(' ') || 'Lead',
                        email: clientEmail,
                        source: 'other',
                        status: 'lead'
                    })
                    .select('id')
                    .single()

                if (newClient) finalClientId = newClient.id
            }
        }

        if (finalClientId && status !== 'cancelled') {
            await supabase
                .from('clients')
                .update({ status: 'qualified', updated_at: new Date().toISOString() })
                .eq('id', finalClientId)
        }

        const appointmentStatus = status === 'cancelled' ? 'cancelled' : 
                                  status === 'confirmed' ? 'confirmed' : 'scheduled'

        const appointmentPayload = {
            title: summary || "Cita Google Calendar",
            start_time: start_time ? new Date(start_time).toISOString() : new Date().toISOString(),
            end_time: end_time ? new Date(end_time).toISOString() : new Date(Date.now() + 3600000).toISOString(),
            client_id: finalClientId,
            location: location || "Online",
            type: "meeting",
            status: appointmentStatus,
            notes_before: description || ""
        }

        if (iCalUID) {
            const { data: existing } = await supabase
                .from('appointments')
                .select('id')
                .eq('client_id', finalClientId)
                .eq('start_time', appointmentPayload.start_time)
                .maybeSingle()

            if (existing) {
                const { error: updateError } = await supabase
                    .from('appointments')
                    .update({
                        status: appointmentStatus,
                        notes_before: appointmentPayload.notes_before,
                        title: appointmentPayload.title,
                        end_time: appointmentPayload.end_time,
                        location: appointmentPayload.location
                    })
                    .eq('id', existing.id)

                if (updateError) throw updateError
                return NextResponse.json({ success: true, message: "Cita actualizada", id: existing.id })
            }
        }

        const { data, error } = await supabase
            .from('appointments')
            .insert(appointmentPayload)
            .select()
            .single()

        if (error) {
            console.error("Google Calendar Sync Error:", error)
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        if (runId) {
            await supabase
                .from('automation_runs')
                .update({ status: 'success', ended_at: new Date().toISOString() })
                .eq('id', runId)
        }

        return NextResponse.json({
            success: true,
            message: "Cita sincronizada desde Google Calendar",
            appointment: data
        })

    } catch (error: any) {
        console.error("Google Calendar Webhook Error:", error)

        if (runId) {
            await supabase
                .from('automation_runs')
                .update({
                    status: 'failed',
                    ended_at: new Date().toISOString(),
                    metadata: { error: error.message }
                })
                .eq('id', runId)
        }

        return NextResponse.json({ error: "Invalid payload" }, { status: 500 })
    }
}
