import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

interface AlertRequest {
  secret: string
  producto: string
  tipo_error: string
  log_error?: string
  confianza?: 'alta' | 'media' | 'baja'
}

export async function POST(request: Request) {
  try {
    const body: AlertRequest = await request.json()

    if (!body.secret || body.secret !== process.env.OPS_API_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!body.producto || !body.tipo_error) {
      return NextResponse.json(
        { error: 'producto and tipo_error are required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('ops_alertas')
      .insert({
        producto: body.producto,
        tipo_error: body.tipo_error,
        log_error: body.log_error ?? null,
        confianza: body.confianza ?? 'media',
        estado: 'pendiente',
      })
      .select('id')
      .single()

    if (error) {
      console.error('[ops/alert] Insert error:', error)
      return NextResponse.json(
        { error: 'Failed to create alert' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, alert_id: data.id })
  } catch (err) {
    console.error('[ops/alert] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
