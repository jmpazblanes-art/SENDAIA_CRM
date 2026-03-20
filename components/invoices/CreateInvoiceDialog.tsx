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
import { Plus, Trash2, Receipt, X } from "lucide-react"
import { createInvoiceAction } from "@/app/dashboard/invoices/actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Client {
    id: string
    name: string
    email?: string
}

interface InvoiceItem {
    description: string
    quantity: number
    unit_price: number
}

interface CreateInvoiceDialogProps {
    clients: Client[]
    trigger?: React.ReactNode
}

export function CreateInvoiceDialog({ clients, trigger }: CreateInvoiceDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [items, setItems] = useState<InvoiceItem[]>([
        { description: '', quantity: 1, unit_price: 0 }
    ])
    const [taxRate, setTaxRate] = useState(21)
    const router = useRouter()

    const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unit_price, 0)
    const taxAmount = subtotal * taxRate / 100
    const total = subtotal + taxAmount

    function addItem() {
        setItems(prev => [...prev, { description: '', quantity: 1, unit_price: 0 }])
    }

    function removeItem(i: number) {
        setItems(prev => prev.filter((_, idx) => idx !== i))
    }

    function updateItem(i: number, field: keyof InvoiceItem, value: string | number) {
        setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item))
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const form = new FormData(e.currentTarget)
        const result = await createInvoiceAction(form, items, taxRate)

        setLoading(false)
        if (result.success) {
            setOpen(false)
            setItems([{ description: '', quantity: 1, unit_price: 0 }])
            toast.success("Factura creada correctamente")
            router.refresh()
        } else {
            toast.error(result.error || "Error al crear la factura")
        }
    }

    const fmt = (n: number) => `${n.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€`

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 text-xs font-bold uppercase tracking-widest">
                        <Plus className="h-4 w-4" /> Crear Factura
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[680px] bg-card border-border shadow-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-primary font-bold mb-1">
                        <Receipt className="h-5 w-5" />
                        <DialogTitle>Nueva Factura</DialogTitle>
                    </div>
                    <DialogDescription className="text-muted-foreground italic">
                        Crea una factura profesional para enviar al cliente.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 py-2">
                    {/* Cliente y número */}
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
                            <Label htmlFor="invoice_number">Número de factura *</Label>
                            <Input
                                id="invoice_number"
                                name="invoice_number"
                                placeholder={`SEND-${new Date().getFullYear()}-001`}
                                required
                                className="bg-secondary/30 border-border"
                            />
                        </div>
                    </div>

                    {/* Fechas */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="invoice_date">Fecha de emisión *</Label>
                            <Input
                                id="invoice_date"
                                name="invoice_date"
                                type="date"
                                defaultValue={new Date().toISOString().split('T')[0]}
                                required
                                className="bg-secondary/30 border-border"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="due_date">Fecha de vencimiento *</Label>
                            <Input
                                id="due_date"
                                name="due_date"
                                type="date"
                                defaultValue={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                                required
                                className="bg-secondary/30 border-border"
                            />
                        </div>
                    </div>

                    {/* Conceptos */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Conceptos *</Label>
                            <Button type="button" variant="ghost" size="sm" onClick={addItem} className="gap-1 text-primary hover:text-primary text-xs">
                                <Plus className="h-3 w-3" /> Añadir línea
                            </Button>
                        </div>

                        <div className="space-y-2">
                            {/* Header */}
                            <div className="grid grid-cols-12 gap-2 px-2">
                                <span className="col-span-5 text-[10px] text-muted-foreground uppercase tracking-wider">Descripción</span>
                                <span className="col-span-2 text-[10px] text-muted-foreground uppercase tracking-wider text-center">Cant.</span>
                                <span className="col-span-3 text-[10px] text-muted-foreground uppercase tracking-wider text-right">Precio unit.</span>
                                <span className="col-span-1 text-[10px] text-muted-foreground uppercase tracking-wider text-right">Total</span>
                                <span className="col-span-1"></span>
                            </div>

                            {items.map((item, i) => (
                                <div key={i} className="grid grid-cols-12 gap-2 items-center bg-secondary/10 rounded-lg p-2">
                                    <div className="col-span-5">
                                        <Input
                                            value={item.description}
                                            onChange={e => updateItem(i, 'description', e.target.value)}
                                            placeholder="Descripción del servicio"
                                            required
                                            className="bg-secondary/30 border-border h-8 text-sm"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={e => updateItem(i, 'quantity', parseFloat(e.target.value) || 1)}
                                            className="bg-secondary/30 border-border h-8 text-sm text-center"
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.unit_price}
                                            onChange={e => updateItem(i, 'unit_price', parseFloat(e.target.value) || 0)}
                                            className="bg-secondary/30 border-border h-8 text-sm text-right"
                                        />
                                    </div>
                                    <div className="col-span-1 text-right text-sm font-medium text-foreground pr-1">
                                        {fmt(item.quantity * item.unit_price)}
                                    </div>
                                    <div className="col-span-1 flex justify-center">
                                        {items.length > 1 && (
                                            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeItem(i)}>
                                                <X className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* IVA y totales */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="tax_rate">IVA (%)</Label>
                            <Input
                                id="tax_rate"
                                name="tax_rate"
                                type="number"
                                min="0"
                                max="100"
                                value={taxRate}
                                onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                                className="bg-secondary/30 border-border"
                            />
                        </div>
                        <div className="bg-secondary/20 rounded-lg p-4 space-y-1 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span><span>{fmt(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>IVA ({taxRate}%)</span><span>{fmt(taxAmount)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-primary text-base pt-1 border-t border-border mt-1">
                                <span>TOTAL</span><span>{fmt(total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notas */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notas (opcional)</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            placeholder="Condiciones de pago, información adicional..."
                            className="bg-secondary/30 border-border min-h-[80px]"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                            <Receipt className="h-4 w-4" />
                            {loading ? "Creando factura..." : "Crear Factura"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
