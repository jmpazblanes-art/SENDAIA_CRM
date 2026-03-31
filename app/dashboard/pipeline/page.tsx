
import { createAdminClient } from "@/utils/supabase/admin"
import { KanbanBoard } from "@/components/pipeline/KanbanBoard"
import { Database, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function PipelinePage() {
    try {
        const supabase = createAdminClient()
        const { data: clients, error } = await supabase
            .from('clients')
            .select('id, first_name, last_name, company_name, email, phone, status, priority, source, created_at')
            .order('created_at', { ascending: false })

        if (error) console.error("Error fetching clients for pipeline:", error)

        return (
            <div className="flex flex-col h-full space-y-4 md:space-y-6 animate-in fade-in duration-500 page-enter">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase italic">
                        Pipeline
                    </h1>
                    <p className="text-muted-foreground italic text-sm font-medium">
                        SendaIA &bull; Pipeline de ventas
                    </p>
                </div>
                <KanbanBoard initialClients={clients || []} />
            </div>
        )
    } catch (error: any) {
        console.error("Critical failure in PipelinePage:", error)
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-in zoom-in-95 duration-500">
                <div className="relative mb-6">
                    <Database className="h-16 w-16 text-red-500 animate-pulse" />
                    <div className="absolute inset-0 bg-red-500/20 blur-[30px] rounded-full scale-150 opacity-20" />
                </div>

                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">Base de Datos Desconectada</h2>
                <p className="text-muted-foreground text-sm max-w-sm mb-8">
                    No se ha podido establecer contacto con el servidor de datos central de SendaIA.
                </p>

                <div className="w-full max-w-md bg-black/60 rounded-xl p-4 text-left border border-red-500/20 shadow-2xl">
                    <p className="text-[10px] font-mono text-primary uppercase tracking-widest mb-1 opacity-70">Error Trace:</p>
                    <code className="text-[10px] font-mono text-red-400 break-all leading-tight">
                        {error?.message || "CON_TIMEOUT: Error de conexión"}
                    </code>
                </div>

                <Link href="/dashboard/pipeline">
                    <Button
                        variant="outline"
                        className="mt-8 text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary hover:bg-primary/5"
                    >
                        Reiniciar Protocolo de Conexión
                    </Button>
                </Link>
            </div>
        )
    }
}
