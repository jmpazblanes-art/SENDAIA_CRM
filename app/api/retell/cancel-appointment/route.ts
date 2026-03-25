import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { deleteEvent } from "@/lib/google-calendar"

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
        const { appointment_id } = body

        if (!appointment_id) {
            return NextResponse.json(
                { error: "Se requiere 'appointment_id'" },
                { status: 400 }
            )
        }

        // Get appointment to find google_event_id
        const { data: appointment, error: fetchError } = await supabase
            .from("appointments")
            .select("id, google_event_id, title, status")
            .eq("id", appointment_id)
            .single()

        if (fetchError || !appointment) {
            return NextResponse.json(
                { error: "Cita no encontrada", details: fetchError?.message },
                { status: 404 }
            )
        }

        if (appointment.status === "cancelled") {
            return NextResponse.json({
                success: true,
                message: "La cita ya estaba cancelada",
                appointment: { id: appointment.id, title: appointment.title, status: "cancelled" },
            })
        }

        // Delete Google Calendar event if exists
        let calendarDeleted = false
        if (appointment.google_event_id) {
            try {
                await deleteEvent(appointment.google_event_id)
                calendarDeleted = true
            } catch (err) {
                console.error("[Retell cancel] Error eliminando evento de Google Calendar:", err)
            }
        }

        // Update status to cancelled
        const { data: updated, error: updateError } = await supabase
            .from("appointments")
            .update({ status: "cancelled" })
            .eq("id", appointment_id)
            .select("id, title, status")
            .single()

        if (updateError) {
            return NextResponse.json(
                { error: `Error cancelando cita: ${updateError.message}` },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: "Cita cancelada correctamente",
            appointment: updated,
            calendar_deleted: calendarDeleted,
        })
    } catch (error: any) {
        console.error("[Retell cancel-appointment] Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
