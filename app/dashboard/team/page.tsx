
import { EmployeeCard } from "@/components/team/EmployeeCard"
import { Button } from "@/components/ui/button"
import { Plus, Users } from "lucide-react"
import { createClient } from "@/utils/supabase/server"

export const dynamic = 'force-dynamic'

export default async function TeamPage() {
    const supabase = await createClient()

    const { data: employees } = await supabase
        .from('employees')
        .select('*')
        .order('role', { ascending: true })


    const mappedEmployees = employees?.map(emp => {
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
    }) || []

    return (
        <div className="flex flex-col h-full space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Nuestro Equipo</h1>
                        <p className="text-muted-foreground italic text-sm">El talento detrás de la autoridad en IA.</p>
                    </div>
                </div>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                    <Plus className="mr-2 h-4 w-4" /> Añadir Miembro
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {mappedEmployees.map(emp => (
                    <EmployeeCard key={emp.id} employee={emp} />
                ))}
            </div>

            {mappedEmployees.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-secondary/10 rounded-xl border border-dashed border-border">
                    <Users className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                    <p className="text-muted-foreground">No se han encontrado miembros del equipo en la base de datos.</p>
                    <Button variant="link" className="text-primary mt-2">Darse de alta como el primero</Button>
                </div>
            )}
        </div>
    )
}
