
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { login } from './actions'
import { Zap, ShieldCheck, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-[#0F1115] overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-500/5 blur-[100px] rounded-full" />

            <div className="z-10 w-full max-w-md px-4">
                <div className="flex flex-col items-center mb-8 space-y-2">
                    <div className="h-16 w-16 bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(201,162,77,0.1)]">
                        <Zap className="h-8 w-8 text-primary drop-shadow-[0_0_8px_rgba(201,162,77,0.5)]" />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter">Senda<span className="text-primary italic">IA</span></h1>
                    <p className="text-muted-foreground font-medium text-sm tracking-widest uppercase">Autoridad Tranquila • CRM</p>
                </div>

                <Card className="border-border bg-card/50 backdrop-blur-xl shadow-2xl overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-primary" /> Acceso Restringido
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground italic">
                            Introduce tus credenciales para acceder al núcleo operativo.
                        </CardDescription>
                    </CardHeader>
                    <form>
                        <CardContent className="grid gap-5 pt-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Email Corporativo</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="nombre@sendaia.es"
                                    required
                                    className="bg-secondary/50 border-border focus:border-primary h-11 transition-all"
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Contraseña</Label>
                                    <a href="#" className="text-[10px] text-primary hover:underline">¿Olvidaste tu clave?</a>
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="bg-secondary/50 border-border focus:border-primary h-11 transition-all"
                                />
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col gap-4 pt-2">
                            <Button
                                formAction={login}
                                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-bold shadow-lg shadow-primary/20 group"
                            >
                                ENTRAR AL SISTEMA <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>

                            <div className="relative w-full py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-border/50"></span>
                                </div>
                                <div className="relative flex justify-center text-[10px] uppercase">
                                    <span className="bg-[#0F1115] px-2 text-muted-foreground font-bold">o</span>
                                </div>
                            </div>

                            <Link href="/dashboard" className="w-full">
                                <Button
                                    variant="outline"
                                    type="button"
                                    className="w-full border-primary/20 hover:bg-primary/10 text-primary h-11 font-bold"
                                >
                                    ACCESO DASHBOARD DIRECTO
                                </Button>
                            </Link>

                            <p className="text-[10px] text-center text-muted-foreground/50">
                                © 2026 SendaIA. Sistemas de Inteligencia Comercial.
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}
