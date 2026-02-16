
"use client"

import * as React from "react"
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday
} from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Plus, Video, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface Appointment {
    id: string
    title: string
    client: string
    type: string
    start: Date
    end: Date
    status: string
    location: string
    isOnline: boolean
}

interface FullCalendarViewProps {
    appointments: Appointment[]
}

export function FullCalendarView({ appointments }: FullCalendarViewProps) {
    const [currentMonth, setCurrentMonth] = React.useState(new Date())

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    })

    const getAppointmentsForDay = (day: Date) => {
        return appointments.filter(apt => isSameDay(new Date(apt.start), day))
    }

    const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

    return (
        <div className="flex flex-col h-full bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/5">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-foreground capitalize">
                        {format(currentMonth, "MMMM yyyy", { locale: es })}
                    </h2>
                    <div className="flex items-center bg-background border border-border rounded-lg p-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="px-3 h-8 text-xs font-medium" onClick={() => setCurrentMonth(new Date())}>
                            Hoy
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="flex items-center gap-4 mr-4">
                        <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span className="text-[10px] text-muted-foreground font-medium uppercase">Confirmado</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-yellow-500" />
                            <span className="text-[10px] text-muted-foreground font-medium uppercase">Pendiente</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Weekdays Header */}
            <div className="grid grid-cols-7 border-b border-border bg-secondary/10">
                {weekDays.map((day) => (
                    <div key={day} className="py-2 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-r border-border last:border-r-0">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 flex-1 auto-rows-fr overflow-y-auto min-h-[600px]">
                {calendarDays.map((day, idx) => {
                    const dayAppointments = getAppointmentsForDay(day)
                    const isOutside = !isSameMonth(day, monthStart)
                    const isTodayDate = isToday(day)

                    return (
                        <div
                            key={day.toString()}
                            className={cn(
                                "min-h-[120px] p-2 border-r border-b border-border group transition-all duration-200",
                                isOutside ? "bg-secondary/5 text-muted-foreground/30" : "bg-card hover:bg-secondary/5",
                                idx % 7 === 6 ? "border-r-0" : ""
                            )}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={cn(
                                    "text-sm font-bold flex items-center justify-center h-7 w-7 rounded-full transition-colors",
                                    isTodayDate ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-foreground/70",
                                    isOutside && "opacity-30"
                                )}>
                                    {format(day, "d")}
                                </span>
                                {dayAppointments.length > 0 && !isOutside && (
                                    <span className="text-[9px] font-bold text-muted-foreground bg-secondary/40 px-1.5 py-0.5 rounded uppercase">
                                        {dayAppointments.length} {dayAppointments.length === 1 ? 'Cita' : 'Citas'}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                                {dayAppointments.map((apt) => (
                                    <TooltipProvider key={apt.id}>
                                        <Tooltip delayDuration={300}>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className={cn(
                                                        "group/apt relative flex flex-col px-2 py-1 rounded border text-[10px] leading-tight cursor-pointer transition-all hover:scale-[1.02]",
                                                        apt.status === 'confirmed'
                                                            ? "bg-green-500/10 border-green-500/20 text-green-500"
                                                            : "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
                                                    )}
                                                >
                                                    <div className="flex items-center justify-between gap-1">
                                                        <span className="font-bold truncate">{apt.title}</span>
                                                        <span className="text-[8px] opacity-70 whitespace-nowrap">{format(new Date(apt.start), "HH:mm")}</span>
                                                    </div>
                                                    <span className="text-[8px] truncate opacity-80">{apt.client}</span>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="right" className="p-3 bg-popover border-border shadow-2xl min-w-[200px]">
                                                <div className="space-y-2">
                                                    <p className="font-bold text-sm text-foreground">{apt.title}</p>
                                                    <div className="space-y-1">
                                                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                                                            <Clock className="h-3 w-3 text-primary" /> {format(new Date(apt.start), "HH:mm")} - {format(new Date(apt.end), "HH:mm")}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                                                            <MapPin className="h-3 w-3 text-primary" /> {apt.location}
                                                        </p>
                                                        <p className="text-xs font-medium text-foreground">Cliente: {apt.client}</p>
                                                    </div>
                                                    <Badge variant="outline" className={cn(
                                                        "text-[9px] uppercase",
                                                        apt.status === 'confirmed' ? "text-green-500 border-green-500/30" : "text-yellow-500 border-yellow-500/30"
                                                    )}>
                                                        {apt.status}
                                                    </Badge>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
