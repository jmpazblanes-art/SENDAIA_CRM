
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Link2, Zap, FileSpreadsheet, Loader2 } from "lucide-react"
import { importClientsAction, extractLeadFromURLAction } from "@/app/dashboard/clients/actions"
import Papa from "papaparse"
import { toast } from "sonner"

export function ImportLeadDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [url, setUrl] = useState("")

    const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setLoading(true)
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results: any) => {
                const data = results.data
                const response = await importClientsAction(data)
                setLoading(false)

                if (response.success) {
                    setOpen(false)
                    toast.success("Importación Exitosa", {
                        description: `Se han importado ${data.length} clientes correctamente.`,
                    })
                } else {
                    toast.error("Error", {
                        description: response.error || "Error al importar el archivo CSV.",
                    })
                }
            },
            error: (error: any) => {
                setLoading(false)
                toast.error("Error de Formato", {
                    description: "No se pudo procesar el archivo CSV.",
                })
            }
        })
    }

    const handleURLExtraction = async () => {
        if (!url) return
        setLoading(true)

        toast.info("Iniciando Extracción IA", {
            description: "Analizando contenido de la web...",
        })

        const response = await extractLeadFromURLAction(url)
        setLoading(false)

        if (response.success) {
            setOpen(false)
            toast.success("Lead Extraído", {
                description: `Se ha creado el lead para ${response.data.first_name || 'Nuevo'} mediante IA SendaIA.`,
            })
        } else {
            toast.error("Error de Extracción", {
                description: response.error || "La IA no pudo extraer datos válidos de esta URL.",
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-primary/30 hover:bg-primary/10 hover:text-primary transition-all">
                    <Upload className="h-4 w-4" /> Importar Leads
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card border-border shadow-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-primary font-bold mb-2">
                        <Zap className="h-5 w-5" />
                        <DialogTitle>Ingesta de Leads Inteligente</DialogTitle>
                    </div>
                    <DialogDescription className="text-muted-foreground italic text-xs">
                        Añade prospectos masivamente o deja que la IA investigue por ti.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="csv" className="w-full mt-4">
                    <TabsList className="grid w-full grid-cols-2 bg-secondary/30">
                        <TabsTrigger value="csv" className="gap-2 data-[state=active]:text-primary">
                            <FileSpreadsheet className="h-3.5 w-3.5" /> CSV
                        </TabsTrigger>
                        <TabsTrigger value="url" className="gap-2 data-[state=active]:text-primary">
                            <Link2 className="h-3.5 w-3.5" /> URL IA
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="csv" className="py-4 space-y-4">
                        <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center gap-2 hover:bg-secondary/10 transition-colors cursor-pointer relative group">
                            <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                            <p className="text-xs text-muted-foreground font-medium group-hover:text-foreground">Click para subir archivo CSV</p>
                            <p className="text-[10px] text-muted-foreground/50">Formato: first_name, last_name, email, phone, company</p>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleCSVUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                disabled={loading}
                            />
                        </div>
                        {loading && (
                            <div className="flex items-center justify-center gap-2 text-xs text-primary animate-pulse font-bold">
                                <Loader2 className="h-3 w-3 animate-spin" /> PROCESANDO...
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="url" className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="url" className="text-foreground text-xs font-bold uppercase tracking-wider">URL del sitio web / LinkedIn</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="url"
                                    placeholder="https://empresa.com"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="bg-secondary/30 border-border focus:border-primary"
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground italic">
                                SendaIA analizará el contenido para extraer teléfonos, correos y nombres automáticamente.
                            </p>
                        </div>
                        <Button
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-bold shadow-lg shadow-primary/20"
                            onClick={handleURLExtraction}
                            disabled={loading || !url}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                            {loading ? "EXTRAYENDO..." : "EXTRAER LEAD CON IA"}
                        </Button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
