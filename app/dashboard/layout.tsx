
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
                {/* Drifting orbs - increased opacity */}
                <div
                    className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.08] blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"
                    style={{ animation: "drift-1 25s ease-in-out infinite" }}
                />
                <div
                    className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/[0.06] blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"
                    style={{ animation: "drift-2 30s ease-in-out infinite" }}
                />
                <div
                    className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-[#C9A24D]/[0.04] blur-[80px] rounded-full"
                    style={{ animation: "drift-1 35s ease-in-out infinite reverse" }}
                />
                {/* Extra orb for richness */}
                <div
                    className="absolute top-1/4 right-1/4 w-[250px] h-[250px] bg-[#D4AF37]/[0.03] blur-[100px] rounded-full"
                    style={{ animation: "drift-2 40s ease-in-out infinite reverse" }}
                />

                {/* Subtle animated grid pattern - more visible */}
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(212,175,55,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(212,175,55,0.04) 1px, transparent 1px)
                        `,
                        backgroundSize: "60px 60px",
                        animation: "grid-fade 8s ease-in-out infinite",
                    }}
                />

                {/* Subtle scanline effect across entire dashboard */}
                <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ opacity: 0.015 }}
                >
                    <div
                        className="absolute w-full h-[30%]"
                        style={{
                            background: "linear-gradient(180deg, transparent, rgba(201, 162, 77, 0.3), transparent)",
                            animation: "scanline-dashboard 12s linear infinite",
                        }}
                    />
                </div>

                {/* Floating particles */}
                <div className="dash-particle" style={{ top: "12%", left: "15%", animation: "float-particle-dash 18s ease-in-out infinite" }} />
                <div className="dash-particle" style={{ top: "30%", right: "20%", animation: "float-particle-dash 22s ease-in-out infinite 2s" }} />
                <div className="dash-particle" style={{ bottom: "25%", left: "40%", animation: "float-particle-dash 20s ease-in-out infinite 4s" }} />
                <div className="dash-particle" style={{ top: "60%", right: "35%", animation: "float-particle-dash 24s ease-in-out infinite 6s" }} />
                <div className="dash-particle" style={{ top: "15%", left: "60%", animation: "float-particle-dash 19s ease-in-out infinite 1s" }} />
                <div className="dash-particle" style={{ bottom: "15%", right: "15%", animation: "float-particle-dash 21s ease-in-out infinite 3s" }} />
            </div>

            {/* Sidebar */}
            <Sidebar className="hidden lg:flex w-64 border-r border-border/50 relative z-20" />

            <div className="flex flex-1 flex-col overflow-hidden relative z-10 w-full">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-3 md:p-6 scroll-smooth relative z-0">
                    <div className="max-w-[1600px] mx-auto w-full pb-20">
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
