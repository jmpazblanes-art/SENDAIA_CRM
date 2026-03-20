
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogTrigger, DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Settings, Loader2, Save } from "lucide-react"

export function EditConfigDialog({ config }: { config: any }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [value, setValue] = useState(JSON.stringify(config.value, null, 2))
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            let parsedValue;
            try {
                parsedValue = JSON.parse(value)
            } catch (e) {
                alert("Error: El formato JSON no es válido.")
                setLoading(false)
                return
            }

            const { error } = await supabase
                .from('automation_configs')
                .update({
                    value: parsedValue,
                    updated_at: new Date().toISOString()
                })
                .eq('id', config.id)

            if (error) throw error

            setOpen(false)
            router.refresh()
        } catch (error) {
            console.error("Error updating config:", error)
            alert("Error al actualizar la configuración")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase transition-all hover:bg-primary hover:text-primary-foreground">
                    CONFIGURACIÓN
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border text-foreground sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
                        <Settings className="h-5 w-5" /> Configurar {config.key}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="text-muted-foreground uppercase text-[10px] font-black tracking-widest">Parámetros (JSON)</Label>
                        <Textarea
                            className="bg-secondary/20 border-border font-mono text-xs min-h-[300px] leading-relaxed"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            required
                        />
                        <p className="text-[9px] text-muted-foreground italic">Edita los valores del objeto JSON para cambiar el comportamiento del agente.</p>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-widest text-xs">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                            Guardar Cambios
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
