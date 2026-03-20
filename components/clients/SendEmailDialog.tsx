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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, Send } from "lucide-react"
import { sendFollowUpEmailAction } from "@/app/dashboard/emails/actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface SendEmailDialogProps {
    clientId: string
    clientEmail?: string
    clientName?: string
    companyName?: string
}

export function SendEmailDialog({ clientId, clientEmail, clientName, companyName }: SendEmailDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const result = await sendFollowUpEmailAction(formData)
        setLoading(false)
        if (result.success) {
            setOpen(false)
            toast.success("Email enviado correctamente")
            router.refresh()
        } else {
            toast.error(result.error || "Error al enviar email")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" size="sm" className="gap-2">
                    <Mail className="h-4 w-4" /> Enviar Email
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-card border-border shadow-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-primary font-bold mb-2">
                        <Mail className="h-5 w-5" />
                        <DialogTitle>Enviar Email de Seguimiento</DialogTitle>
                    </div>
                    <DialogDescription className="text-muted-foreground italic">
                        El email se enviará desde SendaIA y quedará registrado en el historial.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4 py-2">
                    <input type="hidden" name="client_id" value={clientId} />
                    <input type="hidden" name="to_name" value={clientName || ''} />
                    <input type="hidden" name="company_name" value={companyName || ''} />

                    <div className="space-y-2">
                        <Label htmlFor="to_email">Para</Label>
                        <Input
                            id="to_email"
                            name="to_email"
                            type="email"
                            defaultValue={clientEmail || ''}
                            placeholder="cliente@empresa.com"
                            required
                            className="bg-secondary/30 border-border"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="subject">Asunto</Label>
                        <Input
                            id="subject"
                            name="subject"
                            placeholder="Seguimiento de nuestra conversación"
                            required
                            className="bg-secondary/30 border-border"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Mensaje</Label>
                        <Textarea
                            id="message"
                            name="message"
                            placeholder="Escribe el mensaje aquí..."
                            className="min-h-[150px] bg-secondary/30 border-border focus:border-primary transition-colors"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="agent_name">Firma (tu nombre)</Label>
                        <Input
                            id="agent_name"
                            name="agent_name"
                            placeholder="Pachi — SendaIA"
                            className="bg-secondary/30 border-border"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                            <Send className="h-4 w-4" />
                            {loading ? "Enviando..." : "Enviar Email"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
