
import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Phone, Mail, Building2, MapPin, Calendar,
    MessageSquare, Clock, Zap, User,
    ChevronLeft, Edit, AlertCircle, CheckCircle2,
    ShieldAlert
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { AddNoteDialog } from "@/components/clients/AddNoteDialog"

export const dynamic = 'force-dynamic'

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
    try {
        const { id } = await params
        const supabase = await createClient()

        // Fetch client with employee details
        const { data: client, error: clientError } = await supabase
            .from('clients')
            .select(`
                *,
                employees (
                    first_name,
                    last_name
                )
            `)
            .eq('id', id)
            .single()

        if (clientError || !client) {
            console.error("Client not found or fetch error:", clientError)
            notFound()
        }

        // Fetch real notes
        const { data: notes, error: notesError } = await supabase
            .from('lead_notes')
            .select('*')
            .eq('client_id', id)
            .order('created_at', { ascending: false })

        if (notesError) {
            console.error("Notes fetch error:", notesError)
        }

        // Fetch real appointments
        const { data: appointments, error: aptsError } = await supabase
            .from('appointments')
            .select('*')
            .eq('client_id', id)
            .order('start_time', { ascending: false })

        if (aptsError) {
            console.error("Appointments fetch error:", aptsError)
        }

        // Combine activities for timeline
        const activities = [
            ... (notes || []).map(n => ({
                id: n.id,
                type: 'note',
                title: `Nota: ${n.category?.toUpperCase() || 'GENERAL'}`,
                content: n.content,
                date: n.created_at,
                icon: <MessageSquare className="h-3 w-3 text-primary-foreground" />,
                color: 'bg-primary'
            })),
            ... (appointments || []).map(a => ({
                id: a.id,
                type: 'appointment',
                title: `Cita: ${a.type || 'General'}`,
                content: `Estado: ${a.status?.toUpperCase() || 'PENDIENTE'}`,
                date: a.start_time,
                icon: <Calendar className="h-3 w-3 text-white" />,
                color: a.status === 'confirmed' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
            }))
        ].filter(act => act.date).sort((a, b) => {
            try {
                return new Date(b.date).getTime() - new Date(a.date).getTime()
            } catch (e) {
                return 0
            }
        })

        return (
            <div className="flex flex-col h-full space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/clients">
                            <Button variant="ghost" size="icon" className="hover:text-primary transition-all">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase italic">
                                {client.first_name} {client.last_name}
                            </h1>
                            <div className="flex items-center gap-3 mt-1">
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black shadow-[0_0_15px_rgba(201,162,77,0.1)]">
                                    {client.status?.toUpperCase() || 'LEAD'}
                                </Badge>
                                <span className="text-muted-foreground text-[10px] flex items-center gap-1.5 font-bold uppercase tracking-tight">
                                    <Building2 className="h-3 w-3 text-primary" /> {client.company_name}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="border-border hover:bg-secondary/30 text-xs font-bold uppercase transition-all">
                            <Edit className="h-4 w-4 mr-2" /> Editar
                        </Button>
                        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 text-xs font-bold uppercase transition-all border-b-2 border-primary-foreground/20 active:border-b-0">
                            <Zap className="h-4 w-4 mr-2" /> Acción IA
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="bg-card border-border shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                            <CardHeader className="pb-3 px-6">
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary italic">Ficha Técnica</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 px-6">
                                <div className="flex items-center gap-4 group/item">
                                    <div className="h-9 w-9 rounded-xl bg-secondary/50 flex items-center justify-center border border-border group-hover/item:border-primary/50 transition-all">
                                        <Phone className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Contacto Directo</p>
                                        <p className="text-sm font-bold text-foreground">{client.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group/item">
                                    <div className="h-9 w-9 rounded-xl bg-secondary/50 flex items-center justify-center border border-border group-hover/item:border-primary/50 transition-all">
                                        <Mail className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Canal Digital</p>
                                        <p className="text-sm font-bold text-foreground truncate max-w-[180px]">{client.email || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group/item">
                                    <div className="h-9 w-9 rounded-xl bg-secondary/50 flex items-center justify-center border border-border group-hover/item:border-primary/50 transition-all">
                                        <MapPin className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Geo-Localización</p>
                                        <p className="text-sm font-bold text-foreground">{client.city || 'Desconocida'}</p>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-border/50 mt-6 pb-2">
                                    <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-3">Priority Lead Manager</p>
                                    <div className="flex items-center gap-3 bg-secondary/20 p-2 rounded-lg border border-border/50">
                                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20">
                                            {client.employees ? `${(client.employees as any).first_name?.[0] || '?'}${(client.employees as any).last_name?.[0] || '?'}` : 'IA'}
                                        </div>
                                        <span className="text-xs font-bold text-foreground uppercase tracking-tight">
                                            {client.employees ? `${(client.employees as any).first_name || 'Agente'} ${(client.employees as any).last_name || ''}`.trim() : 'Asignación IA'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-card border-border shadow-xl relative overflow-hidden">
                            <CardHeader className="pb-3 px-6">
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary italic">IA Insight & Diagnóstico</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 px-6">
                                <div>
                                    <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-4">Mapeo de Dolor (IA Analysis)</p>
                                    <div className="flex flex-wrap gap-2">
                                        {client.pain_points && client.pain_points.length > 0 ? client.pain_points.map((point: string, i: number) => (
                                            <Badge key={i} variant="secondary" className="bg-secondary/30 text-[9px] border-border font-bold uppercase py-0.5 px-2">
                                                {point}
                                            </Badge>
                                        )) : <span className="text-[10px] italic text-muted-foreground font-medium">No se han detectado fricciones aún.</span>}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1">Opportunity Conversion Score</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="flex-1 h-2 bg-secondary/50 rounded-full overflow-hidden border border-border/30">
                                            <div
                                                className="h-full bg-primary shadow-[0_0_15px_rgba(201,162,77,0.4)] transition-all duration-1000"
                                                style={{ width: `${client.opportunity_score || 0}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-black text-primary italic">{client.opportunity_score || 0}%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <Card className="bg-card border-border shadow-xl min-h-[500px] relative overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 px-6 py-4">
                                <div>
                                    <CardTitle className="text-lg font-black text-foreground uppercase italic tracking-tighter">Historial de Operaciones</CardTitle>
                                    <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Log unificado de inteligencia y eventos.</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <AddNoteDialog clientId={client.id} />
                                </div>
                            </CardHeader>
                            <CardContent className="px-6 py-8">
                                {activities.length > 0 ? (
                                    <div className="space-y-10 relative before:absolute before:inset-0 before:left-[11px] before:w-[1px] before:bg-border/30 before:h-full">
                                        {activities.map((act) => (
                                            <div key={act.id} className="relative pl-10 group">
                                                <span className={`absolute left-0 top-0.5 h-6 w-6 rounded-lg ${act.color} shadow-lg flex items-center justify-center ring-4 ring-background z-10 
                                                    transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                                                    {act.icon}
                                                </span>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-xs font-black text-foreground group-hover:text-primary transition-colors uppercase italic tracking-tight">{act.title}</p>
                                                        <span className="text-[9px] font-black text-muted-foreground bg-secondary/30 px-2 py-0.5 rounded border border-border shadow-sm">
                                                            {(() => {
                                                                try {
                                                                    return format(new Date(act.date), "dd MMM · HH:mm", { locale: es })
                                                                } catch (e) {
                                                                    return "PENDIENTE"
                                                                }
                                                            })()}
                                                        </span>
                                                    </div>
                                                    <div className="mt-1 p-4 bg-secondary/10 rounded-xl border border-border/40 group-hover:border-primary/20 transition-all relative">
                                                        <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed font-medium">{act.content}</p>
                                                        <div className="absolute top-0 right-0 w-8 h-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                                            <Zap className="h-full w-full text-primary" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-64 text-center">
                                        <div className="h-16 w-16 bg-secondary/20 rounded-full flex items-center justify-center mb-4 border border-dashed border-border group hover:scale-110 transition-transform">
                                            <Clock className="h-8 w-8 text-muted-foreground/30" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Silencio Operativo</p>
                                        <p className="text-[10px] text-muted-foreground mt-1 italic">Este canal de lead aún no ha generado pulsos de actividad.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        )
    } catch (error: any) {
        console.error("Critical error in ClientDetailPage:", error)
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <div className="p-8 bg-primary/10 border border-primary/30 rounded-2xl shadow-2xl text-center max-w-md">
                    <ShieldAlert className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Acceso de Lead Interrumpido</h2>
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed font-medium">
                        Se ha producido una excepción al recuperar el expediente del lead. La estructura de datos puede estar corrupta o el servidor no responde.
                    </p>
                    <div className="mt-8 pt-6 border-t border-border/50">
                        <p className="text-[9px] font-mono text-primary/50 uppercase tracking-widest">Error Trace: {error?.message || "Internal Server Error"}</p>
                    </div>
                    <Link href="/dashboard/clients" className="mt-6 inline-block">
                        <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10 font-bold uppercase text-[10px]">
                            Volver al Listado
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }
}
