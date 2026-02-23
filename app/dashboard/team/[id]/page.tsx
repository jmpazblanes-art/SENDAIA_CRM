
import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Phone, Mail, Briefcase, Award, Calendar,
    ArrowUpRight, Users, TrendingUp, DollarSign,
    ChevronLeft, Edit, Shield, Clock
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default async function EmployeeDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params
    const supabase = await createClient()

    if (!supabase) {
        notFound()
    }

    const { data: employee } = await supabase
        .from('employees')
        .select(`
            *,
            clients (
                id,
                first_name,
                last_name,
                company_name,
                status
            )
        `)
        .eq('id', id)
        .single()

    if (!employee) {
        notFound()
    }

    return (
        <div className="flex flex-col h-full space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/team">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {employee.first_name} {employee.last_name}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="bg-primary/20 text-primary border-none">
                                {employee.role.toUpperCase()}
                            </Badge>
                            <span className="text-muted-foreground text-sm flex items-center gap-1">
                                <Award className="h-3 w-3" /> {employee.specialty}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <Edit className="h-4 w-4 mr-2" /> Editar Perfil
                    </Button>
                    <Button className="bg-primary text-primary-foreground">
                        <Shield className="h-4 w-4 mr-2" /> Permisos
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card border-border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Clientes Asignados</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{employee.clients_assigned}</div>
                        <p className="text-xs text-muted-foreground mt-1">+2 este mes</p>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Ventas Cerradas</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{employee.total_deals_closed}</div>
                        <p className="text-xs text-muted-foreground mt-1">Ratio: 45%</p>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos Generados</CardTitle>
                        <DollarSign className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Number(employee.total_revenue_generated || 0).toLocaleString('es-ES')}€</div>
                        <p className="text-xs text-muted-foreground mt-1">Objetivo: 150k€</p>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Antigüedad</CardTitle>
                        <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {(() => {
                                try {
                                    return employee.hire_date ? format(new Date(employee.hire_date), 'yyyy') : '2024'
                                } catch (e) {
                                    return '2024'
                                }
                            })()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Desde incorporación</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-card border-border shadow-md">
                        <CardHeader>
                            <CardTitle className="text-lg">Clientes en Gestión</CardTitle>
                            <CardDescription>Principales cuentas asignadas a este miembro</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {employee.clients?.map((client: any) => (
                                    <Link key={client.id} href={`/dashboard/clients/${client.id}`}>
                                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/20 border border-transparent hover:border-border transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center font-bold text-xs">
                                                    {(client.first_name?.[0] ?? "?")}{(client.last_name?.[0] ?? "")}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{client.first_name} {client.last_name}</p>
                                                    <p className="text-xs text-muted-foreground">{client.company_name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Badge variant="outline" className="text-[10px] h-5">
                                                    {(client.status ?? "lead").toUpperCase()}
                                                </Badge>
                                                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        </div>
                                    </Link>
                                )) || <p className="text-sm text-muted-foreground italic">No hay clientes asignados.</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <Card className="bg-card border-border shadow-md">
                        <CardHeader>
                            <CardTitle className="text-lg">Detalles de Contacto</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="h-4 w-4 text-primary" />
                                <span>{employee.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="h-4 w-4 text-primary" />
                                <span>{employee.phone || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Briefcase className="h-4 w-4 text-primary" />
                                <span>{employee.role} • Full-time</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border shadow-md">
                        <CardHeader>
                            <CardTitle className="text-lg">Bio & Notas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {employee.bio || 'Sin descripción disponible para este miembro del equipo.'}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
