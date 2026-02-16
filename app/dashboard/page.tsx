
import { MetricCard } from "@/components/dashboard/MetricCard"
import { RevenueChart } from "@/components/dashboard/RevenueChart"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { DashboardCalendar } from "@/components/dashboard/DashboardCalendar"
import { LatestLeadsTable, Lead } from "@/components/dashboard/LatestLeadsTable"
import { Users, DollarSign, Calendar, Activity, Zap, Phone, Clock, Brain } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/server"
import { format, subMonths, startOfMonth, endOfMonth, isAfter, startOfToday } from "date-fns"
import { es } from "date-fns/locale"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const supabase = await createClient()

    // 1. Total Clients count (Active Leads)
    const { count: clientCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .in('status', ['lead', 'contacted', 'qualified', 'proposal'])

    // 2. Fetch recent clients for the table
    const { data: recentClients } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)


    const mappedLeads: Lead[] = recentClients?.map(client => {
        const firstName = client.first_name || "Lead"
        const lastName = client.last_name || ""
        let formattedDate = "Reciente"
        try {
            if (client.created_at) {
                formattedDate = format(new Date(client.created_at), 'dd MMM yyyy', { locale: es })
            }
        } catch (e) {
            console.error("Error formatting client date:", e)
        }

        return {
            id: client.id,
            date: formattedDate,
            name: `${firstName} ${lastName}`.trim(),
            initials: `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "L",
            category: (client.status === 'lead' || client.status === 'contacted') ? 'Lead' : 'Client',
            industry: client.industry || 'Consultoría',
            status: client.status || 'lead'
        }
    }) || []

    // 3. Revenue calculation (Sum of paid invoices)
    const { data: invoices } = await supabase
        .from('invoices')
        .select('total, invoice_date')
        .eq('status', 'paid')

    const totalRevenue = invoices?.reduce((acc, curr) => acc + (curr.total || 0), 0) || 0

    // 4. Pending Appointments
    const { count: appointmentCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .gte('start_time', new Date().toISOString())

    // 5. Prepare Revenue Chart Data (Last 6 months)
    const chartData = []
    for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(new Date(), i)
        let monthName = "Mes"
        try {
            monthName = format(monthDate, 'MMM', { locale: es })
        } catch (e) { }

        const start = startOfMonth(monthDate)
        const end = endOfMonth(monthDate)

        const monthTotal = invoices?.filter(inv => {
            try {
                const date = new Date(inv.invoice_date)
                return date >= start && date <= end
            } catch (e) {
                return false
            }
        }).reduce((acc, curr) => acc + (curr.total || 0), 0) || 0

        chartData.push({ name: monthName, total: monthTotal })
    }

    // 6. Real Upcoming Activities
    const { data: nextApts } = await supabase
        .from('appointments')
        .select(`
            *,
            clients (first_name, last_name, company_name)
        `)
        .gte('start_time', startOfToday().toISOString())
        .order('start_time', { ascending: true })
        .limit(4)

    const realActivities = nextApts?.map(apt => {
        let timeLabel = "--:--"
        try {
            if (apt.start_time) {
                timeLabel = format(new Date(apt.start_time), "HH:mm")
            }
        } catch (e) {
            console.error("Error formatting appointment time:", e)
        }

        return {
            user: "Sistema",
            action: apt.type || "Cita",
            target: apt.clients ? //@ts-ignore
                (apt.clients.company_name || `${apt.clients.first_name} ${apt.clients.last_name}`) : "Cliente",
            time: timeLabel,
            type: "appointment"
        }
    }) || []

    return (
        <div className="flex flex-col h-full space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white uppercase italic">SendaIA Command Center</h1>
                    <p className="text-muted-foreground italic text-sm">Crecimiento exponencial mediante Inteligencia Artificial.</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold tracking-widest bg-secondary/10 px-3 py-1.5 rounded-full border border-border">
                    <Clock className="h-3 w-3 text-primary animate-pulse" /> Live Status: {format(new Date(), "HH:mm")}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Revenue Cerrado"
                    value={`${totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 0 })}€`}
                    change="+12%"
                    visualIcon={<DollarSign className="h-4 w-4 text-primary" />}
                    trend="up"
                />
                <MetricCard
                    title="Leads de Alta Prioridad"
                    value={clientCount?.toString() || "0"}
                    change="+5"
                    visualIcon={<Users className="h-4 w-4 text-primary" />}
                    trend="up"
                />
                <MetricCard
                    title="Tokens IA Consumidos"
                    value="1.2M"
                    change="+18%"
                    visualIcon={<Zap className="h-4 w-4 text-primary" />}
                    trend="up"
                />
                <MetricCard
                    title="Eficiencia Operativa"
                    value="84.2%"
                    change="+14%"
                    visualIcon={<Activity className="h-4 w-4 text-primary" />}
                    trend="up"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <div className="lg:col-span-4 space-y-6">
                    <Card className="bg-card border-border shadow-xl overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Brain className="h-24 w-24 text-primary" />
                        </div>
                        <CardHeader className="pb-0">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Zap className="h-4 w-4 text-primary" /> Rendimiento Estratégico (6 meses)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <RevenueChart data={chartData} />
                        </CardContent>
                    </Card>
                    <LatestLeadsTable leads={mappedLeads} />
                </div>
                <div className="lg:col-span-3 space-y-6">
                    <DashboardCalendar />
                    <RecentActivity activities={realActivities} />
                </div>
            </div>
        </div>
    )
}
