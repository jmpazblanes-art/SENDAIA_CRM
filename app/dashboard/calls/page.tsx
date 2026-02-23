
import { createClient } from "@/utils/supabase/server"
import { DataTable } from "@/components/ui/data-table"
import { columns, type Call } from "./columns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Activity, Clock, ShieldAlert, Bot } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function CallsPage() {
    try {
        const supabase = await createClient()

        if (!supabase) {
            throw new Error("VOICE_CORE_OFFLINE: Punto de enlace con Supabase no detectado. Los Agentes de Voz requieren conexión neuronal activa.")
        }

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

        console.log(`[CallsPage] Conexión establecida. Registros recuperados: ${calls?.length || 0}`)

        if (error) {
            console.error("Error fetching call_logs:", error)
            // Si el error es que la tabla no existe, lanzamos un error más descriptivo
            if (error.code === '42P01') {
                throw new Error("DATABASE_SCHEMA_MISMATCH: La tabla 'call_logs' no existe en el núcleo de datos.")
            }
        }

        const mappedCalls: Call[] = (calls || []).map(call => {
            const clientData = call.clients as any

            // Entidad de cliente: puede ser objeto o array de un elemento (Supabase join behavior)
            const clientObj = Array.isArray(clientData) ? clientData[0] : clientData

            // Extracción segura de industria
            const industry = clientObj?.industry || "Operación IA"

            // Extracción segura de nombre de cliente
            const clientName = clientObj
                ? (clientObj.company_name || `${clientObj.first_name || ""} ${clientObj.last_name || ""}`).trim()
                : (call.from_number || "Número Desconocido")

            // Formatear duración (de segundos a mm:ss)
            const secs = call.duration_seconds || 0
            const formatDuration = (s: number) => {
                const mins = Math.floor(s / 60)
                const remainingSecs = s % 60
                return `${mins}:${remainingSecs.toString().padStart(2, '0')}`
            }

            // Normalización de Sentiment (handle English/Spanish variants)
            const rawSentiment = (call.sentiment || "Neutral").toLowerCase()
            let sentiment = "Neutral"
            if (rawSentiment.startsWith("pos") || rawSentiment === "positive" || rawSentiment === "positivo") sentiment = "Positive"
            if (rawSentiment.startsWith("neg") || rawSentiment === "negative" || rawSentiment === "negativo") sentiment = "Negative"

            // Mapeo de Status a Outcome
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
                client: clientName || "Desconocido",
                duration: formatDuration(secs),
                sentiment: sentiment,
                outcome: outcome,
                industry: industry
            }
        })

        return (
            <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">Agentes de Voz</h1>
                        <p className="text-muted-foreground italic text-sm font-medium">SendaIA • Monitorización de flujos de voz y síntesis neuronal.</p>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-primary uppercase font-black tracking-widest bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 animate-pulse">
                        Sistema Activo • 2 Nodos Online
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="bg-card border-border shadow-xl">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Total Llamadas</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <p className="text-3xl font-black text-white">{mappedCalls.length}</p>
                            <Phone className="h-8 w-8 text-primary/40" />
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border shadow-xl">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Sentiment Score</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <p className="text-3xl font-black text-primary">88%</p>
                            <Activity className="h-8 w-8 text-primary/40" />
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border shadow-xl">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Tiempo de Respuesta</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <p className="text-3xl font-black text-white">0.8s</p>
                            <Clock className="h-8 w-8 text-primary/40" />
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-card border-border shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                    <CardHeader>
                        <CardTitle className="text-sm uppercase font-black tracking-widest flex items-center gap-2">
                            <Bot className="h-4 w-4 text-primary" /> Registro de Interacciones Neuronales
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable columns={columns} data={mappedCalls} />
                    </CardContent>
                </Card>
            </div>
        )
    } catch (e: unknown) {
        const error = e as Error
        console.error("Critical failure in CallsPage:", error)
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-in zoom-in-95 duration-500">
                <div className="relative mb-6">
                    <div className="h-24 w-24 bg-red-500/10 rounded-full border border-red-500/20 flex items-center justify-center animate-pulse">
                        <ShieldAlert className="h-12 w-12 text-red-500" />
                    </div>
                    <div className="absolute inset-0 bg-red-500/20 blur-[40px] rounded-full scale-150 opacity-20" />
                </div>

                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2 italic">Fallo en Agentes de Voz</h2>
                <p className="text-muted-foreground text-sm max-w-sm mb-8 leading-relaxed">
                    El sistema de comunicación por voz no puede acceder al núcleo de datos Supabase.
                </p>

                <div className="w-full max-w-md bg-secondary/30 backdrop-blur-xl rounded-2xl p-6 text-left border border-red-500/30 shadow-2xl">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                        <p className="text-[10px] font-mono text-primary uppercase tracking-[0.2em] font-black">Error Diagnostic Check</p>
                    </div>
                    <div className="bg-black/80 rounded-xl p-4 border border-border/50">
                        <code className="text-[11px] font-mono text-red-400 break-all leading-tight">
                            {error?.message || "SYNAPSE_CONNECTION_ERROR"}
                        </code>
                    </div>
                    <p className="mt-4 text-[9px] text-muted-foreground italic text-center">
                        SendaIA: Verifique las variables de entorno para restaurar el servicio de voz.
                    </p>
                </div>

                <Link href="/dashboard/calls">
                    <Button
                        variant="link"
                        className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 hover:text-primary transition-colors"
                    >
                        Reintentar Enlace
                    </Button>
                </Link>
            </div>
        )
    }
}
