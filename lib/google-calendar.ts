/**
 * Google Calendar API client usando Service Account.
 *
 * Requiere:
 *  - GOOGLE_SERVICE_ACCOUNT_JSON: JSON string de la service account
 *  - GOOGLE_CALENDAR_ID: ID del calendario (e.g. correo@gmail.com)
 *
 * Nota: Usa fetch puro con JWT manual para no depender de `googleapis` npm.
 */

const CALENDAR_API = 'https://www.googleapis.com/calendar/v3'
const SCOPES = 'https://www.googleapis.com/auth/calendar'
const TIMEZONE = 'Europe/Madrid'

interface ServiceAccountKey {
    client_email: string
    private_key: string
}

function getCredentials(): ServiceAccountKey {
    const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
    if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON no configurado')
    return JSON.parse(raw)
}

function getCalendarId(): string {
    const id = process.env.GOOGLE_CALENDAR_ID
    if (!id) throw new Error('GOOGLE_CALENDAR_ID no configurado')
    return id
}

// ── JWT token generation (sin dependencias externas) ──

function base64url(input: string | ArrayBuffer): string {
    const buf = typeof input === 'string' ? Buffer.from(input) : Buffer.from(input)
    return buf.toString('base64url')
}

async function createJWT(credentials: ServiceAccountKey): Promise<string> {
    const now = Math.floor(Date.now() / 1000)
    const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
    const payload = base64url(JSON.stringify({
        iss: credentials.client_email,
        scope: SCOPES,
        aud: 'https://oauth2.googleapis.com/token',
        iat: now,
        exp: now + 3600,
    }))

    const signInput = `${header}.${payload}`

    // Import PEM private key using Node.js crypto
    const crypto = await import('crypto')
    const sign = crypto.createSign('RSA-SHA256')
    sign.update(signInput)
    const signature = sign.sign(credentials.private_key, 'base64url')

    return `${signInput}.${signature}`
}

let cachedToken: { token: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
    if (cachedToken && Date.now() < cachedToken.expiresAt) {
        return cachedToken.token
    }

    const credentials = getCredentials()
    const jwt = await createJWT(credentials)

    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt,
        }),
    })

    if (!res.ok) {
        const err = await res.text()
        throw new Error(`Google OAuth error: ${err}`)
    }

    const data = await res.json()
    cachedToken = {
        token: data.access_token,
        expiresAt: Date.now() + (data.expires_in - 60) * 1000,
    }

    return data.access_token
}

// ── Calendar API methods ──

export interface CalendarEvent {
    id?: string
    summary: string
    description?: string
    start: { dateTime: string; timeZone?: string }
    end: { dateTime: string; timeZone?: string }
    attendees?: { email: string }[]
    htmlLink?: string
}

export async function listEvents(
    timeMin: string,
    timeMax: string
): Promise<CalendarEvent[]> {
    const token = await getAccessToken()
    const calendarId = encodeURIComponent(getCalendarId())
    const params = new URLSearchParams({
        timeMin,
        timeMax,
        timeZone: TIMEZONE,
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '20',
    })

    const res = await fetch(`${CALENDAR_API}/calendars/${calendarId}/events?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
        const err = await res.text()
        throw new Error(`Google Calendar listEvents error: ${err}`)
    }

    const data = await res.json()
    return data.items || []
}

export async function createEvent(event: {
    summary: string
    description?: string
    start: string // ISO datetime
    end: string   // ISO datetime
    attendees?: string[] // emails
}): Promise<CalendarEvent> {
    const token = await getAccessToken()
    const calendarId = encodeURIComponent(getCalendarId())

    const body: CalendarEvent = {
        summary: event.summary,
        description: event.description,
        start: { dateTime: event.start, timeZone: TIMEZONE },
        end: { dateTime: event.end, timeZone: TIMEZONE },
    }

    if (event.attendees?.length) {
        body.attendees = event.attendees.map(email => ({ email }))
    }

    const res = await fetch(`${CALENDAR_API}/calendars/${calendarId}/events`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    })

    if (!res.ok) {
        const err = await res.text()
        throw new Error(`Google Calendar createEvent error: ${err}`)
    }

    return res.json()
}
