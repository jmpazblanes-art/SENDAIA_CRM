
import { MetricCard } from "@/components/dashboard/MetricCard"
import { RevenueChart } from "@/components/dashboard/RevenueChart"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { DashboardCalendar } from "@/components/dashboard/DashboardCalendar"
import { LatestLeadsTable, Lead } from "@/components/dashboard/LatestLeadsTable"
import { Users, DollarSign, Calendar, Activity, Zap, Phone, Clock, Brain, AlertTriangle, ShieldOff } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/server"
import { format, subMonths, startOfMonth, endOfMonth, startOfToday } from "date-fns"
import { es } from "date-fns/locale"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    try {
        const supabase = await createClient()

        // Si el cliente es null (fallo de env vars), lanzamos un error controlado
        if (!supabase) {
            throw new Error("CONEXIÓN_NO_ESTABLECIDA: Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL o KEY en Vercel.")
        }

        // 1. Total Clients count
        const { count: clientCount, error: clientCountError } = await supabase
            .from('clients')
            .select('*', { count: 'exact', head: true })
            .in('status', ['lead', 'contacted', 'qualified', 'proposal'])

        if (clientCountError) console.error("Dashboard clientCountError:", clientCountError)

        // 2. Fetch recent leads
        const { data: recentClients, error: recentClientsError } = await supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5)

        if (recentClientsError) console.error("Dashboard recentClientsError:", recentClientsError)

        const mappedLeads: Lead[] = (recentClients || []).map(client => {
            const firstName = client.first_name || "Lead"
            const lastName = client.last_name || ""
            let formattedDate = "Reciente"
            try {
                if (client.created_at) {
                    const dateObj = new Date(client.created_at)
                    if (!isNaN(dateObj.getTime())) {
                        formattedDate = format(dateObj, 'dd MMM yyyy', { locale: es })
                    }
                }
            } catch (e) { }

            return {
                id: client.id,
                date: formattedDate,
                name: `${firstName} ${lastName}`.trim() || "Contacto Anónimo",
                initials: `${(firstName[0] || "L")}${(lastName[0] || "")}`.toUpperCase(),
                category: (client.status === 'lead' || client.status === 'contacted') ? 'Lead' : 'Client',
                industry: client.industry || 'IA Soluciones',
                status: client.status || 'lead'
            }
        })

        // 3. Revenue calculation
        const { data: invoices, error: invoicesError } = await supabase
            .from('invoices')
            .select('total, invoice_date')
            .eq('status', 'paid')

        if (invoicesError) console.error("Dashboard invoicesError:", invoicesError)

        const totalRevenue = (invoices || []).reduce((acc: number, curr: any) => acc + (Number(curr.total) || 0), 0) || 0

        // 4. Pending Appointments Count
        const { count: apptCount, error: apptCountError } = await supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending')
            .gte('start_time', new Date().toISOString())

        if (apptCountError) console.error("Dashboard apptCountError:", apptCountError)

        // 5. Chart Data
        const chartData = []
        for (let i = 5; i >= 0; i--) {
            const monthDate = subMonths(new Date(), i)
            let monthName = "Mes"
            try {
                monthName = format(monthDate, 'MMM', { locale: es })
            } catch (e) { }

            const start = startOfMonth(monthDate)
            const end = endOfMonth(monthDate)

            const monthTotal = (invoices || []).filter((inv: any) => {
                if (!inv.invoice_date) return false
                const d = new Date(inv.invoice_date)
                return !isNaN(d.getTime()) && d >= start && d <= end
            }).reduce((acc: number, curr: any) => acc + (Number(curr.total) || 0), 0) || 0

            chartData.push({ name: monthName, total: monthTotal })
        }

        // 6. Activities
        const { data: nextApts, error: nextAptsError } = await supabase
            .from('appointments')
            .select(`
                *,
                clients (first_name, last_name, company_name)
            `)
            .gte('start_time', startOfToday().toISOString())
            .order('start_time', { ascending: true })
            .limit(4)

        if (nextAptsError) console.error("Dashboard nextAptsError:", nextAptsError)

        const realActivities = (nextApts || []).map(apt => {
            const client = apt.clients as any
            const clientName = client
                ? (Array.isArray(client)
                    ? (client[0]?.company_name || `${client[0]?.first_name || ""} ${client[0]?.last_name || ""}`).trim()
                    : (client.company_name || `${client.first_name || ""} ${client.last_name || ""}`).trim()
                ) : "Cliente"

            return {
                user: "Sistema",
                action: apt.type || "Cita",
                target: clientName || "Generado por IA",
                time: apt.start_time ? format(new Date(apt.start_time), "HH:mm") : "--:--",
                type: "appointment"
            }
        })

        return (
            <div className="flex flex-col h-full space-y-8 animate-in fade-in duration-700">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-primary/50">
                            Neural Command Center
                        </h1>
                        <p className="text-muted-foreground italic text-sm font-medium mt-1">SendaIA • Gestión de Activos y Crecimiento.</p>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground uppercase font-black tracking-widest bg-secondary/20 px-4 py-2 rounded-xl border border-border/50 shadow-inner">
                        <Clock className="h-3 w-3 text-primary animate-pulse" /> Live Feed: {format(new Date(), "HH:mm")}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <MetricCard
                        title="Revenue Operativo"
                        value={`${(totalRevenue).toLocaleString('es-ES')}€`}
                        change="+12.5%"
                        visualIcon={<DollarSign className="h-5 w-5 text-primary" />}
                        trend="up"
                    />
                    <MetricCard
                        title="Oportunidades IA"
                        value={clientCount?.toString() || "0"}
                        change="+3 hoy"
                        visualIcon={<Users className="h-5 w-5 text-primary" />}
                        trend="up"
                    />
                    <MetricCard
                        title="Procesos Autónomos"
                        value="99.8%"
                        change="Estable"
                        visualIcon={<Zap className="h-5 w-5 text-primary" />}
                        trend="neutral"
                    />
                    <MetricCard
                        title="Consultas Pendientes"
                        value={apptCount?.toString() || "0"}
                        change="-2"
                        visualIcon={<Activity className="h-5 w-5 text-primary" />}
                        trend="down"
                    />
                </div>

                <div className="grid gap-8 lg:grid-cols-7">
                    <div className="lg:col-span-4 space-y-8">
                        <Card className="bg-card border-border shadow-2xl overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Brain className="h-32 w-32 text-primary" />
                            </div>
                            <CardHeader className="pb-2 border-b border-border/10">
                                <CardTitle className="text-sm uppercase font-black tracking-widest flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-primary" /> Análisis de Inversión y Proyección
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <RevenueChart data={chartData} />
                            </CardContent>
                        </Card>
                        <LatestLeadsTable leads={mappedLeads} />
                    </div>
                    <div className="lg:col-span-3 space-y-8">
                        <DashboardCalendar />
                        <RecentActivity activities={realActivities} />
                    </div>
                </div>
            </div>
        )
    } catch (error: any) {
        console.error("Critical Dashboard Failure:", error)

        // INTERFAZ DE ERROR ULTRA-RESILIENTE
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center animate-in zoom-in-95 duration-500">
                <div className="relative">
                    <div className="h-24 w-24 bg-red-500/10 rounded-3xl border border-red-500/20 flex items-center justify-center mb-8 relative z-10 animate-bounce-slow">
                        {error.message?.includes('CONEXIÓN') ? <ShieldOff className="h-12 w-12 text-red-500" /> : <AlertTriangle className="h-12 w-12 text-red-500" />}
                    </div>
                    <div className="absolute inset-0 bg-red-500/20 blur-[40px] rounded-full scale-150 opacity-30 animate-pulse" />
                </div>

                <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">Núcleo Central Interrumpido</h2>
                <div className="max-w-md bg-secondary/30 backdrop-blur-md border border-red-500/30 p-6 rounded-2xl shadow-2xl">
                    <p className="text-muted-foreground text-sm font-bold mb-4">
                        La conexión neuronal con el núcleo de datos no se ha podido establecer.
                    </p>
                    <div className="bg-black/80 rounded-xl p-4 text-left border border-red-500/20">
                        <p className="text-[10px] font-mono text-primary uppercase tracking-widest mb-2 opacity-70">SendaIA Diagnostic Hub:</p>
                        <div className="space-y-2">
                            <p className="text-[11px] font-mono text-red-400 leading-tight">
                                <span className="text-white bg-red-500 px-1 mr-2 uppercase text-[9px]">Critical</span> {error?.message || "Internal Server Error"}
                            </p>
                            <div className="mt-4 p-2 bg-primary/5 border border-primary/10 rounded">
                                <p className="text-[9px] text-primary/80 font-bold uppercase tracking-tighter mb-1">Acción Requerida:</p>
                                <p className="text-[9px] text-muted-foreground italic">Verifica que NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY estén configuradas en los Project Settings de Vercel.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-[10px] text-muted-foreground font-black uppercase tracking-[0.4em]">
                    Estado SendaIA: Esperando Configuración de Seguridad
                </p>
            </div>
        )
    }
}
