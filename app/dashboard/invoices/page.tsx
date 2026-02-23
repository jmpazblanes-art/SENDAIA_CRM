
import { InvoiceList, Invoice } from "@/components/invoices/InvoiceList"
import { Button } from "@/components/ui/button"
import { Plus, Receipt, AlertCircle } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { format } from "date-fns"

export const dynamic = 'force-dynamic'

export default async function InvoicesPage() {
    try {
        const supabase = await createClient()

        const { data: invoices, error: invError } = await supabase
            .from('invoices')
            .select(`
                *,
                clients (
                    first_name,
                    last_name,
                    company_name
                )
            `)
            .order('created_at', { ascending: false })

        if (invError) {
            console.error("Supabase fetch error in InvoicesPage:", invError)
        }

        const mappedInvoices: Invoice[] = (invoices || []).map(inv => {
            const client = inv.clients as any
            const clientName = client
                ? (client.company_name || `${client.first_name || ""} ${client.last_name || ""}`).trim()
                : "Cliente Desconocido"

            let formattedDate = 'N/A'
            try {
                if (inv.invoice_date) {
                    formattedDate = format(new Date(inv.invoice_date), 'yyyy-MM-dd')
                }
            } catch (e) {
                console.error("Error formatting invoice date:", e)
            }

            return {
                id: inv.id,
                invoice_number: inv.invoice_number || "Draft",
                client: clientName,
                date: formattedDate,
                amount: `${(inv.total || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}€`,
                status: inv.status || 'draft'
            }
        })

        return (
            <div className="flex flex-col h-full space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase italic">Módulo de Facturación</h1>
                        <p className="text-muted-foreground text-sm font-medium italic tracking-tight">Control de revenue y transacciones validadas.</p>
                    </div>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 text-xs font-bold uppercase tracking-widest transition-all">
                        <Plus className="mr-2 h-4 w-4" /> Crear Factura
                    </Button>
                </div>

                <div className="flex-1 bg-card border border-border rounded-2xl shadow-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
                    <InvoiceList data={mappedInvoices} />
                </div>

                {mappedInvoices.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 bg-secondary/5 rounded-2xl border border-dashed border-border/50">
                        <Receipt className="h-16 w-16 text-muted-foreground/20 mb-6" />
                        <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest italic opacity-60 text-center">Sin Flujos de Caja Detectados</p>
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
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Pasarela de Cobro Offline</h2>
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed font-medium">
                        Se ha perdido la sincronización con el gestor de facturación. Los datos financieros están protegidos pero inaccesibles temporalmente.
                    </p>
                    <div className="mt-8 pt-6 border-t border-border/50">
                        <p className="text-[9px] font-mono text-primary/50 uppercase tracking-widest">Error Trace: {error?.message || "Financial Service Disconnected"}</p>
                    </div>
                </div>
            </div>
        )
    }
}
