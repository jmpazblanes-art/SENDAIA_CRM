import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Usamos Service Role Key para evitar bloqueos por RLS
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
    let runId: string | null = null
    try {
        const payload = await request.json()
        console.log("[Retell Webhook] Received event:", payload.event)

        // Registrar el inicio de la automatización (opcional)
        try {
            const { data: runData } = await supabase
                .from('automation_runs')
                .insert({
                    name: 'Interacción con Agente de Voz',
                    status: 'running',
                    category: 'integration',
                    metadata: { event: payload.event }
                })
                .select('id')
                .single()
            runId = runData?.id ?? null
        } catch (_) { /* non-critical */ }

        // Retell envía diferentes eventos, nos interesa 'call_analyzed' que es cuando ya hay transcripción y resumen
        if (payload.event === 'call_analyzed' || payload.event === 'call_ended') {
            const call = payload.call || payload.data

            if (!call) {
                return NextResponse.json({ success: true, message: "No call data found" })
            }

            const callId = call.call_id
            const direction = call.direction === 'inbound' ? 'inbound' : 'outbound'
            const fromNumber = call.from_number || ''
            const toNumber = call.to_number || ''

            // Determinar cuál es el número del cliente
            const clientPhone = direction === 'inbound' ? fromNumber : toNumber

            const durationSecs = Math.round((call.duration_ms || 0) / 1000)
            const recordingUrl = call.recording_url || ''
            const transcript = call.transcript || ''

            // Extraer análisis inteligente (Retell lo envía en call_analysis)
            const analysis = call.call_analysis || {}
            let sentiment = (analysis.user_sentiment || 'neutral').toLowerCase()
            if (!['positive', 'neutral', 'negative'].includes(sentiment)) sentiment = 'neutral'

            const summary = analysis.call_summary || ''

            // Datos extraídos personalizados desde el Prompt de Retell
            const customData = analysis.custom_analysis_data || {}
            const intent = customData.intent || ''
            const nextAction = customData.next_action || ''

            let clientId = null

            // 1. Buscar si el cliente existe por teléfono
            if (clientPhone) {
                const cleanPhone = clientPhone.replace(/\D/g, '') // Quitar +, espacios etc para buscar mejor

                const { data: existingClient } = await supabase
                    .from('clients')
                    .select('id')
                    .ilike('phone', `%${cleanPhone}%`)
                    .maybeSingle()

                if (existingClient) {
                    clientId = existingClient.id
                } else {
                    // Si no existe y Retell ha averiguado el nombre en la llamada, lo usamos.
                    // Si no lo dijo, será "Llamada Desconocida".
                    const newFirstName = customData.user_name?.split(' ')[0] || "Llamada"
                    const newLastName = customData.user_name?.split(' ').slice(1).join(' ') || "Desconocida"
                    const newCompany = customData.company_name || 'Particular'
                    const newEmail = customData.email || null

                    // Crear cliente automáticamente
                    const { data: newClient } = await supabase
                        .from('clients')
                        .insert({
                            first_name: newFirstName,
                            last_name: newLastName,
                            company_name: newCompany,
                            email: newEmail,
                            phone: clientPhone,
                            source: 'voice_agent',
                            status: 'lead'
                        })
                        .select('id')
                        .single()

                    if (newClient) clientId = newClient.id
                }
            }

            // Mapear status de la llamada a los válidos de la BD
            let status = 'completed'
            const apiStatus = (call.call_status || '').toLowerCase()
            if (apiStatus.includes('no_answer')) status = 'no_answer'
            else if (apiStatus.includes('busy')) status = 'busy'
            else if (apiStatus.includes('failed') || apiStatus.includes('error')) status = 'failed'
            else if (apiStatus.includes('voicemail')) status = 'voicemail'

            // 2. Guardar toooodo el detalle histórico en la tabla de llamadas
            const callLogPayload = {
                call_sid: callId,
                client_id: clientId,
                direction,
                from_number: fromNumber,
                to_number: toNumber,
                status,
                duration_seconds: durationSecs,
                recording_url: recordingUrl,
                transcript,
                sentiment,
                intent: intent.substring(0, 255), // Cortar por seguridad
                summary,
                next_action: nextAction
            }

            const { error: logError } = await supabase
                .from('call_logs')
                // Upsert por si entra "call_ended" y luego actualizamos con "call_analyzed"
                .upsert(callLogPayload, { onConflict: 'call_sid' })

            if (logError) throw logError

            // Actualizar automatización a Success
            if (runId) {
                await supabase
                    .from('automation_runs')
                    .update({ status: 'success', ended_at: new Date().toISOString() })
                    .eq('id', runId)
            }

            console.log("[Retell Webhook] Call logged correctly for SID:", callId)
            return NextResponse.json({ success: true, message: "Llamada registrada correctamente" })
        }

        // Si es otro evento de la API de voz, respondemos OK para que no de error
        return NextResponse.json({ success: true, message: "Evento recibido y descartado" })

    } catch (error: any) {
        console.error("[Retell Webhook] Error:", error)
        if (runId) {
            await supabase
                .from('automation_runs')
                .update({ status: 'failed', ended_at: new Date().toISOString() })
                .eq('id', runId)
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
