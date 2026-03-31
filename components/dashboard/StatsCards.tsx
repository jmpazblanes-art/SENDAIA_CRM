"use client"

import { Users, UserPlus, Euro, FileText, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { type ReactNode } from "react"

interface KPI {
    label: string
    value: string
    change: string
    trend: "up" | "down" | "neutral"
    icon: ReactNode
    iconBg: string
}

interface StatsCardsProps {
    activeClients: number
    leadsThisMonth: number
    revenueThisMonth: number
    pendingProposals: number
    prevActiveClients?: number
    prevLeads?: number
    prevRevenue?: number
    prevProposals?: number
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

function calcTrend(current: number, previous: number): { change: string; trend: "up" | "down" | "neutral" } {
    if (previous === 0) {
        if (current > 0) return { change: "+100%", trend: "up" }
        return { change: "0%", trend: "neutral" }
    }
    const pct = Math.round(((current - previous) / previous) * 100)
    if (pct > 0) return { change: `+${pct}%`, trend: "up" }
    if (pct < 0) return { change: `${pct}%`, trend: "down" }
    return { change: "0%", trend: "neutral" }
}

export function StatsCards({
    activeClients,
    leadsThisMonth,
    revenueThisMonth,
    pendingProposals,
    prevActiveClients = 0,
    prevLeads = 0,
    prevRevenue = 0,
    prevProposals = 0,
}: StatsCardsProps) {
    const kpis: KPI[] = [
        {
            label: "Clientes Activos",
            value: activeClients.toString(),
            ...calcTrend(activeClients, prevActiveClients),
            icon: <Users className="h-5 w-5 text-[#C9A24D]" />,
            iconBg: "Users",
        },
        {
            label: "Leads del Mes",
            value: leadsThisMonth.toString(),
            ...calcTrend(leadsThisMonth, prevLeads),
            icon: <UserPlus className="h-5 w-5 text-[#C9A24D]" />,
            iconBg: "UserPlus",
        },
        {
            label: "Ingresos del Mes",
            value: formatCurrency(revenueThisMonth),
            ...calcTrend(revenueThisMonth, prevRevenue),
            icon: <Euro className="h-5 w-5 text-[#C9A24D]" />,
            iconBg: "Euro",
        },
        {
            label: "Propuestas Pendientes",
            value: pendingProposals.toString(),
            ...calcTrend(pendingProposals, prevProposals),
            icon: <FileText className="h-5 w-5 text-[#C9A24D]" />,
            iconBg: "FileText",
        },
    ]

    const watermarkIcons: Record<string, ReactNode> = {
        Users: <Users className="h-32 w-32 text-[#C9A24D]" strokeWidth={0.4} />,
        UserPlus: <UserPlus className="h-32 w-32 text-[#C9A24D]" strokeWidth={0.4} />,
        Euro: <Euro className="h-32 w-32 text-[#C9A24D]" strokeWidth={0.4} />,
        FileText: <FileText className="h-32 w-32 text-[#C9A24D]" strokeWidth={0.4} />,
    }

    return (
        <div className="grid gap-3 md:gap-6 grid-cols-2 md:grid-cols-4">
            {kpis.map((kpi, idx) => (
                <div
                    key={kpi.label}
                    className="group relative"
                    style={{
                        animationDelay: `${idx * 100}ms`,
                    }}
                >
                    {/* Animated gradient border wrapper */}
                    <div className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                        style={{
                            background: "conic-gradient(from 0deg, rgba(201,162,77,0.1), rgba(201,162,77,0.5), rgba(212,175,55,0.8), rgba(201,162,77,0.5), rgba(201,162,77,0.1), transparent, transparent, rgba(201,162,77,0.1))",
                            animation: "gradient-shift 4s linear infinite",
                            backgroundSize: "300% 300%",
                        }}
                    />

                    <div className="glass-card gold-top-border relative rounded-2xl p-0">
                        {/* Ambient glow orb */}
                        <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-[#C9A24D]/[0.03] rounded-full blur-3xl group-hover:bg-[#C9A24D]/[0.08] transition-all duration-700" />

                        {/* Large watermark icon */}
                        <div className="absolute -bottom-6 -right-6 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none select-none">
                            {watermarkIcons[kpi.iconBg]}
                        </div>

                        {/* Card content */}
                        <div className="relative z-10 p-4 md:p-5">
                            {/* Header: label + icon */}
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[9px] md:text-[10px] uppercase font-black tracking-[0.18em] text-muted-foreground/80">
                                    {kpi.label}
                                </span>
                                <div className="p-2 rounded-xl bg-[#C9A24D]/[0.06] border border-[#C9A24D]/10 group-hover:border-[#C9A24D]/30 group-hover:bg-[#C9A24D]/[0.1] transition-all duration-500">
                                    {kpi.icon}
                                </div>
                            </div>

                            {/* KPI number - LARGE */}
                            <div
                                className="text-3xl md:text-4xl font-black text-foreground tracking-tighter group-hover:text-[#D4AF37] transition-colors duration-500"
                                style={{
                                    textShadow: "0 0 20px rgba(201, 162, 77, 0.0)",
                                    animation: "number-glow 4s ease-in-out infinite",
                                }}
                            >
                                {kpi.value}
                            </div>

                            {/* Trend badge */}
                            <div className="flex items-center gap-2 mt-3">
                                <div
                                    className={cn(
                                        "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-300",
                                        kpi.trend === "up" &&
                                            "bg-[#C9A24D]/15 text-[#D4AF37] border border-[#C9A24D]/25",
                                        kpi.trend === "down" &&
                                            "bg-red-500/10 text-red-400 border border-red-500/20",
                                        kpi.trend === "neutral" &&
                                            "bg-white/[0.04] text-muted-foreground border border-white/[0.06]"
                                    )}
                                    style={
                                        kpi.trend === "up"
                                            ? { animation: "trend-pulse 2s ease-in-out 1" }
                                            : undefined
                                    }
                                >
                                    {kpi.trend === "up" && <TrendingUp className="h-3 w-3" />}
                                    {kpi.trend === "down" && <TrendingDown className="h-3 w-3" />}
                                    {kpi.trend === "neutral" && <Minus className="h-3 w-3" />}
                                    {kpi.change}
                                </div>
                                <span className="text-[9px] text-muted-foreground/50 font-medium italic hidden md:inline">
                                    vs mes anterior
                                </span>
                            </div>
                        </div>

                        {/* Bottom accent line that expands on hover */}
                        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C9A24D]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                </div>
            ))}
        </div>
    )
}
