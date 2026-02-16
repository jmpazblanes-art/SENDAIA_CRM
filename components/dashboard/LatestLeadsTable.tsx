
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"


export interface Lead {
    id: string
    date: string
    name: string
    avatar?: string
    initials: string
    category: string
    industry: string
    status: string
}

interface LatestLeadsTableProps {
    leads: Lead[]
}

export function LatestLeadsTable({ leads }: LatestLeadsTableProps) {
    return (
        <Card className="bg-card border-border shadow-xl overflow-hidden">
            <CardHeader className="bg-secondary/10 pb-4 border-b border-border/50">
                <CardTitle className="text-md font-bold text-foreground italic flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> Últimas Oportunidades SendaIA
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table className="min-w-[600px] md:min-w-full">
                        <TableHeader className="bg-secondary/5">
                            <TableRow className="border-border hover:bg-transparent">
                                <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground py-3">ID</TableHead>
                                <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground py-3 hidden md:table-cell">Fecha</TableHead>
                                <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground py-3">Nombre</TableHead>
                                <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground py-3">Categoría</TableHead>
                                <TableHead className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground py-3 hidden lg:table-cell">Industria</TableHead>
                                <TableHead className="text-right py-3"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leads.map((lead) => (
                                <TableRow key={lead.id} className="border-border group hover:bg-secondary/10 transition-colors">
                                    <TableCell className="text-[11px] font-mono text-muted-foreground">#{lead.id.slice(0, 4)}</TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground hidden md:table-cell">{lead.date}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-7 w-7 border border-primary/20">
                                                <AvatarImage src={lead.avatar} />
                                                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">{lead.initials}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate max-w-[120px] md:max-w-none">{lead.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={
                                                lead.category === 'Client'
                                                    ? "border-primary/20 bg-primary/5 text-primary text-[10px] font-bold"
                                                    : "border-slate-700 bg-slate-800/20 text-slate-400 text-[10px] font-bold"
                                            }
                                        >
                                            {lead.category.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-[12px] text-muted-foreground hidden lg:table-cell">{lead.industry}</TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/dashboard/clients/${lead.id}`}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary transition-all hover:scale-110">
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {leads.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground italic text-sm">
                                        No hay registros recientes.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
