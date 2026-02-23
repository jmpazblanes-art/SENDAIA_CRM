"use client"

import { FullCalendarView } from "./FullCalendarView"

interface CalendarViewProps {
    appointments: any[]
}

export function CalendarView({ appointments }: CalendarViewProps) {
    const mapped = appointments.map(apt => ({
        id: apt.id ?? String(Math.random()),
        title: apt.title || apt.type || "Cita",
        client: apt.clientName || "Cliente",
        type: apt.type || "meeting",
        start: apt.start_time ? new Date(apt.start_time) : new Date(),
        end: apt.end_time ? new Date(apt.end_time) : new Date(),
        status: apt.status || "pending",
        location: apt.location || "Sin ubicación",
        isOnline: apt.is_online ?? false,
    }))

    return <FullCalendarView appointments={mapped} />
}
