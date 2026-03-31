"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Bell,
    Users,
    Calendar,
    Receipt,
    Activity,
    FileSignature,
    FileText,
    Zap,
    Check,
} from "lucide-react"

interface Notification {
    id: string
    tipo: string
    titulo: string
    mensaje: string | null
    link: string | null
    leida: boolean
    created_at: string
}

const tipoIcons: Record<string, React.ReactNode> = {
    lead: <Users className="h-3.5 w-3.5 text-blue-400" />,
    cita: <Calendar className="h-3.5 w-3.5 text-green-400" />,
    factura: <Receipt className="h-3.5 w-3.5 text-yellow-400" />,
    ops: <Activity className="h-3.5 w-3.5 text-purple-400" />,
    contrato: <FileSignature className="h-3.5 w-3.5 text-emerald-400" />,
    presupuesto: <FileText className="h-3.5 w-3.5 text-orange-400" />,
    sistema: <Zap className="h-3.5 w-3.5 text-primary" />,
}

function getRelativeTime(dateStr: string): string {
    try {
        const now = new Date()
        const date = new Date(dateStr)
        const diffMs = now.getTime() - date.getTime()
        const diffSec = Math.floor(diffMs / 1000)
        const diffMin = Math.floor(diffSec / 60)
        const diffHour = Math.floor(diffMin / 60)
        const diffDay = Math.floor(diffHour / 24)

        if (diffSec < 60) return 'Ahora mismo'
        if (diffMin < 60) return `Hace ${diffMin}m`
        if (diffHour < 24) return `Hace ${diffHour}h`
        if (diffDay < 7) return `Hace ${diffDay}d`
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
    } catch {
        return ''
    }
}

export function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const supabase = createClient()

    const unreadCount = notifications.filter(n => !n.leida).length

    const fetchNotifications = useCallback(async () => {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20)

        if (error) {
            console.error('Error fetching notifications:', error)
            return
        }

        setNotifications(data || [])
    }, [supabase])

    useEffect(() => {
        fetchNotifications()
    }, [fetchNotifications])

    useEffect(() => {
        if (open) {
            fetchNotifications()
        }
    }, [open, fetchNotifications])

    async function markAllAsRead() {
        setLoading(true)

        const unreadIds = notifications.filter(n => !n.leida).map(n => n.id)
        if (unreadIds.length === 0) {
            setLoading(false)
            return
        }

        const { error } = await supabase
            .from('notifications')
            .update({ leida: true })
            .in('id', unreadIds)

        if (!error) {
            setNotifications(prev => prev.map(n => ({ ...n, leida: true })))
        }

        setLoading(false)
    }

    async function markAsRead(id: string) {
        const { error } = await supabase
            .from('notifications')
            .update({ leida: true })
            .eq('id', id)

        if (!error) {
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, leida: true } : n)
            )
        }
    }

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(201,162,77,0.5)] animate-pulse" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[380px] bg-card border-border shadow-2xl p-0">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                    <DropdownMenuLabel className="text-xs font-black uppercase tracking-widest text-foreground p-0">
                        Notificaciones
                        {unreadCount > 0 && (
                            <span className="ml-2 text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-black">
                                {unreadCount}
                            </span>
                        )}
                    </DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            disabled={loading}
                            className="text-[10px] text-primary hover:text-primary h-7 gap-1 font-bold uppercase tracking-wider"
                        >
                            <Check className="h-3 w-3" />
                            Marcar todas
                        </Button>
                    )}
                </div>

                <ScrollArea className="max-h-[400px]">
                    {notifications.length > 0 ? (
                        <div className="py-1">
                            {notifications.map(notification => (
                                <button
                                    key={notification.id}
                                    onClick={() => {
                                        if (!notification.leida) markAsRead(notification.id)
                                        if (notification.link) {
                                            window.location.href = notification.link
                                        }
                                    }}
                                    className={`w-full text-left px-4 py-3 hover:bg-secondary/30 transition-colors flex items-start gap-3 relative ${
                                        !notification.leida ? 'bg-primary/5' : ''
                                    }`}
                                >
                                    {/* Unread dot */}
                                    {!notification.leida && (
                                        <span className="absolute top-3 left-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                                    )}

                                    {/* Icon */}
                                    <div className="h-8 w-8 rounded-lg bg-secondary/50 flex items-center justify-center border border-border/50 shrink-0 mt-0.5">
                                        {tipoIcons[notification.tipo] || tipoIcons['sistema']}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={`text-xs font-bold truncate ${!notification.leida ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                {notification.titulo}
                                            </p>
                                            <span className="text-[9px] text-muted-foreground whitespace-nowrap font-medium">
                                                {getRelativeTime(notification.created_at)}
                                            </span>
                                        </div>
                                        {notification.mensaje && (
                                            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                                                {notification.mensaje}
                                            </p>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 px-4">
                            <Bell className="h-8 w-8 text-muted-foreground/20 mb-3" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 italic">
                                Sin notificaciones
                            </p>
                        </div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
