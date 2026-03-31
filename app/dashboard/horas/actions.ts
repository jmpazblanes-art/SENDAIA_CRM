'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTimeEntry(formData: FormData) {
    const supabase = await createClient()

    const client_id = formData.get('client_id') as string
    const proyecto = formData.get('proyecto') as string
    const descripcion = formData.get('descripcion') as string
    const horas = parseFloat(formData.get('horas') as string)
    const fecha = formData.get('fecha') as string
    const tarifa_hora = parseFloat(formData.get('tarifa_hora') as string) || 50
    const facturable = formData.get('facturable') !== 'false'

    if (!client_id || !horas || horas <= 0) {
        return { error: 'Selecciona un cliente e introduce horas válidas' }
    }

    const { error } = await supabase.from('time_entries').insert({
        client_id: client_id || null,
        proyecto: proyecto || null,
        descripcion: descripcion || null,
        horas,
        fecha: fecha || new Date().toISOString().split('T')[0],
        tarifa_hora,
        facturable,
    })

    if (error) {
        console.error('Error creating time entry:', error)
        return { error: 'Error al registrar las horas' }
    }

    revalidatePath('/dashboard/horas')
    revalidatePath('/dashboard')
    return { success: true }
}

export async function deleteTimeEntry(entryId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', entryId)

    if (error) {
        console.error('Error deleting time entry:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/horas')
    revalidatePath('/dashboard')
    return { success: true }
}

export async function getClientsForTimeAction() {
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
