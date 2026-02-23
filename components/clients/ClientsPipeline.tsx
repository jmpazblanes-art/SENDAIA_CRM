"use client"

import { ClientPipeline } from "./ClientPipeline"
import { Client } from "./ClientCard"

interface ClientsPipelineProps {
    initialClients: any[]
}

export function ClientsPipeline({ initialClients }: ClientsPipelineProps) {
    const mappedClients: Client[] = initialClients.map(c => ({
        id: c.id,
        name: c.company_name || `${c.first_name || ""} ${c.last_name || ""}`.trim() || "Sin nombre",
        company: c.company_name || "",
        phone: c.phone || "",
        status: c.status || "lead",
        priority: c.priority || "medium",
        tags: c.tags || [],
        last_contact: c.last_contact,
    }))

    return <ClientPipeline data={mappedClients} />
}
