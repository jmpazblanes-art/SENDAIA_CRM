
"use client"

import { useState } from "react"
import {
    format, addMonths, subMonths, startOfMonth, endOfMonth,
    startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays,
    eachDayOfInterval
} from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Mock data for appointments (will be fetched in a real scenario)
const mockApts = [
    { id: '1', title: 'Demo Agente Voz', date: new Date(), client: 'Clínica Dental', type: 'demo' },
    { id: '2', title: 'Consultoría IA', date: addDays(new Date(), 2), client: 'Tech Sol', type: 'discovery' },
]

export default function BigCalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date())

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Calendario Completo</h1>
                    <p className="text-muted-foreground">Vista detallada de citas y eventos.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/dashboard/appointments">
                        <Button variant="outline" size="sm">
                            <List className="h-4 w-4 mr-2" /> Lista
                        </Button>
                    </Link>
                    <Button size="sm" className="bg-primary text-primary-foreground">
                        <Plus className="h-4 w-4 mr-2" /> Nueva Cita
                    </Button>
                </div>
            </div>

            <Card className="flex-1 bg-card border-border overflow-hidden flex flex-col min-h-[600px]">
                {/* Header Navigation */}
                <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/20">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold capitalize">
                            {format(currentDate, 'MMMM yyyy', { locale: es })}
                        </h2>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={prevMonth}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())}>
                                Hoy
                            </Button>
                            <Button variant="ghost" size="icon" onClick={nextMonth}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex gap-4 text-xs">
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> Demo</div>
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Consultoría</div>
                    </div>
                </div>

                {/* Days Label */}
                <div className="grid grid-cols-7 border-b border-border bg-secondary/10">
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                        <div key={d} className="p-2 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div className="flex-1 grid grid-cols-7 auto-rows-fr">
                    {calendarDays.map((day, idx) => {
                        const dayApts = mockApts.filter(a => isSameDay(a.date, day))
                        return (
                            <div
                                key={idx}
                                className={`min-h-[100px] border-r border-b border-border p-2 transition-colors hover:bg-secondary/10 ${!isSameMonth(day, monthStart) ? "bg-secondary/5 opacity-30" : ""
                                    } ${isSameDay(day, new Date()) ? "bg-primary/5" : ""}`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`text-sm font-medium ${isSameDay(day, new Date()) ? "bg-primary text-primary-foreground h-6 w-6 rounded-full flex items-center justify-center -ml-1" : "text-muted-foreground"}`}>
                                        {format(day, 'd')}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    {dayApts.map(apt => (
                                        <div key={apt.id} className="text-[10px] p-1 rounded bg-primary/20 text-primary border border-primary/20 truncate font-medium">
                                            {apt.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Card>
        </div>
    )
}
