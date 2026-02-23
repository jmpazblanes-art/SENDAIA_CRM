"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Phone, Clock, TrendingUp, TrendingDown, Minus } from "lucide-react"

export type Call = {
    id: string
    date: string
    client: string
    duration: string
    sentiment: string
    outcome: string
    industry: string
}

const sentimentConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    Positive: { label: "Positivo", color: "bg-green-500/10 text-green-400 border-green-500/20", icon: <TrendingUp className="h-3 w-3" /> },
    Negative: { label: "Negativo", color: "bg-red-500/10 text-red-400 border-red-500/20", icon: <TrendingDown className="h-3 w-3" /> },
    Neutral: { label: "Neutral", color: "bg-gray-500/10 text-gray-400 border-gray-500/20", icon: <Minus className="h-3 w-3" /> },
}

const outcomeConfig: Record<string, { label: string; color: string }> = {
    Finalizada: { label: "Finalizada", color: "bg-secondary/30 text-muted-foreground border-border" },
    Convertida: { label: "Convertida", color: "bg-green-500/10 text-green-400 border-green-500/20" },
    "No Contesta": { label: "No Contesta", color: "bg-red-500/10 text-red-400 border-red-500/20" },
    Programada: { label: "Programada", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
    Ocupado: { label: "Ocupado", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
    Fallida: { label: "Fallida", color: "bg-red-500/10 text-red-400 border-red-500/20" },
    "Buzón": { label: "Buzón", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
}

export const columns: ColumnDef<Call>[] = [
    {
        accessorKey: "date",
        header: "Fecha",
        cell: ({ row }) => (
            <span className="text-xs font-mono text-muted-foreground">
                {row.getValue("date")}
            </span>
        ),
    },
    {
        accessorKey: "client",
        header: "Cliente / Número",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10 border border-primary/20">
                    <Phone className="h-3 w-3 text-primary" />
                </div>
                <span className="font-bold text-sm text-white">{row.getValue("client")}</span>
            </div>
        ),
    },
    {
        accessorKey: "industry",
        header: "Sector",
        cell: ({ row }) => (
            <span className="text-xs text-muted-foreground">{row.getValue("industry")}</span>
        ),
    },
    {
        accessorKey: "duration",
        header: "Duración",
        cell: ({ row }) => (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3 text-primary/50" />
                <span className="font-mono">{row.getValue("duration")}</span>
            </div>
        ),
    },
    {
        accessorKey: "sentiment",
        header: "Sentiment",
        cell: ({ row }) => {
            const sentiment = row.getValue("sentiment") as string
            const cfg = sentimentConfig[sentiment] || sentimentConfig.Neutral
            return (
                <Badge variant="outline" className={cn("text-[10px] font-black uppercase italic border gap-1", cfg.color)}>
                    {cfg.icon}
                    {cfg.label}
                </Badge>
            )
        },
    },
    {
        accessorKey: "outcome",
        header: "Resultado",
        cell: ({ row }) => {
            const outcome = row.getValue("outcome") as string
            const cfg = outcomeConfig[outcome] || { label: outcome, color: "bg-secondary/30 text-muted-foreground border-border" }
            return (
                <Badge variant="outline" className={cn("text-[10px] font-black uppercase italic border", cfg.color)}>
                    {cfg.label}
                </Badge>
            )
        },
    },
]
