
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Phone, Clock, User, FileText, Play, ExternalLink, Calendar, Activity, Zap, Mic2, ShieldCheck, Waves } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"

export const dynamic = 'force-dynamic'

const columns: ColumnDef<any>[] = [
    {
        accessorKey: "created_at",
        header: "Fecha & Hora",

        cell: ({ row }) => {
            const date = row.original.created_at ? new Date(row.original.created_at) : null
            return (
                <div className="flex flex-col">
                    <span className="font-bold text-foreground">
                        {date ? format(date, "d MMM", { locale: es }) : "S/F"}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                        {date ? format(date, "HH:mm:ss") : "--:--:--"}
                    </span>
                </div>
            )
        }
    },
    {
        accessorKey: "client",
        header: "Sujeto / Empresa",
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center relative overflow-hidden group">
                    <User className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground">{row.original.client_name}</span>
                    <span className="text-[10px] text-muted-foreground italic truncate max-w-[150px]">{row.original.industry || "Operación IA"}</span>
                </div>
            </div>
        )
    },
    {
        accessorKey: "duration",
        header: "Duración",
        cell: ({ row }) => {
            const seconds = row.original.duration_seconds
            const mins = Math.floor(seconds / 60)
            const secs = seconds % 60
            return (
                <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-mono font-bold">{mins}:{secs.toString().padStart(2, '0')}</span>
                </div>
            )
        }
    },
    {
        accessorKey: "sentiment",
        header: "Análisis Sentimiento",
        cell: ({ row }) => {
            const s = row.original.sentiment
            return (
                <Badge
                    variant="outline"
                    className={`text-[9px] font-black uppercase tracking-tighter ${s === 'positive' ? "border-green-500/30 text-green-500 bg-green-500/5 shadow-[0_0_10px_rgba(34,197,94,0.05)]" :
                        s === 'negative' ? "border-red-500/30 text-red-500 bg-red-500/5" : "border-primary/30 text-primary bg-primary/5"
                        }`}
                >
                    {s || 'neutral'}
                </Badge>
            )
        }
    },
    {
        accessorKey: "outcome",
        header: "Resolución",
        cell: ({ row }) => (
            <Badge variant="secondary" className={`text-[10px] font-bold ${(row.original.status || 'pending') === 'completed' ? "bg-secondary text-primary border border-primary/20" : "bg-destructive/10 text-destructive border border-destructive/20"
                }`}>
                {(row.original.status || 'PENDIENTE').toUpperCase()}
            </Badge>
        )
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-primary/20 hover:text-primary transition-colors">
                    <Play className="h-4 w-4 fill-current" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-primary/20 hover:text-primary transition-colors">
                    <FileText className="h-4 w-4" />
                </Button>
            </div>
        )
    }
]

export default async function CallsPage() {
    const supabase = await createClient()

    const { data: calls } = await supabase
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

    const mappedCalls = calls?.map(call => ({
        ...call,
        //@ts-ignore
        industry: call.clients?.industry,
        client_name: call.clients
            ? //@ts-ignore
            (call.clients.company_name || `${call.clients.first_name} ${call.clients.last_name}`)
            : "Número Desconocido"
    })) || []

    return (
        <div className="flex flex-col h-full space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl border border-primary/30 shadow-[0_0_20px_rgba(201,162,77,0.1)] relative overflow-hidden group">
                        <Mic2 className="h-7 w-7 text-primary relative z-10" />
                        <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">SendaIA Voice Control</h1>
                        <p className="text-muted-foreground italic text-sm font-medium">Monitor de Agentes de Voz en tiempo real.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="border-border hover:bg-secondary/30 hidden lg:flex">
                        <Waves className="h-4 w-4 mr-2 text-primary" /> Audio Logs
                    </Button>
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold border-b-2 border-primary-foreground/20 active:border-b-0 transition-all">
                        <ExternalLink className="h-4 w-4 mr-2" /> Retell Console
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    <Card className="bg-card border-border hover:border-primary/30 transition-all group overflow-hidden relative">
                        <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Phone className="h-20 w-20" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Flujo 24h</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end gap-2">
                                <p className="text-4xl font-black text-foreground">{mappedCalls.length}</p>
                                <p className="text-[11px] font-bold text-green-500 pb-1">+12 hoy</p>
                            </div>
                            <div className="mt-4 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-[65%]" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border hover:border-primary/30 transition-all group overflow-hidden relative">
                        <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Zap className="h-20 w-20" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Ahorro Humano</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end gap-2">
                                <p className="text-4xl font-black text-primary">18.5h</p>
                                <p className="text-[11px] font-bold text-muted-foreground pb-1 italic leading-none">Esta semana</p>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-2 font-medium">Equivalente a <span className="text-foreground font-bold">2.3 jornadas</span> de trabajo.</p>
                        </CardContent>
                    </Card>

                    <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest">IA Verificada</span>
                        </div>
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    </div>
                </div>

                <div className="lg:col-span-3 bg-card border border-border rounded-2xl overflow-hidden shadow-2xl relative">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                    <DataTable columns={columns} data={mappedCalls} />
                </div>
            </div>
        </div>
    )
}
