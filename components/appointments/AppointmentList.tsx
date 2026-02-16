
"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Video, Clock, User, ChevronRight, CheckCircle2, XCircle } from "lucide-react"
import { format, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

export interface Appointment {
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

interface AppointmentListProps {
    data: Appointment[]
}

export function AppointmentList({ data }: AppointmentListProps) {
    const [date, setDate] = React.useState<Date | undefined>(new Date())
    const [statusFilter, setStatusFilter] = React.useState<string>("all")

    const filteredAppointments = data.filter(apt => {
        const dateMatch = !date || isSameDay(apt.start, date)
        const statusMatch = statusFilter === "all" || apt.status === statusFilter
        return dateMatch && statusMatch
    })

    const statusColors: Record<string, string> = {
        pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        confirmed: "bg-green-500/10 text-green-500 border-green-500/20",
        cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
        completed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Calendar Selector */}
                <div className="w-full md:w-auto shrink-0 space-y-4">
                    <Card className="border-border bg-secondary/10 shadow-inner">
                        <CardContent className="p-3">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                locale={es}
                                className="rounded-md"
                            />
                        </CardContent>
                    </Card>

                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Filtrar por Estado</p>
                        <div className="flex flex-wrap gap-2">
                            {["all", "pending", "confirmed", "completed"].map((stat) => (
                                <Button
                                    key={stat}
                                    variant={statusFilter === stat ? "default" : "outline"}
                                    size="sm"
                                    className={cn(
                                        "h-7 text-[10px] uppercase font-bold",
                                        statusFilter === stat ? "bg-primary text-primary-foreground" : "border-border hover:bg-secondary/30"
                                    )}
                                    onClick={() => setStatusFilter(stat)}
                                >
                                    {stat === 'all' ? 'Todos' : stat === 'pending' ? 'Pendientes' : stat === 'confirmed' ? 'Confirmadas' : 'Completadas'}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* List of Appointments */}
                <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
                        <h2 className="text-lg font-bold text-foreground capitalize">
                            {date ? format(date, "EEEE, d 'de' MMMM", { locale: es }) : "Todas las citas"}
                        </h2>
                        <span className="text-xs text-muted-foreground">{filteredAppointments.length} resultados</span>
                    </div>

                    {filteredAppointments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center bg-secondary/5 rounded-xl border border-dashed border-border/50">
                            <Clock className="h-10 w-10 text-muted-foreground/30 mb-2" />
                            <p className="text-muted-foreground text-sm">No hay citas registradas para este criterio.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {filteredAppointments.map(apt => (
                                <Card
                                    key={apt.id}
                                    className="group relative overflow-hidden border-border bg-card hover:bg-secondary/10 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 border-l-4 border-l-transparent hover:border-l-primary"
                                >
                                    <CardContent className="p-4 flex items-center justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="flex flex-col items-center justify-center bg-secondary/20 rounded-lg p-2 min-w-[60px] h-14 border border-border/50 group-hover:bg-primary/10 transition-colors">
                                                <span className="text-xs font-bold text-foreground">
                                                    {format(apt.start, "HH:mm")}
                                                </span>
                                                <span className="text-[9px] text-muted-foreground font-medium uppercase">
                                                    {apt.end.getHours() - apt.start.getHours()}h
                                                </span>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{apt.title}</h3>
                                                    <Badge className={cn("text-[9px] px-1.5 h-4 font-bold border", statusColors[apt.status] || "bg-secondary text-muted-foreground")}>
                                                        {apt.status.toUpperCase()}
                                                    </Badge>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                                                    <div className="flex items-center gap-1.5">
                                                        <User className="h-3 w-3 text-primary" />
                                                        <span className="font-medium text-foreground/80">{apt.client}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        {apt.isOnline ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                                                        <span>{apt.location}</span>
                                                    </div>
                                                    <Badge variant="secondary" className="bg-secondary/50 text-[9px] h-4">
                                                        {apt.type}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
