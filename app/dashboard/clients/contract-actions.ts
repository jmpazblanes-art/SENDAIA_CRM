'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export type ContractPhase = {
  id: string
  contract_id: string
  nombre: string
  descripcion: string | null
  importe: number
  estado: 'pendiente' | 'en_curso' | 'entregada' | 'cobrada' | 'cancelada'
  fecha_prevista: string | null
  fecha_entrega: string | null
  orden: number
  created_at: string
}

export type Contrato = {
  id: string
  client_id: string
  titulo: string
  descripcion: string | null
  valor_total: number
  estado: 'borrador' | 'activo' | 'pausado' | 'completado' | 'cancelado'
  fecha_inicio: string | null
  fecha_fin: string | null
  notas: string | null
  created_at: string
  updated_at: string
  contract_phases?: ContractPhase[]
}

export async function getClientContracts(clientId: string): Promise<{ data: Contrato[]; error?: string }> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('contratos')
    .select(`*, contract_phases (*)`)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching contracts:', error)
    return { data: [], error: error.message }
  }

  const contracts = (data || []).map((c: any) => ({
    ...c,
    contract_phases: (c.contract_phases || []).sort((a: ContractPhase, b: ContractPhase) => a.orden - b.orden)
  }))

  return { data: contracts }
}

export async function createContract(data: {
  client_id: string
  titulo: string
  descripcion?: string
  fecha_inicio?: string
  notas?: string
  phases: Array<{
    nombre: string
    descripcion?: string
    importe: number
    fecha_prevista?: string
  }>
}): Promise<{ success?: boolean; data?: Contrato; error?: string }> {
  const supabase = createAdminClient()

  const valor_total = data.phases.reduce((sum, p) => sum + (p.importe || 0), 0)

  const { data: contrato, error: contratoError } = await supabase
    .from('contratos')
    .insert({
      client_id: data.client_id,
      titulo: data.titulo,
      descripcion: data.descripcion || null,
      valor_total,
      fecha_inicio: data.fecha_inicio || null,
      notas: data.notas || null,
      estado: 'borrador'
    })
    .select()
    .single()

  if (contratoError || !contrato) {
    console.error('Error creating contract:', contratoError)
    return { error: contratoError?.message || 'Error al crear el contrato.' }
  }

  if (data.phases.length > 0) {
    const phasesInsert = data.phases.map((p, i) => ({
      contract_id: contrato.id,
      nombre: p.nombre,
      descripcion: p.descripcion || null,
      importe: p.importe || 0,
      fecha_prevista: p.fecha_prevista || null,
      orden: i,
      estado: 'pendiente'
    }))

    const { error: phasesError } = await supabase.from('contract_phases').insert(phasesInsert)

    if (phasesError) {
      console.error('Error creating phases:', phasesError)
      return { error: phasesError.message }
    }
  }

  revalidatePath(`/dashboard/clients/${data.client_id}`)
  return { success: true, data: contrato }
}

export async function updateContractPhase(
  phaseId: string,
  updates: Partial<Pick<ContractPhase, 'estado' | 'fecha_entrega' | 'nombre' | 'descripcion' | 'importe' | 'fecha_prevista'>>
): Promise<{ success?: boolean; error?: string }> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('contract_phases')
    .update(updates)
    .eq('id', phaseId)

  if (error) {
    console.error('Error updating phase:', error)
    return { error: error.message }
  }

  return { success: true }
}

export async function deleteContract(contractId: string): Promise<{ success?: boolean; error?: string }> {
  const supabase = createAdminClient()

  const { data: contrato } = await supabase
    .from('contratos')
    .select('client_id')
    .eq('id', contractId)
    .single()

  const { error } = await supabase.from('contratos').delete().eq('id', contractId)

  if (error) {
    console.error('Error deleting contract:', error)
    return { error: error.message }
  }

  if (contrato?.client_id) {
    revalidatePath(`/dashboard/clients/${contrato.client_id}`)
  }

  return { success: true }
}

export async function addPhaseToContract(
  contractId: string,
  phaseData: {
    nombre: string
    descripcion?: string
    importe: number
    fecha_prevista?: string
  }
): Promise<{ success?: boolean; error?: string }> {
  const supabase = createAdminClient()

  const { data: existingPhases } = await supabase
    .from('contract_phases')
    .select('orden')
    .eq('contract_id', contractId)
    .order('orden', { ascending: false })
    .limit(1)

  const nextOrden = existingPhases && existingPhases.length > 0 ? existingPhases[0].orden + 1 : 0

  const { error: phaseError } = await supabase.from('contract_phases').insert({
    contract_id: contractId,
    nombre: phaseData.nombre,
    descripcion: phaseData.descripcion || null,
    importe: phaseData.importe || 0,
    fecha_prevista: phaseData.fecha_prevista || null,
    orden: nextOrden,
    estado: 'pendiente'
  })

  if (phaseError) {
    console.error('Error adding phase:', phaseError)
    return { error: phaseError.message }
  }

  const { data: allPhases } = await supabase
    .from('contract_phases')
    .select('importe')
    .eq('contract_id', contractId)

  const newTotal = (allPhases || []).reduce((sum, p) => sum + (p.importe || 0), 0)

  await supabase
    .from('contratos')
    .update({ valor_total: newTotal, updated_at: new Date().toISOString() })
    .eq('id', contractId)

  return { success: true }
}
