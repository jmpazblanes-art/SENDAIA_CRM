
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
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>

            <Sidebar className="hidden lg:flex w-64" />
            <div className="flex flex-1 flex-col overflow-hidden relative z-10 w-full">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth relative z-0">
                    <div className="max-w-[1600px] mx-auto w-full">
                        {children}
                    </div>
                </main>
                <ChatWidget />
            </div>
        </div>
    )
}
