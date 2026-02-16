"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Plus, Copy, Edit, FileText, Brain, Terminal, Trash2 } from "lucide-react"

export default function PromptsPage() {

    const prompts = [
        {
            id: '1',
            name: 'System Prompt - Agente de Ventas WhatsApp',
            category: 'Sales',
            model: 'GPT-4o',
            lastUpdated: 'Hace 2 días',
            snippet: 'Eres un experto en consultoría de IA para SendaIA. Tu objetivo es agendar una sesión de diagnóstico...',
            version: 'v2.4',
            stats: { tokens: '1.2k', usage: '高' }
        },
        {
            id: '2',
            name: 'Extractor de Intenciones - n8n Workflow',
            category: 'Automation',
            model: 'Claude 3.5 Sonnet',
            lastUpdated: 'Hace 5 días',
            snippet: 'Analiza el siguiente texto y devuelve un JSON con: intent, priority, next_action...',
            version: 'v1.1',
            stats: { tokens: '450', usage: '中' }
        },
        {
            id: '3',
            name: 'Generador de Propuestas ROI',
            category: 'Finance',
            model: 'GPT-4o-mini',
            lastUpdated: 'Ayer',
            snippet: 'Calcula el ahorro potencial basándote en los inputs de empleados y coste por hora...',
            version: 'v3.0',
            stats: { tokens: '2.8k', usage: '高' }
        }
    ]

    return (
        <div className="flex flex-col h-full space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl border border-primary/30 shadow-[0_0_20px_rgba(201,162,77,0.1)] relative overflow-hidden group">
                        <Brain className="h-7 w-7 text-primary relative z-10" />
                        <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">SendaIA Prompt Lab</h1>
                        <p className="text-muted-foreground italic text-sm font-medium">Activos intelectuales y configuraciones de IA de SendaIA.</p>
                    </div>
                </div>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold border-b-2 border-primary-foreground/20 active:border-b-0 transition-all">
                    <Plus className="h-4 w-4 mr-2" /> Nuevo Activo Inteligente
                </Button>
            </div>

            <div className="flex items-center gap-4 bg-[#151921]/50 backdrop-blur-md p-4 rounded-xl border border-border/50 shadow-2xl">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50" />
                    <input
                        placeholder="Buscar en la base de conocimientos..."
                        className="w-full bg-background/50 border border-border/50 rounded-lg px-10 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 transition-all"
                    />
                </div>
                <div className="hidden sm:flex gap-2">
                    {['Ventas', 'Operaciones', 'Finanzas'].map(f => (
                        <Badge key={f} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all uppercase text-[9px] font-black tracking-widest px-3 py-1">
                            {f}
                        </Badge>
                    ))}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {prompts.map(prompt => (
                    <Card key={prompt.id} className="bg-card border-border hover:border-primary/50 transition-all group overflow-hidden relative flex flex-col">
                        <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />

                        <CardHeader className="pb-2 relative z-10">
                            <div className="flex justify-between items-start mb-3">
                                <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-tighter bg-secondary text-muted-foreground">
                                    {prompt.category}
                                </Badge>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[9px] text-muted-foreground font-mono font-bold">{prompt.version}</span>
                                </div>
                            </div>
                            <CardTitle className="text-md group-hover:text-primary transition-colors font-bold uppercase tracking-tight">{prompt.name}</CardTitle>
                            <CardDescription className="text-[10px] flex items-center gap-1 uppercase font-bold text-muted-foreground/70">
                                <Terminal className="h-3 w-3 text-primary/70" /> {prompt.model} • <span className="opacity-50 italic">Act. {prompt.lastUpdated}</span>
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="flex-1 flex flex-col pt-2 relative z-10">
                            <div className="bg-[#0A0C10] rounded-lg p-3 font-mono text-[10px] text-muted-foreground/80 mb-4 relative min-h-[80px] border border-border/30 group-hover:border-primary/20 transition-all">
                                <p className="leading-relaxed">"{prompt.snippet}"</p>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] to-transparent flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <Button size="sm" variant="secondary" className="h-7 text-[10px] font-black uppercase bg-secondary/80 backdrop-blur-sm border border-border/50 hover:bg-primary hover:text-primary-foreground transition-all">
                                        DEBUG CODE <Plus className="ml-1.5 h-3 w-3" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-muted-foreground uppercase opacity-50">Contexto</span>
                                    <span className="text-[10px] font-bold text-foreground">{prompt.stats.tokens} tokens</span>
                                </div>
                                <div className="w-[1px] h-6 bg-border/50" />
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-muted-foreground uppercase opacity-50">Demanda</span>
                                    <span className="text-[10px] font-bold text-foreground">{prompt.stats.usage}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-border/50 pt-4 mt-auto">
                                <div className="flex gap-1">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* Placeholder for expansion */}
                <div className="border-2 border-dashed border-border/50 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-secondary/5 hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="h-12 w-12 rounded-xl bg-secondary/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-primary/20 group-hover:text-primary">
                        <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-sm font-black text-muted-foreground uppercase tracking-[0.1em] group-hover:text-foreground transition-colors relative z-10">Nuevo Activo IA</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-2 font-medium relative z-10 max-w-[150px]">Resguarda una nueva heurística o lógica de sistema.</p>
                </div>
            </div>

        </div>
    )
}
