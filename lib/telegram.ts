const TELEGRAM_API = 'https://api.telegram.org/bot'

function getToken(): string {
    const token = process.env.TELEGRAM_BOT_TOKEN
    if (!token) throw new Error('TELEGRAM_BOT_TOKEN no configurado')
    return token
}

function apiUrl(method: string): string {
    return `${TELEGRAM_API}${getToken()}/${method}`
}

export async function sendMessage(
    chatId: number | string,
    text: string,
    options?: { parse_mode?: 'Markdown' | 'HTML'; reply_markup?: unknown }
) {
    const res = await fetch(apiUrl('sendMessage'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: options?.parse_mode || 'Markdown',
            ...(options?.reply_markup ? { reply_markup: options.reply_markup } : {}),
        }),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        console.error('[Telegram] sendMessage error:', err)
        throw new Error(`Telegram sendMessage failed: ${res.status}`)
    }

    return res.json()
}

export async function getFile(fileId: string): Promise<{ filePath: string; fileUrl: string }> {
    const res = await fetch(apiUrl('getFile'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_id: fileId }),
    })

    if (!res.ok) {
        throw new Error(`Telegram getFile failed: ${res.status}`)
    }

    const data = await res.json()
    const filePath = data.result.file_path
    const fileUrl = `https://api.telegram.org/file/bot${getToken()}/${filePath}`

    return { filePath, fileUrl }
}

export async function downloadFile(fileUrl: string): Promise<ArrayBuffer> {
    const res = await fetch(fileUrl)
    if (!res.ok) throw new Error(`Telegram download failed: ${res.status}`)
    return res.arrayBuffer()
}

export async function setWebhook(url: string): Promise<{ ok: boolean; description?: string }> {
    const res = await fetch(apiUrl('setWebhook'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            url,
            allowed_updates: ['message'],
        }),
    })

    return res.json()
}
