
import { createClient } from "@/utils/supabase/server"
import { getClientsForPresupuesto } from "./actions"
import { PresupuestosList } from "@/components/presupuestos/PresupuestosList"
import { CreatePresupuestoDialog } from "@/components/presupuestos/CreatePresupuestoDialog"
import { FileText } from "lucide-react"
import { format } from "date-fns"

export const dynamic = 'force-dynamic'

export default async function PresupuestosPage() {
    try {
        const supabase = await createClient()

        const [presupuestosResult, clients] = await Promise.all([
            supabase
                .from('presupuestos')
                .select(`*, clients(first_name, last_name, company_name)`)
                .order('created_at', { ascending: false }),
            getClientsForPresupuesto(),
        ])

        const { data: presupuestos, error: pError } = presupuestosResult
        if (pError) console.error("Supabase fetch error in PresupuestosPage:", pError)

        const mappedPresupuestos = (presupuestos || []).map(p => {
            const client = p.clients as any
            const clientName = client
                ? (client.company_name || `${client.first_name || ""} ${client.last_name || ""}`).trim()
                : "Cliente Desconocido"

            let formattedDate = 'N/A'
            try {
                if (p.created_at) formattedDate = format(new Date(p.created_at), 'dd/MM/yyyy')
            } catch (_) { }

            return {
                id: p.id,
                numero: p.numero || "Borrador",
                cliente: clientName,
                titulo: p.titulo,
                total: `${(p.total || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}€`,
                estado: p.estado || 'borrador',
                fecha: formattedDate,
            }
        })

        // Metricas
        const totalAceptados = (presupuestos || [])
            .filter(p => p.estado === 'aceptado' || p.estado === 'facturado')
            .reduce((acc, p) => acc + (parseFloat(p.total) || 0), 0)
        const pendientes = (presupuestos || []).filter(p => p.estado === 'enviado').length
        const borradores = (presupuestos || []).filter(p => p.estado === 'borrador').length

        return (
            <div className="flex flex-col h-full space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase italic">Presupuestos</h1>
                        <p className="text-muted-foreground text-sm font-medium italic tracking-tight">Gestiona propuestas y cotizaciones para tus clientes.</p>
                    </div>
                    <CreatePresupuestoDialog clients={clients} />
                </div>

                {/* Metricas */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-card border border-border rounded-xl p-4">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Aceptados / Facturados</p>
                        <p className="text-2xl font-black text-primary">{totalAceptados.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Pendiente Respuesta</p>
                        <p className="text-2xl font-black text-blue-500">{pendientes}</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Borradores</p>
                        <p className="text-2xl font-black text-muted-foreground">{borradores}</p>
                    </div>
                </div>

                <div className="flex-1 bg-card border border-border rounded-2xl shadow-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
                    <PresupuestosList data={mappedPresupuestos} />
                </div>

                {mappedPresupuestos.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 bg-secondary/5 rounded-2xl border border-dashed border-border/50">
                        <FileText className="h-16 w-16 text-muted-foreground/20 mb-6" />
                        <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest italic opacity-60 text-center">Sin Presupuestos</p>
                        <p className="text-muted-foreground text-xs mt-2 opacity-40">Crea tu primer presupuesto con el boton de arriba</p>
                    </div>
                )}
            </div>
        )
    } catch (error: any) {
        console.error("Critical error in PresupuestosPage:", error)
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <div className="p-8 bg-primary/10 border border-primary/30 rounded-2xl shadow-2xl text-center max-w-md">
                    <FileText className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Error en Presupuestos</h2>
                    <p className="text-muted-foreground mt-2 text-sm">{error?.message || "Error desconocido"}</p>
                </div>
            </div>
        )
    }
}
