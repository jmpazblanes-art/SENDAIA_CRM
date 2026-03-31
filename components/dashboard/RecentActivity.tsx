"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserPlus, CalendarCheck } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ActivityItem {
    id: string
    type: "client" | "appointment"
    title: string
    subtitle: string
    date: string
    time: string
}

interface RecentActivityProps {
    activities: ActivityItem[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
    return (
        <Card className="bg-card border-border shadow-xl overflow-hidden">
            <CardHeader className="bg-secondary/10 pb-4 border-b border-border/50">
                <CardTitle className="text-md font-bold text-foreground flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#C9A24D] animate-pulse" />
                        Actividad Reciente
                    </span>
                    <Badge
                        variant="outline"
                        className="text-[9px] border-[#C9A24D]/30 text-[#C9A24D]"
                    >
                        EN VIVO
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                {activities.length > 0 ? (
                    <div className="space-y-1">
                        {activities.map((item) => (
                            <div
                                key={`${item.type}-${item.id}`}
                                className="flex items-start gap-4 p-3 rounded-lg hover:bg-secondary/20 transition-colors border border-transparent hover:border-border/50"
                            >
                                <div
                                    className={cn(
                                        "mt-0.5 p-2 rounded-lg border",
                                        item.type === "client"
                                            ? "bg-blue-500/10 border-blue-500/20"
                                            : "bg-[#C9A24D]/10 border-[#C9A24D]/20"
                                    )}
                                >
                                    {item.type === "client" ? (
                                        <UserPlus className="h-4 w-4 text-blue-500" />
                                    ) : (
                                        <CalendarCheck className="h-4 w-4 text-[#C9A24D]" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-foreground leading-tight truncate">
                                        {item.title}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                                        {item.subtitle}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-[11px] font-mono font-bold text-muted-foreground">
                                        {item.time}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/60">
                                        {item.date}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-10 text-center text-muted-foreground italic text-xs">
                        No hay actividad reciente registrada.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
