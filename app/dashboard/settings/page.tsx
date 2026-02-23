"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Shield, Bell, Database, Globe, Brain } from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
    const handleTestTelegram = () => {
        toast.success("Alerta enviada correctamente a Telegram (Modo Simulación)", {
            description: "El bot @SendaIA_Bot ha procesado la notificación.",
        })
    }

    return (
        <div className="flex flex-col h-full space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-secondary/30 rounded-xl border border-border/50">
                        <Settings className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">Configuración</h1>
                        <p className="text-muted-foreground italic text-sm font-medium">Gestión global del ecosistema SendaIA.</p>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="bg-secondary/20 border border-border p-1 gap-1">
                    <TabsTrigger value="general" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">General</TabsTrigger>
                    <TabsTrigger value="security" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Seguridad</TabsTrigger>
                    <TabsTrigger value="integrations" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Integraciones</TabsTrigger>
                    <TabsTrigger value="ai" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Motor IA</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6">
                    <Card className="bg-card border-border shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Globe className="h-4 w-4 text-primary" /> Perfil de Agencia
                            </CardTitle>
                            <CardDescription>Información básica de SendaIA CRM.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="agency_name">Nombre de la Agencia</Label>
                                    <Input id="agency_name" defaultValue="SendaIA" className="bg-secondary/10" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="agency_email">Email Corporativo</Label>
                                    <Input id="agency_email" defaultValue="hola@sendaia.es" className="bg-secondary/10" />
                                </div>
                            </div>
                            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Guardar Cambios</Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Bell className="h-4 w-4 text-primary" /> Notificaciones
                            </CardTitle>
                            <CardDescription>Configura cómo quieres recibir las alertas.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-secondary/10 p-4 rounded-lg border border-border/50">
                                <p className="text-xs font-bold text-foreground mb-2 uppercase">Integración Telegram</p>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-primary/30 text-primary hover:bg-primary/10"
                                    onClick={handleTestTelegram}
                                >
                                    Probar Alerta Telegram
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground italic">Próximamente: Integración con Slack para alertas críticas.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                    <Card className="bg-card border-border shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Shield className="h-4 w-4 text-primary" /> Capas de Acceso
                            </CardTitle>
                            <CardDescription>Reglas de autenticación y roles.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-secondary/10 p-4 rounded-lg border border-border/50">
                                <p className="text-sm font-bold text-foreground">Modo Demo Activo</p>
                                <p className="text-xs text-muted-foreground mt-1 text-balance">Actualmente los botones de acceso directo están habilitados para facilitar la navegación del cliente.</p>
                                <Button variant="outline" className="mt-4 border-primary/30 text-primary hover:bg-primary/10">Re-activar Cerrojazo Supabase</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="integrations" className="space-y-6">
                    <Card className="bg-card border-border shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Database className="h-4 w-4 text-primary" /> Conectividad
                            </CardTitle>
                            <CardDescription>Tokens y claves del ecosistema.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Supabase Connection</Label>
                                <div className="h-2 w-full bg-green-500/20 rounded-full relative overflow-hidden">
                                    <div className="h-full bg-green-500 w-[100%] animate-pulse" />
                                </div>
                                <p className="text-[10px] text-green-500 uppercase font-bold tracking-widest mt-1">Conexión Segura Establecida</p>
                            </div>
                            <div className="space-y-2 pt-4">
                                <Label>n8n Brain Hook</Label>
                                <Input value="https://n8n.sendaia.es/..." readOnly className="font-mono text-xs bg-black/40 border-primary/20" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="ai" className="space-y-6">
                    <Card className="bg-card border-border shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Brain className="h-4 w-4 text-primary" /> Parámetros del Motor
                            </CardTitle>
                            <CardDescription>Ajusta el comportamiento de los agentes.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Modelo por Defecto</Label>
                                    <div className="p-3 bg-secondary/10 rounded border border-border text-sm font-bold">GPT-4o (SendaIA Optimizado)</div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Temperatura Creativa</Label>
                                    <div className="p-3 bg-secondary/10 rounded border border-border text-sm font-bold">0.7 (Equilibrado)</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
