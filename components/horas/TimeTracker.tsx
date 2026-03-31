"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Plus } from "lucide-react"
import { createTimeEntry } from "@/app/dashboard/horas/actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Client {
    id: string
    name: string
}

interface TimeTrackerProps {
    clients: Client[]
}

export function TimeTracker({ clients }: TimeTrackerProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const form = new FormData(e.currentTarget)
        const result = await createTimeEntry(form)

        setLoading(false)
        if (result.success) {
            toast.success("Horas registradas correctamente")
            ;(e.target as HTMLFormElement).reset()
            router.refresh()
        } else {
            toast.error(result.error || "Error al registrar las horas")
        }
    }

    return (
        <Card className="bg-card border-border shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <CardHeader className="pb-3 px-6">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary italic flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" /> Registrar Horas
                </CardTitle>
            </CardHeader>
            <CardContent className="px-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        {/* Client */}
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="client_id" className="text-xs">Cliente *</Label>
                            <select
                                id="client_id"
                                name="client_id"
                                required
                                className="w-full h-10 px-3 rounded-md bg-secondary/30 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                            >
                                <option value="">Selecciona cliente...</option>
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Project */}
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="proyecto" className="text-xs">Proyecto</Label>
                            <Input
                                id="proyecto"
                                name="proyecto"
                                placeholder="Ej: Web Corporativa"
                                className="bg-secondary/30 border-border"
                            />
                        </div>

                        {/* Hours */}
                        <div className="space-y-2">
                            <Label htmlFor="horas" className="text-xs">Horas *</Label>
                            <Input
                                id="horas"
                                name="horas"
                                type="number"
                                min="0.25"
                                step="0.25"
                                placeholder="2"
                                required
                                className="bg-secondary/30 border-border"
                            />
                        </div>

                        {/* Rate */}
                        <div className="space-y-2">
                            <Label htmlFor="tarifa_hora" className="text-xs">Tarifa/hora</Label>
                            <Input
                                id="tarifa_hora"
                                name="tarifa_hora"
                                type="number"
                                min="0"
                                step="1"
                                defaultValue={50}
                                className="bg-secondary/30 border-border"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        {/* Description */}
                        <div className="space-y-2 md:col-span-4">
                            <Label htmlFor="descripcion" className="text-xs">Descripcion</Label>
                            <Textarea
                                id="descripcion"
                                name="descripcion"
                                placeholder="Breve descripción del trabajo realizado..."
                                className="bg-secondary/30 border-border min-h-[40px] h-10 resize-none"
                            />
                        </div>

                        {/* Date */}
                        <div className="space-y-2">
                            <Label htmlFor="fecha" className="text-xs">Fecha</Label>
                            <Input
                                id="fecha"
                                name="fecha"
                                type="date"
                                defaultValue={new Date().toISOString().split('T')[0]}
                                className="bg-secondary/30 border-border"
                            />
                        </div>

                        {/* Submit */}
                        <div className="space-y-2 flex items-end">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 text-xs font-bold uppercase tracking-widest"
                            >
                                <Plus className="h-4 w-4" />
                                {loading ? "Registrando..." : "Registrar"}
                            </Button>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
