
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MessageSquare, Plus } from "lucide-react"
import { createNoteAction } from "@/app/dashboard/clients/actions"

interface AddNoteDialogProps {
    clientId: string
}

export function AddNoteDialog({ clientId }: AddNoteDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const result = await createNoteAction(formData)
        setLoading(false)
        if (result.success) {
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" size="sm" className="gap-2">
                    <Plus className="h-4 w-4" /> Añadir Nota
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card border-border shadow-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-primary font-bold mb-2">
                        <MessageSquare className="h-5 w-5" />
                        <DialogTitle>Añadir Nota de Seguimiento</DialogTitle>
                    </div>
                    <DialogDescription className="text-muted-foreground italic">
                        Registra información relevante sobre la interacción con el cliente.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4 py-4">
                    <input type="hidden" name="client_id" value={clientId} />
                    <div className="space-y-2">
                        <Label htmlFor="content" className="text-foreground">Contenido de la nota</Label>
                        <Textarea
                            id="content"
                            name="content"
                            placeholder="Escribe aquí los detalles del seguimiento..."
                            className="min-h-[120px] bg-secondary/30 border-border focus:border-primary transition-colors"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category" className="text-foreground">Categoría</Label>
                        <select
                            id="category"
                            name="category"
                            className="w-full h-10 px-3 rounded-md bg-secondary/30 border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            <option value="general">General</option>
                            <option value="call">Llamada</option>
                            <option value="meeting">Reunión</option>
                            <option value="technical">Técnica</option>
                            <option value="closing">Cierre</option>
                        </select>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                            {loading ? "Guardando..." : "Guardar Nota"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
