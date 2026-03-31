"use client"

import { OpsChangelog } from "./types"
import { Badge } from "@/components/ui/badge"
import { GitCommit, Inbox, ExternalLink, User } from "lucide-react"

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
  if (diffD < 30) return `hace ${diffD}d`
  const diffM = Math.floor(diffD / 30)
  return `hace ${diffM}mes`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

const productoColors: Record<string, string> = {
  "MI CRM": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PeritApp: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  IngApp: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  DentalAI: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  MedicApp: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  BarbApp: "bg-amber-500/20 text-amber-400 border-amber-500/30",
}

function getProductoColor(producto: string): string {
  return productoColors[producto] ?? "bg-secondary/50 text-white border-border/50"
}

/** Group changelogs by date string (e.g. "25 mar 2026") */
function groupByDate(changelogs: OpsChangelog[]): Map<string, OpsChangelog[]> {
  const groups = new Map<string, OpsChangelog[]>()
  for (const entry of changelogs) {
    const dateKey = entry.commit_date ? formatDate(entry.commit_date) : "Sin fecha"
    const group = groups.get(dateKey)
    if (group) {
      group.push(entry)
    } else {
      groups.set(dateKey, [entry])
    }
  }
  return groups
}

export function Changelog({ changelogs }: { changelogs: OpsChangelog[] }) {
  if (!changelogs || changelogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Inbox className="h-10 w-10 mb-3 opacity-50" />
        <p className="text-sm font-medium">Sin cambios recientes</p>
        <p className="text-xs mt-1">No se han registrado commits todavia</p>
      </div>
    )
  }

  const grouped = groupByDate(changelogs)

  return (
    <div className="space-y-6">
      {Array.from(grouped.entries()).map(([dateLabel, entries]) => (
        <div key={dateLabel}>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-border/50" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              {dateLabel}
            </span>
            <div className="h-px flex-1 bg-border/50" />
          </div>

          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="group flex items-start gap-3 rounded-lg border border-border/50 bg-secondary/10 p-3 transition-colors hover:bg-secondary/20"
              >
                {/* Timeline dot */}
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <GitCommit className="h-3.5 w-3.5 text-primary" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge
                      variant="outline"
                      className={`text-[10px] uppercase font-bold ${getProductoColor(entry.producto)}`}
                    >
                      {entry.producto}
                    </Badge>

                    {entry.commit_sha && (
                      <code className="text-[11px] font-mono text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded">
                        {entry.commit_sha.slice(0, 7)}
                      </code>
                    )}

                    {entry.commit_date && (
                      <span className="text-[11px] text-muted-foreground/70">
                        {relativeTime(entry.commit_date)}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-white/90 leading-snug break-words">
                    {entry.commit_message ?? "Sin mensaje"}
                  </p>

                  <div className="flex items-center gap-3 mt-1.5">
                    {entry.commit_author && (
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <User className="h-3 w-3" />
                        {entry.commit_author}
                      </span>
                    )}

                    {entry.commit_url && (
                      <a
                        href={entry.commit_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Ver en GitHub
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
