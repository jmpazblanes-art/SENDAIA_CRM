'use client'

import { useState, useTransition, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  FileText, Plus, Trash2, ChevronDown, ChevronUp,
  Upload, Loader2, CheckCircle2, Circle, Clock,
  XCircle, ArrowRight, Euro, FileUp
} from 'lucide-react'
import {
  createContract, updateContractPhase, deleteContract, addPhaseToContract,
  type Contrato, type ContractPhase
} from '@/app/dashboard/clients/contract-actions'

// ─── Color helpers ────────────────────────────────────────────────────────────

const estadoContratoConfig: Record<string, { label: string; className: string }> = {
  borrador:   { label: 'Borrador',   className: 'bg-secondary/40 text-muted-foreground border-border' },
  activo:     { label: 'Activo',     className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  pausado:    { label: 'Pausado',    className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  completado: { label: 'Completado', className: 'bg-green-500/15 text-green-400 border-green-500/30' },
  cancelado:  { label: 'Cancelado',  className: 'bg-red-500/15 text-red-400 border-red-500/30' },
}

const estadoFaseConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  pendiente:  { label: 'Pendiente',  className: 'bg-secondary/40 text-muted-foreground border-border', icon: <Circle className="h-3 w-3" /> },
  en_curso:   { label: 'En Curso',   className: 'bg-blue-500/15 text-blue-400 border-blue-500/30',   icon: <ArrowRight className="h-3 w-3" /> },
  entregada:  { label: 'Entregada',  className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', icon: <Clock className="h-3 w-3" /> },
  cobrada:    { label: 'Cobrada',    className: 'bg-green-500/15 text-green-400 border-green-500/30',  icon: <CheckCircle2 className="h-3 w-3" /> },
  cancelada:  { label: 'Cancelada',  className: 'bg-red-500/15 text-red-400 border-red-500/30',        icon: <XCircle className="h-3 w-3" /> },
}

function fmt(n: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n)
}

// ─── Empty phase template ─────────────────────────────────────────────────────

type PhaseForm = { nombre: string; descripcion: string; importe: string; fecha_prevista: string }
const emptyPhase = (): PhaseForm => ({ nombre: '', descripcion: '', importe: '', fecha_prevista: '' })

// ─── Phase state cycler ───────────────────────────────────────────────────────

const PHASE_STATES: ContractPhase['estado'][] = ['pendiente', 'en_curso', 'entregada', 'cobrada', 'cancelada']

function nextEstado(current: ContractPhase['estado']): ContractPhase['estado'] {
  const idx = PHASE_STATES.indexOf(current)
  return PHASE_STATES[(idx + 1) % PHASE_STATES.length]
}

// ─── Contract card ────────────────────────────────────────────────────────────

function ContratoCard({
  contrato,
  onDeleted,
  onPhaseUpdated,
}: {
  contrato: Contrato
  onDeleted: (id: string) => void
  onPhaseUpdated: (contractId: string, phaseId: string, estado: ContractPhase['estado']) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [isPending, startTransition] = useTransition()

  const phases = contrato.contract_phases || []
  const cobradas = phases.filter(p => p.estado === 'cobrada')
  const totalCobrado = cobradas.reduce((s, p) => s + (p.importe || 0), 0)
  const progresso = contrato.valor_total > 0 ? (totalCobrado / contrato.valor_total) * 100 : 0

  function handlePhaseClick(phase: ContractPhase) {
    const newEstado = nextEstado(phase.estado)
    startTransition(async () => {
      const res = await updateContractPhase(phase.id, { estado: newEstado })
      if (!res.error) {
        onPhaseUpdated(contrato.id, phase.id, newEstado)
      }
    })
  }

  function handleDelete() {
    if (!confirm('¿Eliminar este contrato y todas sus fases?')) return
    startTransition(async () => {
      const res = await deleteContract(contrato.id)
      if (!res.error) onDeleted(contrato.id)
    })
  }

  const cfg = estadoContratoConfig[contrato.estado] || estadoContratoConfig.borrador

  return (
    <Card className="bg-card border-border/50 shadow-lg relative overflow-hidden group transition-all hover:border-primary/20">
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <CardContent className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
              <h3 className="text-sm font-black text-foreground uppercase italic tracking-tight truncate">{contrato.titulo}</h3>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={`text-[9px] font-black px-2 py-0.5 ${cfg.className}`}>
                {cfg.label}
              </Badge>
              <span className="text-[10px] font-black text-primary">{fmt(contrato.valor_total)}</span>
              <span className="text-[9px] text-muted-foreground font-bold">
                {cobradas.length}/{phases.length} fases cobradas
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost" size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-red-400"
              onClick={handleDelete}
              disabled={isPending}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost" size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-primary"
              onClick={() => setExpanded(e => !e)}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Cobrado</span>
            <span className="text-[9px] font-black text-primary">{fmt(totalCobrado)} / {fmt(contrato.valor_total)}</span>
          </div>
          <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden border border-border/30">
            <div
              className="h-full bg-primary shadow-[0_0_10px_rgba(201,162,77,0.4)] transition-all duration-700"
              style={{ width: `${Math.min(100, progresso)}%` }}
            />
          </div>
        </div>

        {/* Phases timeline */}
        {expanded && (
          <div className="mt-5 space-y-3 border-t border-border/30 pt-4">
            {phases.length === 0 ? (
              <p className="text-[10px] text-muted-foreground italic text-center py-2">Sin fases definidas.</p>
            ) : (
              <div className="relative pl-5 before:absolute before:left-2 before:top-0 before:bottom-0 before:w-px before:bg-border/40 space-y-4">
                {phases.map((phase) => {
                  const fcfg = estadoFaseConfig[phase.estado] || estadoFaseConfig.pendiente
                  return (
                    <div key={phase.id} className="relative group/phase">
                      <div className="absolute -left-3 top-0.5 h-5 w-5 rounded-full bg-card border border-border flex items-center justify-center">
                        <span className={`${fcfg.className.includes('green') ? 'text-green-400' : fcfg.className.includes('blue') ? 'text-blue-400' : fcfg.className.includes('yellow') ? 'text-yellow-400' : fcfg.className.includes('red') ? 'text-red-400' : 'text-muted-foreground'}`}>
                          {fcfg.icon}
                        </span>
                      </div>
                      <div className="ml-2 flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-foreground uppercase tracking-tight">{phase.nombre}</p>
                          {phase.descripcion && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">{phase.descripcion}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-primary">{fmt(phase.importe)}</span>
                            {phase.fecha_prevista && (
                              <span className="text-[9px] text-muted-foreground font-bold">· {phase.fecha_prevista}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handlePhaseClick(phase)}
                          disabled={isPending}
                          className={`shrink-0 text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wide transition-all hover:opacity-80 ${fcfg.className}`}
                          title="Click para avanzar estado"
                        >
                          {fcfg.label}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── New contract dialog ──────────────────────────────────────────────────────

function NewContratoDialog({
  clientId,
  onCreated,
  prefill,
  open,
  onOpenChange,
}: {
  clientId: string
  onCreated: (c: Contrato) => void
  prefill?: Partial<ExtractedContract>
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [titulo, setTitulo] = useState(prefill?.titulo || '')
  const [descripcion, setDescripcion] = useState(prefill?.descripcion || '')
  const [fechaInicio, setFechaInicio] = useState(prefill?.fecha_inicio || '')
  const [notas, setNotas] = useState(prefill?.notas || '')
  const [phases, setPhases] = useState<PhaseForm[]>(
    prefill?.phases?.map(p => ({
      nombre: p.nombre,
      descripcion: p.descripcion || '',
      importe: String(p.importe || ''),
      fecha_prevista: p.fecha_prevista || ''
    })) || [emptyPhase()]
  )
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  // Sync prefill when it changes (after PDF extraction)
  useState(() => {
    if (prefill) {
      setTitulo(prefill.titulo || '')
      setDescripcion(prefill.descripcion || '')
      setFechaInicio(prefill.fecha_inicio || '')
      setNotas(prefill.notas || '')
      setPhases(
        prefill.phases?.map(p => ({
          nombre: p.nombre,
          descripcion: p.descripcion || '',
          importe: String(p.importe || ''),
          fecha_prevista: p.fecha_prevista || ''
        })) || [emptyPhase()]
      )
    }
  })

  function addPhase() {
    setPhases(ps => [...ps, emptyPhase()])
  }
  function removePhase(idx: number) {
    setPhases(ps => ps.filter((_, i) => i !== idx))
  }
  function updatePhase(idx: number, field: keyof PhaseForm, val: string) {
    setPhases(ps => ps.map((p, i) => i === idx ? { ...p, [field]: val } : p))
  }

  function handleSubmit() {
    if (!titulo.trim()) { setError('El título es obligatorio.'); return }
    setError('')
    startTransition(async () => {
      const res = await createContract({
        client_id: clientId,
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        fecha_inicio: fechaInicio || undefined,
        notas: notas.trim() || undefined,
        phases: phases
          .filter(p => p.nombre.trim())
          .map(p => ({
            nombre: p.nombre.trim(),
            descripcion: p.descripcion.trim() || undefined,
            importe: parseFloat(p.importe) || 0,
            fecha_prevista: p.fecha_prevista || undefined,
          }))
      })
      if (res.error) {
        setError(res.error)
      } else if (res.data) {
        onCreated(res.data)
        onOpenChange(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-black uppercase italic tracking-tight text-foreground">
            Nuevo Contrato
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Título *</Label>
            <Input value={titulo} onChange={e => setTitulo(e.target.value)}
              className="mt-1 bg-secondary/20 border-border/50 text-sm font-bold"
              placeholder="Ej: Rediseño web corporativa" />
          </div>

          <div>
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Descripción</Label>
            <Textarea value={descripcion} onChange={e => setDescripcion(e.target.value)}
              className="mt-1 bg-secondary/20 border-border/50 text-sm resize-none" rows={2}
              placeholder="Descripción del alcance del contrato..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fecha Inicio</Label>
              <Input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)}
                className="mt-1 bg-secondary/20 border-border/50 text-sm" />
            </div>
            <div>
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Notas</Label>
              <Input value={notas} onChange={e => setNotas(e.target.value)}
                className="mt-1 bg-secondary/20 border-border/50 text-sm"
                placeholder="Condiciones especiales..." />
            </div>
          </div>

          {/* Phases */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fases del Contrato</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addPhase}
                className="h-6 text-[10px] font-black text-primary hover:bg-primary/10 uppercase tracking-wide">
                <Plus className="h-3 w-3 mr-1" /> Añadir Fase
              </Button>
            </div>
            <div className="space-y-3">
              {phases.map((phase, idx) => (
                <div key={idx} className="p-3 bg-secondary/10 rounded-xl border border-border/40 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">Fase {idx + 1}</span>
                    {phases.length > 1 && (
                      <button onClick={() => removePhase(idx)}
                        className="text-muted-foreground hover:text-red-400 transition-colors">
                        <XCircle className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Input value={phase.nombre} onChange={e => updatePhase(idx, 'nombre', e.target.value)}
                        className="bg-secondary/20 border-border/50 text-xs font-bold h-8"
                        placeholder="Nombre de la fase" />
                    </div>
                    <div>
                      <Input value={phase.importe} onChange={e => updatePhase(idx, 'importe', e.target.value)}
                        type="number" min="0" step="0.01"
                        className="bg-secondary/20 border-border/50 text-xs font-bold h-8"
                        placeholder="Importe (€)" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={phase.descripcion} onChange={e => updatePhase(idx, 'descripcion', e.target.value)}
                      className="bg-secondary/20 border-border/50 text-xs h-8"
                      placeholder="Descripción (opcional)" />
                    <Input type="date" value={phase.fecha_prevista} onChange={e => updatePhase(idx, 'fecha_prevista', e.target.value)}
                      className="bg-secondary/20 border-border/50 text-xs h-8" />
                  </div>
                </div>
              ))}
            </div>

            {/* Total preview */}
            {phases.some(p => p.importe) && (
              <div className="mt-2 flex items-center justify-end gap-2">
                <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Total:</span>
                <span className="text-sm font-black text-primary">
                  {fmt(phases.reduce((s, p) => s + (parseFloat(p.importe) || 0), 0))}
                </span>
              </div>
            )}
          </div>

          {error && <p className="text-xs text-red-400 font-bold">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}
              className="text-xs font-black uppercase">Cancelar</Button>
            <Button onClick={handleSubmit} disabled={isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-black uppercase">
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
              Guardar Contrato
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Types for PDF extraction ─────────────────────────────────────────────────

type ExtractedContract = {
  titulo?: string
  descripcion?: string
  fecha_inicio?: string
  notas?: string
  phases: Array<{ nombre: string; descripcion?: string; importe: number; fecha_prevista?: string | null }>
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ClientContracts({
  clientId,
  initialContracts,
}: {
  clientId: string
  initialContracts: Contrato[]
}) {
  const [contracts, setContracts] = useState<Contrato[]>(initialContracts)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [prefill, setPrefill] = useState<ExtractedContract | undefined>(undefined)
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleCreated(newContract: Contrato) {
    // Reload with phases from server would be ideal; for now add optimistically
    setContracts(cs => [{ ...newContract, contract_phases: [] }, ...cs])
    // Trigger revalidation by reloading the page data silently
    window.location.reload()
  }

  function handleDeleted(id: string) {
    setContracts(cs => cs.filter(c => c.id !== id))
  }

  function handlePhaseUpdated(contractId: string, phaseId: string, estado: ContractPhase['estado']) {
    setContracts(cs => cs.map(c => {
      if (c.id !== contractId) return c
      return {
        ...c,
        contract_phases: (c.contract_phases || []).map(p =>
          p.id === phaseId ? { ...p, estado } : p
        )
      }
    }))
  }

  async function handlePdfImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setExtracting(true)
    setExtractError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/contracts/extract', { method: 'POST', body: fd })
      const json = await res.json()
      if (json.error) {
        setExtractError(json.error)
      } else {
        setPrefill(json)
        setDialogOpen(true)
      }
    } catch (err: any) {
      setExtractError(err.message || 'Error al procesar el PDF.')
    } finally {
      setExtracting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const totalGeneral = contracts.reduce((s, c) => s + (c.valor_total || 0), 0)
  const totalCobrado = contracts.reduce((s, c) => {
    const cobrado = (c.contract_phases || [])
      .filter(p => p.estado === 'cobrada')
      .reduce((ps, p) => ps + (p.importe || 0), 0)
    return s + cobrado
  }, 0)

  return (
    <Card className="bg-card border-border shadow-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 px-6 py-4">
        <div>
          <CardTitle className="text-lg font-black text-foreground uppercase italic tracking-tighter">
            Contratos
          </CardTitle>
          {contracts.length > 0 && (
            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mt-0.5">
              {fmt(totalCobrado)} cobrado de {fmt(totalGeneral)} total · {contracts.length} contrato{contracts.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* PDF import */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handlePdfImport}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={extracting}
            className="border-border/50 text-muted-foreground hover:text-primary hover:border-primary/30 text-[10px] font-black uppercase h-8"
          >
            {extracting ? (
              <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> Analizando...</>
            ) : (
              <><FileUp className="h-3 w-3 mr-1.5" /> Importar PDF</>
            )}
          </Button>

          <Button
            size="sm"
            onClick={() => { setPrefill(undefined); setDialogOpen(true) }}
            className="bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 text-[10px] font-black uppercase h-8"
          >
            <Plus className="h-3 w-3 mr-1.5" /> Nuevo Contrato
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {extractError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-xs text-red-400 font-bold">{extractError}</p>
          </div>
        )}

        {contracts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-14 w-14 bg-secondary/20 rounded-full flex items-center justify-center mb-4 border border-dashed border-border">
              <FileText className="h-7 w-7 text-muted-foreground/30" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sin Contratos</p>
            <p className="text-[10px] text-muted-foreground mt-1 italic">Crea el primer contrato o importa uno desde PDF.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {contracts.map(c => (
              <ContratoCard
                key={c.id}
                contrato={c}
                onDeleted={handleDeleted}
                onPhaseUpdated={handlePhaseUpdated}
              />
            ))}
          </div>
        )}
      </CardContent>

      <NewContratoDialog
        clientId={clientId}
        onCreated={handleCreated}
        prefill={prefill}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </Card>
  )
}
