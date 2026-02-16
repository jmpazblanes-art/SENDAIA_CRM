"use client"

import { ClientCard, Client } from "./ClientCard"

interface ClientPipelineProps {

    data: Client[]
}

export function ClientPipeline({ data }: ClientPipelineProps) {
    const columns = [
        { id: 'lead', label: 'Leads' },
        { id: 'qualified', label: 'Cualificados' },
        { id: 'active', label: 'Activos' },
        { id: 'closed', label: 'Cerrados' },
    ]

    return (
        <div className="flex h-full gap-4 overflow-x-auto pb-4">
            {columns.map(col => (
                <div key={col.id} className="min-w-[300px] flex-1 flex flex-col bg-secondary/30 rounded-lg p-2 border border-border/50">
                    <div className="flex items-center justify-between p-2 mb-2">
                        <h3 className="font-semibold text-sm text-foreground">{col.label}</h3>
                        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                            {data.filter(c => c.status === col.id).length}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2">
                        {data.filter(c => c.status === col.id).map(client => (
                            <ClientCard key={client.id} client={client} />
                        ))}
                        {data.filter(c => c.status === col.id).length === 0 && (
                            <div className="text-center text-xs text-muted-foreground py-4">
                                No hay clientes en esta etapa
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

