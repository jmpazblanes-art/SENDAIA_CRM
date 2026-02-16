
"use client"

import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Bell, Search, User, Menu } from "lucide-react"
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
        <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-6">
            <div className="flex items-center gap-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="lg:hidden">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64 bg-sidebar border-border">
                        <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
                        <Sidebar className="w-full border-none" />
                    </SheetContent>
                </Sheet>

                <div className="flex items-center text-sm text-muted-foreground overflow-hidden">
                    {breadcrumbs.map((crumb, i) => (
                        <span key={crumb.href} className="flex items-center whitespace-nowrap">
                            {i > 0 && <span className="mx-2">/</span>}
                            <span className={cn(
                                "truncate max-w-[100px] md:max-w-none",
                                crumb.isLast ? "text-foreground font-medium" : ""
                            )}>
                                {crumb.label}
                            </span>
                        </span>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative w-64 hidden md:flex">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar... (Cmd+K)"
                        className="w-full bg-secondary pl-9 md:w-[300px] lg:w-[300px] border-none focus-visible:ring-1 focus-visible:ring-primary"
                    />
                </div>

                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8 border border-border">
                                <AvatarImage src="/avatars/01.png" alt="@shadcn" />
                                <AvatarFallback>P</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">Pachi</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    founder@sendaia.es
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <Link href="/dashboard/settings">
                            <DropdownMenuItem className="cursor-pointer">Configuración</DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <form action={logout}>
                            <button type="submit" className="w-full">
                                <DropdownMenuItem className="text-destructive cursor-pointer">
                                    Cerrar Sesión
                                </DropdownMenuItem>
                            </button>
                        </form>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
