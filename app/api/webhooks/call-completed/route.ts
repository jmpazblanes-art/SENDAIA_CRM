/**
 * DEPRECATED: Este endpoint está obsoleto.
 * El webhook de llamadas se gestiona en /api/webhooks/retell
 * que tiene la lógica completa con análisis de sentimiento,
 * creación automática de clientes y extracción de datos.
 *
 * Mantenemos este endpoint por compatibilidad pero redirige
 * toda la lógica al webhook de Retell.
 */

import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const body = await req.json()

        // Reenviar al webhook de Retell que tiene la lógica completa
        const retellUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhooks/retell`

        const response = await fetch(retellUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event: 'call_ended',
                call: {
                    call_id: body.call_sid,
                    call_status: body.status || 'completed',
                    transcript: body.transcript || '',
                    call_analysis: {
                        call_summary: body.summary || '',
                        user_sentiment: body.sentiment || 'neutral',
                    },
                    direction: body.direction || 'outbound',
                    from_number: body.from_number || '',
                    to_number: body.to_number || '',
                    duration_ms: (body.duration_seconds || 0) * 1000,
                    recording_url: body.recording_url || '',
                }
            })
        })

        const result = await response.json()
        return NextResponse.json(result)

    } catch (error: any) {
        console.error('[call-completed] Error forwarding to retell webhook:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
