'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

interface ContratoModulo {
    nombre: string
    setup: number
    mensual: number
}

export async function createContrato(
    formData: FormData,
    modulos: ContratoModulo[]
) {
    const supabase = await createClient()

    const client_id = formData.get('client_id') as string
    const tipo = formData.get('tipo') as string
    const titulo = formData.get('titulo') as string
    const contenido = formData.get('contenido') as string
    const fecha_vencimiento = formData.get('fecha_vencimiento') as string

    if (!client_id || !titulo) {
        return { error: 'Faltan campos obligatorios (cliente y título)' }
    }

    if (!modulos.length) {
        return { error: 'Añade al menos un módulo al contrato' }
    }

    const valor_setup = modulos.reduce((acc, m) => acc + (m.setup || 0), 0)
    const valor_mensual = modulos.reduce((acc, m) => acc + (m.mensual || 0), 0)

    const { error } = await supabase.from('contratos').insert({
        client_id,
        tipo: tipo || 'mercantil',
        titulo,
        contenido: contenido || null,
        estado: 'borrador',
        fecha_vencimiento: fecha_vencimiento || null,
        modulos,
        valor_setup,
        valor_mensual,
    })

    if (error) {
        console.error('Error creating contrato:', error)
        return { error: 'Error al crear el contrato' }
    }

    revalidatePath('/dashboard/contratos')
    revalidatePath('/dashboard')
    return { success: true }
}

export async function updateContratoStatus(contratoId: string, estado: string) {
    const supabase = await createClient()

    const validStatuses = ['borrador', 'enviado', 'firmado', 'cancelado']
    if (!validStatuses.includes(estado)) {
        return { error: 'Estado inválido' }
    }

    const update: Record<string, any> = { estado, updated_at: new Date().toISOString() }

    if (estado === 'firmado') {
        update.fecha_firma = new Date().toISOString().split('T')[0]
    }

    const { error } = await supabase
        .from('contratos')
        .update(update)
        .eq('id', contratoId)

    if (error) {
        console.error('Error updating contrato status:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/contratos')
    revalidatePath('/dashboard')
    return { success: true }
}

export async function getClientsForContratoAction() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('clients')
        .select('id, first_name, last_name, company_name')
        .order('company_name', { ascending: true })

    if (error) return []

    return (data || []).map(c => ({
        id: c.id,
        name: (c.company_name || `${c.first_name} ${c.last_name}`).trim(),
    }))
}
