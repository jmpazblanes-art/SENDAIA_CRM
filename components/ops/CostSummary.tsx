"use client"

import { OpsMonitoring } from "./types"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"
import { AlertTriangle } from "lucide-react"

function eur(n: number): string {
  return n.toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function CostSummary({ productos }: { productos: OpsMonitoring[] }) {
  if (!productos || productos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <AlertTriangle className="h-10 w-10 mb-3 opacity-50" />
        <p className="text-sm font-medium">No hay datos de costes</p>
      </div>
    )
  }

  const totals = productos.reduce(
    (acc, p) => ({
      anthropic: acc.anthropic + (p.coste_anthropic_mes ?? 0),
      openai: acc.openai + (p.coste_openai_mes ?? 0),
      supabase: acc.supabase + (p.coste_supabase_mes ?? 0),
    }),
    { anthropic: 0, openai: 0, supabase: 0 }
  )
  const grandTotal = totals.anthropic + totals.openai + totals.supabase

  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="text-[#C9A24D] font-bold uppercase text-xs tracking-wider">
              Producto
            </TableHead>
            <TableHead className="text-right text-xs font-bold uppercase tracking-wider">
              Anthropic
            </TableHead>
            <TableHead className="text-right text-xs font-bold uppercase tracking-wider">
              OpenAI
            </TableHead>
            <TableHead className="text-right text-xs font-bold uppercase tracking-wider">
              Supabase
            </TableHead>
            <TableHead className="text-right text-xs font-bold uppercase tracking-wider">
              Total
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productos.map((p) => {
            const rowTotal =
              (p.coste_anthropic_mes ?? 0) +
              (p.coste_openai_mes ?? 0) +
              (p.coste_supabase_mes ?? 0)
            return (
              <TableRow key={p.id} className="border-border/50">
                <TableCell className="font-semibold text-white">
                  <span className="flex items-center gap-2">
                    {p.producto}
                    {rowTotal > 50 && (
                      <Badge
                        variant="outline"
                        className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px]"
                      >
                        Alto
                      </Badge>
                    )}
                  </span>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {eur(p.coste_anthropic_mes ?? 0)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {eur(p.coste_openai_mes ?? 0)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {eur(p.coste_supabase_mes ?? 0)}
                </TableCell>
                <TableCell className="text-right font-semibold text-white">
                  {eur(rowTotal)}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
        <TableFooter>
          <TableRow className="border-border/50 bg-secondary/30">
            <TableCell className="font-bold text-[#C9A24D] uppercase text-xs tracking-wider">
              Total
            </TableCell>
            <TableCell className="text-right font-semibold text-white">
              {eur(totals.anthropic)}
            </TableCell>
            <TableCell className="text-right font-semibold text-white">
              {eur(totals.openai)}
            </TableCell>
            <TableCell className="text-right font-semibold text-white">
              {eur(totals.supabase)}
            </TableCell>
            <TableCell className="text-right font-bold text-[#C9A24D]">
              {eur(grandTotal)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
