
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogTrigger, DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Calendar as CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"

export function CreateAppointmentDialog({ clients }: { clients: any[] }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const [formData, setFormData] = useState({
        client_id: "",
        title: "",
        type: "DEMO",
        start_time: "",
        notes_before: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase
                .from('appointments')
                .insert([{
                    client_id: formData.client_id,
                    title: formData.title,
                    type: formData.type,
                    start_time: new Date(formData.start_time).toISOString(),
                    end_time: new Date(new Date(formData.start_time).getTime() + 60 * 60 * 1000).toISOString(), // +1 hour default
                    notes_before: formData.notes_before,
                    status: 'pending'
                }])

            if (error) throw error

            setOpen(false)
            router.refresh()
            setFormData({
                client_id: "",
                title: "",
                type: "DEMO",
                start_time: "",
                notes_before: ""
            })
        } catch (error) {
            console.error("Error creating appointment:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                    <Plus className="mr-2 h-4 w-4" /> Nueva Cita
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border text-foreground sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-primary">Agendar Nueva Cita</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="client" className="text-muted-foreground">Cliente</Label>
                        <Select
                            onValueChange={(val) => setFormData({ ...formData, client_id: val })}
                            value={formData.client_id}
                            required
                        >
                            <SelectTrigger className="bg-secondary/50 border-border">
                                <SelectValue placeholder="Seleccionar cliente" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                                {clients.map(client => (
                                    <SelectItem key={client.id} value={client.id}>
                                        {client.first_name} {client.last_name} {client.company_name ? `(${client.company_name})` : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-muted-foreground">Título / Tarea</Label>
                        <Input
                            id="title"
                            className="bg-secondary/50 border-border"
                            placeholder="Ej: Demo Agente de Voz"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type" className="text-muted-foreground">Tipo</Label>
                            <Select
                                onValueChange={(val) => setFormData({ ...formData, type: val })}
                                value={formData.type}
                            >
                                <SelectTrigger className="bg-secondary/50 border-border">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    <SelectItem value="DEMO">DEMO</SelectItem>
                                    <SelectItem value="DIAGNOSTICO">DIAGNÓSTICO</SelectItem>
                                    <SelectItem value="FOLLOW_UP">SEGUIMIENTO</SelectItem>
                                    <SelectItem value="OTHER">OTRO</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date" className="text-muted-foreground">Fecha y Hora</Label>
                            <Input
                                id="date"
                                type="datetime-local"
                                className="bg-secondary/50 border-border text-sm"
                                value={formData.start_time}
                                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes" className="text-muted-foreground">Notas Internas</Label>
                        <Textarea
                            id="notes"
                            className="bg-secondary/50 border-border min-h-[80px]"
                            placeholder="Puntos de dolor, objetivos de la reunión..."
                            value={formData.notes_before}
                            onChange={(e) => setFormData({ ...formData, notes_before: e.target.value })}
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CalendarIcon className="mr-2 h-4 w-4" />}
                            Confirmar Cita
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
