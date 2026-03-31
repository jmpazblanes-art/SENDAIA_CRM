"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, DollarSign, Users } from "lucide-react"

interface ClientSummaryEntry {
    name: string
    horas: number
    importe: number
}

interface TimeSummaryProps {
    totalHorasMes: number
    totalFacturado: number
    clientSummary: ClientSummaryEntry[]
}

export function TimeSummary({ totalHorasMes, totalFacturado, clientSummary }: TimeSummaryProps) {
    const fmt = (n: number) => `${n.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€`

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Hours */}
            <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Total Horas Mes</p>
                </div>
                <p className="text-2xl font-black text-white">{totalHorasMes.toLocaleString('es-ES', { minimumFractionDigits: 1 })}h</p>
            </div>

            {/* Total Billed */}
            <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-3.5 w-3.5 text-primary" />
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Total Facturado</p>
                </div>
                <p className="text-2xl font-black text-primary">{fmt(totalFacturado)}</p>
            </div>

            {/* Hours per Client */}
            <Card className="bg-card border-border">
                <CardHeader className="pb-2 px-4 pt-4">
                    <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Horas por Cliente</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                    {clientSummary.length > 0 ? (
                        <div className="space-y-2">
                            {clientSummary.slice(0, 5).map((cs) => (
                                <div key={cs.name} className="flex items-center justify-between">
                                    <span className="text-xs text-foreground font-medium truncate max-w-[120px]">{cs.name}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] text-muted-foreground font-bold">{cs.horas.toLocaleString('es-ES', { minimumFractionDigits: 1 })}h</span>
                                        <span className="text-[10px] text-primary font-bold">{fmt(cs.importe)}</span>
                                    </div>
                                </div>
                            ))}
                            {clientSummary.length > 5 && (
                                <p className="text-[9px] text-muted-foreground italic text-center mt-1">
                                    +{clientSummary.length - 5} clientes más
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground italic">Sin datos este mes</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
