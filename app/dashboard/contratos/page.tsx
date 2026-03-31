
import { createClient } from "@/utils/supabase/server"
import { CreateContratoDialog } from "@/components/contratos/CreateContratoDialog"
import { ContratoList } from "@/components/contratos/ContratoList"
import { FileSignature, ShieldAlert } from "lucide-react"
import { getClientsForContratoAction } from "./actions"
import { format } from "date-fns"

export const dynamic = 'force-dynamic'

export default async function ContratosPage() {
    try {
        const supabase = await createClient()

        const [contratosResult, clients] = await Promise.all([
            supabase
                .from('contratos')
                .select(`*, clients(first_name, last_name, company_name)`)
                .order('created_at', { ascending: false }),
            getClientsForContratoAction(),
        ])

        const { data: contratos, error } = contratosResult
        if (error) console.error("Supabase fetch error in ContratosPage:", error)

        const mappedContratos = (contratos || []).map(c => {
            const client = c.clients as any
            const clientName = client
                ? (client.company_name || `${client.first_name || ""} ${client.last_name || ""}`).trim()
                : "Cliente Desconocido"

            let formattedDate = 'N/A'
            try {
                if (c.created_at) formattedDate = format(new Date(c.created_at), 'dd/MM/yyyy')
            } catch (_) { }

            let fechaVencimiento = 'N/A'
            try {
                if (c.fecha_vencimiento) fechaVencimiento = format(new Date(c.fecha_vencimiento), 'dd/MM/yyyy')
            } catch (_) { }

            const modulos = (c.modulos as any[]) || []

            return {
                id: c.id,
                titulo: c.titulo || 'Sin título',
                tipo: c.tipo || 'mercantil',
                client: clientName,
                client_id: c.client_id,
                estado: c.estado || 'borrador',
                fecha_creacion: formattedDate,
                fecha_vencimiento: fechaVencimiento,
                fecha_firma: c.fecha_firma,
                valor_setup: c.valor_setup || 0,
                valor_mensual: c.valor_mensual || 0,
                modulos,
            }
        })

        // Metrics
        const firmados = mappedContratos.filter(c => c.estado === 'firmado').length
        const enviados = mappedContratos.filter(c => c.estado === 'enviado').length
        const borradores = mappedContratos.filter(c => c.estado === 'borrador').length
        const mrr = mappedContratos
            .filter(c => c.estado === 'firmado')
            .reduce((acc, c) => acc + (c.valor_mensual || 0), 0)

        return (
            <div className="flex flex-col h-full space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase italic">Contratos</h1>
                        <p className="text-muted-foreground text-sm font-medium italic tracking-tight">Gestión de acuerdos mercantiles y relaciones comerciales.</p>
                    </div>
                    <CreateContratoDialog clients={clients} />
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-card border border-border rounded-xl p-4">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Firmados</p>
                        <p className="text-2xl font-black text-green-500">{firmados}</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Enviados</p>
                        <p className="text-2xl font-black text-yellow-500">{enviados}</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Borradores</p>
                        <p className="text-2xl font-black text-muted-foreground">{borradores}</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">MRR Firmado</p>
                        <p className="text-2xl font-black text-primary">{mrr.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</p>
                    </div>
                </div>

                <div className="flex-1 bg-card border border-border rounded-2xl shadow-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
                    <ContratoList data={mappedContratos} />
                </div>

                {mappedContratos.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 bg-secondary/5 rounded-2xl border border-dashed border-border/50">
                        <FileSignature className="h-16 w-16 text-muted-foreground/20 mb-6" />
                        <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest italic opacity-60 text-center">Sin Contratos Aún</p>
                        <p className="text-muted-foreground text-xs mt-2 opacity-40">Crea tu primer contrato con el botón de arriba</p>
                    </div>
                )}
            </div>
        )
    } catch (error: any) {
        console.error("Critical error in ContratosPage:", error)
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <div className="p-8 bg-primary/10 border border-primary/30 rounded-2xl shadow-2xl text-center max-w-md">
                    <ShieldAlert className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Error en Contratos</h2>
                    <p className="text-muted-foreground mt-2 text-sm">{error?.message || "Error desconocido"}</p>
                </div>
            </div>
        )
    }
}
