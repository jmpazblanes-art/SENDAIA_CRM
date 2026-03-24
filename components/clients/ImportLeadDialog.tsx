
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
import { Upload, Link as LinkIcon, Loader2, FileSpreadsheet, Sparkles } from "lucide-react"
import { toast } from "sonner"
import Papa from "papaparse"
import { importClientsAction, extractLeadFromURLAction } from "@/app/dashboard/clients/actions"
import { useRouter } from "next/navigation"

export function ImportLeadDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [url, setUrl] = useState("")
    const router = useRouter()

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setLoading(true)
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const result = await importClientsAction(results.data)
                setLoading(false)
                if (result.success) {
                    setOpen(false)
                    toast.success("Importación completada", {
                        description: `Se han procesado ${results.data.length} leads correctamente.`
                    })
                    router.refresh()
                } else {
                    toast.error("Error en la importación", {
                        description: result.error
                    })
                }
            },
            error: (error) => {
                setLoading(false)
                toast.error("Error al leer el archivo CSV")
                console.error(error)
            }
        })
    }

    const handleURLExtraction = async () => {
        if (!url) {
            toast.error("Por favor, introduce una URL válida")
            return
        }

        setLoading(true)
        try {
            const result = await extractLeadFromURLAction(url)
            setLoading(false)
            if (result.success) {
                setOpen(false)
                toast.success("Lead extraído con éxito", {
                    description: `${result.data.company_name || 'Nuevo cliente'} ha sido analizado por la IA.`
                })
                router.refresh()
            } else {
                toast.error("Error en extracción IA", {
                    description: result.error
                })
            }
        } catch (error) {
            setLoading(false)
            toast.error("Error inesperado en la extracción")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="border-primary/20 hover:bg-primary/5 text-primary-foreground font-bold">
                    <Upload className="mr-2 h-4 w-4" /> Importar Leads
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card border-border shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2 italic uppercase tracking-tighter">
                        <Sparkles className="h-5 w-5" /> Ingesta de Datos IA
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground italic">
                        Elige el método de importación para nutrir tu CRM.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-6">
                    {/* CSV Upload Section */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Método Masivo (CSV)</Label>
                        <div className="relative">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                disabled={loading}
                            />
                            <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center bg-secondary/20 hover:bg-secondary/30 transition-all group">
                                <FileSpreadsheet className="h-8 w-8 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
                                <span className="text-xs font-bold text-foreground">Subir Archivo .csv</span>
                                <span className="text-[9px] text-muted-foreground mt-1">Formato: name, email, phone, company</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-[8px] uppercase font-black tracking-[0.3em]">
                            <span className="bg-card px-2 text-muted-foreground">O también</span>
                        </div>
                    </div>

                    {/* URL Extraction Section */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Extracción con IA (URL)</Label>
                        <div className="flex flex-col gap-2">
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    placeholder="https://empresa.com"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="pl-9 bg-secondary/20 border-border focus:border-primary/50"
                                    disabled={loading}
                                />
                            </div>
                            <Button
                                onClick={handleURLExtraction}
                                disabled={loading || !url}
                                className="w-full bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 font-black uppercase italic tracking-widest text-[10px]"
                            >
                                {loading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : "Analizar con IA"}
                            </Button>
                        </div>
                    </div>
                </div>

                <DialogFooter className="sm:justify-start">
                    <p className="text-[9px] text-muted-foreground font-medium italic italic">
                        * Los datos serán procesados automáticamente e insertados en tu pipeline de ventas.
                    </p>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
