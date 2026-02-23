
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, Link2, Settings, Play, CheckCircle2, AlertCircle, RefreshCw, Activity, Terminal, Brain, ShieldCheck, Clock } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export const dynamic = 'force-dynamic'

export default async function AutomationsPage() {
    try {
        const supabase = await createClient()

        const { data: runs, error: runsError } = await supabase
            .from('automation_runs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10)

        if (runsError) {
            console.error("Supabase fetch error in AutomationsPage:", runsError)
        }

        const workflows = [
            {
                id: '1',
                name: 'Cerebro Ingesta de Leads',
                target: 'n8n + OpenAI',
                status: 'active',
                type: 'CORE',
                description: 'Recibe datos brutos de RRSS y web, califica el lead mediante IA y asigna prioridad comercial.'
            },
            {
                id: '2',
                name: 'Agente de Voz Operativo',
                target: 'Retell AI / n8n',
                status: 'active',
                type: 'VOICE',
                description: 'Gestiona la agenda de SendaIA 24/7. Capaz de cancelar, mover y confirmar citas por voz.'
            },
            {
                id: '3',
                name: 'Generador de Propuesta Técnica',
                target: 'n8n + GPT-4o',
                status: 'inactive',
                type: 'SALES',
                description: 'Analiza el diagnóstico de la cita y genera un PDF profesional con la estrategia propuesta.'
            },
            {
                id: '4',
                name: 'Seguimiento Omnicanal IA',
                target: 'n8n + WhatsApp',
                status: 'active',
                type: 'REMARKETING',
                description: 'Envía mensajes personalizados de seguimiento basados en el estado del lead en el pipeline.'
            },
            {
                id: '5',
                name: 'Sincronizador GHL Funnels',
                target: 'GoHighLevel + CRM',
                status: 'active',
                type: 'INTEGRATION',
                description: 'Recibe datos en tiempo real de demo.sendaia.es y los mapea directamente al pipeline de ventas.'
            }
        ]

        return (
            <div className="flex flex-col h-full space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl border border-primary/30 shadow-[0_0_25px_rgba(201,162,77,0.15)] animate-pulse">
                            <Zap className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">SendaIA Brain</h1>
                            <p className="text-muted-foreground italic text-sm font-medium tracking-tight">Centro de Mando Operativo: Automatizaciones Internas y Agentes IA.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-secondary/10 border border-border rounded-lg mr-2">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-green-500" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Integridad Sistema: 100%</span>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="border-border hover:bg-secondary/30 transition-all">
                            <RefreshCw className="h-4 w-4 mr-2" /> Sincronizar
                        </Button>
                        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 font-bold border-b-2 border-primary-foreground/20 active:border-b-0 transition-all">
                            <Settings className="h-4 w-4 mr-2" /> n8n Panel
                        </Button>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-12">
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <Terminal className="h-5 w-5 text-primary" /> Workflows de Agencia
                            </h2>
                            <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest text-primary border-primary/30">Motor Interno SendaIA</Badge>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {workflows.map(wf => (
                                <Card key={wf.id} className="bg-card border-border hover:border-primary/50 transition-all group relative overflow-hidden flex flex-col">
                                    <div className={`absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors`} />
                                    <CardHeader className="flex flex-row items-start justify-between pb-3 relative z-10">
                                        <div className="space-y-1">
                                            <Badge variant="secondary" className="text-[9px] font-black uppercase mb-1 bg-secondary text-muted-foreground">
                                                {wf.type}
                                            </Badge>
                                            <CardTitle className="text-md group-hover:text-primary transition-colors font-bold">
                                                {wf.name}
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-2 text-[10px] uppercase font-bold text-muted-foreground">
                                                <Link2 className="h-3 w-3 text-primary/70" /> {wf.target}
                                            </CardDescription>
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className={
                                                wf.status === 'active'
                                                    ? "bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]"
                                                    : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                                            }
                                        >
                                            <div className={`h-1.5 w-1.5 rounded-full mr-1.5 ${wf.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                                            <span className="text-[9px] font-bold">{wf.status.toUpperCase()}</span>
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="flex-1 flex flex-col relative z-10">
                                        <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                                            {wf.description}
                                        </p>
                                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="h-5 w-5 rounded-full bg-secondary border border-background flex items-center justify-center">
                                                        <Activity className="h-2.5 w-2.5 text-primary/50" />
                                                    </div>
                                                ))}
                                            </div>
                                            <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                                CONFIGURACIÓN <Play className="ml-2 h-3 w-3 fill-current" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <Card className="bg-gradient-to-r from-primary/5 to-transparent border-primary/20 border-dashed relative overflow-hidden">
                            <Brain className="absolute -bottom-6 -right-6 h-32 w-32 text-primary/5 rotate-12" />
                            <CardHeader>
                                <CardTitle className="text-md font-bold text-primary italic uppercase tracking-widest flex items-center gap-2">
                                    <Settings className="h-4 w-4" /> Endpoints del Motor (n8n hooks)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 relative z-10">
                                {[
                                    { name: "Ingreso Leads n8n", url: "https://n8n.sendaia.es/webhook/incoming-lead", icon: Zap },
                                    { name: "Webhook GHL Directo", url: "/api/webhooks/ghl", icon: Link2 },
                                    { name: "Agente Voz LOG", url: "https://n8n.sendaia.es/webhook/log-call", icon: Activity }
                                ].map((hook, i) => (
                                    <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 bg-background/50 p-2 rounded-lg border border-border/50">
                                        <div className="flex items-center gap-2 min-w-[140px]">
                                            <hook.icon className="h-3.5 w-3.5 text-primary" />
                                            <span className="text-[10px] font-black text-muted-foreground uppercase">{hook.name}</span>
                                        </div>
                                        <div className="flex-1 p-1 px-3 bg-secondary/30 rounded border border-border/50 font-mono text-[10px] truncate text-primary/80">
                                            {hook.url}
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-8 px-4 text-[10px] font-bold uppercase transition-all hover:bg-primary hover:text-primary-foreground">
                                            Copia URL
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        <h2 className="text-lg font-bold text-foreground">Monitor en Tiempo Real</h2>
                        <Card className="bg-card border-border shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                            <CardContent className="p-0">
                                <div className="divide-y divide-border">
                                    {runs && Array.isArray(runs) && runs.length > 0 ? (
                                        runs.map((run) => (
                                            <div key={run.id} className="p-4 flex items-center justify-between group hover:bg-secondary/10 transition-colors">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`h-1.5 w-1.5 rounded-full ${run.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                                                        <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors underline decoration-primary/20">{run.name}</p>
                                                    </div>

                                                    <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                                                        <Clock className="h-3 w-3" /> {(() => {
                                                            try {
                                                                return run.started_at ? formatDistanceToNow(new Date(run.started_at), { addSuffix: true, locale: es }) : 'Tiempo desconocido'
                                                            } catch (e) {
                                                                return 'Recientemente'
                                                            }
                                                        })()}
                                                    </p>
                                                </div>

                                                <Badge variant="outline" className={
                                                    (run.status || 'pending') === 'success' ? "border-green-500/30 text-green-500 bg-green-500/5 text-[9px] font-black" : "border-red-500/30 text-red-500 bg-red-500/5 text-[9px] font-black"
                                                }>
                                                    {(run.status || 'PENDIENTE').toUpperCase()}
                                                </Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-12 text-center">
                                            <div className="h-16 w-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-border group hover:scale-110 transition-transform">
                                                <RefreshCw className="h-8 w-8 text-muted-foreground/30 animate-spin-slow" />
                                            </div>
                                            <p className="text-xs text-muted-foreground italic font-medium uppercase tracking-widest">Esperando pulsos del sistema...</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-2 gap-4">
                            <Card className="bg-secondary/10 border-border p-4">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1 italic">Tasa Éxito</p>
                                <p className="text-2xl font-black text-primary">98.4%</p>
                            </Card>
                            <Card className="bg-secondary/10 border-border p-4">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1 italic">Uptime AI</p>
                                <p className="text-2xl font-black text-green-500">22d</p>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        )
    } catch (error: any) {
        console.error("Critical error in AutomationsPage:", error)
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <div className="p-6 bg-primary/10 border border-primary/30 rounded-2xl shadow-2xl text-center max-w-md">
                    <Brain className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">SendaIA Brain Fuera de Línea</h2>
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                        No se han podido cargar los flujos estratégicos. El motor n8n o la base de datos no responden.
                    </p>
                    <div className="mt-6 pt-6 border-t border-border/50">
                        <p className="text-[9px] font-mono text-primary/50 uppercase tracking-widest">Error Trace: {error?.message || "Internal Server Error"}</p>
                    </div>
                </div>
            </div>
        )
    }
}
