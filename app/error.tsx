'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Unhandled CRM Error:', error)
    }, [error])

    return (
        <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center p-4 overflow-hidden relative">
            {/* Ambient Background Effects */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-primary/5 blur-[100px] rounded-full" />

            <div className="z-10 w-full max-w-md bg-card/50 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="h-20 w-20 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                        <AlertCircle className="h-10 w-10 text-red-500" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">Fallo en el Sistema</h1>
                        <p className="text-muted-foreground text-sm font-medium">
                            El cerebro de SendaIA ha encontrado una anomalía inesperada.
                        </p>
                    </div>

                    <div className="bg-black/40 border border-border/50 rounded-lg p-3 w-full">
                        <p className="text-[10px] font-mono text-red-400/80 break-all leading-tight">
                            {error.message || "Error interno del servidor (500)"}
                        </p>
                        {error.digest && (
                            <p className="text-[9px] font-mono text-muted-foreground mt-1 uppercase tracking-widest">
                                ID: {error.digest}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full pt-4">
                        <Button
                            onClick={() => reset()}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" /> REINTENTAR
                        </Button>
                        <Link href="/dashboard" className="w-full">
                            <Button
                                variant="outline"
                                className="w-full border-border hover:bg-secondary/50 text-foreground font-bold"
                            >
                                <Home className="h-4 w-4 mr-2" /> INICIO
                            </Button>
                        </Link>
                    </div>

                    <p className="text-[10px] text-muted-foreground/50 uppercase font-black tracking-[0.2em] pt-4">
                        Autoridad Tranquila • SendaIA
                    </p>
                </div>
            </div>
        </div>
    )
}
