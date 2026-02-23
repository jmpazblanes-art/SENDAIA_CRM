
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
            {/* Neural Link Status Indicator - FIXED TOP BAR */}
            <div className="fixed top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent z-[100] border-b border-primary/10 shadow-[0_0_10px_rgba(201,162,77,0.2)]" />

            {/* Ambient Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>

            {/* Sidebar can fail silently if hidden, but we want it robust */}
            <Sidebar className="hidden lg:flex w-64 border-r border-border/50 relative z-20" />

            <div className="flex flex-1 flex-col overflow-hidden relative z-10 w-full">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth relative z-0">
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
