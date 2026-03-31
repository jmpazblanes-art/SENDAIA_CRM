"use client"

import { useState, useTransition, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { updateClientStatus } from "@/app/dashboard/pipeline/actions"
import {
    CircleDot,
    Phone,
    Star,
    FileText,
    CheckCircle2,
    XCircle,
    Building2,
    User,
    Clock,
    GripVertical,
} from "lucide-react"

// --- Types ---

interface Client {
    id: string
    first_name: string
    last_name: string
    company_name: string | null
    email: string | null
    phone: string | null
    status: string
    priority: string | null
    source: string | null
    created_at: string
}

interface Column {
    id: string
    label: string
    color: string
    borderColor: string
    bgColor: string
    badgeBg: string
    icon: React.ReactNode
}

// --- Column definitions ---

const COLUMNS: Column[] = [
    {
        id: "lead",
        label: "Lead",
        color: "text-blue-400",
        borderColor: "border-l-blue-500",
        bgColor: "bg-blue-500/5",
        badgeBg: "bg-blue-500/20 text-blue-400",
        icon: <CircleDot className="h-4 w-4" />,
    },
    {
        id: "contacted",
        label: "Contactado",
        color: "text-yellow-400",
        borderColor: "border-l-yellow-500",
        bgColor: "bg-yellow-500/5",
        badgeBg: "bg-yellow-500/20 text-yellow-400",
        icon: <Phone className="h-4 w-4" />,
    },
    {
        id: "qualified",
        label: "Cualificado",
        color: "text-orange-400",
        borderColor: "border-l-orange-500",
        bgColor: "bg-orange-500/5",
        badgeBg: "bg-orange-500/20 text-orange-400",
        icon: <Star className="h-4 w-4" />,
    },
    {
        id: "proposal",
        label: "Propuesta",
        color: "text-purple-400",
        borderColor: "border-l-purple-500",
        bgColor: "bg-purple-500/5",
        badgeBg: "bg-purple-500/20 text-purple-400",
        icon: <FileText className="h-4 w-4" />,
    },
    {
        id: "active",
        label: "Cliente Activo",
        color: "text-green-400",
        borderColor: "border-l-green-500",
        bgColor: "bg-green-500/5",
        badgeBg: "bg-green-500/20 text-green-400",
        icon: <CheckCircle2 className="h-4 w-4" />,
    },
    {
        id: "lost",
        label: "Perdido",
        color: "text-red-400",
        borderColor: "border-l-red-500",
        bgColor: "bg-red-500/5",
        badgeBg: "bg-red-500/20 text-red-400",
        icon: <XCircle className="h-4 w-4" />,
    },
]

// --- Helpers ---

function getDaysSince(dateStr: string): number {
    const now = new Date()
    const created = new Date(dateStr)
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
}

function getSourceLabel(source: string | null): string {
    if (!source) return ""
    const map: Record<string, string> = {
        website: "Web",
        referral: "Referido",
        social_media: "RRSS",
        cold_call: "Llamada",
        event: "Evento",
        advertising: "Publicidad",
        other: "Otro",
        manual: "Manual",
        telegram: "Telegram",
        whatsapp: "WhatsApp",
    }
    return map[source] || source
}

function getPriorityIndicator(priority: string | null) {
    if (!priority) return null
    const styles: Record<string, string> = {
        high: "bg-red-500",
        medium: "bg-yellow-500",
        low: "bg-green-500",
    }
    return (
        <span
            className={`inline-block h-2 w-2 rounded-full ${styles[priority] || "bg-gray-500"}`}
            title={`Prioridad: ${priority}`}
        />
    )
}

// --- Client Card ---

interface ClientCardProps {
    client: Client
    onDragStart: (e: React.DragEvent, clientId: string) => void
}

function ClientCard({ client, onDragStart }: ClientCardProps) {
    const router = useRouter()
    const days = getDaysSince(client.created_at)
    const sourceLabel = getSourceLabel(client.source)

    return (
        <Card
            draggable
            onDragStart={(e) => onDragStart(e, client.id)}
            onClick={() => router.push(`/dashboard/clients/${client.id}`)}
            className="group cursor-grab active:cursor-grabbing border-border/50 bg-background/80 hover:bg-background hover:border-primary/30 transition-all duration-200 p-0 gap-0 shadow-none hover:shadow-md hover:shadow-primary/5"
        >
            <div className="p-3 space-y-2">
                {/* Header: name + priority */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm font-semibold text-white truncate">
                            {client.first_name} {client.last_name}
                        </span>
                    </div>
                    {getPriorityIndicator(client.priority)}
                </div>

                {/* Company */}
                {client.company_name && (
                    <div className="flex items-center gap-1.5 pl-[22px]">
                        <Building2 className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                        <span className="text-xs text-muted-foreground truncate">
                            {client.company_name}
                        </span>
                    </div>
                )}

                {/* Footer: source + days */}
                <div className="flex items-center justify-between pl-[22px] pt-1">
                    <div className="flex items-center gap-1.5">
                        {sourceLabel && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-medium">
                                {sourceLabel}
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground/60">
                        <Clock className="h-3 w-3" />
                        <span className="text-[10px]">{days}d</span>
                    </div>
                </div>
            </div>
        </Card>
    )
}

// --- Kanban Column ---

interface KanbanColumnProps {
    column: Column
    clients: Client[]
    onDragStart: (e: React.DragEvent, clientId: string) => void
    onDrop: (e: React.DragEvent, columnId: string) => void
    isDragOver: boolean
    onDragOver: (e: React.DragEvent) => void
    onDragEnter: (e: React.DragEvent, columnId: string) => void
    onDragLeave: (e: React.DragEvent) => void
}

function KanbanColumn({
    column,
    clients,
    onDragStart,
    onDrop,
    isDragOver,
    onDragOver,
    onDragEnter,
    onDragLeave,
}: KanbanColumnProps) {
    return (
        <div
            className={`flex flex-col min-w-[260px] max-w-[320px] flex-1 rounded-xl border transition-all duration-200 ${
                isDragOver
                    ? `border-primary/50 ${column.bgColor} shadow-lg shadow-primary/10`
                    : "border-border/30 bg-secondary/10"
            }`}
            onDragOver={onDragOver}
            onDragEnter={(e) => onDragEnter(e, column.id)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, column.id)}
        >
            {/* Column Header */}
            <div className={`flex items-center justify-between p-3 border-b border-border/20 border-l-4 ${column.borderColor} rounded-t-xl`}>
                <div className="flex items-center gap-2">
                    <span className={column.color}>{column.icon}</span>
                    <span className="text-sm font-bold text-white uppercase tracking-wide">
                        {column.label}
                    </span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${column.badgeBg}`}>
                    {clients.length}
                </span>
            </div>

            {/* Cards */}
            <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-260px)] min-h-[100px]">
                {clients.length === 0 && (
                    <div className="flex items-center justify-center h-20 text-muted-foreground/40 text-xs italic">
                        Sin clientes
                    </div>
                )}
                {clients.map((client) => (
                    <ClientCard
                        key={client.id}
                        client={client}
                        onDragStart={onDragStart}
                    />
                ))}
            </div>
        </div>
    )
}

// --- Main Board ---

interface KanbanBoardProps {
    initialClients: Client[]
}

export function KanbanBoard({ initialClients }: KanbanBoardProps) {
    const [clients, setClients] = useState<Client[]>(initialClients)
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
    const [draggedClientId, setDraggedClientId] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const handleDragStart = useCallback((e: React.DragEvent, clientId: string) => {
        setDraggedClientId(clientId)
        e.dataTransfer.effectAllowed = "move"
        e.dataTransfer.setData("text/plain", clientId)
        // Make the dragged element semi-transparent
        if (e.currentTarget instanceof HTMLElement) {
            requestAnimationFrame(() => {
                (e.currentTarget as HTMLElement).style.opacity = "0.5"
            })
        }
    }, [])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
    }, [])

    const handleDragEnter = useCallback((e: React.DragEvent, columnId: string) => {
        e.preventDefault()
        setDragOverColumn(columnId)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        // Only clear if leaving the column container (not entering a child)
        const relatedTarget = e.relatedTarget as HTMLElement | null
        if (!e.currentTarget.contains(relatedTarget)) {
            setDragOverColumn(null)
        }
    }, [])

    const handleDrop = useCallback(
        (e: React.DragEvent, targetColumnId: string) => {
            e.preventDefault()
            setDragOverColumn(null)

            const clientId = e.dataTransfer.getData("text/plain")
            if (!clientId) return

            const client = clients.find((c) => c.id === clientId)
            if (!client || client.status === targetColumnId) {
                setDraggedClientId(null)
                return
            }

            // Optimistic update
            setClients((prev) =>
                prev.map((c) =>
                    c.id === clientId ? { ...c, status: targetColumnId } : c
                )
            )
            setDraggedClientId(null)

            // Server update
            startTransition(async () => {
                const result = await updateClientStatus(clientId, targetColumnId)
                if (result.error) {
                    // Revert on error
                    setClients((prev) =>
                        prev.map((c) =>
                            c.id === clientId ? { ...c, status: client.status } : c
                        )
                    )
                    console.error("Error updating status:", result.error)
                }
            })
        },
        [clients]
    )

    // Handle drag end to restore opacity
    const handleDragEnd = useCallback(() => {
        setDraggedClientId(null)
        setDragOverColumn(null)
    }, [])

    // Group clients by column
    const clientsByColumn = COLUMNS.reduce<Record<string, Client[]>>(
        (acc, col) => {
            acc[col.id] = clients.filter((c) => c.status === col.id)
            return acc
        },
        {}
    )

    // Total clients in pipeline
    const totalInPipeline = clients.filter((c) =>
        COLUMNS.some((col) => col.id === c.status)
    ).length

    return (
        <div className="space-y-4" onDragEnd={handleDragEnd}>
            {/* Summary bar */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="font-medium">
                    {totalInPipeline} cliente{totalInPipeline !== 1 ? "s" : ""} en pipeline
                </span>
                {isPending && (
                    <span className="text-primary animate-pulse font-medium">
                        Actualizando...
                    </span>
                )}
            </div>

            {/* Kanban columns - horizontal scroll */}
            <div className="flex gap-3 overflow-x-auto pb-4 -mx-1 px-1">
                {COLUMNS.map((column) => (
                    <KanbanColumn
                        key={column.id}
                        column={column}
                        clients={clientsByColumn[column.id] || []}
                        onDragStart={handleDragStart}
                        onDrop={handleDrop}
                        isDragOver={dragOverColumn === column.id}
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                    />
                ))}
            </div>
        </div>
    )
}
