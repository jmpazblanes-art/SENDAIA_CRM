"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Trash2 } from "lucide-react"
import { deleteTimeEntry } from "@/app/dashboard/horas/actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface TimeEntry {
    id: string
    client: string
    client_id: string
    proyecto: string
    descripcion: string
    horas: number
    fecha: string
    tarifa_hora: number
    facturable: boolean
    importe: number
}

export function TimeLog({ data }: { data: TimeEntry[] }) {
    const router = useRouter()
    const [deleting, setDeleting] = useState<string | null>(null)

    const fmt = (n: number) => `${n.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€`

    async function handleDelete(id: string) {
        if (!confirm('¿Eliminar este registro de horas?')) return

        setDeleting(id)
        const result = await deleteTimeEntry(id)
        setDeleting(null)

        if (result.success) {
            toast.success("Registro eliminado")
            router.refresh()
        } else {
            toast.error(result.error || "Error al eliminar")
        }
    }

    if (data.length === 0) return null

    return (
        <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary italic mb-4">Registro de Horas</h3>
            <Table>
                <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                        <TableHead className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Fecha</TableHead>
                        <TableHead className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Cliente</TableHead>
                        <TableHead className="text-[10px] text-muted-foreground uppercase tracking-widest font-black hidden md:table-cell">Proyecto</TableHead>
                        <TableHead className="text-[10px] text-muted-foreground uppercase tracking-widest font-black text-right">Horas</TableHead>
                        <TableHead className="text-[10px] text-muted-foreground uppercase tracking-widest font-black text-right hidden md:table-cell">Tarifa</TableHead>
                        <TableHead className="text-[10px] text-muted-foreground uppercase tracking-widest font-black text-right">Importe</TableHead>
                        <TableHead className="text-[10px] text-muted-foreground uppercase tracking-widest font-black hidden lg:table-cell">Descripcion</TableHead>
                        <TableHead className="w-10"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map(entry => (
                        <TableRow key={entry.id} className="border-border/30 hover:bg-secondary/20 transition-colors">
                            <TableCell className="text-sm text-muted-foreground font-medium">{entry.fecha}</TableCell>
                            <TableCell className="text-sm font-bold text-foreground">{entry.client}</TableCell>
                            <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                                {entry.proyecto || (
                                    <span className="text-muted-foreground/50 italic text-xs">-</span>
                                )}
                            </TableCell>
                            <TableCell className="text-sm font-bold text-right">
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black">
                                    {entry.horas}h
                                </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground text-right hidden md:table-cell">{fmt(entry.tarifa_hora)}/h</TableCell>
                            <TableCell className="text-sm font-bold text-primary text-right">{fmt(entry.importe)}</TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate hidden lg:table-cell">
                                {entry.descripcion || (
                                    <span className="text-muted-foreground/50 italic">-</span>
                                )}
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    disabled={deleting === entry.id}
                                    onClick={() => handleDelete(entry.id)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
