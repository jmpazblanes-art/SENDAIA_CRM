

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
    title: string
    value: string
    visualIcon: ReactNode
    change: string
    trend: "up" | "down" | "neutral"
}


export function MetricCard({ title, value, visualIcon, change, trend }: MetricCardProps) {
    return (
        <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 group overflow-hidden relative">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-[10px] uppercase font-black tracking-[0.15em] text-muted-foreground">
                    {title}
                </CardTitle>
                <div className="p-2 rounded-lg bg-secondary/30 border border-border/50 group-hover:border-primary/30 transition-colors">
                    {visualIcon}
                </div>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="text-3xl font-black text-foreground tracking-tighter group-hover:text-primary transition-colors">{value}</div>
                <div className="flex items-center gap-2 mt-2">
                    <div className={cn(
                        "flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold",
                        trend === "up" ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                            trend === "down" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                                "bg-slate-500/10 text-slate-500 border border-slate-500/20"
                    )}>
                        {trend === "up" ? "↑" : trend === "down" ? "↓" : "•"} {change}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium italic opacity-60">vs mes anterior</span>
                </div>
            </CardContent>

            {/* Bottom Accent Line */}
            <div className={`absolute bottom-0 left-0 h-[2px] transition-all duration-500 ${trend === "up" ? "bg-green-500/30 group-hover:w-full w-0" :
                trend === "down" ? "bg-red-500/30 group-hover:w-full w-0" :
                    "bg-primary/30 group-hover:w-full w-0"
                }`} />
        </Card>
    )
}
