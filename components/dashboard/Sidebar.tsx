
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Users,
    Briefcase,
    Calendar,
    FileText,
    Phone,
    Settings,
    LogOut,
    Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { logout } from "@/app/login/actions"

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Users, label: "Clientes", href: "/dashboard/clients" },
    { icon: Briefcase, label: "Equipo", href: "/dashboard/team" },
    { icon: Calendar, label: "Citas", href: "/dashboard/appointments" },
    { icon: FileText, label: "Facturas", href: "/dashboard/invoices" },
    { icon: Zap, label: "Automatizaciones", href: "/dashboard/automations" },
    { icon: Phone, label: "Agentes de Voz", href: "/dashboard/calls" },
    { icon: FileText, label: "Librería Prompts", href: "/dashboard/prompts" },
]

interface SidebarProps {
    className?: string
}

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname()

    return (
        <div className={cn("flex h-screen flex-col border-r border-border bg-sidebar text-sidebar-foreground", className)}>
            <div className="flex h-16 items-center border-b border-border px-6">
                <Link href="/dashboard" className="group">
                    <h1 className="text-2xl font-black tracking-tighter transition-all duration-300 group-hover:scale-105">
                        <span className="relative inline-block text-primary drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] [text-shadow:_0_1px_0_rgb(0_0_0_/_40%),_0_2px_0_rgb(0_0_0_/_40%),_0_3px_0_rgb(0_0_0_/_40%),_0_4px_0_rgb(0_0_0_/_40%),_0_5px_0_rgb(0_0_0_/_40%),_0_6px_1px_rgba(0,0,0,.1),_0_0_5px_rgba(0,0,0,.1),_0_1px_3px_rgba(0,0,0,.3),_0_3px_5px_rgba(0,0,0,.2),_0_5px_10px_rgba(0,0,0,.25),_0_10px_10px_rgba(0,0,0,.2),_0_20px_20px_rgba(0,0,0,.15)] before:absolute before:inset-0 before:content-['SendaIA'] before:text-white/10 before:translate-x-[0.5px] before:translate-y-[0.5px] before:blur-[1px]">
                            SendaIA
                        </span>
                    </h1>
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
