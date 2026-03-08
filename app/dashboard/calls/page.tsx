
import { createAdminClient } from "@/utils/supabase/admin"
import { DataTable } from "@/components/ui/data-table"
import { columns, type Call } from "./columns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Activity, Clock, ShieldAlert, Bot, Brain, Target, ShieldCheck } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { MetricCard } from "@/components/dashboard/MetricCard"
import Link from "next/link"

// FORZAR QUE NO HAYA CACHÉ - ESTO ES CRÍTICO
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CallsPage() {
    try {
        const supabase = await createAdminClient()

        if (!supabase) {
            throw new Error("VOICE_CORE_OFFLINE: Punto de enlace con Supabase no detectado.")
        }

        // Consulta simplificada para asegurar que traemos TODO
        const { data: calls, error } = await supabase
            .from('call_logs')
            .select(`
                *,
                clients (
                    first_name,
                    last_name,
                    company_name,
                    industry
                )
            `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error("Error fetching call_logs:", error)
        }

        const mappedCalls: Call[] = (calls || []).map(call => {
            // Lógica ultra-robusta de nombres
            const clientObj = call.clients as any
            let clientDisplayName = "Número Desconocido"

            if (clientObj) {
                const name = `${clientObj.first_name || ""} ${clientObj.last_name || ""}`.trim()
                clientDisplayName = clientObj.company_name || name || "Cliente sin nombre"
            } else if (call.from_number) {
                clientDisplayName = call.from_number
            } else if (call.intent) {
                clientDisplayName = `Intento: ${call.intent}`
            }

            const secs = call.duration_seconds || 0
            const formatDuration = (s: number) => {
                const mins = Math.floor(s / 60)
                const remainingSecs = s % 60
                return `${mins}:${remainingSecs.toString().padStart(2, '0')}`
            }

            const rawSentiment = (call.sentiment || "Neutral").toLowerCase()
            let sentiment = "Neutral"
            if (rawSentiment.startsWith("pos") || rawSentiment === "positive" || rawSentiment === "positivo") sentiment = "Positive"
            if (rawSentiment.startsWith("neg") || rawSentiment === "negative" || rawSentiment === "negativo") sentiment = "Negative"

            const statusToOutcome: Record<string, string> = {
                'completed': 'Finalizada',
                'no_answer': 'No Contesta',
                'busy': 'Ocupado',
                'failed': 'Fallida',
                'voicemail': 'Buzón'
            }
            const outcome = statusToOutcome[call.status] || call.status || "Finalizada"

            return {
                id: call.id,
                date: call.created_at ? format(new Date(call.created_at), 'dd MMM, HH:mm', { locale: es }) : "Reciente",
                client: clientDisplayName,
                duration: formatDuration(secs),
                sentiment: sentiment as any,
                outcome: outcome,
                industry: (clientObj?.industry) || "Operación IA"
            }
        })

        const totalCalls = mappedCalls.length
        const totalDuration = (calls || []).reduce((acc, curr) => acc + (Number(curr.duration_seconds) || 0), 0)
        const avgDuration = totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0
        const positiveCalls = (calls || []).filter(c => {
            const s = (c.sentiment || "").toLowerCase()
            return s.startsWith("pos") || s === "positive" || s === "positivo"
        }).length
        const sentimentRate = totalCalls > 0 ? Math.round((positiveCalls / totalCalls) * 100) : 0

        return (
            <div className="flex flex-col h-full space-y-8 animate-in fade-in duration-700">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Sistema Biométrico de Voz Activo</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-primary/50">
                            Agentes de Voz
                        </h1>
                        <p className="text-muted-foreground italic text-sm font-medium mt-1">SendaIA • Registro de Interacciones Neuronales en Tiempo Real.</p>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground uppercase font-black tracking-widest bg-secondary/20 px-4 py-2 rounded-xl border border-border/50 shadow-inner">
                        <Activity className="h-3 w-3 text-primary" /> Transmisión En Vivo
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <MetricCard
                        title="Total Interacciones"
                        value={totalCalls.toString()}
                        change="+100%"
                        trend="up"
                        visualIcon={<Phone className="h-5 w-5 text-primary" />}
                    />
                    <MetricCard
                        title="Sentiment Score"
                        value={`${sentimentRate}%`}
                        change="Analizado"
                        trend="up"
                        visualIcon={<Brain className="h-5 w-5 text-primary" />}
                    />
                    <MetricCard
                        title="Tiempo Promedio"
                        value={`${Math.floor(avgDuration / 60)}:${(avgDuration % 60).toString().padStart(2, '0')}`}
                        change="Live"
                        trend="down"
                        visualIcon={<Clock className="h-5 w-5 text-primary" />}
                    />
                </div>

                <Card className="bg-card border-border shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                    <CardHeader className="border-b border-border/10 pb-4">
                        <CardTitle className="text-xs uppercase font-black tracking-widest flex items-center gap-2">
                            <Bot className="h-4 w-4 text-primary" /> Registro de Actividades Recientes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <DataTable columns={columns} data={mappedCalls} />
                    </CardContent>
                </Card>

                <div className="flex items-center justify-center gap-6 py-4 opacity-50">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-3 w-3 text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Encriptación de Transcritura Activa</span>
                    </div>
                    <div className="h-1 w-1 rounded-full bg-border" />
                    <div className="flex items-center gap-2">
                        <Target className="h-3 w-3 text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Analítica de Lead Scoring</span>
                    </div>
                </div>
            </div>
        )
    } catch (e: unknown) {
        const error = e as Error
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
                <h2 className="text-3xl font-black text-white italic uppercase mb-2">Error de Enlace</h2>
                <div className="bg-black/80 rounded-xl p-4 border border-border/50 text-red-400 font-mono text-xs">
                    {error?.message}
                </div>
            </div>
        )
    }
}
