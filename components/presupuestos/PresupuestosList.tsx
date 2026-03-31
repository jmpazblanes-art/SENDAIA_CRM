"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, MoreHorizontal, Send, CheckCircle, XCircle, Receipt } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { updatePresupuestoStatus } from "@/app/dashboard/presupuestos/actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export interface Presupuesto {
    id: string
    numero: string
    cliente: string
    titulo: string
    total: string
    estado: string
    fecha: string
}

interface PresupuestosListProps {
    data: Presupuesto[]
}

const statusConfig: Record<string, { label: string; className: string }> = {
    borrador: { label: "Borrador", className: "bg-slate-500/10 text-slate-400 hover:bg-slate-500/20" },
    enviado: { label: "Enviado", className: "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20" },
    aceptado: { label: "Aceptado", className: "bg-green-500/10 text-green-400 hover:bg-green-500/20" },
    rechazado: { label: "Rechazado", className: "bg-red-500/10 text-red-400 hover:bg-red-500/20" },
    facturado: { label: "Facturado", className: "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20" },
}

export function PresupuestosList({ data }: PresupuestosListProps) {
    const router = useRouter()

    async function handleStatusChange(id: string, estado: string) {
        const result = await updatePresupuestoStatus(id, estado)
        if (result.success) {
            toast.success(`Estado actualizado a "${statusConfig[estado]?.label || estado}"`)
            router.refresh()
        } else {
            toast.error(result.error || "Error al actualizar estado")
        }
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="hover:bg-secondary/50 border-border">
                    <TableHead className="w-[140px]">Numero</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Titulo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((p) => {
                    const status = statusConfig[p.estado] || statusConfig.borrador
                    return (
                        <TableRow key={p.id} className="hover:bg-secondary/30 border-border">
                            <TableCell className="font-medium flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                {p.numero}
                            </TableCell>
                            <TableCell>{p.cliente}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{p.titulo}</TableCell>
                            <TableCell className="text-muted-foreground">{p.fecha}</TableCell>
                            <TableCell>
                                <Badge variant="outline" className={`border-none ${status.className}`}>
                                    {status.label}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right font-bold text-foreground">{p.total}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        {p.estado === 'borrador' && (
                                            <DropdownMenuItem onClick={() => handleStatusChange(p.id, 'enviado')}>
                                                <Send className="h-4 w-4 mr-2 text-blue-400" />
                                                Marcar como Enviado
                                            </DropdownMenuItem>
                                        )}
                                        {(p.estado === 'borrador' || p.estado === 'enviado') && (
                                            <DropdownMenuItem onClick={() => handleStatusChange(p.id, 'aceptado')}>
                                                <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                                                Marcar como Aceptado
                                            </DropdownMenuItem>
                                        )}
                                        {(p.estado === 'borrador' || p.estado === 'enviado') && (
                                            <DropdownMenuItem onClick={() => handleStatusChange(p.id, 'rechazado')}>
                                                <XCircle className="h-4 w-4 mr-2 text-red-400" />
                                                Marcar como Rechazado
                                            </DropdownMenuItem>
                                        )}
                                        {p.estado === 'aceptado' && (
                                            <DropdownMenuItem onClick={() => handleStatusChange(p.id, 'facturado')}>
                                                <Receipt className="h-4 w-4 mr-2 text-purple-400" />
                                                Marcar como Facturado
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    )
                })}
                {data.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                            No hay presupuestos registrados.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}
