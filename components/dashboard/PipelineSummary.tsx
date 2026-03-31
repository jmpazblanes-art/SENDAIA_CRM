"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    negotiation: { label: "Negociación", color: "bg-orange-500", order: 4 },
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
        <Card className="bg-card border-border shadow-2xl overflow-hidden relative group">
            <CardHeader className="pb-2 border-b border-border/10">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm uppercase font-black tracking-widest flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#C9A24D] animate-pulse" />
                        Pipeline de Ventas
                    </CardTitle>
                    <span className="text-xs text-muted-foreground font-bold">
                        {totalClients} total
                    </span>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    {stages.map((stage) => {
                        const pct = Math.round((stage.count / maxCount) * 100)
                        return (
                            <div key={stage.status} className="group/bar">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-bold text-foreground">
                                        {stage.label}
                                    </span>
                                    <span className="text-xs font-mono font-bold text-muted-foreground">
                                        {stage.count}
                                    </span>
                                </div>
                                <div className="h-2.5 w-full bg-secondary/30 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-700 ease-out",
                                            stage.color
                                        )}
                                        style={{ width: `${pct}%`, minWidth: stage.count > 0 ? "8px" : "0" }}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>

                {stages.length === 0 && (
                    <div className="py-10 text-center text-muted-foreground italic text-xs">
                        No hay datos de pipeline.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
