import { createClient } from "@/utils/supabase/server"
import { Appointment, AppointmentList } from "@/components/appointments/AppointmentList"
import { CreateAppointmentDialog } from "@/components/appointments/CreateAppointmentDialog"
import { FullCalendarView } from "@/components/appointments/FullCalendarView"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, User, LayoutGrid, List, Calendar } from "lucide-react"
import { format, isAfter, startOfToday } from "date-fns"
import { es } from "date-fns/locale"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const dynamic = 'force-dynamic'

export default async function AppointmentsPage() {
    const supabase = await createClient()

    // Fetch appointments with client info
    const { data: appointments } = await supabase
        .from('appointments')
        .select(`
            id,
            title,
            start_time,
            end_time,
            type,
            status,
            location,
            meeting_url,
            clients (
                id,
                first_name,
                last_name,
                company_name
            )
        `)
        .order('start_time', { ascending: true })

    // Fetch clients for the creation modal
    const { data: clients } = await supabase
        .from('clients')
        .select('id, first_name, last_name, company_name')
        .order('first_name', { ascending: true })


    const mappedAppointments: Appointment[] = appointments?.map(apt => {
        const clients = apt.clients as any
        const clientName = clients
            ? (clients.company_name || `${clients.first_name || "Cliente"} ${clients.last_name || ""}`).trim()
            : "Cliente Desconocido"

        let safeStart = new Date()
        let safeEnd = new Date()
        try {
            if (apt.start_time) safeStart = new Date(apt.start_time)
            if (apt.end_time) safeEnd = new Date(apt.end_time)
        } catch (e) {
            console.error("Error parsing appointment date:", e)
        }

        return {
            id: apt.id,
            title: apt.title || "Reunión",
            client: clientName,
            type: apt.type || 'OTHER',
            start: safeStart,
            end: safeEnd,
            status: apt.status || 'pending',
            location: apt.location || (apt.meeting_url ? "Online" : "SendaIA Offices"),
            isOnline: !!apt.meeting_url
        }
    }) || []

    const upcomingApts = mappedAppointments.filter(apt => isAfter(apt.start, startOfToday())).slice(0, 5)

    return (
        <div className="flex flex-col h-full space-y-6">
            <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-1">Centro de Control de Citas</h1>
                    <p className="text-muted-foreground text-sm max-w-2xl">
                        Visualiza y gestiona las demostraciones de IA y sesiones de diagnóstico.
                    </p>
                </div>
                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" className="border-primary/20 hover:bg-primary/5 text-primary text-xs font-bold uppercase transition-all">
                        <Calendar className="h-4 w-4 mr-2" /> Sync Google
                    </Button>
                    <CreateAppointmentDialog clients={clients || []} />
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Stats Panel - Now on the side for XL, or top for smaller screens */}
                <div className="xl:col-span-1 space-y-6">
                    <Card className="bg-card border-border shadow-lg overflow-hidden relative group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary transition-all group-hover:w-2" />
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg text-primary flex items-center gap-2">
                                <Clock className="h-5 w-5" /> Próximas 72h
                            </CardTitle>
                            <CardDescription>Eventos críticos próximos</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {upcomingApts.length > 0 ? (
                                upcomingApts.map((apt) => (
                                    <div key={apt.id} className="p-3 bg-secondary/20 rounded-lg border border-border/50 hover:bg-secondary/40 transition-all cursor-pointer">
                                        <div className="flex justify-between items-start mb-1">
                                            <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 font-bold ${apt.status === 'confirmed' ? "border-green-500 text-green-500 bg-green-500/5" : "border-yellow-500 text-yellow-500 bg-yellow-500/5"
                                                }`}>
                                                {apt.status.toUpperCase()}
                                            </Badge>
                                            <span className="text-[10px] font-bold text-foreground">
                                                {(() => {
                                                    try {
                                                        return format(apt.start, "HH:mm")
                                                    } catch (e) {
                                                        return "00:00"
                                                    }
                                                })()}
                                            </span>
                                        </div>
                                        <p className="text-xs font-bold text-foreground truncate">{apt.title}</p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <User className="h-3 w-3 text-primary" />
                                            <p className="text-[10px] text-muted-foreground truncate">{apt.client}</p>
                                        </div>
                                        <p className="text-[10px] text-primary mt-2 font-bold capitalize">
                                            {(() => {
                                                try {
                                                    return format(apt.start, "eeee d 'de' MMMM", { locale: es })
                                                } catch (e) {
                                                    return "Fecha pendiente"
                                                }
                                            })()}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center bg-secondary/5 rounded-xl border border-dashed border-border/50">
                                    <Clock className="h-8 w-8 text-muted-foreground/30 mb-2" />
                                    <p className="text-xs text-muted-foreground italic">No hay citas registradas.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Info Card */}
                    <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20 shadow-lg">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-primary italic uppercase tracking-widest">Tip de Venta</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Recuerda enviar el resumen de la sesión de diagnóstico por WhatsApp 15 minutos después de terminar la cita para maximizar el cierre.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="xl:col-span-3">
                    <Tabs defaultValue="grid" className="w-full">
                        <div className="flex items-center justify-between mb-4">
                            <TabsList className="bg-secondary/30 p-1 border border-border">
                                <TabsTrigger value="grid" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex gap-2 text-xs font-bold">
                                    <LayoutGrid className="h-3.5 w-3.5" /> Calendario
                                </TabsTrigger>
                                <TabsTrigger value="list" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex gap-2 text-xs font-bold">
                                    <List className="h-3.5 w-3.5" /> Lista Diaria
                                </TabsTrigger>
                            </TabsList>
                            <div className="hidden md:flex gap-2 text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> Confirmadas</span>
                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500" /> Pendientes</span>
                            </div>
                        </div>

                        <TabsContent value="grid" className="m-0 border-none p-0 focus-visible:ring-0">
                            <FullCalendarView appointments={mappedAppointments} />
                        </TabsContent>

                        <TabsContent value="list" className="m-0 border-none p-0 focus-visible:ring-0">
                            <Card className="bg-card border-border shadow-xl">
                                <CardContent className="p-6">
                                    <AppointmentList data={mappedAppointments} />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
