
import { EmployeeCard } from "@/components/team/EmployeeCard"
import { Button } from "@/components/ui/button"
import { Plus, Users, ShieldCheck } from "lucide-react"
import { createClient } from "@/utils/supabase/server"

export const dynamic = 'force-dynamic'

export default async function TeamPage() {
    try {
        const supabase = await createClient()

        if (!supabase) {
            throw new Error("TALENT_CORE_OFFLINE: Variables de entorno de Supabase no configuradas.")
        }

        const { data: employees, error: empError } = await supabase
            .from('employees')
            .select('*')
            .order('role', { ascending: true })

        if (empError) {
            console.error("Supabase fetch error in TeamPage:", empError)
        }

        const mappedEmployees = (employees || []).map(emp => {
            const firstName = emp.first_name || "Miembro"
            const lastName = emp.last_name || ""
            return {
                id: emp.id,
                name: `${firstName} ${lastName}`.trim(),
                initials: `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "?",
                role: emp.role || 'technician',
                specialty: emp.specialty || 'Especialista IA',
                email: emp.email || 'N/A',
                phone: emp.phone || 'Sin teléfono',
                avatar: emp.avatar_url || `/avatars/${emp.role === 'founder' ? 'pachi' : '02'}.png`,
                stats: {
                    clients: emp.clients_assigned || 0,
                    revenue: emp.total_revenue_generated
                        ? (emp.total_revenue_generated / 1000).toFixed(0) + 'k€'
                        : 'N/A'
                }
            }
        })

        return (
            <div className="flex flex-col h-full space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg shadow-[0_0_15px_rgba(201,162,77,0.1)] border border-primary/20">
                            <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase italic">Elite Operativa IA</h1>
                            <p className="text-muted-foreground italic text-sm font-medium tracking-tight">El talento y la arquitectura humana detrás de SendaIA.</p>
                        </div>
                    </div>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 text-xs font-bold uppercase tracking-widest transition-all">
                        <Plus className="mr-2 h-4 w-4" /> Añadir Miembro
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {mappedEmployees.map(emp => (
                        <EmployeeCard key={emp.id} employee={emp} />
                    ))}
                </div>

                {mappedEmployees.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 bg-secondary/5 rounded-2xl border border-dashed border-border/50 group hover:bg-secondary/10 transition-colors">
                        <Users className="h-16 w-16 text-muted-foreground/20 mb-6 group-hover:scale-110 transition-transform" />
                        <p className="text-muted-foreground font-bold uppercase text-xs tracking-widest italic">Personal No Identificado</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-2 max-w-xs text-center px-4">No se han encontrado registros activos en el módulo de recursos humanos de SendaIA.</p>
                        <Button variant="link" className="text-primary mt-4 font-black uppercase text-[10px] tracking-tighter hover:no-underline">Inyectar primer perfil operativo</Button>
                    </div>
                )}
            </div>
        )
    } catch (error: any) {
        console.error("Critical error in TeamPage:", error)
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <div className="p-8 bg-primary/10 border border-primary/30 rounded-2xl shadow-2xl text-center max-w-md">
                    <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-4 animate-bounce" />
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Fallo en Bio-Métrica Team</h2>
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed font-medium">
                        Se ha interrumpido la conexión con el servidor de gestión de talento. Por favor, verifica el estado del clúster de base de datos.
                    </p>
                    <div className="mt-8 pt-6 border-t border-border/50">
                        <p className="text-[9px] font-mono text-primary/50 uppercase tracking-widest">Error Trace: {error?.message || "Talent Service Down"}</p>
                    </div>
                </div>
            </div>
        )
    }
}
