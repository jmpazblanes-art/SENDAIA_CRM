"use client"

import { OpsAlerta } from "./types"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"
import { Inbox } from "lucide-react"

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

const estadoAlertaColors: Record<string, string> = {
  pendiente: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  en_analisis: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  fix_propuesto: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  reparado: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  ignorado: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  fallido: "bg-red-500/20 text-red-400 border-red-500/30",
}

const estadoLabels: Record<string, string> = {
  pendiente: "Pendiente",
  en_analisis: "En analisis",
  fix_propuesto: "Fix propuesto",
  reparado: "Reparado",
  ignorado: "Ignorado",
  fallido: "Fallido",
}

export function AlertLog({ alertas }: { alertas: OpsAlerta[] }) {
  if (!alertas || alertas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Inbox className="h-10 w-10 mb-3 opacity-50" />
        <p className="text-sm font-medium">Sin alertas recientes</p>
        <p className="text-xs mt-1">Los productos operan con normalidad</p>
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-xs font-bold uppercase tracking-wider">Fecha</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider">Producto</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider">Tipo error</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider">Estado</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider">Fix aplicado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alertas.map((a) => (
              <TableRow key={a.id} className="border-border/50">
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {relativeTime(a.created_at)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="bg-secondary/50 text-white border-border/50 text-xs font-semibold"
                  >
                    {a.producto}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {a.tipo_error ?? "-"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-[10px] uppercase font-bold ${estadoAlertaColors[a.estado] ?? ""}`}
                  >
                    {estadoLabels[a.estado] ?? a.estado}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[200px]">
                  {a.fix_aplicado ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-xs text-muted-foreground truncate block cursor-default">
                          {a.fix_aplicado}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-sm text-xs">
                        {a.fix_aplicado}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <span className="text-xs text-muted-foreground/50">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  )
}
