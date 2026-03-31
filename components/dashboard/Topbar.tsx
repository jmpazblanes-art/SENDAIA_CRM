
"use client"

import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Search, User, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import Link from "next/link"
import { logout } from "@/app/login/actions"
import { Sidebar } from "./Sidebar"
import { NotificationCenter } from "./NotificationCenter"

export function Topbar() {
    const pathname = usePathname()

    // Simple breadcrumb logic
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs = segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`
        const label = segment.charAt(0).toUpperCase() + segment.slice(1)
        return { label, href, isLast: index === segments.length - 1 }
    })

    return (
        <header className="relative flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-4 md:px-6">
            {/* Gold gradient line at bottom of topbar */}
            <div
                className="absolute bottom-0 left-0 right-0 h-[1px]"
                style={{
                    background: "linear-gradient(90deg, transparent 0%, rgba(201,162,77,0.15) 20%, rgba(212,175,55,0.4) 50%, rgba(201,162,77,0.15) 80%, transparent 100%)",
                }}
            />

            <div className="flex items-center gap-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="lg:hidden hover:bg-[#C9A24D]/[0.06] transition-colors duration-300">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64 bg-sidebar border-border">
                        <SheetTitle className="sr-only">Menu de Navegacion</SheetTitle>
                        <Sidebar className="w-full border-none" />
                    </SheetContent>
                </Sheet>

                <div className="flex items-center text-sm text-muted-foreground overflow-hidden">
                    {breadcrumbs.map((crumb, i) => (
                        <span key={crumb.href} className="flex items-center whitespace-nowrap">
                            {i > 0 && <span className="mx-2 text-muted-foreground/30">/</span>}
                            <span className={cn(
                                "truncate max-w-[100px] md:max-w-none transition-colors duration-300",
                                crumb.isLast
                                    ? "text-[#D4AF37] font-semibold"
                                    : "text-muted-foreground/60"
                            )}
                            style={crumb.isLast ? { textShadow: "0 0 12px rgba(212, 175, 55, 0.2)" } : undefined}
                            >
                                {crumb.label}
                            </span>
                        </span>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative w-64 hidden md:flex">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/50" />
                    <Input
                        type="search"
                        placeholder="Buscar... (Cmd+K)"
                        className="w-full pl-9 md:w-[300px] lg:w-[300px] border-[#C9A24D]/10 bg-white/[0.03] text-sm transition-all duration-300 focus-visible:ring-1 focus-visible:ring-[#C9A24D]/50 focus-visible:border-[#C9A24D]/30 focus-visible:bg-white/[0.05] placeholder:text-muted-foreground/30"
                        style={{
                            borderRadius: "10px",
                        }}
                    />
                </div>

                <NotificationCenter />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-[#C9A24D]/[0.06] transition-colors duration-300">
                            <Avatar className="h-8 w-8 border border-[#C9A24D]/20 hover:border-[#C9A24D]/40 transition-colors duration-300">
                                <AvatarImage src="/avatars/01.png" alt="@shadcn" />
                                <AvatarFallback className="bg-[#C9A24D]/10 text-[#C9A24D] text-xs font-bold">P</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-[#1A1A1A]/95 backdrop-blur-xl border-[#C9A24D]/10" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">Pachi</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    founder@sendaia.es
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-[#C9A24D]/10" />
                        <Link href="/dashboard/settings">
                            <DropdownMenuItem className="cursor-pointer hover:bg-[#C9A24D]/[0.06] focus:bg-[#C9A24D]/[0.06]">Configuracion</DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator className="bg-[#C9A24D]/10" />
                        <form action={logout}>
                            <button type="submit" className="w-full">
                                <DropdownMenuItem className="text-destructive cursor-pointer hover:bg-red-500/[0.06] focus:bg-red-500/[0.06]">
                                    Cerrar Sesion
                                </DropdownMenuItem>
                            </button>
                        </form>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
