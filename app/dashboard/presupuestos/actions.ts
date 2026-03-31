'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import type { PresupuestoServicio } from '@/lib/baremo'

export async function createPresupuesto(data: {
  client_id: string
  titulo: string
  servicios: PresupuestoServicio[]
  iva_percent: number
  notas?: string
  valid_until?: string
}) {
  const supabase = await createClient()

  if (!data.client_id || !data.titulo || !data.servicios.length) {
    return { error: 'Faltan campos obligatorios (cliente, titulo, servicios)' }
  }

  // Generate next numero
  const year = new Date().getFullYear()
  const { data: lastPresupuesto } = await supabase
    .from('presupuestos')
    .select('numero')
    .like('numero', `SEND-P-${year}-%`)
    .order('numero', { ascending: false })
    .limit(1)
    .single()

  let nextNum = 1
  if (lastPresupuesto?.numero) {
    const parts = lastPresupuesto.numero.split('-')
    const last = parseInt(parts[parts.length - 1], 10)
    if (!isNaN(last)) nextNum = last + 1
  }

  const numero = `SEND-P-${year}-${String(nextNum).padStart(3, '0')}`

  const subtotal = data.servicios.reduce(
    (acc, s) => acc + s.precio_setup + s.precio_mensual,
    0
  )
  const total = subtotal * (1 + data.iva_percent / 100)

  const { error } = await supabase.from('presupuestos').insert({
    client_id: data.client_id,
    numero,
    titulo: data.titulo,
    servicios: data.servicios,
    subtotal,
    iva_percent: data.iva_percent,
    total,
    estado: 'borrador',
    notas: data.notas || null,
    valid_until: data.valid_until || null,
  })

  if (error) {
    console.error('Error creating presupuesto:', error)
    if (error.code === '23505') return { error: 'Ya existe un presupuesto con ese numero' }
    return { error: 'Error al crear el presupuesto' }
  }

  revalidatePath('/dashboard/presupuestos')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updatePresupuestoStatus(presupuestoId: string, estado: string) {
  const supabase = await createClient()

  const validStatuses = ['borrador', 'enviado', 'aceptado', 'rechazado', 'facturado']
  if (!validStatuses.includes(estado)) return { error: 'Estado invalido' }

  const { error } = await supabase
    .from('presupuestos')
    .update({ estado, updated_at: new Date().toISOString() })
    .eq('id', presupuestoId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/presupuestos')
  return { success: true }
}

export async function getClientsForPresupuesto() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('clients')
    .select('id, first_name, last_name, company_name, email')
    .order('company_name', { ascending: true })

  if (error) return []

  return (data || []).map(c => ({
    id: c.id,
    name: (c.company_name || `${c.first_name} ${c.last_name}`).trim(),
    email: c.email || '',
  }))
}
