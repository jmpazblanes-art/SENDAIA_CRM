"use client"

import { OpsMonitoring } from "./types"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"
import { ExternalLink, CircleDot, GitBranch, AlertTriangle } from "lucide-react"

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

const estadoColors: Record<string, string> = {
  ok: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  error: "bg-red-500/20 text-red-400 border-red-500/30",
}

export function StatusGrid({ productos }: { productos: OpsMonitoring[] }) {
  if (!productos || productos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <AlertTriangle className="h-10 w-10 mb-3 opacity-50" />
        <p className="text-sm font-medium">No hay productos monitorizados</p>
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {productos.map((p) => (
          <Card key={p.id} className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white truncate">{p.producto}</h3>
                <Badge
                  variant="outline"
                  className={`text-xs uppercase font-bold ${estadoColors[p.estado] ?? ""}`}
                >
                  {p.estado}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {/* Uptime */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <CircleDot
                  className={`h-3.5 w-3.5 ${p.uptime_ok ? "text-emerald-400" : "text-red-400"}`}
                />
                <span>{p.uptime_ok ? "Online" : "Offline"}</span>
              </div>

              {/* GitHub Actions */}
              {p.github_actions_status && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GitBranch className="h-3.5 w-3.5" />
                  <span className="truncate">CI: {p.github_actions_status}</span>
                  {p.github_actions_url && (
                    <a
                      href={p.github_actions_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-[#C9A24D] hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}

              {/* Ultima comprobacion */}
              <p className="text-xs text-muted-foreground">
                Ultima comprobacion:{" "}
                <span className="text-white/70">{relativeTime(p.updated_at)}</span>
              </p>

              {/* Ultimo error */}
              {p.ultimo_error && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-start gap-1.5 text-xs text-red-400 bg-red-500/10 rounded-md px-2 py-1.5 cursor-default">
                      <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                      <span className="truncate">{p.ultimo_error}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-sm text-xs">
                    {p.ultimo_error}
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Repo link */}
              {p.repo && (
                <a
                  href={`https://github.com/${p.repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#C9A24D] hover:underline"
                >
                  <GitBranch className="h-3 w-3" />
                  {p.repo}
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  )
}
