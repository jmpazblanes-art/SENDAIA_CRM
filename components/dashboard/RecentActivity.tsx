"use client"

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
                            Actividad Reciente
                        </h3>
                    </div>
                    <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-[#C9A24D]/60 border border-[#C9A24D]/20 px-2.5 py-1 rounded-full">
                        En Vivo
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="px-3 pt-2 pb-3">
                {activities.length > 0 ? (
                    <div className="divide-y divide-white/[0.03]">
                        {activities.map((item, idx) => (
                            <div
                                key={`${item.type}-${item.id}`}
                                className="activity-item flex items-start gap-3 px-3 py-3 rounded-lg transition-all duration-400 cursor-default"
                                style={{
                                    animation: `chart-fade-in 0.4s ease-out ${idx * 60}ms both`,
                                }}
                            >
                                {/* Icon */}
                                <div
                                    className={cn(
                                        "mt-0.5 p-2 rounded-xl border transition-all duration-300",
                                        item.type === "client"
                                            ? "bg-[#C9A24D]/[0.06] border-[#C9A24D]/15"
                                            : "bg-[#C9A24D]/[0.06] border-[#C9A24D]/15"
                                    )}
                                >
                                    {item.type === "client" ? (
                                        <UserPlus className="h-4 w-4 text-[#C9A24D]/70" />
                                    ) : (
                                        <CalendarCheck className="h-4 w-4 text-[#C9A24D]/70" />
                                    )}
                                </div>

                                {/* Text content */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-foreground/90 leading-tight truncate">
                                        {item.title}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground/50 mt-0.5 truncate">
                                        {item.subtitle}
                                    </p>
                                </div>

                                {/* Timestamp */}
                                <div className="text-right shrink-0">
                                    <p
                                        className="text-[11px] font-mono font-bold text-[#C9A24D]/40"
                                    >
                                        {item.time}
                                    </p>
                                    <p className="text-[10px] font-mono text-muted-foreground/30 mt-0.5">
                                        {item.date}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-10 text-center text-muted-foreground/40 italic text-xs tracking-wider">
                        No hay actividad reciente registrada.
                    </div>
                )}
            </div>
        </div>
    )
}
