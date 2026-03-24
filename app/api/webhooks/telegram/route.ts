import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { sendMessage, getFile, downloadFile } from "@/lib/telegram"
import { runSecretary } from "@/lib/agents/secretary"

// Service Role para bypass RLS
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
    let runId: string | null = null
    try {
        const update = await request.json()
        console.log("[Telegram Webhook] Update recibido:", update.update_id)

        const message = update.message
        if (!message) {
            return NextResponse.json({ ok: true, message: "Update sin mensaje, ignorado" })
        }

        const chatId = message.chat.id
        const userName = message.from?.first_name || 'Usuario'

        // Registrar inicio de automatización
        try {
            const { data: runData } = await supabase
                .from('automation_runs')
                .insert({
                    name: 'Telegram Bot - Mensaje recibido',
                    status: 'running',
                    category: 'integration',
                    metadata: {
                        chat_id: chatId,
                        user_name: userName,
                        message_type: message.voice ? 'voice' : 'text',
                    }
                })
                .select('id')
                .single()
            runId = runData?.id ?? null
        } catch (_) { /* non-critical */ }

        // Extraer texto del mensaje
        let userText = message.text || ''

        // Si es mensaje de voz, transcribir con Whisper
        if (message.voice) {
            try {
                userText = await transcribeVoice(message.voice.file_id)
                console.log("[Telegram Webhook] Transcripción:", userText)
            } catch (err) {
                console.error("[Telegram Webhook] Error transcribiendo voz:", err)
                await sendMessage(chatId, "No pude procesar el audio. Por favor, envía un mensaje de texto.")
                return NextResponse.json({ ok: true })
            }
        }

        if (!userText.trim()) {
            await sendMessage(chatId, "No he recibido texto. Envíame un mensaje o nota de voz.")
            return NextResponse.json({ ok: true })
        }

        // Ejecutar el agente secretaria
        const { reply, action_taken } = await runSecretary(String(chatId), userText)

        // Enviar respuesta al usuario
        await sendMessage(chatId, reply)

        // Actualizar automatización a éxito
        if (runId) {
            await supabase
                .from('automation_runs')
                .update({
                    status: 'success',
                    ended_at: new Date().toISOString(),
                    metadata: {
                        chat_id: chatId,
                        user_name: userName,
                        action_taken,
                        message_preview: userText.substring(0, 100),
                    },
                })
                .eq('id', runId)
        }

        console.log("[Telegram Webhook] Respuesta enviada a chat:", chatId)
        return NextResponse.json({ ok: true, action_taken })

    } catch (error: any) {
        console.error("[Telegram Webhook] Error:", error)

        if (runId) {
            await supabase
                .from('automation_runs')
                .update({ status: 'failed', ended_at: new Date().toISOString() })
                .eq('id', runId)
        }

        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// ── Transcripción de voz con Whisper vía OpenRouter/OpenAI ──

async function transcribeVoice(fileId: string): Promise<string> {
    // Descargar archivo de audio de Telegram
    const { fileUrl } = await getFile(fileId)
    const audioBuffer = await downloadFile(fileUrl)

    // Enviar a Whisper API
    // Usamos la API de OpenAI directamente para Whisper (OpenRouter no soporta Whisper)
    const whisperKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY
    if (!whisperKey) throw new Error('Se necesita OPENAI_API_KEY para transcripción de voz')

    const whisperUrl = process.env.WHISPER_API_URL || 'https://api.openai.com/v1/audio/transcriptions'

    const formData = new FormData()
    const blob = new Blob([audioBuffer], { type: 'audio/ogg' })
    formData.append('file', blob, 'voice.ogg')
    formData.append('model', 'whisper-1')
    formData.append('language', 'es')
    formData.append('response_format', 'text')

    const res = await fetch(whisperUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${whisperKey}`,
        },
        body: formData,
    })

    if (!res.ok) {
        const errText = await res.text()
        throw new Error(`Whisper API error: ${res.status} - ${errText}`)
    }

    const text = await res.text()
    return text.trim()
}
