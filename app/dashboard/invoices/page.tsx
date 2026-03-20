
import { InvoiceList } from "@/components/invoices/InvoiceList"
import { CreateInvoiceDialog } from "@/components/invoices/CreateInvoiceDialog"
import { Receipt } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { getClientsForInvoiceAction } from "./actions"
import { format } from "date-fns"

export const dynamic = 'force-dynamic'

export default async function InvoicesPage() {
    try {
        const supabase = await createClient()

        const [invoicesResult, clients] = await Promise.all([
            supabase
                .from('invoices')
                .select(`*, clients(first_name, last_name, company_name)`)
                .order('created_at', { ascending: false }),
            getClientsForInvoiceAction(),
        ])

        const { data: invoices, error: invError } = invoicesResult
        if (invError) console.error("Supabase fetch error in InvoicesPage:", invError)

        const mappedInvoices = (invoices || []).map(inv => {
            const client = inv.clients as any
            const clientName = client
                ? (client.company_name || `${client.first_name || ""} ${client.last_name || ""}`).trim()
                : "Cliente Desconocido"

            let formattedDate = 'N/A'
            try {
                if (inv.invoice_date) formattedDate = format(new Date(inv.invoice_date), 'dd/MM/yyyy')
            } catch (_) { }

            return {
                id: inv.id,
                invoice_number: inv.invoice_number || "Draft",
                client: clientName,
                date: formattedDate,
                amount: `${(inv.total || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}€`,
                status: inv.status || 'draft',
                client_id: inv.client_id,
            }
        })

        // Métricas rápidas
        const totalRevenue = (invoices || [])
            .filter(i => i.status === 'paid')
            .reduce((acc, i) => acc + (i.total || 0), 0)
        const pending = (invoices || []).filter(i => i.status === 'sent' || i.status === 'overdue').length
        const drafts = (invoices || []).filter(i => i.status === 'draft').length

        return (
            <div className="flex flex-col h-full space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase italic">Módulo de Facturación</h1>
                        <p className="text-muted-foreground text-sm font-medium italic tracking-tight">Control de revenue y transacciones validadas.</p>
                    </div>
                    <CreateInvoiceDialog clients={clients} />
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-card border border-border rounded-xl p-4">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Revenue Cobrado</p>
                        <p className="text-2xl font-black text-primary">{totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Pendiente Cobro</p>
                        <p className="text-2xl font-black text-yellow-500">{pending}</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-4">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Borradores</p>
                        <p className="text-2xl font-black text-muted-foreground">{drafts}</p>
                    </div>
                </div>

                <div className="flex-1 bg-card border border-border rounded-2xl shadow-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
                    <InvoiceList data={mappedInvoices} />
                </div>

                {mappedInvoices.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 bg-secondary/5 rounded-2xl border border-dashed border-border/50">
                        <Receipt className="h-16 w-16 text-muted-foreground/20 mb-6" />
                        <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest italic opacity-60 text-center">Sin Facturas Aún</p>
                        <p className="text-muted-foreground text-xs mt-2 opacity-40">Crea tu primera factura con el botón de arriba</p>
                    </div>
                )}
            </div>
        )
    } catch (error: any) {
        console.error("Critical error in InvoicesPage:", error)
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <div className="p-8 bg-primary/10 border border-primary/30 rounded-2xl shadow-2xl text-center max-w-md">
                    <Receipt className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Error en Facturación</h2>
                    <p className="text-muted-foreground mt-2 text-sm">{error?.message || "Error desconocido"}</p>
                </div>
            </div>
        )
    }
}
