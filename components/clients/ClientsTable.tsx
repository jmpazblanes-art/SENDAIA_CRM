"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ExternalLink } from "lucide-react"

interface ClientsTableProps {
    clients: any[]
}

const statusConfig: Record<string, { label: string; color: string }> = {
    lead:      { label: "Lead",       color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    qualified: { label: "Cualificado", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
    active:    { label: "Activo",     color: "bg-green-500/10 text-green-400 border-green-500/20" },
    closed:    { label: "Cerrado",    color: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
    low:    { label: "Baja",    color: "text-blue-400" },
    medium: { label: "Media",   color: "text-yellow-400" },
    high:   { label: "Alta",    color: "text-orange-400" },
    urgent: { label: "Urgente", color: "text-red-500" },
}

const columns: ColumnDef<any>[] = [
    {
        accessorKey: "name",
        header: "Cliente",
        cell: ({ row }) => {
            const first = row.original.first_name || ""
            const last  = row.original.last_name  || ""
            const name  = row.original.company_name || `${first} ${last}`.trim() || "Sin nombre"
            return (
                <Link
                    href={`/dashboard/clients/${row.original.id}`}
                    className="flex items-center gap-2 font-bold text-white hover:text-primary transition-colors group"
                >
                    {name}
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                </Link>
            )
        },
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
            <span className="text-muted-foreground text-xs">{row.original.email || "—"}</span>
        ),
    },
    {
        accessorKey: "phone",
        header: "Teléfono",
        cell: ({ row }) => (
            <span className="text-muted-foreground text-xs font-mono">{row.original.phone || "—"}</span>
        ),
    },
    {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => {
            const status = row.original.status || "lead"
            const cfg = statusConfig[status] || { label: status, color: "bg-secondary/30 text-muted-foreground border-border" }
            return (
                <Badge variant="outline" className={cn("text-[10px] font-black uppercase italic border", cfg.color)}>
                    {cfg.label}
                </Badge>
            )
        },
    },
    {
        accessorKey: "priority",
        header: "Prioridad",
        cell: ({ row }) => {
            const priority = row.original.priority || "medium"
            const cfg = priorityConfig[priority] || priorityConfig.medium
            return (
                <span className={cn("text-[10px] font-black uppercase", cfg.color)}>
                    {cfg.label}
                </span>
            )
        },
    },
    {
        accessorKey: "industry",
        header: "Sector",
        cell: ({ row }) => (
            <span className="text-muted-foreground text-xs">{row.original.industry || "—"}</span>
        ),
    },
]

export function ClientsTable({ clients }: ClientsTableProps) {
    return <DataTable columns={columns} data={clients} />
}
