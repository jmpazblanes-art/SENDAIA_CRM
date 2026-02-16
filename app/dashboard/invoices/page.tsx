
import { InvoiceList, Invoice } from "@/components/invoices/InvoiceList"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { format } from "date-fns"

export const dynamic = 'force-dynamic'

export default async function InvoicesPage() {
    const supabase = await createClient()

    // Assuming no relation yet based on webhook, but if there is client_id we can join

    const { data: invoices } = await supabase
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

    const mappedInvoices: Invoice[] = invoices?.map(inv => {
        const client = inv.clients as any
        const clientName = client
            ? (client.company_name || `${client.first_name} ${client.last_name}`).trim()
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
            status: inv.status
        }
    }) || []

    return (
        <div className="flex flex-col h-full space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Facturación</h1>
                    <p className="text-muted-foreground">Control de ingresos y facturas pendientes.</p>
                </div>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" /> Crear Factura
                </Button>
            </div>

            <div className="flex-1">
                <InvoiceList data={mappedInvoices} />
            </div>
        </div>
    )
}
