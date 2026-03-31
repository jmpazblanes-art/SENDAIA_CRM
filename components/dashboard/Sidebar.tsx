
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
    { icon: BookOpen, label: "Libreria Prompts", href: "/dashboard/prompts" },
    { icon: Activity, label: "Ops Center", href: "/dashboard/ops" },
]

interface SidebarProps {
    className?: string
}

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname()

    return (
        <div className={cn("flex h-screen flex-col border-r border-border bg-sidebar text-sidebar-foreground relative", className)}>
            {/* Gold left edge accent */}
            <div
                className="absolute top-0 left-0 w-[1px] h-full z-10"
                style={{
                    background: "linear-gradient(180deg, transparent 0%, rgba(201,162,77,0.2) 20%, rgba(212,175,55,0.4) 50%, rgba(201,162,77,0.2) 80%, transparent 100%)",
                    animation: "sidebar-glow 6s ease-in-out infinite",
                }}
            />

            {/* Logo area with gold glow */}
            <div className="flex h-16 items-center border-b border-border px-4 relative">
                {/* Glow behind logo */}
                <div
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full blur-xl"
                    style={{ background: "radial-gradient(circle, rgba(201,162,77,0.12) 0%, transparent 70%)" }}
                />
                <Link href="/dashboard" className="group flex items-center gap-2 transition-all duration-300 hover:opacity-90 relative z-10">
                    <Image
                        src="/logo-sendaia-transparent.png"
                        alt="SendaIA"
                        width={40}
                        height={40}
                        className="transition-transform duration-300 group-hover:scale-110"
                        style={{ filter: "drop-shadow(0 0 8px rgba(201, 162, 77, 0.2))" }}
                    />
                    <span
                        className="text-xl font-black tracking-tighter text-[#C9A24D]"
                        style={{ textShadow: "0 0 20px rgba(201, 162, 77, 0.15)" }}
                    >
                        SendaIA
                    </span>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <nav className="grid gap-0.5 px-2">
                    {sidebarItems.map((item, index) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(
                                    "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300",
                                    isActive
                                        ? "text-[#D4AF37]"
                                        : "text-muted-foreground hover:text-foreground/80"
                                )}
                                style={isActive ? {
                                    background: "rgba(201, 162, 77, 0.06)",
                                    boxShadow: "inset 0 0 20px rgba(201, 162, 77, 0.03)",
                                } : undefined}
                            >
                                {/* Active indicator - gold left border */}
                                {isActive && (
                                    <div
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 rounded-full"
                                        style={{
                                            background: "linear-gradient(180deg, transparent, #D4AF37, transparent)",
                                            boxShadow: "0 0 8px rgba(212, 175, 55, 0.5)",
                                        }}
                                    />
                                )}

                                {/* Hover gold tint overlay */}
                                <div className={cn(
                                    "absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300",
                                    !isActive && "bg-[#C9A24D]/[0.03]"
                                )} />

                                <item.icon className={cn(
                                    "h-4 w-4 relative z-10 transition-colors duration-300",
                                    isActive ? "text-[#D4AF37]" : "text-muted-foreground"
                                )} />
                                <span className="relative z-10">{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* Gold separator line before footer */}
            <div
                className="mx-4 h-[1px]"
                style={{
                    background: "linear-gradient(90deg, transparent, rgba(201, 162, 77, 0.2), transparent)",
                }}
            />

            <div className="mt-auto p-4">
                <div className="grid gap-0.5">
                    <Link
                        href="/dashboard/settings"
                        className={cn(
                            "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300",
                            pathname === "/dashboard/settings"
                                ? "text-[#D4AF37]"
                                : "text-muted-foreground hover:text-foreground/80"
                        )}
                        style={pathname === "/dashboard/settings" ? {
                            background: "rgba(201, 162, 77, 0.06)",
                        } : undefined}
                    >
                        {pathname === "/dashboard/settings" && (
                            <div
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 rounded-full"
                                style={{
                                    background: "linear-gradient(180deg, transparent, #D4AF37, transparent)",
                                    boxShadow: "0 0 8px rgba(212, 175, 55, 0.5)",
                                }}
                            />
                        )}
                        <Settings className={cn("h-4 w-4", pathname === "/dashboard/settings" ? "text-[#D4AF37]" : "")} />
                        Configuracion
                    </Link>
                    <form action={logout}>
                        <Button
                            type="submit"
                            variant="ghost"
                            className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-red-400 hover:bg-red-500/[0.06] rounded-lg transition-all duration-300"
                        >
                            <LogOut className="h-4 w-4" />
                            Cerrar Sesion
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
