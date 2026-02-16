
import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Phone, Mail, Building2, MapPin, Calendar,
    MessageSquare, Clock, Zap, User,
    ChevronLeft, Edit, AlertCircle, CheckCircle2
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { AddNoteDialog } from "@/components/clients/AddNoteDialog"

export const dynamic = 'force-dynamic'

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch client with employee details
    const { data: client } = await supabase
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

    if (!client) {
        notFound()
    }

    // Fetch real notes
    const { data: notes } = await supabase
        .from('lead_notes')
        .select('*')
        .eq('client_id', id)
        .order('created_at', { ascending: false })

    // Fetch real appointments
    const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('client_id', id)
        .order('start_time', { ascending: false })

    // Combine activities for timeline
    const activities = [
        ... (notes?.map(n => ({
            id: n.id,
            type: 'note',
            title: `Nota: ${n.category.toUpperCase()}`,
            content: n.content,
            date: n.created_at,
            icon: <MessageSquare className="h-3 w-3 text-primary-foreground" />,
            color: 'bg-primary'
        })) || []),
        ... (appointments?.map(a => ({
            id: a.id,
            type: 'appointment',
            title: `Cita: ${a.type || 'General'}`,
            content: `Estado: ${a.status.toUpperCase()}`,
            date: a.start_time,
            icon: <Calendar className="h-3 w-3 text-white" />,
            color: a.status === 'confirmed' ? 'bg-green-500' : 'bg-blue-500'
        })) || [])
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
                        <Button variant="ghost" size="icon" className="hover:text-primary">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">
                            {client.first_name} {client.last_name}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">
                                {client.status.toUpperCase()}
                            </Badge>
                            <span className="text-muted-foreground text-xs flex items-center gap-1">
                                <Building2 className="h-3 w-3" /> {client.company_name}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="border-border">
                        <Edit className="h-4 w-4 mr-2" /> Editar
                    </Button>
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Zap className="h-4 w-4 mr-2" /> Acción IA
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <Card className="bg-card border-border shadow-xl">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Información</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                                    <Phone className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Teléfono</p>
                                    <p className="text-sm font-medium">{client.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                                    <Mail className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Email</p>
                                    <p className="text-sm font-medium truncate max-w-[180px]">{client.email || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                                    <MapPin className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Ubicación</p>
                                    <p className="text-sm font-medium">{client.city || 'Desconocida'}</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-border mt-4">
                                <p className="text-[10px] text-muted-foreground uppercase font-bold mb-2">Responsable SendaIA</p>
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                                        {client.employees ? `${(client.employees as any).first_name?.[0] || '?'}${(client.employees as any).last_name?.[0] || '?'}` : '??'}
                                    </div>
                                    <span className="text-sm font-bold text-foreground">
                                        {client.employees ? `${(client.employees as any).first_name || 'Agente'} ${(client.employees as any).last_name || ''}`.trim() : 'Sin asignar'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border shadow-xl">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Diagnóstico Comercial</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold mb-2">Puntos de Dolor</p>
                                <div className="flex flex-wrap gap-2">
                                    {client.pain_points?.map((point: string, i: number) => (
                                        <Badge key={i} variant="secondary" className="bg-secondary/30 text-[10px] border-border">
                                            {point}
                                        </Badge>
                                    )) || <span className="text-xs italic text-muted-foreground">Analizando...</span>}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Opportunity Score</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary shadow-[0_0_10px_rgba(201,162,77,0.5)] transition-all duration-1000"
                                            style={{ width: `${client.opportunity_score || 0}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-bold text-primary">{client.opportunity_score || 0}%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-card border-border shadow-xl min-h-[500px]">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
                            <div>
                                <CardTitle className="text-lg font-bold text-foreground">Línea de Tiempo del Cliente</CardTitle>
                                <CardDescription className="text-xs italic text-muted-foreground">Historial unificado de notas y citas.</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <AddNoteDialog clientId={client.id} />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-8">
                            {activities.length > 0 ? (
                                <div className="space-y-8 relative before:absolute before:inset-0 before:left-[11px] before:w-[1px] before:bg-border/50 before:h-full">
                                    {activities.map((act) => (
                                        <div key={act.id} className="relative pl-8 group">
                                            <span className={`absolute left-0 top-1 h-6 w-6 rounded-full ${act.color} shadow-lg flex items-center justify-center ring-4 ring-background z-10 
                                                transition-transform group-hover:scale-110`}>
                                                {act.icon}
                                            </span>
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{act.title}</p>
                                                    <span className="text-[10px] font-mono text-muted-foreground bg-secondary/30 px-2 py-0.5 rounded border border-border">
                                                        {(() => {
                                                            try {
                                                                return format(new Date(act.date), "dd MMM, HH:mm", { locale: es })
                                                            } catch (e) {
                                                                return "S/F"
                                                            }
                                                        })()}
                                                    </span>
                                                </div>
                                                <div className="mt-1 p-3 bg-secondary/10 rounded-md border border-border/30 group-hover:border-primary/20 transition-all">
                                                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">{act.content}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full py-20 text-center opacity-50">
                                    <Clock className="h-10 w-10 text-muted-foreground mb-4" />
                                    <p className="text-sm italic">No hay actividad registrada para este cliente.</p>
                                    <p className="text-[10px] uppercase font-bold tracking-widest mt-2">Usa el botón superior para añadir notas</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
