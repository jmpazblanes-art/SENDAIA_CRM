
import { createClient } from "@/utils/supabase/server"
import { CalendarView } from "@/components/appointments/CalendarView"
import { AppointmentList } from "@/components/appointments/AppointmentList"
import { Plus, Calendar as CalendarIcon, List, AlertCircle, ShieldOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { format, isAfter, startOfToday } from "date-fns"
import { es } from "date-fns/locale"

export const dynamic = 'force-dynamic'

export default async function AppointmentsPage() {
    try {
        const supabase = await createClient()

        if (!supabase) {
            throw new Error("SISTEMA_DATOS_OFFLINE: No se detectan credenciales operativas de Supabase.")
        }

        const { data: appointments, error: fetchError } = await supabase
            .from('appointments')
            .select(`
                *,
                clients (
                    first_name,
                    last_name,
                    company_name
                )
            `)
            .order('start_time', { ascending: true })

        if (fetchError) console.error("Error fetching appointments:", fetchError)

        const mappedAppointments = (appointments || []).map(apt => {
            const clients = apt.clients as any
            const clientName = clients
                ? (Array.isArray(clients)
                    ? (clients[0]?.company_name || `${clients[0]?.first_name || "Cliente"} ${clients[0]?.last_name || ""}`).trim()
                    : (clients.company_name || `${clients.first_name || "Cliente"} ${clients.last_name || ""}`).trim()
                ) : "Cliente Desconocido"

            return {
                ...apt,
                clientName
            }
        })

        const upcomingCount = mappedAppointments.filter(apt =>
            apt.start_time && isAfter(new Date(apt.start_time), startOfToday())
        ).length

        return (
            <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">Agenda Inteligente</h1>
                        <p className="text-muted-foreground italic text-sm font-medium">SendaIA • Gestión de activos temporales.</p>
                    </div>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold border-b-2 border-primary-foreground/20 active:border-b-0 transition-all">
                        <Plus className="h-4 w-4 mr-2" /> Programar Cita
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
                    <Card className="bg-card border-border hover:border-primary/20 transition-all group overflow-hidden relative">
                        <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
                            <CalendarIcon className="h-20 w-20" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Próximos Eventos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-black text-foreground">{upcomingCount}</p>
                            <p className="text-[10px] text-muted-foreground mt-1 font-medium italic">Sincronizado con IA</p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="calendar" className="w-full">
                    <div className="flex items-center justify-between mb-4 bg-secondary/20 p-1 rounded-xl border border-border/50">
                        <TabsList className="bg-transparent border-none">
                            <TabsTrigger value="calendar" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-xs uppercase italic tracking-widest px-6">
                                <CalendarIcon className="h-3.5 w-3.5 mr-2" /> Vista Mural
                            </TabsTrigger>
                            <TabsTrigger value="list" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-xs uppercase italic tracking-widest px-6">
                                <List className="h-3.5 w-3.5 mr-2" /> Registro Líquido
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="calendar" className="mt-0 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                        <CalendarView appointments={mappedAppointments} />
                    </TabsContent>
                    <TabsContent value="list" className="mt-0">
                        <AppointmentList data={mappedAppointments.map(apt => ({
                            id: apt.id ?? String(Math.random()),
                            title: apt.title || apt.type || "Cita",
                            client: apt.clientName || "Cliente",
                            type: apt.type || "meeting",
                            start: apt.start_time ? new Date(apt.start_time) : new Date(),
                            end: apt.end_time ? new Date(apt.end_time) : new Date(),
                            status: apt.status || "pending",
                            location: apt.location || "Sin ubicación",
                            isOnline: apt.is_online ?? false,
                        }))} />
                    </TabsContent>
                </Tabs>
            </div>
        )
    } catch (error: any) {
        console.error("Critical issue in AppointmentsPage:", error)
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
                <div className="h-20 w-20 bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-center animate-pulse">
                    <ShieldOff className="h-10 w-10 text-primary" />
                </div>
                <div className="text-center max-w-md">
                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Agenda Fuera de Servicio</h2>
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                        No se ha podido sincronizar con el núcleo de datos de Supabase. El sistema de citas está en modo offline.
                    </p>
                    <div className="mt-6 p-4 bg-secondary/30 rounded-xl border border-border text-left">
                        <p className="text-[10px] font-mono text-primary uppercase tracking-widest mb-1">Diagnóstico:</p>
                        <code className="text-[10px] text-muted-foreground break-all">{error?.message || "Error desconocido en el servidor"}</code>
                    </div>
                </div>
                <Button variant="outline" className="text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary" onClick={() => window.location.reload()}>
                    Reintentar Conexión
                </Button>
            </div>
        )
    }
}
