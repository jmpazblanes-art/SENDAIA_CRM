"use client"

import { cn } from "@/lib/utils"

interface PipelineStage {
    status: string
    label: string
    count: number
    color: string
}

interface PipelineSummaryProps {
    pipeline: { status: string; count: number }[]
}

const STAGE_CONFIG: Record<string, { label: string; color: string; order: number }> = {
    lead: { label: "Lead", color: "bg-blue-500", order: 0 },
    contacted: { label: "Contactado", color: "bg-sky-500", order: 1 },
    qualified: { label: "Cualificado", color: "bg-violet-500", order: 2 },
    proposal: { label: "Propuesta", color: "bg-amber-500", order: 3 },
    negotiation: { label: "Negociacion", color: "bg-orange-500", order: 4 },
    client: { label: "Cliente", color: "bg-green-500", order: 5 },
    active: { label: "Activo", color: "bg-emerald-500", order: 6 },
    churned: { label: "Perdido", color: "bg-red-500", order: 7 },
    inactive: { label: "Inactivo", color: "bg-slate-500", order: 8 },
}

export function PipelineSummary({ pipeline }: PipelineSummaryProps) {
    const maxCount = Math.max(...pipeline.map((s) => s.count), 1)

    const stages: PipelineStage[] = pipeline
        .map((s) => {
            const config = STAGE_CONFIG[s.status] || {
                label: s.status,
                color: "bg-slate-500",
                order: 99,
            }
            return {
                status: s.status,
                label: config.label,
                count: s.count,
                color: config.color,
            }
        })
        .sort(
            (a, b) =>
                (STAGE_CONFIG[a.status]?.order ?? 99) -
                (STAGE_CONFIG[b.status]?.order ?? 99)
        )

    const totalClients = pipeline.reduce((acc, s) => acc + s.count, 0)

    return (
        <div className="glass-card gold-top-border rounded-2xl group">
            {/* Header */}
            <div className="px-5 pt-5 pb-3 border-b border-white/[0.04]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C9A24D] opacity-40" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#C9A24D]" />
                        </span>
                        <h3 className="text-[11px] uppercase font-black tracking-[0.2em] text-muted-foreground/90">
                            Pipeline de Ventas
                        </h3>
                    </div>
                    <span
                        className="text-xs font-mono font-bold text-[#C9A24D]/70"
                        style={{ textShadow: "0 0 10px rgba(201, 162, 77, 0.2)" }}
                    >
                        {totalClients} total
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="px-5 pt-5 pb-5">
                <div className="space-y-4">
                    {stages.map((stage, idx) => {
                        const pct = Math.round((stage.count / maxCount) * 100)
                        return (
                            <div
                                key={stage.status}
                                className="group/bar"
                                style={{
                                    animation: `chart-fade-in 0.5s ease-out ${idx * 80}ms both`,
                                }}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] uppercase font-black tracking-[0.15em] text-foreground/80">
                                        {stage.label}
                                    </span>
                                    <span
                                        className="text-xs font-mono font-bold text-[#C9A24D]/60"
                                        style={{ textShadow: "0 0 8px rgba(201, 162, 77, 0.15)" }}
                                    >
                                        {stage.count}
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.03]">
                                    <div className="relative h-full">
                                        {/* Metallic gold bar */}
                                        <div
                                            className="bar-metallic h-full transition-all duration-700 ease-out relative"
                                            style={{
                                                width: `${pct}%`,
                                                minWidth: stage.count > 0 ? "10px" : "0",
                                            }}
                                        />
                                        {/* Animated dot at end of bar */}
                                        {stage.count > 0 && (
                                            <div
                                                className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#D4AF37]"
                                                style={{
                                                    left: `${pct}%`,
                                                    marginLeft: "-3px",
                                                    animation: `bar-pulse-dot 2s ease-in-out infinite ${idx * 200}ms`,
                                                    boxShadow: "0 0 6px rgba(212, 175, 55, 0.6)",
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {stages.length === 0 && (
                    <div className="py-10 text-center text-muted-foreground/50 italic text-xs tracking-wider">
                        No hay datos de pipeline.
                    </div>
                )}
            </div>
        </div>
    )
}
