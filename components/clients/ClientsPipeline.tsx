"use client"

import { useState, useEffect } from "react"
import { ClientPipeline } from "./ClientPipeline"
import { Client } from "./ClientCard"
import { createClient } from "@/utils/supabase/client"

interface ClientsPipelineProps {
    initialClients: any[]
}

export function ClientsPipeline({ initialClients }: ClientsPipelineProps) {
    const [clients, setClients] = useState<any[]>(initialClients)
    const supabase = createClient()

    useEffect(() => {
        // Initial setup
        setClients(initialClients)

        // Realtime subscription
        const channel = supabase
            .channel('public:clients')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'clients'
            }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setClients(prev => [payload.new, ...prev])
                } else if (payload.eventType === 'UPDATE') {
                    setClients(prev => prev.map(c => c.id === payload.new.id ? payload.new : c))
                } else if (payload.eventType === 'DELETE') {
                    setClients(prev => prev.filter(c => c.id !== payload.old.id))
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [initialClients, supabase])

    const mappedClients: Client[] = clients.map(c => ({
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
