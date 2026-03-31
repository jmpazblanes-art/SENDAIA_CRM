import { createAdminClient } from '@/utils/supabase/admin'

type NotificationType = 'lead' | 'cita' | 'factura' | 'ops' | 'contrato' | 'presupuesto' | 'sistema'

interface CreateNotificationParams {
    tipo: NotificationType
    titulo: string
    mensaje?: string
    link?: string
}

export async function createNotification(params: CreateNotificationParams) {
    const supabase = createAdminClient()

    const { error } = await supabase.from('notifications').insert({
        tipo: params.tipo,
        titulo: params.titulo,
        mensaje: params.mensaje || null,
        link: params.link || null,
        leida: false,
    })

    if (error) {
        console.error('Error creating notification:', error)
        return { error: error.message }
    }

    return { success: true }
}
