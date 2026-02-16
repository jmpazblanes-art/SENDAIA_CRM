
"use client"

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
import { Plus, Loader2, UserPlus } from "lucide-react"
import { createClientAction } from "@/app/dashboard/clients/actions"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function CreateClientDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const result = await createClientAction(formData)
        setLoading(false)
        if (result?.success) {
            setOpen(false)
        } else {
            alert("Error al crear cliente")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Lead
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-card text-card-foreground border-border">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
                        <UserPlus className="h-5 w-5" /> Registrar Nuevo Lead
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground italic">
                        Completa la información básica para iniciar el seguimiento en SendaIA.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first_name" className="text-muted-foreground">Nombre</Label>
                                <Input id="first_name" name="first_name" placeholder="Pachi" className="bg-secondary/50 border-border" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_name" className="text-muted-foreground">Apellidos</Label>
                                <Input id="last_name" name="last_name" placeholder="Senda" className="bg-secondary/50 border-border" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-muted-foreground">Email</Label>
                                <Input id="email" name="email" type="email" placeholder="pachi@sendaia.es" className="bg-secondary/50 border-border" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-muted-foreground">Teléfono</Label>
                                <Input id="phone" name="phone" placeholder="+34 600..." className="bg-secondary/50 border-border" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="company_name" className="text-muted-foreground">Empresa / Negocio</Label>
                            <Input id="company_name" name="company_name" placeholder="SendaIA Corp" className="bg-secondary/50 border-border" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-muted-foreground">Estado Inicial</Label>
                                <Select name="status" defaultValue="lead">
                                    <SelectTrigger className="bg-secondary/50 border-border">
                                        <SelectValue placeholder="Estado" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border">
                                        <SelectItem value="lead">Lead (Frío)</SelectItem>
                                        <SelectItem value="contacted">Contactado</SelectItem>
                                        <SelectItem value="qualified">Cualificado</SelectItem>
                                        <SelectItem value="proposal">En Propuesta</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="source" className="text-muted-foreground">Origen</Label>
                                <Select name="source" defaultValue="web">
                                    <SelectTrigger className="bg-secondary/50 border-border">
                                        <SelectValue placeholder="Origen" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border">
                                        <SelectItem value="web">Sitio Web</SelectItem>
                                        <SelectItem value="instagram">Instagram / RRSS</SelectItem>
                                        <SelectItem value="referral">Recomendación</SelectItem>
                                        <SelectItem value="cold_outreach">Prospección Fría</SelectItem>
                                        <SelectItem value="other">Otro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Registrar en Base de Datos"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
