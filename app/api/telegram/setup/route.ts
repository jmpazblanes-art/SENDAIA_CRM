import { NextResponse } from "next/server"
import { setWebhook } from "@/lib/telegram"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const secret = searchParams.get('secret')

        if (!secret || secret !== process.env.TELEGRAM_SETUP_SECRET) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
        if (!appUrl) {
            return NextResponse.json({ error: 'NEXT_PUBLIC_APP_URL no configurado' }, { status: 500 })
        }

        const webhookUrl = `${appUrl.startsWith('http') ? appUrl : `https://${appUrl}`}/api/webhooks/telegram`

        console.log("[Telegram Setup] Configurando webhook:", webhookUrl)
        const result = await setWebhook(webhookUrl)

        if (result.ok) {
            return NextResponse.json({
                success: true,
                message: `Webhook configurado correctamente en ${webhookUrl}`,
                telegram_response: result,
            })
        } else {
            return NextResponse.json({
                success: false,
                message: 'Error al configurar webhook',
                telegram_response: result,
            }, { status: 400 })
        }

    } catch (error: any) {
        console.error("[Telegram Setup] Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
