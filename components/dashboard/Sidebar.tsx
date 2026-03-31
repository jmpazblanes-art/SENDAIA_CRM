
"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Users,
    Kanban,
    Briefcase,
    Calendar,
    FileText,
    FileSignature,
    Phone,
    Settings,
    LogOut,
    Zap,
    Activity,
    ClipboardList,
    Clock,
    BookOpen
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { logout } from "@/app/login/actions"

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Users, label: "Clientes", href: "/dashboard/clients" },
    { icon: Kanban, label: "Pipeline", href: "/dashboard/pipeline" },
    { icon: ClipboardList, label: "Presupuestos", href: "/dashboard/presupuestos" },
    { icon: FileSignature, label: "Contratos", href: "/dashboard/contratos" },
    { icon: Briefcase, label: "Equipo", href: "/dashboard/team" },
    { icon: Calendar, label: "Citas", href: "/dashboard/appointments" },
    { icon: FileText, label: "Facturas", href: "/dashboard/invoices" },
    { icon: Clock, label: "Horas", href: "/dashboard/horas" },
    { icon: Zap, label: "Automatizaciones", href: "/dashboard/automations" },
    { icon: Phone, label: "Agentes de Voz", href: "/dashboard/calls" },
    { icon: BookOpen, label: "Librería Prompts", href: "/dashboard/prompts" },
    { icon: Activity, label: "Ops Center", href: "/dashboard/ops" },
]

interface SidebarProps {
    className?: string
}

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname()

    return (
        <div className={cn("flex h-screen flex-col border-r border-border bg-sidebar text-sidebar-foreground", className)}>
            <div className="flex h-16 items-center border-b border-border px-4">
                <Link href="/dashboard" className="group flex items-center gap-2 transition-all duration-300 hover:opacity-90">
                    <Image
                        src="/logo-sendaia-transparent.png"
                        alt="SendaIA"
                        width={40}
                        height={40}
                        className="transition-transform duration-300 group-hover:scale-110"
                    />
                    <span className="text-xl font-black tracking-tighter text-[#C9A24D]">
                        SendaIA
                    </span>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <nav className="grid gap-1 px-2">
                    {sidebarItems.map((item, index) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-sidebar-accent text-primary"
                                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-primary"
                                )}
                            >
                                <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="mt-auto border-t border-border p-4">
                <div className="grid gap-1">
                    <Link
                        href="/dashboard/settings"
                        className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-sidebar-accent hover:text-primary",
                            pathname === "/dashboard/settings" && "bg-sidebar-accent text-primary"
                        )}
                    >
                        <Settings className="h-4 w-4" />
                        Configuración
                    </Link>
                    <form action={logout}>
                        <Button type="submit" variant="ghost" className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                            <LogOut className="h-4 w-4" />
                            Cerrar Sesión
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
