'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addProductAction(formData: FormData) {
  try {
    const supabase = await createClient()
    const producto = formData.get('producto') as string
    const repo = formData.get('repo') as string
    const url_app = formData.get('url_app') as string || null

    if (!producto || !repo) {
      return { error: 'Producto y repo son obligatorios' }
    }

    const { error } = await supabase.from('ops_monitoring').insert({
      producto,
      repo,
      url_app,
      estado: 'ok',
      uptime_ok: true,
    })

    if (error) {
      if (error.code === '23505') return { error: 'Este producto ya existe' }
      return { error: error.message }
    }

    revalidatePath('/dashboard/ops')
    return { success: true }
  } catch (err) {
    return { error: 'Error inesperado' }
  }
}

export async function removeProductAction(productId: string) {
  try {
    const supabase = await createClient()

    // Also delete related alerts
    const { data: product } = await supabase
      .from('ops_monitoring')
      .select('producto')
      .eq('id', productId)
      .single()

    if (product) {
      await supabase.from('ops_alertas').delete().eq('producto', product.producto)
    }

    const { error } = await supabase
      .from('ops_monitoring')
      .delete()
      .eq('id', productId)

    if (error) return { error: error.message }

    revalidatePath('/dashboard/ops')
    return { success: true }
  } catch (err) {
    return { error: 'Error inesperado' }
  }
}
