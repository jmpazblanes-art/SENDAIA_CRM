
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, Building2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

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


export function ClientCard({ client }: { client: Client }) {
    const priorityConfig: Record<string, { color: string, label: string, glow: string }> = {
        low: { color: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "BAJA", glow: "group-hover:shadow-[0_0_15px_rgba(59,130,246,0.1)]" },
        medium: { color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", label: "MEDIA", glow: "group-hover:shadow-[0_0_15px_rgba(234,179,8,0.1)]" },
        high: { color: "bg-orange-500/10 text-orange-400 border-orange-500/20", label: "ALTA", glow: "group-hover:shadow-[0_0_15px_rgba(249,115,22,0.15)]" },
        urgent: { color: "bg-red-500/10 text-red-500 border-red-500/30", label: "URGENTE", glow: "group-hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]" }
    }

    const config = priorityConfig[client.priority] || priorityConfig.medium

    return (
        <Card className={cn(
            "hover:border-primary/50 transition-all duration-300 cursor-pointer bg-[#151921]/50 backdrop-blur-sm text-card-foreground border-border/50 group overflow-hidden mb-3 relative",
            config.glow
        )}>
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

            <Link href={`/dashboard/clients/${client.id}`}>
                <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-sm font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors truncate">
                            {client.name}
                        </CardTitle>
                        <Badge variant="outline" className={cn("text-[8px] font-black px-1.5 py-0 border italic", config.color)}>
                            {config.label}
                        </Badge>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 flex items-center gap-1.5 mt-0.5 transition-opacity">
                        <Building2 className="h-3 w-3 text-primary/50" /> {client.company || "CLIENTE PARTICULAR"}
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-2 pb-3 space-y-2.5">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                        <div className="p-1 rounded bg-secondary/50 border border-border/50">
                            <Phone className="h-3 w-3 text-primary/70" />
                        </div>
                        {client.phone || "SIN CONTACTO"}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {client.tags?.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[9px] font-bold uppercase tracking-tighter bg-primary/5 text-primary/80 px-2 py-0.5 rounded border border-primary/10">
                                {tag}
                            </span>
                        ))}
                        {client.tags?.length > 2 && (
                            <span className="text-[9px] font-bold text-muted-foreground/50 px-1">
                                +{client.tags.length - 2}
                            </span>
                        )}
                    </div>
                </CardContent>
            </Link>

            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
        </Card>
    )
}
