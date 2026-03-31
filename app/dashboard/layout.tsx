
import { Sidebar } from "@/components/dashboard/Sidebar"
import { Topbar } from "@/components/dashboard/Topbar"
import { ChatWidget } from "@/components/chat/ChatWidget"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-[#0A0C10] text-slate-200">
            {/* Gold gradient line at the very top of the page */}
            <div
                className="fixed top-0 left-0 w-full h-[1px] z-[100]"
                style={{
                    background:
                        "linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.1) 15%, rgba(212,175,55,0.6) 35%, rgba(212,175,55,0.9) 50%, rgba(212,175,55,0.6) 65%, rgba(212,175,55,0.1) 85%, transparent 100%)",
                    boxShadow:
                        "0 0 8px rgba(212,175,55,0.3), 0 0 20px rgba(212,175,55,0.1)",
                }}
            />

            {/* Vignette overlay - darker edges */}
            <div
                className="fixed inset-0 pointer-events-none z-[2]"
                style={{
                    background: "radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.5) 100%)",
                }}
            />

            {/* Ambient Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                {/* Drifting orbs - INCREASED opacity for visible ambient glow */}
                <div
                    className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.12] blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"
                    style={{ animation: "drift-1 25s ease-in-out infinite" }}
                />
                <div
                    className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/[0.08] blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"
                    style={{ animation: "drift-2 30s ease-in-out infinite" }}
                />
                <div
                    className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-[#C9A24D]/[0.07] blur-[80px] rounded-full"
                    style={{ animation: "drift-1 35s ease-in-out infinite reverse" }}
                />
                {/* Extra orb for richness */}
                <div
                    className="absolute top-1/4 right-1/4 w-[250px] h-[250px] bg-[#D4AF37]/[0.06] blur-[100px] rounded-full"
                    style={{ animation: "drift-2 40s ease-in-out infinite reverse" }}
                />
                {/* Additional ambient orb — bottom right */}
                <div
                    className="absolute bottom-1/4 right-1/3 w-[350px] h-[350px] bg-[#C9A24D]/[0.05] blur-[90px] rounded-full"
                    style={{ animation: "drift-1 32s ease-in-out infinite 5s" }}
                />

                {/* Animated grid pattern — MORE VISIBLE */}
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(212,175,55,0.06) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(212,175,55,0.06) 1px, transparent 1px)
                        `,
                        backgroundSize: "60px 60px",
                        animation: "grid-fade 8s ease-in-out infinite",
                    }}
                />

                {/* Scanline effect — more visible */}
                <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ opacity: 0.03 }}
                >
                    <div
                        className="absolute w-full h-[30%]"
                        style={{
                            background: "linear-gradient(180deg, transparent, rgba(201, 162, 77, 0.4), transparent)",
                            animation: "scanline-dashboard 12s linear infinite",
                        }}
                    />
                </div>

                {/* Horizontal scan line — slow sweep every 15s */}
                <div
                    className="absolute inset-0 overflow-hidden"
                >
                    <div
                        className="absolute w-full h-[2px] left-0"
                        style={{
                            background: "linear-gradient(90deg, transparent 0%, rgba(201, 162, 77, 0.15) 20%, rgba(212, 175, 55, 0.4) 50%, rgba(201, 162, 77, 0.15) 80%, transparent 100%)",
                            boxShadow: "0 0 15px 3px rgba(201, 162, 77, 0.15)",
                            animation: "scanline-sweep 15s linear infinite",
                        }}
                    />
                </div>

                {/* 12 Floating particles — VISIBLE gold dots with glow */}
                <div className="dash-particle" style={{ top: "8%", left: "12%", width: "4px", height: "4px", animation: "float-particle-dash 18s ease-in-out infinite" }} />
                <div className="dash-particle-lg" style={{ top: "25%", right: "18%", animation: "float-particle-dash 22s ease-in-out infinite 2s" }} />
                <div className="dash-particle" style={{ bottom: "20%", left: "35%", width: "3px", height: "3px", animation: "float-particle-dash 20s ease-in-out infinite 4s" }} />
                <div className="dash-particle-lg" style={{ top: "55%", right: "30%", animation: "float-particle-dash 24s ease-in-out infinite 6s" }} />
                <div className="dash-particle-sm" style={{ top: "12%", left: "55%", animation: "float-particle-dash 19s ease-in-out infinite 1s" }} />
                <div className="dash-particle" style={{ bottom: "12%", right: "12%", width: "5px", height: "5px", animation: "float-particle-dash 21s ease-in-out infinite 3s" }} />
                <div className="dash-particle-lg" style={{ top: "40%", left: "8%", animation: "float-particle-dash 26s ease-in-out infinite 5s" }} />
                <div className="dash-particle-sm" style={{ top: "70%", left: "65%", animation: "float-particle-dash 17s ease-in-out infinite 7s" }} />
                <div className="dash-particle" style={{ top: "18%", right: "45%", width: "3px", height: "3px", animation: "float-particle-dash 23s ease-in-out infinite 8s" }} />
                <div className="dash-particle-lg" style={{ bottom: "35%", right: "55%", animation: "float-particle-dash 28s ease-in-out infinite 9s" }} />
                <div className="dash-particle-sm" style={{ top: "85%", left: "25%", animation: "float-particle-dash 15s ease-in-out infinite 10s" }} />
                <div className="dash-particle" style={{ top: "45%", right: "8%", width: "4px", height: "4px", animation: "float-particle-dash 30s ease-in-out infinite 11s" }} />
            </div>

            {/* Sidebar */}
            <Sidebar className="hidden lg:flex w-64 border-r border-border/50 relative z-20" />

            <div className="flex flex-1 flex-col overflow-hidden relative z-10 w-full">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-3 md:p-6 scroll-smooth relative z-0">
                    <div className="max-w-[1600px] mx-auto w-full pb-20 page-enter">
                        {children}
                    </div>
                </main>

                {/* Safe Chat Widget */}
                <div className="relative z-[60]">
                    <ChatWidget />
                </div>
            </div>

            {/* Bottom Status Text */}
            <div className="fixed bottom-2 left-4 z-[100] pointer-events-none">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary/30 opacity-50">
                    Neural Link Active &bull; SendaIA Command Center
                </span>
            </div>
        </div>
    )
}
