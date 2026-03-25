import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { updateEvent } from "@/lib/google-calendar"

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
        const { appointment_id, new_date, new_time } = body

        if (!appointment_id || !new_date || !new_time) {
            return NextResponse.json(
                { error: "Se requieren 'appointment_id', 'new_date' (YYYY-MM-DD) y 'new_time' (HH:MM)" },
                { status: 400 }
            )
        }

        // Get current appointment
        const { data: current, error: fetchError } = await supabase
            .from("appointments")
            .select("id, title, type, start_time, end_time, google_event_id")
            .eq("id", appointment_id)
            .single()

        if (fetchError || !current) {
            return NextResponse.json(
                { error: "Cita no encontrada", details: fetchError?.message },
                { status: 404 }
            )
        }

        // Calculate new start/end times preserving the original duration
        const oldStart = new Date(current.start_time)
        const oldEnd = new Date(current.end_time)
        const durationMs = oldEnd.getTime() - oldStart.getTime()

        // Build new datetime in Europe/Madrid timezone
        const newStartISO = `${new_date}T${new_time}:00+01:00`
        const newStartDate = new Date(newStartISO)
        const newEndDate = new Date(newStartDate.getTime() + durationMs)
        const newEndISO = newEndDate.toISOString()

        // Update in Supabase
        const { data: updated, error: updateError } = await supabase
            .from("appointments")
            .update({
                start_time: newStartISO,
                end_time: newEndISO,
            })
            .eq("id", appointment_id)
            .select("id, title, type, status, start_time, end_time")
            .single()

        if (updateError) {
            return NextResponse.json(
                { error: `Error actualizando cita: ${updateError.message}` },
                { status: 500 }
            )
        }

        // Update Google Calendar event if exists
        let calendarUpdated = false
        if (current.google_event_id) {
            try {
                await updateEvent(current.google_event_id, {
                    start: newStartISO,
                    end: newEndISO,
                })
                calendarUpdated = true
            } catch (err) {
                console.error("[Retell reschedule] Error actualizando Google Calendar:", err)
            }
        }

        return NextResponse.json({
            success: true,
            message: "Cita reprogramada correctamente",
            appointment: updated,
            calendar_updated: calendarUpdated,
        })
    } catch (error: any) {
        console.error("[Retell reschedule-appointment] Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
