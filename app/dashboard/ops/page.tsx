import { createAdminClient } from "@/utils/supabase/admin"
import { StatusGrid } from "@/components/ops/StatusGrid"
import { CostSummary } from "@/components/ops/CostSummary"
import { AlertLog } from "@/components/ops/AlertLog"
import { Changelog } from "@/components/ops/Changelog"
import { AddProductDialog } from "@/components/ops/AddProductDialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, DollarSign, Bell, GitCommit, AlertTriangle } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function OpsPage() {
  try {
    const supabase = createAdminClient()

    const [monitoringRes, alertasRes, changelogRes] = await Promise.all([
      supabase.from('ops_monitoring').select('*').order('producto', { ascending: true }),
      supabase
        .from('ops_alertas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30),
      supabase
        .from('ops_changelog')
        .select('*')
        .order('commit_date', { ascending: false })
        .limit(50),
    ])

    if (monitoringRes.error) console.error("Error fetching ops_monitoring:", monitoringRes.error)
    if (alertasRes.error) console.error("Error fetching ops_alertas:", alertasRes.error)
    if (changelogRes.error) console.error("Error fetching ops_changelog:", changelogRes.error)

    const productos = monitoringRes.data ?? []
    const alertas = alertasRes.data ?? []
    const changelogs = changelogRes.data ?? []

    const alertCount = alertas.filter(
      (a) => a.estado === 'pendiente' || a.estado === 'en_analisis'
    ).length

    return (
      <div className="flex flex-col h-full space-y-4 md:space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase italic">
              Ops Center
            </h1>
            <p className="text-muted-foreground italic text-sm font-medium">
              SendaIA &bull; Monitorizacion de productos SendaIA
            </p>
          </div>
          <AddProductDialog />
        </div>

        <Tabs defaultValue="estado" className="w-full">
          <div className="flex items-center justify-between mb-4 bg-secondary/20 p-1 rounded-xl border border-border/50">
            <TabsList className="bg-transparent border-none w-full">
              <TabsTrigger
                value="estado"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-xs uppercase italic tracking-widest px-3 md:px-6 flex-1"
              >
                <Activity className="h-3.5 w-3.5 mr-1 md:mr-2 shrink-0" />
                <span className="hidden sm:inline">Estado</span>
                <span className="sm:hidden">Estado</span>
              </TabsTrigger>
              <TabsTrigger
                value="costes"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-xs uppercase italic tracking-widest px-3 md:px-6 flex-1"
              >
                <DollarSign className="h-3.5 w-3.5 mr-1 md:mr-2 shrink-0" />
                <span className="hidden sm:inline">Costes</span>
                <span className="sm:hidden">Costes</span>
              </TabsTrigger>
              <TabsTrigger
                value="alertas"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-xs uppercase italic tracking-widest px-3 md:px-6 flex-1"
              >
                <Bell className="h-3.5 w-3.5 mr-1 md:mr-2 shrink-0" />
                <span className="hidden sm:inline">
                  Alertas{alertCount > 0 && ` (${alertCount})`}
                </span>
                <span className="sm:hidden">
                  Alertas{alertCount > 0 && ` (${alertCount})`}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="changelog"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-xs uppercase italic tracking-widest px-3 md:px-6 flex-1"
              >
                <GitCommit className="h-3.5 w-3.5 mr-1 md:mr-2 shrink-0" />
                <span className="hidden sm:inline">Changelog</span>
                <span className="sm:hidden">Changelog</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="estado" className="mt-0">
            <StatusGrid productos={productos} />
          </TabsContent>

          <TabsContent value="costes" className="mt-0">
            <CostSummary productos={productos} />
          </TabsContent>

          <TabsContent value="alertas" className="mt-0">
            <AlertLog alertas={alertas} />
          </TabsContent>

          <TabsContent value="changelog" className="mt-0">
            <Changelog changelogs={changelogs} />
          </TabsContent>
        </Tabs>
      </div>
    )
  } catch (error) {
    console.error("OpsPage error:", error)
    return (
      <div className="flex flex-col h-full space-y-4 md:space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase italic">
            Ops Center
          </h1>
          <p className="text-muted-foreground italic text-sm font-medium">
            SendaIA &bull; Monitorizacion de productos SendaIA
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <AlertTriangle className="h-10 w-10 mb-3 text-yellow-500" />
          <p className="font-semibold text-white">Error al cargar Ops Center</p>
          <p className="text-sm mt-1">
            {error instanceof Error ? error.message : "Error desconocido"}
          </p>
        </div>
      </div>
    )
  }
}
