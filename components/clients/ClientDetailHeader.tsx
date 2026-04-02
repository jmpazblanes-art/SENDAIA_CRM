
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Edit, Zap } from "lucide-react"
import { EditClientDialog } from "@/components/clients/EditClientDialog"

interface ClientDetailHeaderProps {
    client: any
}

export function ClientDetailHeader({ client }: ClientDetailHeaderProps) {
    const [editOpen, setEditOpen] = useState(false)

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                className="border-border hover:bg-secondary/30 text-xs font-bold uppercase transition-all"
                onClick={() => setEditOpen(true)}
            >
                <Edit className="h-4 w-4 mr-2" /> Editar
            </Button>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 text-xs font-bold uppercase transition-all border-b-2 border-primary-foreground/20 active:border-b-0">
                <Zap className="h-4 w-4 mr-2" /> Acción IA
            </Button>
            <EditClientDialog
                client={client}
                open={editOpen}
                onOpenChange={setEditOpen}
            />
        </>
    )
}
