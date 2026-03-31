import { StatsCards } from "@/components/dashboard/StatsCards"
import { RevenueChart } from "@/components/dashboard/RevenueChart"
import { PipelineSummary } from "@/components/dashboard/PipelineSummary"
import { RecentActivity, type ActivityItem } from "@/components/dashboard/RecentActivity"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { TrendingUp, Clock, AlertTriangle, ShieldOff } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import {
    format,
    subMonths,
    startOfMonth,
    endOfMonth,
} from "date-fns"
import { es } from "date-fns/locale"

export const dynamic = "force-dynamic"

const SPANISH_MONTHS: Record<number, string> = {
    0: "Ene",
    1: "Feb",
    2: "Mar",
    3: "Abr",
    4: "May",
    5: "Jun",
    6: "Jul",
    7: "Ago",
    8: "Sep",
    9: "Oct",
    10: "Nov",
    11: "Dic",
}

function getMonthLabel(date: Date): string {
    return SPANISH_MONTHS[date.getMonth()] ?? format(date, "MMM", { locale: es })
}

export default async function DashboardPage() {
    try {
        const supabase = await createClient()

        if (!supabase) {
            throw new Error(
                "CONEXION_NO_ESTABLECIDA: Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL o KEY."
            )
        }

        const now = new Date()
        const monthStart = startOfMonth(now).toISOString()
        const monthEnd = endOfMonth(now).toISOString()

        // Previous month range (for trend comparison)
        const prevMonthDate = subMonths(now, 1)
        const prevMonthStart = startOfMonth(prevMonthDate).toISOString()
        const prevMonthEnd = endOfMonth(prevMonthDate).toISOString()

        // ─── Parallel queries ──────────────────────────────────────────────
        const [
            activeClientsRes,
            leadsThisMonthRes,
            leadsPrevMonthRes,
            revenueThisMonthRes,
            revenuePrevMonthRes,
            pendingProposalsRes,
            allInvoicesRes,
            pipelineRes,
            recentClientsRes,
            recentAppointmentsRes,
        ] = await Promise.all([
            // 1. Active clients (status = 'active' or 'client')
            supabase
                .from("clients")
                .select("*", { count: "exact", head: true })
                .in("status", ["active", "client"]),

            // 2. Leads this month
            supabase
                .from("clients")
                .select("*", { count: "exact", head: true })
                .eq("status", "lead")
                .gte("created_at", monthStart)
                .lte("created_at", monthEnd),

            // 3. Leads previous month
            supabase
                .from("clients")
                .select("*", { count: "exact", head: true })
                .eq("status", "lead")
                .gte("created_at", prevMonthStart)
                .lte("created_at", prevMonthEnd),

            // 4. Revenue this month (paid invoices)
            supabase
                .from("invoices")
                .select("total")
                .eq("status", "paid")
                .gte("created_at", monthStart)
                .lte("created_at", monthEnd),

            // 5. Revenue previous month
            supabase
                .from("invoices")
                .select("total")
                .eq("status", "paid")
                .gte("created_at", prevMonthStart)
                .lte("created_at", prevMonthEnd),

            // 6. Pending proposals
            supabase
                .from("clients")
                .select("*", { count: "exact", head: true })
                .eq("status", "proposal"),

            // 7. All paid invoices for chart (last 6 months)
            supabase
                .from("invoices")
                .select("total, created_at")
                .eq("status", "paid")
                .gte(
                    "created_at",
                    startOfMonth(subMonths(now, 5)).toISOString()
                ),

            // 8. Pipeline: count per status
            supabase.from("clients").select("status"),

            // 9. Recent clients (last 5)
            supabase
                .from("clients")
                .select("id, first_name, last_name, company_name, status, created_at")
                .order("created_at", { ascending: false })
                .limit(5),

            // 10. Recent appointments (last 5)
            supabase
                .from("appointments")
                .select(
                    "id, type, start_time, status, created_at, clients(first_name, last_name, company_name)"
                )
                .order("created_at", { ascending: false })
                .limit(5),
        ])

        // ─── KPI values ────────────────────────────────────────────────────
        const activeClients = activeClientsRes.count ?? 0
        const leadsThisMonth = leadsThisMonthRes.count ?? 0
        const leadsPrevMonth = leadsPrevMonthRes.count ?? 0

        const sumTotal = (rows: { total: number | null }[] | null) =>
            (rows ?? []).reduce((acc, r) => acc + (Number(r.total) || 0), 0)

        const revenueThisMonth = sumTotal(revenueThisMonthRes.data)
        const revenuePrevMonth = sumTotal(revenuePrevMonthRes.data)
        const pendingProposals = pendingProposalsRes.count ?? 0

        // ─── Revenue chart data (last 6 months) ───────────────────────────
        const chartData: { name: string; total: number }[] = []
        for (let i = 5; i >= 0; i--) {
            const monthDate = subMonths(now, i)
            const mStart = startOfMonth(monthDate)
            const mEnd = endOfMonth(monthDate)

            const monthTotal = (allInvoicesRes.data ?? [])
                .filter((inv) => {
                    if (!inv.created_at) return false
                    const d = new Date(inv.created_at)
                    return !isNaN(d.getTime()) && d >= mStart && d <= mEnd
                })
                .reduce((acc, curr) => acc + (Number(curr.total) || 0), 0)

            chartData.push({
                name: getMonthLabel(monthDate),
                total: monthTotal,
            })
        }

        // ─── Pipeline summary ──────────────────────────────────────────────
        const statusCounts: Record<string, number> = {}
        for (const row of pipelineRes.data ?? []) {
            const s = row.status || "unknown"
            statusCounts[s] = (statusCounts[s] || 0) + 1
        }
        const pipeline = Object.entries(statusCounts).map(([status, count]) => ({
            status,
            count,
        }))

        // ─── Recent activity (merge clients + appointments, sort by date) ─
        const clientActivities: ActivityItem[] = (recentClientsRes.data ?? []).map(
            (c) => {
                const name =
                    c.company_name ||
                    `${c.first_name || ""} ${c.last_name || ""}`.trim() ||
                    "Contacto"
                let dateStr = ""
                let timeStr = ""
                try {
                    const d = new Date(c.created_at)
                    dateStr = format(d, "dd MMM", { locale: es })
                    timeStr = format(d, "HH:mm")
                } catch {
                    dateStr = "Reciente"
                    timeStr = "--:--"
                }
                return {
                    id: c.id,
                    type: "client" as const,
                    title: name,
                    subtitle: `Nuevo ${c.status === "lead" ? "lead" : "cliente"} registrado`,
                    date: dateStr,
                    time: timeStr,
                }
            }
        )

        const appointmentActivities: ActivityItem[] = (
            recentAppointmentsRes.data ?? []
        ).map((apt) => {
            const client = apt.clients as
                | { first_name?: string; last_name?: string; company_name?: string }
                | { first_name?: string; last_name?: string; company_name?: string }[]
                | null
            let clientName = "Cliente"
            if (client) {
                const c = Array.isArray(client) ? client[0] : client
                if (c) {
                    clientName =
                        c.company_name ||
                        `${c.first_name || ""} ${c.last_name || ""}`.trim() ||
                        "Cliente"
                }
            }

            let dateStr = ""
            let timeStr = ""
            try {
                const d = new Date(apt.start_time || apt.created_at)
                dateStr = format(d, "dd MMM", { locale: es })
                timeStr = format(d, "HH:mm")
            } catch {
                dateStr = "Reciente"
                timeStr = "--:--"
            }

            return {
                id: apt.id,
                type: "appointment" as const,
                title: clientName,
                subtitle: `${apt.type || "Cita"} - ${apt.status || "pendiente"}`,
                date: dateStr,
                time: timeStr,
            }
        })

        const allActivities = [...clientActivities, ...appointmentActivities]
            .sort((a, b) => {
                // Sort by date+time descending (most recent first)
                const da = `${a.date} ${a.time}`
                const db = `${b.date} ${b.time}`
                return db.localeCompare(da)
            })
            .slice(0, 10)

        // ─── Render ────────────────────────────────────────────────────────
        return (
            <div className="flex flex-col h-full space-y-4 md:space-y-8 animate-in fade-in duration-700 page-enter stagger-in">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-[#C9A24D]/50">
                            Panel de Control
                        </h1>
                        <p className="text-muted-foreground text-xs md:text-sm font-medium mt-1">
                            SendaIA CRM &mdash; KPIs y rendimiento del negocio
                        </p>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground uppercase font-black tracking-widest bg-secondary/20 px-3 md:px-4 py-1.5 md:py-2 rounded-xl border border-border/50 shadow-inner">
                        <Clock className="h-3 w-3 text-[#C9A24D] animate-pulse" />
                        {format(now, "EEEE, d MMMM yyyy", { locale: es })}
                    </div>
                </div>

                {/* KPI Cards */}
                <StatsCards
                    activeClients={activeClients}
                    leadsThisMonth={leadsThisMonth}
                    revenueThisMonth={revenueThisMonth}
                    pendingProposals={pendingProposals}
                    prevLeads={leadsPrevMonth}
                    prevRevenue={revenuePrevMonth}
                />

                {/* Middle row: Revenue chart + Pipeline */}
                <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
                    {/* Revenue Chart */}
                    <Card className="bg-card border-border shadow-2xl overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                            <TrendingUp className="h-28 w-28 text-[#C9A24D]" />
                        </div>
                        <CardHeader className="pb-2 border-b border-border/10">
                            <CardTitle className="text-sm uppercase font-black tracking-widest flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-[#C9A24D]" />
                                Ingresos &mdash; Últimos 6 Meses
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <RevenueChart data={chartData} />
                        </CardContent>
                    </Card>

                    {/* Pipeline */}
                    <PipelineSummary pipeline={pipeline} />
                </div>

                {/* Recent Activity */}
                <RecentActivity activities={allActivities} />
            </div>
        )
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : "Error interno del servidor"
        const isConnectionError = message.includes("CONEXION")

        console.error("Dashboard error:", error)

        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center animate-in zoom-in-95 duration-500">
                <div className="relative">
                    <div className="h-24 w-24 bg-red-500/10 rounded-3xl border border-red-500/20 flex items-center justify-center mb-8 relative z-10">
                        {isConnectionError ? (
                            <ShieldOff className="h-12 w-12 text-red-500" />
                        ) : (
                            <AlertTriangle className="h-12 w-12 text-red-500" />
                        )}
                    </div>
                    <div className="absolute inset-0 bg-red-500/20 blur-[40px] rounded-full scale-150 opacity-30 animate-pulse" />
                </div>

                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">
                    Panel No Disponible
                </h2>
                <div className="max-w-md bg-secondary/30 backdrop-blur-md border border-red-500/30 p-6 rounded-2xl shadow-2xl">
                    <p className="text-muted-foreground text-sm font-bold mb-4">
                        No se ha podido conectar con la base de datos.
                    </p>
                    <div className="bg-black/80 rounded-xl p-4 text-left border border-red-500/20">
                        <p className="text-[10px] font-mono text-[#C9A24D] uppercase tracking-widest mb-2 opacity-70">
                            Diagnóstico:
                        </p>
                        <p className="text-[11px] font-mono text-red-400 leading-tight">
                            <span className="text-white bg-red-500 px-1 mr-2 uppercase text-[9px]">
                                Error
                            </span>
                            {message}
                        </p>
                        <div className="mt-4 p-2 bg-[#C9A24D]/5 border border-[#C9A24D]/10 rounded">
                            <p className="text-[9px] text-[#C9A24D]/80 font-bold uppercase tracking-tighter mb-1">
                                Acción Requerida:
                            </p>
                            <p className="text-[9px] text-muted-foreground">
                                Verifica que NEXT_PUBLIC_SUPABASE_URL y
                                NEXT_PUBLIC_SUPABASE_ANON_KEY estén configuradas
                                correctamente.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
