"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Upload, FileText, FileSpreadsheet, FileImage, File, Film,
    Presentation, Trash2, Download, Loader2, FolderOpen,
    FileCode, FileArchive, Music, CloudUpload, X, Zap
} from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
    uploadDocumentAction,
    deleteDocumentAction,
    getDocumentSignedUrl
} from "@/app/dashboard/clients/actions"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface ClientDocument {
    id: string
    client_id: string
    file_name: string
    file_size: number | null
    file_type: string | null
    storage_path: string
    description: string | null
    category: string
    uploaded_by: string | null
    created_at: string
    updated_at: string
}

interface ClientDocumentsProps {
    clientId: string
    initialDocuments: ClientDocument[]
}

const CATEGORIES = [
    { value: 'general', label: 'General', color: 'bg-slate-500' },
    { value: 'contrato', label: 'Contrato', color: 'bg-emerald-500' },
    { value: 'propuesta', label: 'Propuesta', color: 'bg-blue-500' },
    { value: 'factura', label: 'Factura', color: 'bg-amber-500' },
    { value: 'presentacion', label: 'Presentacion', color: 'bg-purple-500' },
    { value: 'tecnico', label: 'Tecnico', color: 'bg-cyan-500' },
    { value: 'otro', label: 'Otro', color: 'bg-rose-500' },
]

function getFileIcon(fileType: string | null, fileName: string) {
    const ext = fileName.split('.').pop()?.toLowerCase() || ''
    const type = fileType?.toLowerCase() || ''

    if (type.includes('pdf') || ext === 'pdf') return <FileText className="h-5 w-5 text-red-400" />
    if (type.includes('word') || ext === 'doc' || ext === 'docx') return <FileText className="h-5 w-5 text-blue-400" />
    if (type.includes('sheet') || type.includes('excel') || ext === 'xls' || ext === 'xlsx' || ext === 'csv') return <FileSpreadsheet className="h-5 w-5 text-green-400" />
    if (type.includes('presentation') || type.includes('powerpoint') || ext === 'ppt' || ext === 'pptx') return <Presentation className="h-5 w-5 text-orange-400" />
    if (type.includes('image') || ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return <FileImage className="h-5 w-5 text-pink-400" />
    if (type.includes('video') || ['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(ext)) return <Film className="h-5 w-5 text-purple-400" />
    if (type.includes('audio') || ['mp3', 'wav', 'ogg', 'flac'].includes(ext)) return <Music className="h-5 w-5 text-yellow-400" />
    if (type.includes('zip') || type.includes('rar') || ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return <FileArchive className="h-5 w-5 text-amber-400" />
    if (['js', 'ts', 'py', 'html', 'css', 'json', 'xml', 'sql'].includes(ext)) return <FileCode className="h-5 w-5 text-cyan-400" />
    return <File className="h-5 w-5 text-muted-foreground" />
}

function formatFileSize(bytes: number | null): string {
    if (!bytes) return '—'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getCategoryBadge(category: string) {
    const cat = CATEGORIES.find(c => c.value === category) || CATEGORIES[0]
    return (
        <Badge variant="outline" className={`text-[8px] font-black uppercase tracking-widest border-border/50 ${cat.color}/10 text-${cat.color.replace('bg-', '')}`}>
            {cat.label}
        </Badge>
    )
}

export function ClientDocuments({ clientId, initialDocuments }: ClientDocumentsProps) {
    const [documents, setDocuments] = useState<ClientDocument[]>(initialDocuments)
    const [uploadOpen, setUploadOpen] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [deleting, setDeleting] = useState<string | null>(null)
    const [dragActive, setDragActive] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [category, setCategory] = useState('general')
    const [description, setDescription] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setSelectedFile(e.dataTransfer.files[0])
        }
    }, [])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0])
        }
    }

    const resetForm = () => {
        setSelectedFile(null)
        setCategory('general')
        setDescription('')
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error("Selecciona un archivo primero")
            return
        }

        if (selectedFile.size > 50 * 1024 * 1024) {
            toast.error("Archivo demasiado grande", { description: "El limite es 50MB." })
            return
        }

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', selectedFile)
            formData.append('description', description)
            formData.append('category', category)

            const result = await uploadDocumentAction(clientId, formData)

            if (result.success) {
                toast.success("Documento subido", {
                    description: `${selectedFile.name} se ha guardado correctamente.`
                })
                setUploadOpen(false)
                resetForm()
                router.refresh()
            } else {
                toast.error("Error al subir", { description: result.error })
            }
        } catch (error: any) {
            toast.error("Error inesperado", { description: error.message })
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (docId: string, fileName: string) => {
        if (!confirm(`Eliminar "${fileName}"? Esta accion no se puede deshacer.`)) return

        setDeleting(docId)
        try {
            const result = await deleteDocumentAction(docId)
            if (result.success) {
                setDocuments(prev => prev.filter(d => d.id !== docId))
                toast.success("Documento eliminado", { description: fileName })
                router.refresh()
            } else {
                toast.error("Error al eliminar", { description: result.error })
            }
        } catch (error: any) {
            toast.error("Error inesperado", { description: error.message })
        } finally {
            setDeleting(null)
        }
    }

    const handleDownload = async (doc: ClientDocument) => {
        try {
            const result = await getDocumentSignedUrl(doc.storage_path)
            if (result.url) {
                window.open(result.url, '_blank')
            } else {
                toast.error("Error al generar enlace", { description: result.error })
            }
        } catch (error: any) {
            toast.error("Error de descarga", { description: error.message })
        }
    }

    const categoryColor = (cat: string) => {
        const found = CATEGORIES.find(c => c.value === cat)
        return found?.color || 'bg-slate-500'
    }

    return (
        <Card className="bg-card border-border shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 px-6 py-4">
                <div>
                    <CardTitle className="text-lg font-black text-foreground uppercase italic tracking-tighter flex items-center gap-2">
                        <FolderOpen className="h-5 w-5 text-primary" />
                        Documentos
                    </CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                        Archivos y documentacion del cliente ({documents.length})
                    </CardDescription>
                </div>
                <Dialog open={uploadOpen} onOpenChange={(open) => { setUploadOpen(open); if (!open) resetForm() }}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 text-[10px] font-black uppercase">
                            <Upload className="mr-1.5 h-3.5 w-3.5" /> Subir Documento
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] bg-card text-card-foreground border-border">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
                                <CloudUpload className="h-5 w-5" /> Subir Documento
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground italic">
                                Arrastra un archivo o seleccionalo desde tu equipo. Max 50MB.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            {/* Drop Zone */}
                            <div
                                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                                    ${dragActive
                                        ? 'border-primary bg-primary/10 shadow-[0_0_30px_rgba(201,162,77,0.15)]'
                                        : selectedFile
                                            ? 'border-emerald-500/50 bg-emerald-500/5'
                                            : 'border-border hover:border-primary/50 hover:bg-secondary/20'
                                    }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                    accept="*/*"
                                />
                                {selectedFile ? (
                                    <div className="flex items-center justify-center gap-3">
                                        {getFileIcon(selectedFile.type, selectedFile.name)}
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-foreground truncate max-w-[280px]">{selectedFile.name}</p>
                                            <p className="text-[10px] text-muted-foreground font-mono">{formatFileSize(selectedFile.size)}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 hover:text-red-400"
                                            onClick={(e) => { e.stopPropagation(); resetForm() }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div>
                                        <CloudUpload className={`h-10 w-10 mx-auto mb-3 transition-colors ${dragActive ? 'text-primary' : 'text-muted-foreground/40'}`} />
                                        <p className="text-xs font-bold text-muted-foreground">
                                            Arrastra aqui o <span className="text-primary underline">selecciona archivo</span>
                                        </p>
                                        <p className="text-[10px] text-muted-foreground/60 mt-1">PDF, DOC, XLS, PPT, Imagenes, etc.</p>
                                    </div>
                                )}
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <Label className="text-muted-foreground text-xs font-bold uppercase">Categoria</Label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger className="bg-secondary/50 border-border">
                                        <SelectValue placeholder="Categoria" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border">
                                        {CATEGORIES.map(cat => (
                                            <SelectItem key={cat.value} value={cat.value}>
                                                <span className="flex items-center gap-2">
                                                    <span className={`h-2 w-2 rounded-full ${cat.color}`} />
                                                    {cat.label}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label className="text-muted-foreground text-xs font-bold uppercase">Descripcion (opcional)</Label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Breve descripcion del documento..."
                                    className="bg-secondary/50 border-border resize-none h-20"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                onClick={handleUpload}
                                disabled={uploading || !selectedFile}
                                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Subiendo...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Subir Documento
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>

            <CardContent className="px-6 py-4">
                {documents.length > 0 ? (
                    <div className="space-y-2">
                        {documents.map((doc) => (
                            <div
                                key={doc.id}
                                className="flex items-center gap-4 p-3 rounded-xl bg-secondary/10 border border-border/40 hover:border-primary/30 transition-all group"
                            >
                                {/* File Icon */}
                                <div className="h-10 w-10 rounded-lg bg-secondary/50 flex items-center justify-center border border-border group-hover:border-primary/40 transition-all shrink-0">
                                    {getFileIcon(doc.file_type, doc.file_name)}
                                </div>

                                {/* File Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                            {doc.file_name}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <span className="flex items-center gap-1">
                                            <span className={`h-1.5 w-1.5 rounded-full ${categoryColor(doc.category)}`} />
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase">
                                                {CATEGORIES.find(c => c.value === doc.category)?.label || doc.category}
                                            </span>
                                        </span>
                                        <span className="text-[9px] text-muted-foreground font-mono">
                                            {formatFileSize(doc.file_size)}
                                        </span>
                                        <span className="text-[9px] text-muted-foreground">
                                            {(() => {
                                                try {
                                                    return format(new Date(doc.created_at), "dd MMM yyyy", { locale: es })
                                                } catch {
                                                    return "—"
                                                }
                                            })()}
                                        </span>
                                    </div>
                                    {doc.description && (
                                        <p className="text-[10px] text-muted-foreground/70 mt-0.5 truncate italic">{doc.description}</p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:text-primary hover:bg-primary/10"
                                        onClick={() => handleDownload(doc)}
                                        title="Descargar"
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:text-red-400 hover:bg-red-400/10"
                                        onClick={() => handleDelete(doc.id, doc.file_name)}
                                        disabled={deleting === doc.id}
                                        title="Eliminar"
                                    >
                                        {deleting === doc.id ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-3.5 w-3.5" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-center">
                        <div className="h-14 w-14 bg-secondary/20 rounded-full flex items-center justify-center mb-3 border border-dashed border-border">
                            <FolderOpen className="h-7 w-7 text-muted-foreground/30" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sin Documentos</p>
                        <p className="text-[10px] text-muted-foreground mt-1 italic">Sube contratos, propuestas u otros archivos relevantes.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
