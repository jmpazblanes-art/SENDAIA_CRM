
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const { clientId, phone } = await req.json()

        const n8nUrl = process.env.N8N_WEBHOOK_URL_CALLS
        if (!n8nUrl) {
            return NextResponse.json({ success: false, message: "N8N URL not configured" }, { status: 500 })
        }

        // Trigger call agent
        fetch(n8nUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientId, phone, action: 'start_call' })
        }).catch(err => console.error("Async call trigger failed", err))

        return NextResponse.json({ success: true, message: "Call initiated" })

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
