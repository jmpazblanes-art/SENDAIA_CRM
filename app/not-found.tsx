import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center p-4 overflow-hidden relative">
            {/* Ambient Background Effects */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-500/5 blur-[100px] rounded-full" />

            <div className="z-10 w-full max-w-md bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="h-20 w-20 bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                        <Search className="h-10 w-10 text-primary" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">404</h1>
                        <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">Ruta No Encontrada</h2>
                        <p className="text-muted-foreground text-sm font-medium">
                            Has navegado fuera del mapa estratégico. Esta página no existe o ha sido movida.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 w-full pt-4">
                        <Link href="/dashboard" className="w-full">
                            <Button
                                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                            >
                                <Home className="h-4 w-4 mr-2" /> VOLVER AL COMMAND CENTER
                            </Button>
                        </Link>
                    </div>

                    <p className="text-[10px] text-muted-foreground/50 uppercase font-black tracking-[0.2em] pt-4">
                        Navegación Inteligente • SendaIA
                    </p>
                </div>
            </div>
        </div>
    )
}
