
import { createClient } from "@/utils/supabase/server"
import { ClientsPipeline } from "@/components/clients/ClientsPipeline"
import { ClientsTable } from "@/components/clients/ClientsTable"
import { CreateClientDialog } from "@/components/clients/CreateClientDialog"
import { ImportClientsDialog } from "@/components/clients/ImportClientsDialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutGrid, List, AlertTriangle, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function ClientsPage() {
    try {
        const supabase = await createClient()

        if (!supabase) {
            throw new Error("SUPABASE_UNAVAILABLE: Las variables de entorno para la base de datos no están configuradas en Vercel.")
        }

        const { data: clients, error } = await supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) console.error("Error fetching clients:", error)

        return (
            <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">Central de Leads</h1>
                        <p className="text-muted-foreground italic text-sm font-medium">SendaIA • Gestión de activos industriales y comerciales.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <ImportClientsDialog />
                        <CreateClientDialog />
                    </div>
                </div>

                <Tabs defaultValue="pipeline" className="w-full">
                    <div className="flex items-center justify-between mb-4 bg-secondary/20 p-1 rounded-xl border border-border/50">
                        <TabsList className="bg-transparent border-none">
                            <TabsTrigger value="pipeline" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-xs uppercase italic tracking-widest px-6">
                                <LayoutGrid className="h-3.5 w-3.5 mr-2" /> Pipeline Flow
                            </TabsTrigger>
                            <TabsTrigger value="list" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-xs uppercase italic tracking-widest px-6">
                                <List className="h-3.5 w-3.5 mr-2" /> Listado Maestro
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="pipeline" className="mt-0 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                        <ClientsPipeline initialClients={clients || []} />
                    </TabsContent>
                    <TabsContent value="list" className="mt-0">
                        <ClientsTable clients={clients || []} />
                    </TabsContent>
                </Tabs>
            </div>
        )
    } catch (error: any) {
        console.error("Critical failure in ClientsPage:", error)
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

                <Link href="/dashboard/clients">
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
