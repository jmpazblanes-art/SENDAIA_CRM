
import { Zap, Loader2, Brain } from "lucide-react"

export default function DashboardLoading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] w-full space-y-8 animate-in fade-in duration-1000">
            {/* Pulsing Neural Core */}
            <div className="relative">
                <div className="h-24 w-24 bg-primary/10 rounded-3xl border border-primary/20 flex items-center justify-center relative z-10 animate-pulse">
                    <Brain className="h-12 w-12 text-primary" />
                </div>
                <div className="absolute inset-0 bg-primary/20 blur-[40px] rounded-full scale-150 opacity-30 animate-pulse" />

                {/* Orbiting particles */}
                <div className="absolute inset-0 animate-spin-slow">
                    <div className="h-2 w-2 bg-primary rounded-full absolute top-0 left-1/2 -translate-x-1/2 shadow-[0_0_10px_#D4AF37]" />
                </div>
            </div>

            <div className="flex flex-col items-center space-y-2">
                <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Estableciendo Enlace Neural</h2>
                </div>
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-[0.2em] opacity-60">SendaIA • Sistema Operativo CRM</p>
            </div>

            {/* Simulated progress segments */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-xs px-4">
                <div className="h-1 bg-primary/20 rounded-full overflow-hidden">
                    <div className="h-full bg-primary animate-progress" />
                </div>
                <div className="h-1 bg-primary/20 rounded-full overflow-hidden">
                    <div className="h-full bg-primary animate-progress" style={{ animationDelay: '0.2s' }} />
                </div>
                <div className="h-1 bg-primary/20 rounded-full overflow-hidden">
                    <div className="h-full bg-primary animate-progress" style={{ animationDelay: '0.4s' }} />
                </div>
            </div>

            <p className="text-[10px] text-primary/40 font-mono italic animate-pulse">Sincronizando flujos de datos en tiempo real...</p>
        </div>
    )
}
