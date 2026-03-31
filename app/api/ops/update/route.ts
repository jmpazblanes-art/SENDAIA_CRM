import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { sendOpsAlert } from '@/lib/ops-telegram'

interface ProductoUpdate {
  producto: string
  estado: 'ok' | 'warning' | 'error'
  github_actions_status?: string
  github_actions_url?: string
  uptime_ok?: boolean
  ultimo_error?: string | null
  coste_anthropic_mes?: number
  coste_openai_mes?: number
  coste_supabase_mes?: number
}

interface UpdateRequest {
  secret: string
  productos: ProductoUpdate[]
}

export async function POST(request: Request) {
  try {
    const body: UpdateRequest = await request.json()

    if (!body.secret || body.secret !== process.env.OPS_API_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!Array.isArray(body.productos) || body.productos.length === 0) {
      return NextResponse.json(
        { error: 'productos array is required and must not be empty' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    let updated = 0
    let alerts_created = 0

    for (const prod of body.productos) {
      if (!prod.producto || !prod.estado) {
        continue
      }

      // Check current state before upserting (to detect new errors)
      let currentError: string | null = null
      if (prod.estado === 'error' && prod.ultimo_error) {
        const { data: existing } = await supabase
          .from('ops_monitoring')
          .select('ultimo_error')
          .eq('producto', prod.producto)
          .single()

        currentError = existing?.ultimo_error ?? null
      }

      // Upsert monitoring row
      const { error: upsertError } = await supabase
        .from('ops_monitoring')
        .upsert(
          {
            producto: prod.producto,
            estado: prod.estado,
            ...(prod.github_actions_status !== undefined && {
              github_actions_status: prod.github_actions_status,
            }),
            ...(prod.github_actions_url !== undefined && {
              github_actions_url: prod.github_actions_url,
            }),
            ...(prod.uptime_ok !== undefined && { uptime_ok: prod.uptime_ok }),
            ...(prod.ultimo_error !== undefined && {
              ultimo_error: prod.ultimo_error,
            }),
            ...(prod.coste_anthropic_mes !== undefined && {
              coste_anthropic_mes: prod.coste_anthropic_mes,
            }),
            ...(prod.coste_openai_mes !== undefined && {
              coste_openai_mes: prod.coste_openai_mes,
            }),
            ...(prod.coste_supabase_mes !== undefined && {
              coste_supabase_mes: prod.coste_supabase_mes,
            }),
            ultima_verificacion: new Date().toISOString(),
          },
          { onConflict: 'producto' }
        )

      if (upsertError) {
        console.error(`[ops/update] Upsert error for ${prod.producto}:`, upsertError)
        continue
      }

      updated++

      // Create alert if estado is error and the error message is new
      if (
        prod.estado === 'error' &&
        prod.ultimo_error &&
        prod.ultimo_error !== currentError
      ) {
        const { error: alertError } = await supabase.from('ops_alertas').insert({
          producto: prod.producto,
          tipo_error: 'monitoring_auto',
          log_error: prod.ultimo_error,
          estado: 'pendiente',
          confianza: 'media',
        })

        if (alertError) {
          console.error(`[ops/update] Alert creation error for ${prod.producto}:`, alertError)
        } else {
          alerts_created++
          // Fire-and-forget Telegram alert
          try {
            await sendOpsAlert(prod.producto, 'monitoring_auto', prod.ultimo_error)
          } catch (tgErr) {
            console.error(`[ops/update] Telegram alert failed for ${prod.producto}:`, tgErr)
          }
        }
      }
    }

    return NextResponse.json({ ok: true, updated, alerts_created })
  } catch (err) {
    console.error('[ops/update] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
