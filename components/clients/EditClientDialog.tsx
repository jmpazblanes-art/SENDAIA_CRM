
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
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Loader2, Save } from "lucide-react"
import { updateClientAction } from "@/app/dashboard/clients/actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface EditClientDialogProps {
    client: any
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditClientDialog({ client, open, onOpenChange }: EditClientDialogProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const result = await updateClientAction(client.id, formData)
        setLoading(false)
        if (result?.success) {
            onOpenChange(false)
            toast.success("Cliente actualizado correctamente", {
                description: "Los cambios se han guardado en la base de datos."
            })
            router.refresh()
        } else {
            toast.error("Error al actualizar cliente", {
                description: result?.error || "Inténtalo de nuevo más tarde."
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-card text-card-foreground border-border">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
                        <Edit className="h-5 w-5" /> Editar Cliente
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground italic">
                        Modifica la información del lead en el sistema SendaIA.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {/* Nombre y Apellidos */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_first_name" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Nombre</Label>
                                <Input
                                    id="edit_first_name"
                                    name="first_name"
                                    defaultValue={client.first_name || ""}
                                    placeholder="Nombre"
                                    className="bg-secondary/50 border-border"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_last_name" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Apellidos</Label>
                                <Input
                                    id="edit_last_name"
                                    name="last_name"
                                    defaultValue={client.last_name || ""}
                                    placeholder="Apellidos"
                                    className="bg-secondary/50 border-border"
                                />
                            </div>
                        </div>

                        {/* Email y Teléfono */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_email" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Email</Label>
                                <Input
                                    id="edit_email"
                                    name="email"
                                    type="email"
                                    defaultValue={client.email || ""}
                                    placeholder="email@ejemplo.com"
                                    className="bg-secondary/50 border-border"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_phone" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Teléfono</Label>
                                <Input
                                    id="edit_phone"
                                    name="phone"
                                    defaultValue={client.phone || ""}
                                    placeholder="+34 600..."
                                    className="bg-secondary/50 border-border"
                                    required
                                />
                            </div>
                        </div>

                        {/* Teléfono 2 y Ciudad */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_phone2" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Teléfono 2</Label>
                                <Input
                                    id="edit_phone2"
                                    name="phone2"
                                    defaultValue={client.phone2 || ""}
                                    placeholder="+34 600..."
                                    className="bg-secondary/50 border-border"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_city" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Ciudad</Label>
                                <Input
                                    id="edit_city"
                                    name="city"
                                    defaultValue={client.city || ""}
                                    placeholder="Madrid"
                                    className="bg-secondary/50 border-border"
                                />
                            </div>
                        </div>

                        {/* Empresa e Industria */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_company_name" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Empresa</Label>
                                <Input
                                    id="edit_company_name"
                                    name="company_name"
                                    defaultValue={client.company_name || ""}
                                    placeholder="SendaIA Corp"
                                    className="bg-secondary/50 border-border"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_industry" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Industria</Label>
                                <Input
                                    id="edit_industry"
                                    name="industry"
                                    defaultValue={client.industry || ""}
                                    placeholder="Tecnología"
                                    className="bg-secondary/50 border-border"
                                />
                            </div>
                        </div>

                        {/* Tamaño Empresa y Website */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_company_size" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Tamaño Empresa</Label>
                                <Input
                                    id="edit_company_size"
                                    name="company_size"
                                    defaultValue={client.company_size || ""}
                                    placeholder="10-50"
                                    className="bg-secondary/50 border-border"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_website" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Website</Label>
                                <Input
                                    id="edit_website"
                                    name="website"
                                    defaultValue={client.website || ""}
                                    placeholder="https://ejemplo.com"
                                    className="bg-secondary/50 border-border"
                                />
                            </div>
                        </div>

                        {/* LinkedIn */}
                        <div className="space-y-2">
                            <Label htmlFor="edit_linkedin" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">LinkedIn</Label>
                            <Input
                                id="edit_linkedin"
                                name="linkedin"
                                defaultValue={client.linkedin || ""}
                                placeholder="https://linkedin.com/in/..."
                                className="bg-secondary/50 border-border"
                            />
                        </div>

                        {/* Estado, Prioridad, Origen */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_status" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Estado</Label>
                                <Select name="status" defaultValue={client.status || "lead"}>
                                    <SelectTrigger className="bg-secondary/50 border-border">
                                        <SelectValue placeholder="Estado" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border">
                                        <SelectItem value="lead">Lead</SelectItem>
                                        <SelectItem value="contacted">Contactado</SelectItem>
                                        <SelectItem value="qualified">Cualificado</SelectItem>
                                        <SelectItem value="proposal">Propuesta</SelectItem>
                                        <SelectItem value="negotiation">Negociación</SelectItem>
                                        <SelectItem value="won">Ganado</SelectItem>
                                        <SelectItem value="lost">Perdido</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_priority" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Prioridad</Label>
                                <Select name="priority" defaultValue={client.priority || "medium"}>
                                    <SelectTrigger className="bg-secondary/50 border-border">
                                        <SelectValue placeholder="Prioridad" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border">
                                        <SelectItem value="low">Baja</SelectItem>
                                        <SelectItem value="medium">Media</SelectItem>
                                        <SelectItem value="high">Alta</SelectItem>
                                        <SelectItem value="urgent">Urgente</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_source" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Origen</Label>
                                <Select name="source" defaultValue={client.source || "web"}>
                                    <SelectTrigger className="bg-secondary/50 border-border">
                                        <SelectValue placeholder="Origen" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border">
                                        <SelectItem value="web">Sitio Web</SelectItem>
                                        <SelectItem value="instagram">Instagram / RRSS</SelectItem>
                                        <SelectItem value="referral">Recomendación</SelectItem>
                                        <SelectItem value="cold_outreach">Prospección Fría</SelectItem>
                                        <SelectItem value="ai_extraction">Extracción IA</SelectItem>
                                        <SelectItem value="csv_import">Importación CSV</SelectItem>
                                        <SelectItem value="telegram">Telegram</SelectItem>
                                        <SelectItem value="other">Otro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Tags y Pain Points */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_tags" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Tags (separados por coma)</Label>
                                <Input
                                    id="edit_tags"
                                    name="tags"
                                    defaultValue={client.tags ? client.tags.join(", ") : ""}
                                    placeholder="vip, tech, urgente"
                                    className="bg-secondary/50 border-border"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_pain_points" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Pain Points (separados por coma)</Label>
                                <Input
                                    id="edit_pain_points"
                                    name="pain_points"
                                    defaultValue={client.pain_points ? client.pain_points.join(", ") : ""}
                                    placeholder="precio, tiempo, soporte"
                                    className="bg-secondary/50 border-border"
                                />
                            </div>
                        </div>

                        {/* Opportunity Score y Next Follow Up */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_opportunity_score" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Opportunity Score (0-100)</Label>
                                <Input
                                    id="edit_opportunity_score"
                                    name="opportunity_score"
                                    type="number"
                                    min={0}
                                    max={100}
                                    defaultValue={client.opportunity_score ?? ""}
                                    placeholder="75"
                                    className="bg-secondary/50 border-border"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_next_follow_up" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Próximo Seguimiento</Label>
                                <Input
                                    id="edit_next_follow_up"
                                    name="next_follow_up"
                                    type="datetime-local"
                                    defaultValue={client.next_follow_up ? client.next_follow_up.slice(0, 16) : ""}
                                    className="bg-secondary/50 border-border"
                                />
                            </div>
                        </div>

                        {/* Notas */}
                        <div className="space-y-2">
                            <Label htmlFor="edit_notes" className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Notas Generales</Label>
                            <Textarea
                                id="edit_notes"
                                name="notes"
                                defaultValue={client.notes || ""}
                                placeholder="Notas internas sobre este cliente..."
                                className="min-h-[80px] bg-secondary/50 border-border"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="mr-2"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Guardar Cambios
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
