const TELEGRAM_API = 'https://api.telegram.org/bot'

function getOpsToken(): string {
  const token = process.env.OPS_TELEGRAM_BOT_TOKEN
  if (!token) throw new Error('OPS_TELEGRAM_BOT_TOKEN no configurado')
  return token
}

function getChatId(): string {
  const chatId = process.env.OPS_TELEGRAM_CHAT_ID
  if (!chatId || chatId === 'PENDING') throw new Error('OPS_TELEGRAM_CHAT_ID no configurado')
  return chatId
}

function opsApiUrl(method: string): string {
  return `${TELEGRAM_API}${getOpsToken()}/${method}`
}

export async function sendOpsAlert(
  producto: string,
  tipoError: string,
  logError?: string | null
) {
  const chatId = getChatId()
  const emoji = '🔴'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  let message = `${emoji} <b>ALERTA — ${producto}</b>\n`
  message += `Error: ${tipoError}\n`
  message += `Detectado: ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}\n`
  if (logError) {
    const truncated = logError.length > 300 ? logError.slice(0, 300) + '...' : logError
    message += `\n<pre>${truncated}</pre>\n`
  }
  message += `\n📊 <a href="${appUrl}/dashboard/ops">Ver en Ops Center</a>`

  const res = await fetch(opsApiUrl('sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.error('[OPS Telegram] sendMessage error:', err)
    throw new Error(`OPS Telegram sendMessage failed: ${res.status}`)
  }

  return res.json()
}

export async function sendOpsNotification(message: string) {
  const chatId = getChatId()

  const res = await fetch(opsApiUrl('sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.error('[OPS Telegram] notification error:', err)
    throw new Error(`OPS Telegram notification failed: ${res.status}`)
  }

  return res.json()
}
