"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  CircleDot,
  GitBranch,
  FlaskConical,
  ExternalLink,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  History,
} from "lucide-react"
import { OpsMonitoring, OpsAlerta } from "./types"

const estadoBadge: Record<string, { class: string; label: string }> = {
  ok: { class: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", label: "Operativo" },
  warning: { class: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", label: "Advertencia" },
  error: { class: "bg-red-500/20 text-red-400 border-red-500/30", label: "Error" },
}

const alertaEstadoBadge: Record<string, string> = {
  pendiente: "bg-yellow-500/20 text-yellow-400",
  en_analisis: "bg-blue-500/20 text-blue-400",
  fix_propuesto: "bg-purple-500/20 text-purple-400",
  reparado: "bg-emerald-500/20 text-emerald-400",
  ignorado: "bg-zinc-500/20 text-zinc-400",
  fallido: "bg-red-500/20 text-red-400",
}

function relativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return "ahora"
  if (diffMin < 60) return `hace ${diffMin}m`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `hace ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  return `hace ${diffD}d`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('es-ES', {
    timeZone: 'Europe/Madrid',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface Props {
  producto: OpsMonitoring
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductDetailDialog({ producto: p, open, onOpenChange }: Props) {
  const [alertas, setAlertas] = useState<OpsAlerta[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    const supabase = createClient()
    supabase
      .from('ops_alertas')
      .select('*')
      .eq('producto', p.producto)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setAlertas(data || [])
        setLoading(false)
      })
  }, [open, p.producto])

  const badge = estadoBadge[p.estado] || estadoBadge.warning
  const testJobs = p.test_summary ? p.test_summary.split(', ') : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">{p.producto}</DialogTitle>
            <Badge variant="outline" className={`text-xs uppercase font-bold ${badge.class}`}>
              {badge.label}
            </Badge>
          </div>
          {p.repo && (
            <p className="text-xs text-muted-foreground font-mono">{p.repo}</p>
          )}
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-2">
          <div className="space-y-4">
            {/* Estado general */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <CircleDot className={`h-4 w-4 ${p.uptime_ok ? "text-emerald-400" : "text-red-400"}`} />
                <span>{p.uptime_ok ? "Online" : "Offline"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{relativeTime(p.updated_at)}</span>
              </div>
            </div>

            {/* GitHub Actions */}
            {p.github_actions_status && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
                    <GitBranch className="h-4 w-4 text-[#C9A24D]" />
                    GitHub Actions
                  </h4>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Estado CI:</span>
                    <div className="flex items-center gap-1.5">
                      {p.github_actions_status === 'success' ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      ) : p.github_actions_status === 'failure' ? (
                        <XCircle className="h-3.5 w-3.5 text-red-400" />
                      ) : null}
                      <span className={p.github_actions_status === 'success' ? 'text-emerald-400' : p.github_actions_status === 'failure' ? 'text-red-400' : 'text-muted-foreground'}>
                        {p.github_actions_status}
                      </span>
                    </div>
                  </div>
                  {p.github_actions_url && (
                    <a
                      href={p.github_actions_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#C9A24D] hover:underline mt-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Ver en GitHub
                    </a>
                  )}
                </div>
              </>
            )}

            {/* Test Summary - desglosado */}
            {testJobs.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
                    <FlaskConical className="h-4 w-4 text-[#C9A24D]" />
                    Comprobaciones CI
                  </h4>
                  <div className="space-y-1.5">
                    {testJobs.map((job, i) => {
                      const [name, result] = job.split(': ')
                      const isSuccess = result?.trim() === 'success'
                      return (
                        <div key={i} className="flex items-center justify-between text-sm bg-secondary/20 rounded-md px-3 py-1.5">
                          <span className="text-muted-foreground">{name}</span>
                          <div className="flex items-center gap-1">
                            {isSuccess ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 text-red-400" />
                            )}
                            <span className={isSuccess ? 'text-emerald-400 text-xs font-medium' : 'text-red-400 text-xs font-medium'}>
                              {result?.trim() || 'unknown'}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Error actual */}
            {p.ultimo_error && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    Error Actual
                  </h4>
                  <div className="text-xs text-red-400 bg-red-500/10 rounded-md px-3 py-2 font-mono whitespace-pre-wrap">
                    {p.ultimo_error}
                  </div>
                </div>
              </>
            )}

            {/* URL de la app */}
            {p.url_app && (
              <>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">URL App:</span>
                  <a href={p.url_app} target="_blank" rel="noopener noreferrer" className="text-[#C9A24D] hover:underline flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    {p.url_app.replace('https://', '')}
                  </a>
                </div>
              </>
            )}

            {/* Costes */}
            {(p.coste_anthropic_mes > 0 || p.coste_openai_mes > 0 || p.coste_supabase_mes > 0) && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2">Costes del mes</h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-secondary/20 rounded-md px-2 py-1.5">
                      <p className="text-xs text-muted-foreground">Anthropic</p>
                      <p className="text-sm font-bold text-white">{p.coste_anthropic_mes.toFixed(2)}&euro;</p>
                    </div>
                    <div className="bg-secondary/20 rounded-md px-2 py-1.5">
                      <p className="text-xs text-muted-foreground">OpenAI</p>
                      <p className="text-sm font-bold text-white">{p.coste_openai_mes.toFixed(2)}&euro;</p>
                    </div>
                    <div className="bg-secondary/20 rounded-md px-2 py-1.5">
                      <p className="text-xs text-muted-foreground">Supabase</p>
                      <p className="text-sm font-bold text-white">{p.coste_supabase_mes.toFixed(2)}&euro;</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Historial de alertas */}
            <Separator />
            <div>
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
                <History className="h-4 w-4 text-[#C9A24D]" />
                Historial de alertas
              </h4>
              {loading ? (
                <p className="text-xs text-muted-foreground animate-pulse">Cargando...</p>
              ) : alertas.length === 0 ? (
                <p className="text-xs text-muted-foreground">Sin alertas registradas</p>
              ) : (
                <div className="space-y-2">
                  {alertas.map((a) => (
                    <div key={a.id} className="bg-secondary/20 rounded-md px-3 py-2 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{formatDate(a.created_at)}</span>
                        <Badge variant="outline" className={`text-[10px] ${alertaEstadoBadge[a.estado] || ''}`}>
                          {a.estado}
                        </Badge>
                      </div>
                      {a.tipo_error && <p className="text-white/80">{a.tipo_error}</p>}
                      {a.fix_aplicado && <p className="text-emerald-400">Fix: {a.fix_aplicado}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
