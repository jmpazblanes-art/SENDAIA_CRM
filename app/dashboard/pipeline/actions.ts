'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

const VALID_STATUSES = ['lead', 'contacted', 'qualified', 'proposal', 'active', 'lost'] as const

export async function updateClientStatus(clientId: string, newStatus: string) {
    if (!clientId || !newStatus) {
        return { error: 'ID de cliente y estado son requeridos' }
    }

    if (!VALID_STATUSES.includes(newStatus as any)) {
        return { error: `Estado inválido: ${newStatus}` }
    }

    const supabase = await createClient()
    const { error } = await supabase
        .from('clients')
        .update({ status: newStatus })
        .eq('id', clientId)

    if (error) return { error: error.message }

    revalidatePath('/dashboard/pipeline')
    revalidatePath('/dashboard/clients')
    return { success: true }
}
