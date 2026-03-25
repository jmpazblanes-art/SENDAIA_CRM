"use client"

import { ClientCard, Client } from "./ClientCard"
import { Zap, Users, Star, CheckCircle2, TrendingUp } from "lucide-react"

interface ClientPipelineProps {
    data: Client[]
}

const columns = [
    {
        id: 'lead',
        label: 'Leads',
        sublabel: 'Nuevas oportunidades',
        icon: Zap,
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/5',
        border: 'border-yellow-500/20',
        accent: 'bg-yellow-500',
        headerGlow: 'shadow-[0_0_20px_rgba(234,179,8,0.08)]',
    },
    {
        id: 'qualified',
        label: 'Cualificados',
        sublabel: 'En evaluación',
        icon: Star,
        color: 'text-blue-400',
        bg: 'bg-blue-500/5',
        border: 'border-blue-500/20',
        accent: 'bg-blue-500',
        headerGlow: 'shadow-[0_0_20px_rgba(59,130,246,0.08)]',
    },
    {
        id: 'active',
        label: 'Activos',
        sublabel: 'Proyectos en curso',
        icon: TrendingUp,
        color: 'text-green-400',
        bg: 'bg-green-500/5',
        border: 'border-green-500/20',
        accent: 'bg-green-500',
        headerGlow: 'shadow-[0_0_20px_rgba(34,197,94,0.08)]',
    },
    {
        id: 'closed',
        label: 'Cerrados',
        sublabel: 'Deals ganados',
        icon: CheckCircle2,
        color: 'text-primary',
        bg: 'bg-primary/5',
        border: 'border-primary/20',
        accent: 'bg-primary',
        headerGlow: 'shadow-[0_0_20px_rgba(201,162,77,0.08)]',
    },
]

export function ClientPipeline({ data }: ClientPipelineProps) {
    return (
        <div className="flex gap-3 md:gap-5 overflow-x-auto pb-4 min-h-[400px] md:min-h-[500px] -mx-1 px-1 snap-x snap-mandatory md:snap-none">
            {columns.map(col => {
                const colClients = data.filter(c => c.status === col.id)
                const Icon = col.icon

                return (
                    <div
                        key={col.id}
                        className={`flex-1 min-w-[220px] md:min-w-[260px] max-w-[320px] flex flex-col rounded-2xl border ${col.border} ${col.bg} overflow-hidden ${col.headerGlow} snap-start`}
                    >
                        {/* Column Header */}
                        <div className="px-4 pt-4 pb-3">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-lg bg-card border border-border/50`}>
                                        <Icon className={`h-3.5 w-3.5 ${col.color}`} />
                                    </div>
                                    <span className={`text-xs font-black uppercase tracking-widest ${col.color}`}>
                                        {col.label}
                                    </span>
                                </div>
                                <div className={`h-6 min-w-6 px-2 rounded-full ${col.accent}/10 border ${col.border} flex items-center justify-center`}>
                                    <span className={`text-[11px] font-black ${col.color}`}>
                                        {colClients.length}
                                    </span>
                                </div>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium pl-9 opacity-60">
                                {col.sublabel}
                            </p>
                        </div>

                        {/* Divider */}
                        <div className={`h-px mx-4 ${col.accent}/20`} style={{ background: `linear-gradient(to right, transparent, currentColor, transparent)` }} />

                        {/* Cards */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                            {colClients.map(client => (
                                <ClientCard key={client.id} client={client} />
                            ))}

                            {colClients.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className={`h-12 w-12 rounded-2xl ${col.bg} border border-dashed ${col.border} flex items-center justify-center mb-3`}>
                                        <Icon className={`h-5 w-5 ${col.color} opacity-40`} />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                                        Sin clientes
                                    </p>
                                    <p className="text-[9px] text-muted-foreground/30 mt-1 italic">
                                        en esta etapa
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
