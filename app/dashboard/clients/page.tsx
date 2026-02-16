
import { ClientPipeline } from "@/components/clients/ClientPipeline"
import { CreateClientDialog } from "@/components/clients/CreateClientDialog"
import { ImportLeadDialog } from "@/components/clients/ImportLeadDialog"
import { createClient } from "@/utils/supabase/server"
import { Client } from "@/components/clients/ClientCard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Eye, Kanban, List } from "lucide-react"

export const dynamic = 'force-dynamic'

const columns: ColumnDef<any>[] = [
    {
        accessorKey: "name",
        header: "Nombre",
        cell: ({ row }: any) => {
            return (
                <div className="flex flex-col">
                    <span className="font-bold text-foreground">{row.original.name}</span>
                    <span className="text-[10px] text-muted-foreground">{row.original.company}</span>
                </div>
            )
        }
    },
    {
        accessorKey: "ai_score",
        header: "IA Score",
        cell: ({ row }: any) => {
            const score = row.original.ai_score
            return (
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 w-12 bg-secondary rounded-full overflow-hidden">
                        <div
                            className={`h-full ${score > 80 ? 'bg-green-500' : score > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${score}%` }}
                        />
                    </div>
                    <span className={`text-[10px] font-black ${score > 80 ? 'text-green-500' : score > 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {score}%
                    </span>
                </div>
            )
        }
    },
    {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }: any) => {
            const status = row.getValue("status") as string
            return (
                <Badge variant="outline" className="capitalize border-primary/30 text-primary bg-primary/5">
                    {status}
                </Badge>
            )
        }
    },
    {
        accessorKey: "last_contact",
        header: () => <span className="hidden md:inline">Último Contacto</span>,
        cell: ({ row }: any) => {
            const date = row.getValue("last_contact") as string
            try {
                return <span className="hidden md:inline">{date ? format(new Date(date), "d MMM, yyyy", { locale: es }) : "-"}</span>
            } catch (e) {
                return <span className="hidden md:inline">-</span>
            }
        }
    },
    {
        accessorKey: "next_action",
        header: () => <span className="hidden lg:inline">Próxima Acción</span>,
        cell: ({ row }: any) => {
            const date = row.original.next_action as string
            try {
                return <span className="hidden lg:inline">{date ? (
                    <span className="text-secondary-foreground font-medium">
                        {format(new Date(date), "d MMM", { locale: es })}
                    </span>
                ) : "-"}</span>
            } catch (e) {
                return <span className="hidden lg:inline">-</span>
            }
        }
    },
    {
        accessorKey: "source",
        header: () => <span className="hidden xl:inline">Origen</span>,
        cell: ({ row }: any) => <span className="text-xs text-muted-foreground italic hidden xl:inline">{row.original.source || "Directo"}</span>
    },
    {
        id: "actions",
        cell: ({ row }: any) => (
            <Link href={`/dashboard/clients/${row.original.id}`}>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                    <Eye className="h-4 w-4" />
                </Button>
            </Link>
        )
    }
]

export default async function ClientsPage() {
    const supabase = await createClient()

    const { data: clients } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })


    const mappedClients: any[] = clients?.map(client => {
        const firstName = client.first_name || "Cliente"
        const lastName = client.last_name || ""
        return {
            id: client.id,
            name: `${firstName} ${lastName}`.trim(),
            company: client.company_name || "",
            phone: client.phone || "Sin teléfono",
            status: client.status || "lead",
            source: client.source || "Directo",
            last_contact: client.last_contact_date,
            next_action: client.next_follow_up,
            priority: client.priority || 'medium',
            tags: client.pain_points || [],
            ai_score: Math.floor(Math.random() * (98 - 45 + 1)) + 45, // AI Agency mock score
        }
    }) || []

    return (
        <div className="flex flex-col h-full space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Base de Datos de Clientes</h1>
                    <p className="text-muted-foreground text-sm">Gestiona tus leads y oportunidades de negocio.</p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="flex-1 md:flex-none">
                        <ImportLeadDialog />
                    </div>
                    <div className="flex-1 md:flex-none">
                        <CreateClientDialog />
                    </div>
                </div>
            </div>

            <Tabs defaultValue="pipeline" className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <TabsList className="bg-secondary/20 border border-border">
                        <TabsTrigger value="pipeline" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                            <Kanban className="h-4 w-4 mr-2" /> Pipeline
                        </TabsTrigger>
                        <TabsTrigger value="list" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                            <List className="h-4 w-4 mr-2" /> Lista
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="pipeline" className="flex-1 mt-0">
                    <div className="h-[calc(100vh-16rem)] overflow-hidden">
                        <ClientPipeline data={mappedClients} />
                    </div>
                </TabsContent>

                <TabsContent value="list" className="flex-1 mt-0 bg-card border border-border rounded-xl p-4 shadow-xl">
                    <DataTable
                        columns={columns}
                        data={mappedClients}
                    />
                </TabsContent>
            </Tabs>
        </div >
    )
}
