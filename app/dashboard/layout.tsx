
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

            {/* Ambient Background Effects — drifting blurred circles */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div
                    className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"
                    style={{ animation: "drift-1 25s ease-in-out infinite" }}
                />
                <div
                    className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"
                    style={{ animation: "drift-2 30s ease-in-out infinite" }}
                />
                {/* Additional subtle gold orb */}
                <div
                    className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-[#C9A24D]/[0.02] blur-[80px] rounded-full"
                    style={{ animation: "drift-1 35s ease-in-out infinite reverse" }}
                />

                {/* Subtle animated grid pattern */}
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(212,175,55,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(212,175,55,0.03) 1px, transparent 1px)
                        `,
                        backgroundSize: "60px 60px",
                        animation: "grid-fade 8s ease-in-out infinite",
                    }}
                />
            </div>

            {/* Sidebar can fail silently if hidden, but we want it robust */}
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

            {/* Bottom Status Text - FOR VISIBILITY VERIFICATION */}
            <div className="fixed bottom-2 left-4 z-[100] pointer-events-none">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary/30 opacity-50">
                    Neural Link Active • SendaIA Command Center
                </span>
            </div>
        </div>
    )
}
