"use client"

import { useState, useMemo } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, FileText, Calculator, ChevronRight } from "lucide-react"
import { BAREMO, formatCurrency, type PresupuestoServicio, type BaremoServicio } from "@/lib/baremo"
import { createPresupuesto } from "@/app/dashboard/presupuestos/actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Client {
    id: string
    name: string
    email?: string
}

interface CreatePresupuestoDialogProps {
    clients: Client[]
    trigger?: React.ReactNode
}

export function CreatePresupuestoDialog({ clients, trigger }: CreatePresupuestoDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    // Form state
    const [clientId, setClientId] = useState("")
    const [titulo, setTitulo] = useState("")
    const [notas, setNotas] = useState("")
    const [validUntil, setValidUntil] = useState(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    )
    const [ivaPercent, setIvaPercent] = useState(21)

    // Service selection state
    const [selectedCategoria, setSelectedCategoria] = useState("")
    const [servicios, setServicios] = useState<PresupuestoServicio[]>([])

    // Calculations
    const subtotal = useMemo(
        () => servicios.reduce((acc, s) => acc + s.precio_setup + s.precio_mensual, 0),
        [servicios]
    )
    const ivaAmount = subtotal * ivaPercent / 100
    const total = subtotal + ivaAmount

    // Get services for selected category
    const categoryServices = useMemo(() => {
        if (!selectedCategoria) return []
        const cat = BAREMO.find(c => c.categoria === selectedCategoria)
        return cat?.servicios || []
    }, [selectedCategoria])

    function addService(svc: BaremoServicio) {
        const cat = BAREMO.find(c => c.categoria === selectedCategoria)
        if (!cat) return

        setServicios(prev => [
            ...prev,
            {
                categoria: cat.categoria,
                nombre: svc.nombre,
                descripcion: svc.descripcion,
                nivel: svc.nivel,
                precio_setup: svc.setup_min,
                precio_mensual: svc.mensual_min,
            },
        ])
    }

    function removeService(index: number) {
        setServicios(prev => prev.filter((_, i) => i !== index))
    }

    function updateServicePrice(index: number, field: 'precio_setup' | 'precio_mensual', value: number) {
        setServicios(prev =>
            prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
        )
    }

    function resetForm() {
        setClientId("")
        setTitulo("")
        setNotas("")
        setValidUntil(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        setIvaPercent(21)
        setSelectedCategoria("")
        setServicios([])
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!clientId || !titulo || servicios.length === 0) {
            toast.error("Completa todos los campos y agrega al menos un servicio")
            return
        }

        setLoading(true)
        const result = await createPresupuesto({
            client_id: clientId,
            titulo,
            servicios,
            iva_percent: ivaPercent,
            notas: notas || undefined,
            valid_until: validUntil || undefined,
        })

        setLoading(false)
        if (result.success) {
            setOpen(false)
            resetForm()
            toast.success("Presupuesto creado correctamente")
            router.refresh()
        } else {
            toast.error(result.error || "Error al crear el presupuesto")
        }
    }

    // Find baremo range for a given service
    function findBaremoRange(svc: PresupuestoServicio) {
        const cat = BAREMO.find(c => c.categoria === svc.categoria)
        const baremoSvc = cat?.servicios.find(s => s.nombre === svc.nombre)
        return baremoSvc || null
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 text-xs font-bold uppercase tracking-widest">
                        <Plus className="h-4 w-4" /> Nuevo Presupuesto
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[780px] bg-card border-border shadow-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-primary font-bold mb-1">
                        <Calculator className="h-5 w-5" />
                        <DialogTitle>Nuevo Presupuesto</DialogTitle>
                    </div>
                    <DialogDescription className="text-muted-foreground italic">
                        Selecciona servicios del baremo, ajusta precios y genera una propuesta profesional.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 py-2">
                    {/* Cliente y titulo */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="pres_client">Cliente *</Label>
                            <select
                                id="pres_client"
                                value={clientId}
                                onChange={e => setClientId(e.target.value)}
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
                            <Label htmlFor="pres_titulo">Titulo del presupuesto *</Label>
                            <Input
                                id="pres_titulo"
                                value={titulo}
                                onChange={e => setTitulo(e.target.value)}
                                placeholder="Ej: Automatizacion CRM + Chatbot"
                                required
                                className="bg-secondary/30 border-border"
                            />
                        </div>
                    </div>

                    {/* Selector de servicios del baremo */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                Servicios del Baremo
                            </Label>
                        </div>

                        {/* Category selector */}
                        <div className="flex flex-wrap gap-2">
                            {BAREMO.map(cat => (
                                <button
                                    key={cat.categoria}
                                    type="button"
                                    onClick={() => setSelectedCategoria(
                                        selectedCategoria === cat.categoria ? "" : cat.categoria
                                    )}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                                        selectedCategoria === cat.categoria
                                            ? "bg-primary/20 border-primary text-primary"
                                            : "bg-secondary/20 border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                                    }`}
                                >
                                    {cat.categoria}
                                </button>
                            ))}
                        </div>

                        {/* Services in selected category */}
                        {selectedCategoria && categoryServices.length > 0 && (
                            <div className="grid gap-2 border border-border/50 rounded-xl p-3 bg-secondary/5">
                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
                                    Servicios disponibles en {selectedCategoria}
                                </p>
                                {categoryServices.map((svc) => (
                                    <div
                                        key={svc.nombre}
                                        className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-foreground">{svc.nombre}</span>
                                                <Badge variant="outline" className="border-border text-[10px] px-1.5 py-0">
                                                    {svc.nivel}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">{svc.descripcion}</p>
                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                Setup: {formatCurrency(svc.setup_min)} - {formatCurrency(svc.setup_max)}
                                                {svc.mensual_max > 0 && (
                                                    <span className="ml-2">
                                                        | Mensual: {formatCurrency(svc.mensual_min)} - {formatCurrency(svc.mensual_max)}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => addService(svc)}
                                            className="shrink-0 text-primary hover:text-primary hover:bg-primary/10 gap-1"
                                        >
                                            <Plus className="h-3 w-3" /> Agregar
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Added services with editable prices */}
                    {servicios.length > 0 && (
                        <div className="space-y-3">
                            <Label className="flex items-center gap-2">
                                <ChevronRight className="h-4 w-4 text-primary" />
                                Servicios seleccionados ({servicios.length})
                            </Label>

                            {/* Header */}
                            <div className="grid grid-cols-12 gap-2 px-2">
                                <span className="col-span-4 text-[10px] text-muted-foreground uppercase tracking-wider">Servicio</span>
                                <span className="col-span-3 text-[10px] text-muted-foreground uppercase tracking-wider text-center">Setup</span>
                                <span className="col-span-3 text-[10px] text-muted-foreground uppercase tracking-wider text-center">Mensual</span>
                                <span className="col-span-1 text-[10px] text-muted-foreground uppercase tracking-wider text-right">Total</span>
                                <span className="col-span-1"></span>
                            </div>

                            {servicios.map((svc, i) => {
                                const baremo = findBaremoRange(svc)
                                return (
                                    <div key={i} className="grid grid-cols-12 gap-2 items-center bg-secondary/10 rounded-lg p-2.5">
                                        <div className="col-span-4">
                                            <p className="text-sm font-medium text-foreground truncate">{svc.nombre}</p>
                                            <p className="text-[10px] text-muted-foreground truncate">{svc.categoria}</p>
                                        </div>
                                        <div className="col-span-3">
                                            <Input
                                                type="number"
                                                min={baremo?.setup_min || 0}
                                                max={baremo?.setup_max || 999999}
                                                step="50"
                                                value={svc.precio_setup}
                                                onChange={e => updateServicePrice(i, 'precio_setup', parseFloat(e.target.value) || 0)}
                                                className="bg-secondary/30 border-border h-8 text-sm text-center"
                                            />
                                            {baremo && (
                                                <p className="text-[9px] text-muted-foreground text-center mt-0.5">
                                                    {formatCurrency(baremo.setup_min)} - {formatCurrency(baremo.setup_max)}
                                                </p>
                                            )}
                                        </div>
                                        <div className="col-span-3">
                                            <Input
                                                type="number"
                                                min={baremo?.mensual_min || 0}
                                                max={baremo?.mensual_max || 999999}
                                                step="10"
                                                value={svc.precio_mensual}
                                                onChange={e => updateServicePrice(i, 'precio_mensual', parseFloat(e.target.value) || 0)}
                                                className="bg-secondary/30 border-border h-8 text-sm text-center"
                                            />
                                            {baremo && baremo.mensual_max > 0 && (
                                                <p className="text-[9px] text-muted-foreground text-center mt-0.5">
                                                    {formatCurrency(baremo.mensual_min)} - {formatCurrency(baremo.mensual_max)}
                                                </p>
                                            )}
                                        </div>
                                        <div className="col-span-1 text-right text-sm font-medium text-foreground">
                                            {formatCurrency(svc.precio_setup + svc.precio_mensual)}
                                        </div>
                                        <div className="col-span-1 flex justify-center">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                onClick={() => removeService(i)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* IVA, validez y totales */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="pres_iva">IVA (%)</Label>
                                <Input
                                    id="pres_iva"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={ivaPercent}
                                    onChange={e => setIvaPercent(parseFloat(e.target.value) || 0)}
                                    className="bg-secondary/30 border-border"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pres_valid">Valido hasta</Label>
                                <Input
                                    id="pres_valid"
                                    type="date"
                                    value={validUntil}
                                    onChange={e => setValidUntil(e.target.value)}
                                    className="bg-secondary/30 border-border"
                                />
                            </div>
                        </div>
                        <div className="bg-secondary/20 rounded-lg p-4 space-y-1.5 text-sm flex flex-col justify-center">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>IVA ({ivaPercent}%)</span>
                                <span>{formatCurrency(ivaAmount)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-primary text-lg pt-2 border-t border-border mt-1">
                                <span>TOTAL</span>
                                <span>{formatCurrency(total)}</span>
                            </div>
                            {servicios.length > 0 && (
                                <p className="text-[10px] text-muted-foreground text-right mt-1">
                                    {servicios.length} servicio{servicios.length !== 1 ? 's' : ''} seleccionado{servicios.length !== 1 ? 's' : ''}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Notas */}
                    <div className="space-y-2">
                        <Label htmlFor="pres_notas">Notas (opcional)</Label>
                        <Textarea
                            id="pres_notas"
                            value={notas}
                            onChange={e => setNotas(e.target.value)}
                            placeholder="Condiciones, plazos, observaciones..."
                            className="bg-secondary/30 border-border min-h-[80px]"
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={loading || servicios.length === 0}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                        >
                            <Calculator className="h-4 w-4" />
                            {loading ? "Creando presupuesto..." : `Crear Presupuesto (${formatCurrency(total)})`}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
