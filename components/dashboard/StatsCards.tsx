"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

    /* Map icon name to a large watermark SVG path for the card background */
    const watermarkIcons: Record<string, ReactNode> = {
        Users: <Users className="h-28 w-28 text-[#C9A24D]" strokeWidth={0.5} />,
        UserPlus: <UserPlus className="h-28 w-28 text-[#C9A24D]" strokeWidth={0.5} />,
        Euro: <Euro className="h-28 w-28 text-[#C9A24D]" strokeWidth={0.5} />,
        FileText: <FileText className="h-28 w-28 text-[#C9A24D]" strokeWidth={0.5} />,
    }

    return (
        <div className="grid gap-3 md:gap-6 grid-cols-2 md:grid-cols-4">
            {kpis.map((kpi) => (
                <div
                    key={kpi.label}
                    className="relative group rounded-xl"
                    style={{ padding: "1px" }}
                >
                    {/* Animated gradient border — visible on hover */}
                    <div
                        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                            background:
                                "linear-gradient(135deg, rgba(201,162,77,0.5), rgba(201,162,77,0.05), rgba(201,162,77,0.3), rgba(201,162,77,0.05), rgba(201,162,77,0.5))",
                            backgroundSize: "300% 300%",
                            animation: "gradient-shift 4s ease infinite",
                        }}
                    />

                    <Card
                        className="bg-card border-border hover:border-transparent transition-all duration-300 overflow-hidden relative rounded-xl"
                    >
                        {/* Gold accent line at top */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C9A24D]/40 to-transparent" />

                        {/* Ambient glow */}
                        <div className="absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 bg-[#C9A24D]/5 rounded-full blur-2xl group-hover:bg-[#C9A24D]/10 transition-colors" />

                        {/* Large watermark icon in background */}
                        <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700 pointer-events-none select-none">
                            {watermarkIcons[kpi.iconBg]}
                        </div>

                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-[10px] uppercase font-black tracking-[0.15em] text-muted-foreground">
                                {kpi.label}
                            </CardTitle>
                            <div className="p-2 rounded-lg bg-secondary/30 border border-border/50 group-hover:border-[#C9A24D]/30 transition-colors">
                                {kpi.icon}
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            {/* Number value with glow animation */}
                            <div
                                className="text-2xl md:text-3xl font-black text-foreground tracking-tighter group-hover:text-[#C9A24D] transition-colors"
                                style={{
                                    animation: "number-glow 3s ease-in-out infinite",
                                }}
                            >
                                {kpi.value}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <div
                                    className={cn(
                                        "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold",
                                        kpi.trend === "up" &&
                                            "bg-green-500/10 text-green-500 border border-green-500/20",
                                        kpi.trend === "down" &&
                                            "bg-red-500/10 text-red-500 border border-red-500/20",
                                        kpi.trend === "neutral" &&
                                            "bg-slate-500/10 text-slate-500 border border-slate-500/20"
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
                                <span className="text-[10px] text-muted-foreground font-medium italic opacity-60">
                                    vs mes anterior
                                </span>
                            </div>
                        </CardContent>

                        {/* Bottom accent line */}
                        <div
                            className={cn(
                                "absolute bottom-0 left-0 h-[2px] transition-all duration-500 w-0 group-hover:w-full",
                                kpi.trend === "up" && "bg-green-500/30",
                                kpi.trend === "down" && "bg-red-500/30",
                                kpi.trend === "neutral" && "bg-[#C9A24D]/30"
                            )}
                        />

                        {/* Hover gold pulse glow */}
                        <div
                            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-700"
                            style={{
                                animation: "pulse-gold 3s ease-in-out infinite",
                            }}
                        />
                    </Card>
                </div>
            ))}
        </div>
    )
}
