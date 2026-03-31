import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

interface PatchRequest {
  secret: string
  estado: 'en_analisis' | 'fix_propuesto' | 'reparado' | 'ignorado' | 'fallido'
  fix_propuesto?: string
  fix_aplicado?: string
  fix_commit_url?: string
}

const RESOLUTION_STATES = ['reparado', 'ignorado', 'fallido']

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: PatchRequest = await request.json()

    if (!body.secret || body.secret !== process.env.OPS_API_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!body.estado) {
      return NextResponse.json(
        { error: 'estado is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const updateData: Record<string, unknown> = {
      estado: body.estado,
    }

    if (body.fix_propuesto !== undefined) {
      updateData.fix_propuesto = body.fix_propuesto
    }
    if (body.fix_aplicado !== undefined) {
      updateData.fix_aplicado = body.fix_aplicado
    }
    if (body.fix_commit_url !== undefined) {
      updateData.fix_commit_url = body.fix_commit_url
    }

    if (RESOLUTION_STATES.includes(body.estado)) {
      updateData.fecha_resolucion = new Date().toISOString()
    }

    const { error } = await supabase
      .from('ops_alertas')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error(`[ops/alert/${id}] Update error:`, error)
      return NextResponse.json(
        { error: 'Failed to update alert' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[ops/alert/[id]] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
