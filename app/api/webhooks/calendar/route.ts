import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Use Service Role Key for background processing and bypassing RLS if needed
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
    let runId: string | null = null
    try {
        const body = await request.json()
        console.log("Calendar Webhook Received:", body)

        // Log start of run
        const { data: runData } = await supabase
            .from('automation_runs')
            .insert({
                name: 'Sincronización de Calendario',
                status: 'running',
                category: 'integration',
                metadata: { trigger: body.triggerEvent || 'manual' }
            })
            .select('id')
            .single()
        runId = runData?.id

        // Cal.com specific detection
        const isCalCom = body.triggerEvent && body.payload
        const payloadData = isCalCom ? body.payload : body

        // Expected fields
        let {
            title,
            start_time,
            end_time,
            client_id,
            client_email,
            client_phone,
            client_name,
            location,
            type,
            notes
        } = payloadData

        // Map Cal.com specific fields
        if (isCalCom) {
            title = payloadData.title || `Cita Cal.com: ${payloadData.bookingTitle || ''}`
            start_time = payloadData.startTime
            end_time = payloadData.endTime
            location = payloadData.location
            notes = payloadData.description

            // Cal.com attendees mapping
            if (payloadData.attendees && payloadData.attendees.length > 0) {
                const attendee = payloadData.attendees[0]
                client_email = attendee.email
                client_name = attendee.name
                client_phone = attendee.phoneNumber
            }
        }

        let finalClientId = client_id

        // If no client_id, try to find by email or phone
        if (!finalClientId && (client_email || client_phone)) {
            let query = supabase.from('clients').select('id')
            if (client_email) {
                query = query.eq('email', client_email)
            } else {
                query = query.eq('phone', client_phone)
            }

            const { data: clientData } = await query.maybeSingle()
            if (clientData) {
                finalClientId = clientData.id
            } else {
                // Optionally create a new lead if not found
                const { data: newClient } = await supabase
                    .from('clients')
                    .insert({
                        first_name: body.client_name?.split(' ')[0] || "Nuevo",
                        last_name: body.client_name?.split(' ').slice(1).join(' ') || "Lead Calendario",
                        email: client_email,
                        phone: client_phone,
                        source: 'other', // Update to use valid constraint 'other' instead of 'calendar'
                        status: 'lead'
                    })
                    .select('id')
                    .single()

                if (newClient) finalClientId = newClient.id
            }
        }

        // Intelligent Pipeline: Update client status if booking is confirmed
        if (finalClientId && body.triggerEvent !== 'BOOKING_CANCELLED') {
            await supabase
                .from('clients')
                .update({ status: 'qualified', updated_at: new Date().toISOString() })
                .eq('id', finalClientId)
        }

        const appointmentPayload = {
            title: title || "Nueva Cita",
            start_time: start_time ? new Date(start_time).toISOString() : new Date().toISOString(),
            end_time: end_time ? new Date(end_time).toISOString() : new Date(Date.now() + 3600000).toISOString(),
            client_id: finalClientId || null,
            location: location || "Online",
            type: type || "meeting",
            status: body.triggerEvent === 'BOOKING_CANCELLED' ? 'cancelled' : 'confirmed',
            notes_before: notes || ""
        }

        // Use upsert-like logic: try to find existing appointment for this client and time
        if (finalClientId && start_time) {
            const startTimeISO = new Date(start_time).toISOString()
            const { data: existing } = await supabase
                .from('appointments')
                .select('id')
                .eq('client_id', finalClientId)
                .eq('start_time', startTimeISO)
                .maybeSingle()

            if (existing) {
                // Update existing
                const { error: updateError } = await supabase
                    .from('appointments')
                    .update({
                        status: appointmentPayload.status,
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

        // Otherwise Insert
        const { data, error } = await supabase
            .from('appointments')
            .insert(appointmentPayload)
            .select()
            .single()

        if (error) {
            console.error("Calendar Sync Error:", error)
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
            message: "Cita sincronizada correctamente",
            appointment: data
        })

    } catch (error: any) {
        console.error("Calendar Webhook Internal Error:", error)

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

        return NextResponse.json({ error: "Invalid payload or internal error" }, { status: 500 })
    }
}
