
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const { message, history } = await req.json()

        // Call n8n webhook
        const n8nUrl = process.env.N8N_WEBHOOK_URL_CHAT
        if (!n8nUrl) {
            // Fallback for demo if no n8n configured or env var missing
            console.warn("N8N_WEBHOOK_URL_CHAT missing")
            return NextResponse.json({
                response: "Modo Demo: No puedo conectar con mi cerebro (n8n). Pero estoy diseñado para ayudarte."
            })
        }

        const response = await fetch(n8nUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, history })
        })

        if (!response.ok) {
            throw new Error('Failed to fetch from n8n')
        }

        const data = await response.json()
        return NextResponse.json(data)

    } catch (error) {
        console.error('Chat error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
