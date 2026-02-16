"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Send, X, Bot, Zap, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type Message = {
    id: string
    role: 'user' | 'assistant'
    content: string
}

export function ChatWidget() {
    const [isOpen, setIsOpen] = React.useState(false)
    const [input, setInput] = React.useState("")
    const [isTyping, setIsTyping] = React.useState(false)
    const [messages, setMessages] = React.useState<Message[]>([
        { id: '1', role: 'assistant', content: '¡Hola! Soy SendaIA Brain. Estoy conectado a tus sistemas en tiempo real. ¿En qué puedo asistirte hoy?' }
    ])

    const scrollRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            })
        }
    }, [messages, isTyping])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input }
        setMessages(prev => [...prev, userMsg])
        setInput("")
        setIsTyping(true)

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input, history: messages })
            })

            const data = await response.json()
            const botContent = data.response || data.output || "Lo siento, mi conexión con el núcleo n8n ha fallado. Comprueba los flujos operativos."

            const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: botContent }
            setMessages(prev => [...prev, botMsg])
        } catch (error) {
            const errorMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: "Error crítico de enlace. Reintentando puente neuronal..." }
            setMessages(prev => [...prev, errorMsg])
        } finally {
            setIsTyping(false)
        }
    }

    return (
        <>
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 h-16 w-16 rounded-2xl shadow-[0_0_30px_rgba(201,162,77,0.3)] bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all z-50 animate-bounce-slow"
                >
                    <div className="relative">
                        <MessageSquare className="h-7 w-7" />
                        <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 border-2 border-primary rounded-full" />
                    </div>
                </Button>
            )}

            {isOpen && (
                <Card className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-[420px] h-full sm:h-[600px] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-primary/20 z-50 bg-[#0F1115]/90 backdrop-blur-2xl slide-in-from-bottom-5 animate-in fade-in duration-300 overflow-hidden sm:rounded-xl rounded-none">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />

                    <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-border/50 bg-secondary/10">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center relative overflow-hidden group">
                                <Bot className="h-6 w-6 text-primary z-10" />
                                <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-black text-white uppercase tracking-tighter">SendaIA Brain</CardTitle>
                                <div className="flex items-center gap-1.5 status">
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Enlace Activo</span>
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white transition-colors" onClick={() => setIsOpen(false)}>
                            <X className="h-5 w-5" />
                        </Button>
                    </CardHeader>

                    <CardContent className="flex-1 p-0 overflow-hidden relative">
                        <ScrollArea className="h-full p-4" viewportRef={scrollRef}>
                            <div className="space-y-6 pb-2">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={cn(
                                        "flex flex-col gap-2 max-w-[85%]",
                                        msg.role === 'user' ? "ml-auto items-end" : "items-start"
                                    )}>
                                        <div className={cn(
                                            "rounded-2xl px-4 py-3 text-sm shadow-xl relative",
                                            msg.role === 'user'
                                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                                : "bg-secondary/80 text-foreground border border-border/50 rounded-tl-none"
                                        )}>
                                            {msg.content}
                                            {msg.role === 'assistant' && (
                                                <Zap className="absolute -left-6 top-0 h-4 w-4 text-primary/30" />
                                            )}
                                        </div>
                                        <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest px-1">
                                            {msg.role === 'user' ? 'Tú' : 'Brain'} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))}

                                {isTyping && (
                                    <div className="flex flex-col items-start gap-2 max-w-[85%] animate-pulse">
                                        <div className="bg-secondary/40 text-muted-foreground rounded-2xl rounded-tl-none px-4 py-3 text-sm border border-border/30 flex items-center gap-2">
                                            <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                            <span className="italic font-medium text-xs">Procesando consulta...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>

                    <CardFooter className="p-4 border-t border-border/50 bg-background/50">
                        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex w-full items-center gap-2 relative">
                            <Input
                                placeholder="Escribe tu comando..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                className="flex-1 bg-secondary/50 border-border focus-visible:ring-1 focus-visible:ring-primary h-12 pr-12 rounded-xl italic font-medium"
                                disabled={isTyping}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                className="absolute right-1 top-1 h-10 w-10 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all rounded-lg"
                                disabled={isTyping || !input.trim()}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            )}
        </>
    )
}
