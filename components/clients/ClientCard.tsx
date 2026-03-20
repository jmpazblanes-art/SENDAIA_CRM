
import { Badge } from "@/components/ui/badge"
import { Phone, Building2, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export interface Client {
    id: string
    name: string
    company: string
    phone: string
    status: string
    priority: 'low' | 'medium' | 'high' | 'urgent' | string
    tags: string[]
    last_contact?: string
}

const priorityConfig: Record<string, { dot: string; label: string; badge: string }> = {
    low: { dot: "bg-slate-400", label: "Baja", badge: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
    medium: { dot: "bg-yellow-400", label: "Media", badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
    high: { dot: "bg-orange-400", label: "Alta", badge: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
    urgent: { dot: "bg-red-500 animate-pulse", label: "Urgente", badge: "bg-red-500/10 text-red-400 border-red-500/20" },
}

export function ClientCard({ client }: { client: Client }) {
    const cfg = priorityConfig[client.priority] || priorityConfig.medium

    let timeAgo = ""
    if (client.last_contact) {
        try {
            timeAgo = formatDistanceToNow(new Date(client.last_contact), { addSuffix: true, locale: es })
        } catch {
            timeAgo = ""
        }
    }

    const initials = client.name
        .split(" ")
        .slice(0, 2)
        .map(w => w[0])
        .join("")
        .toUpperCase()

    return (
        <Link href={`/dashboard/clients/${client.id}`}>
            <div className={cn(
                "group relative bg-card border border-border/40 rounded-xl p-3.5 cursor-pointer",
                "hover:border-primary/40 hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:-translate-y-0.5",
                "transition-all duration-200 overflow-hidden"
            )}>
                {/* Top accent line on hover */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/0 to-transparent group-hover:via-primary/50 transition-all duration-300" />

                {/* Header row */}
                <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-[10px] font-black text-primary">
                        {initials || "?"}
                    </div>

                    {/* Name + company */}
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-white group-hover:text-primary transition-colors truncate uppercase tracking-tight">
                            {client.name}
                        </p>
                        {client.company && client.company !== client.name && (
                            <div className="flex items-center gap-1 mt-0.5">
                                <Building2 className="h-2.5 w-2.5 text-muted-foreground/40 shrink-0" />
                                <p className="text-[10px] text-muted-foreground/60 truncate font-medium">
                                    {client.company}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Priority dot */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        <div className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-border/30 my-2.5" />

                {/* Footer row */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 font-medium">
                        <Phone className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate">{client.phone || "Sin teléfono"}</span>
                    </div>

                    {timeAgo ? (
                        <div className="flex items-center gap-1 text-[9px] text-muted-foreground/40 font-medium shrink-0">
                            <Clock className="h-2.5 w-2.5" />
                            {timeAgo}
                        </div>
                    ) : (
                        <ArrowRight className="h-3 w-3 text-muted-foreground/20 group-hover:text-primary/50 transition-colors shrink-0" />
                    )}
                </div>

                {/* Tags */}
                {client.tags && client.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2.5">
                        {client.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[8px] font-bold uppercase tracking-tight bg-secondary/40 text-muted-foreground/70 px-1.5 py-0.5 rounded border border-border/30">
                                {tag}
                            </span>
                        ))}
                        {client.tags.length > 3 && (
                            <span className="text-[8px] font-bold text-muted-foreground/40">
                                +{client.tags.length - 3}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </Link>
    )
}
