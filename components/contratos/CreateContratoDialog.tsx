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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, FileSignature } from "lucide-react"
import { createContrato } from "@/app/dashboard/contratos/actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Client {
    id: string
    name: string
}

interface Modulo {
    nombre: string
    setup: number
    mensual: number
}

interface CreateContratoDialogProps {
    clients: Client[]
    trigger?: React.ReactNode
}

export function CreateContratoDialog({ clients, trigger }: CreateContratoDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [modulos, setModulos] = useState<Modulo[]>([
        { nombre: '', setup: 0, mensual: 0 }
    ])
    const router = useRouter()

    const totalSetup = modulos.reduce((acc, m) => acc + (m.setup || 0), 0)
    const totalMensual = modulos.reduce((acc, m) => acc + (m.mensual || 0), 0)

    function addModulo() {
        setModulos(prev => [...prev, { nombre: '', setup: 0, mensual: 0 }])
    }

    function removeModulo(i: number) {
        setModulos(prev => prev.filter((_, idx) => idx !== i))
    }

    function updateModulo(i: number, field: keyof Modulo, value: string | number) {
        setModulos(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m))
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const form = new FormData(e.currentTarget)
        const result = await createContrato(form, modulos)

        setLoading(false)
        if (result.success) {
            setOpen(false)
            setModulos([{ nombre: '', setup: 0, mensual: 0 }])
            toast.success("Contrato creado correctamente")
            router.refresh()
        } else {
            toast.error(result.error || "Error al crear el contrato")
        }
    }

    const fmt = (n: number) => `${n.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€`

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 text-xs font-bold uppercase tracking-widest">
                        <Plus className="h-4 w-4" /> Nuevo Contrato
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[720px] bg-card border-border shadow-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-primary font-bold mb-1">
                        <FileSignature className="h-5 w-5" />
                        <DialogTitle>Nuevo Contrato</DialogTitle>
                    </div>
                    <DialogDescription className="text-muted-foreground italic">
                        Define los términos, módulos y condiciones del acuerdo mercantil.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 py-2">
                    {/* Client + Type */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="client_id">Cliente *</Label>
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
                        <div className="space-y-2">
                            <Label htmlFor="tipo">Tipo de contrato</Label>
                            <select
                                id="tipo"
                                name="tipo"
                                className="w-full h-10 px-3 rounded-md bg-secondary/30 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                            >
                                <option value="mercantil">Mercantil</option>
                                <option value="proteccion_datos">Protección de Datos</option>
                                <option value="nda">NDA</option>
                                <option value="otro">Otro</option>
                            </select>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="titulo">Título del contrato *</Label>
                        <Input
                            id="titulo"
                            name="titulo"
                            placeholder="Ej: Contrato de Servicios Digitales - Fase 01-05"
                            required
                            className="bg-secondary/30 border-border"
                        />
                    </div>

                    {/* Expiration date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fecha_vencimiento">Fecha de vencimiento</Label>
                            <Input
                                id="fecha_vencimiento"
                                name="fecha_vencimiento"
                                type="date"
                                className="bg-secondary/30 border-border"
                            />
                        </div>
                        <div />
                    </div>

                    {/* Modules */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Módulos del contrato *</Label>
                            <Button type="button" variant="ghost" size="sm" onClick={addModulo} className="gap-1 text-primary hover:text-primary text-xs">
                                <Plus className="h-3 w-3" /> Añadir módulo
                            </Button>
                        </div>

                        <div className="space-y-2">
                            {/* Header */}
                            <div className="grid grid-cols-12 gap-2 px-2">
                                <span className="col-span-5 text-[10px] text-muted-foreground uppercase tracking-wider">Nombre del módulo</span>
                                <span className="col-span-3 text-[10px] text-muted-foreground uppercase tracking-wider text-right">Setup</span>
                                <span className="col-span-3 text-[10px] text-muted-foreground uppercase tracking-wider text-right">Mensual</span>
                                <span className="col-span-1"></span>
                            </div>

                            {modulos.map((modulo, i) => (
                                <div key={i} className="grid grid-cols-12 gap-2 items-center bg-secondary/10 rounded-lg p-2">
                                    <div className="col-span-5">
                                        <Input
                                            value={modulo.nombre}
                                            onChange={e => updateModulo(i, 'nombre', e.target.value)}
                                            placeholder="Ej: Fase 01 — Web + SEO"
                                            required
                                            className="bg-secondary/30 border-border h-8 text-sm"
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={modulo.setup}
                                            onChange={e => updateModulo(i, 'setup', parseFloat(e.target.value) || 0)}
                                            className="bg-secondary/30 border-border h-8 text-sm text-right"
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={modulo.mensual}
                                            onChange={e => updateModulo(i, 'mensual', parseFloat(e.target.value) || 0)}
                                            className="bg-secondary/30 border-border h-8 text-sm text-right"
                                        />
                                    </div>
                                    <div className="col-span-1 flex justify-center">
                                        {modulos.length > 1 && (
                                            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeModulo(i)}>
                                                <X className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="bg-secondary/20 rounded-lg p-4 space-y-1 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Total Setup (pago único)</span>
                                <span className="font-bold">{fmt(totalSetup)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Total Mensual (recurrente)</span>
                                <span className="font-bold">{fmt(totalMensual)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-primary text-base pt-1 border-t border-border mt-1">
                                <span>Valor anual estimado</span>
                                <span>{fmt(totalSetup + totalMensual * 12)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes / Content */}
                    <div className="space-y-2">
                        <Label htmlFor="contenido">Notas / Contenido adicional</Label>
                        <Textarea
                            id="contenido"
                            name="contenido"
                            placeholder="Duración, condiciones de renovación, cláusulas especiales..."
                            className="bg-secondary/30 border-border min-h-[80px]"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                            <FileSignature className="h-4 w-4" />
                            {loading ? "Creando contrato..." : "Crear Contrato"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
