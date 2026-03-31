"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { MoreHorizontal, Send, CheckCircle2, XCircle, FileEdit } from "lucide-react"
import { updateContratoStatus } from "@/app/dashboard/contratos/actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Contrato {
    id: string
    titulo: string
    tipo: string
    client: string
    client_id: string
    estado: string
    fecha_creacion: string
    fecha_vencimiento: string
    fecha_firma: string | null
    valor_setup: number
    valor_mensual: number
    modulos: any[]
}

const statusConfig: Record<string, { label: string; className: string }> = {
    borrador: {
        label: 'BORRADOR',
        className: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    },
    enviado: {
        label: 'ENVIADO',
        className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    },
    firmado: {
        label: 'FIRMADO',
        className: 'bg-green-500/10 text-green-500 border-green-500/20',
    },
    cancelado: {
        label: 'CANCELADO',
        className: 'bg-red-500/10 text-red-400 border-red-500/20',
    },
}

const tipoLabels: Record<string, string> = {
    mercantil: 'Mercantil',
    proteccion_datos: 'Protección Datos',
    nda: 'NDA',
    otro: 'Otro',
}

export function ContratoList({ data }: { data: Contrato[] }) {
    const router = useRouter()
    const [updating, setUpdating] = useState<string | null>(null)

    const fmt = (n: number) => `${n.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€`

    async function handleStatusChange(id: string, newStatus: string) {
        setUpdating(id)
        const result = await updateContratoStatus(id, newStatus)
        setUpdating(null)

        if (result.success) {
            toast.success(`Contrato marcado como ${statusConfig[newStatus]?.label || newStatus}`)
            router.refresh()
        } else {
            toast.error(result.error || "Error al actualizar el estado")
        }
    }

    if (data.length === 0) return null

    return (
        <Table>
            <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Título</TableHead>
                    <TableHead className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Cliente</TableHead>
                    <TableHead className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Tipo</TableHead>
                    <TableHead className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Estado</TableHead>
                    <TableHead className="text-[10px] text-muted-foreground uppercase tracking-widest font-black text-right">Setup</TableHead>
                    <TableHead className="text-[10px] text-muted-foreground uppercase tracking-widest font-black text-right">Mensual</TableHead>
                    <TableHead className="text-[10px] text-muted-foreground uppercase tracking-widest font-black hidden md:table-cell">Módulos</TableHead>
                    <TableHead className="text-[10px] text-muted-foreground uppercase tracking-widest font-black hidden md:table-cell">Fecha</TableHead>
                    <TableHead className="w-10"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map(contrato => {
                    const status = statusConfig[contrato.estado] || statusConfig['borrador']
                    return (
                        <TableRow key={contrato.id} className="border-border/30 hover:bg-secondary/20 transition-colors">
                            <TableCell className="font-bold text-sm text-foreground">{contrato.titulo}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{contrato.client}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{tipoLabels[contrato.tipo] || contrato.tipo}</TableCell>
                            <TableCell>
                                <Badge variant="outline" className={`text-[9px] font-black ${status.className}`}>
                                    {status.label}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-sm font-medium text-right">{fmt(contrato.valor_setup)}</TableCell>
                            <TableCell className="text-sm font-medium text-primary text-right">{fmt(contrato.valor_mensual)}</TableCell>
                            <TableCell className="text-xs text-muted-foreground hidden md:table-cell">{contrato.modulos.length} módulos</TableCell>
                            <TableCell className="text-xs text-muted-foreground hidden md:table-cell">{contrato.fecha_creacion}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={updating === contrato.id}>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-card border-border">
                                        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">Cambiar estado</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {contrato.estado !== 'borrador' && (
                                            <DropdownMenuItem onClick={() => handleStatusChange(contrato.id, 'borrador')} className="cursor-pointer gap-2">
                                                <FileEdit className="h-3.5 w-3.5" /> Borrador
                                            </DropdownMenuItem>
                                        )}
                                        {contrato.estado !== 'enviado' && (
                                            <DropdownMenuItem onClick={() => handleStatusChange(contrato.id, 'enviado')} className="cursor-pointer gap-2">
                                                <Send className="h-3.5 w-3.5" /> Enviado
                                            </DropdownMenuItem>
                                        )}
                                        {contrato.estado !== 'firmado' && (
                                            <DropdownMenuItem onClick={() => handleStatusChange(contrato.id, 'firmado')} className="cursor-pointer gap-2">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Firmado
                                            </DropdownMenuItem>
                                        )}
                                        {contrato.estado !== 'cancelado' && (
                                            <DropdownMenuItem onClick={() => handleStatusChange(contrato.id, 'cancelado')} className="cursor-pointer gap-2 text-destructive">
                                                <XCircle className="h-3.5 w-3.5" /> Cancelado
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    )
}
