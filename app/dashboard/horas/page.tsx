
import { createClient } from "@/utils/supabase/server"
import { TimeTracker } from "@/components/horas/TimeTracker"
import { TimeLog } from "@/components/horas/TimeLog"
import { TimeSummary } from "@/components/horas/TimeSummary"
import { Clock, ShieldAlert } from "lucide-react"
import { getClientsForTimeAction } from "./actions"
import { format, startOfMonth, endOfMonth } from "date-fns"

export const dynamic = 'force-dynamic'

export default async function HorasPage() {
    try {
        const supabase = await createClient()

        const now = new Date()
        const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
        const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')

        const [entriesResult, monthEntriesResult, clients] = await Promise.all([
            supabase
                .from('time_entries')
                .select(`*, clients(first_name, last_name, company_name)`)
                .order('fecha', { ascending: false })
                .limit(50),
            supabase
                .from('time_entries')
                .select(`*, clients(first_name, last_name, company_name)`)
                .gte('fecha', monthStart)
                .lte('fecha', monthEnd),
            getClientsForTimeAction(),
        ])

        const { data: entries, error } = entriesResult
        if (error) console.error("Supabase fetch error in HorasPage:", error)

        const { data: monthEntries } = monthEntriesResult

        const mappedEntries = (entries || []).map(e => {
            const client = e.clients as any
            const clientName = client
                ? (client.company_name || `${client.first_name || ""} ${client.last_name || ""}`).trim()
                : "Sin cliente"

            let formattedDate = 'N/A'
            try {
                if (e.fecha) formattedDate = format(new Date(e.fecha), 'dd/MM/yyyy')
            } catch (_) { }

            return {
                id: e.id,
                client: clientName,
                client_id: e.client_id,
                proyecto: e.proyecto || '',
                descripcion: e.descripcion || '',
                horas: e.horas || 0,
                fecha: formattedDate,
                tarifa_hora: e.tarifa_hora || 50,
                facturable: e.facturable !== false,
                importe: (e.horas || 0) * (e.tarifa_hora || 50),
            }
        })

        // Monthly summary
        const monthData = (monthEntries || []).map(e => {
            const client = e.clients as any
            const clientName = client
                ? (client.company_name || `${client.first_name || ""} ${client.last_name || ""}`).trim()
                : "Sin cliente"
            return {
                client: clientName,
                horas: e.horas || 0,
                importe: (e.horas || 0) * (e.tarifa_hora || 50),
                facturable: e.facturable !== false,
            }
        })

        const totalHorasMes = monthData.reduce((acc, e) => acc + e.horas, 0)
        const totalFacturado = monthData
            .filter(e => e.facturable)
            .reduce((acc, e) => acc + e.importe, 0)

        // Hours per client
        const horasPorCliente: Record<string, { horas: number; importe: number }> = {}
        for (const e of monthData) {
            if (!horasPorCliente[e.client]) {
                horasPorCliente[e.client] = { horas: 0, importe: 0 }
            }
            horasPorCliente[e.client].horas += e.horas
            horasPorCliente[e.client].importe += e.importe
        }

        const clientSummary = Object.entries(horasPorCliente)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.horas - a.horas)

        return (
            <div className="flex flex-col h-full space-y-6 page-enter">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase italic">Tracking de Horas</h1>
                    <p className="text-muted-foreground text-sm font-medium italic tracking-tight">Registro de tiempo, proyectos y facturación por cliente.</p>
                </div>

                {/* Summary Cards */}
                <TimeSummary
                    totalHorasMes={totalHorasMes}
                    totalFacturado={totalFacturado}
                    clientSummary={clientSummary}
                />

                {/* Tracker Form */}
                <TimeTracker clients={clients} />

                {/* Log Table */}
                <div className="flex-1 bg-card border border-border rounded-2xl shadow-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
                    <TimeLog data={mappedEntries} />
                </div>

                {mappedEntries.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 bg-secondary/5 rounded-2xl border border-dashed border-border/50">
                        <Clock className="h-16 w-16 text-muted-foreground/20 mb-6" />
                        <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest italic opacity-60 text-center">Sin Registros Aún</p>
                        <p className="text-muted-foreground text-xs mt-2 opacity-40">Usa el formulario de arriba para registrar tus primeras horas</p>
                    </div>
                )}
            </div>
        )
    } catch (error: any) {
        console.error("Critical error in HorasPage:", error)
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <div className="p-8 bg-primary/10 border border-primary/30 rounded-2xl shadow-2xl text-center max-w-md">
                    <ShieldAlert className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Error en Horas</h2>
                    <p className="text-muted-foreground mt-2 text-sm">{error?.message || "Error desconocido"}</p>
                </div>
            </div>
        )
    }
}
