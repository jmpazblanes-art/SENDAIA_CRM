import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Map any raw source string to valid DB CHECK values
function normalizeSource(raw?: string): string {
    if (!raw) return 'other'
    const s = raw.toLowerCase()
    if (s.includes('telegram')) return 'telegram'
    if (s.includes('ghl') || s.includes('funnel') || s.includes('highlevel')) return 'ghl_funnel'
    if (s.includes('instagram') || s.includes('ig')) return 'instagram'
    if (s.includes('referral') || s.includes('ref')) return 'referral'
    if (s.includes('cold') || s.includes('outreach')) return 'cold_outreach'
    if (s.includes('event')) return 'event'
    if (s.includes('manual')) return 'manual'
    if (s.includes('ads') || s.includes('ad')) return 'ads'
    if (s.includes('voice') || s.includes('retell') || s.includes('call')) return 'voice_agent'
    if (s.includes('web') || s.includes('website') || s.includes('form')) return 'web'
    return 'other'
}

export async function POST(request: Request) {
    let runId: string | null = null
    try {
        const body = await request.json()
        console.log("[GHL Webhook] received:", JSON.stringify(body).substring(0, 400))

        // Log automation run (non-blocking — if it fails, we continue)
        try {
            const { data: runData } = await supabase
                .from('automation_runs')
                .insert({ name: 'Captación de Lead', status: 'running', category: 'lead_gen' })
                .select('id')
                .single()
            runId = runData?.id ?? null
        } catch (_) { /* non-critical */ }

        // Accept all field name variants (GHL, Telegram bot, manual, CSV)
        const firstName = (body.first_name || body.firstName || body.name?.split(' ')?.[0] || 'Nuevo').toString().trim()
        const lastName = (body.last_name || body.lastName || body.name?.split(' ')?.slice(1)?.join(' ') || 'Lead').toString().trim()
        const email = body.email?.toString().trim() || null
        const phone = (body.phone || body.company_phone || body.phoneNumber)?.toString().trim() || null
        const company = (body.company_name || body.companyName || body.company || body.display_name || 'Particular').toString().trim()
        const rawSource = body.source || body.webhook_source || 'other'

        const payload: Record<string, any> = {
            first_name: firstName,
            last_name: lastName,
            company_name: company,
            source: normalizeSource(rawSource),
            status: 'lead',
            opportunity_score: typeof body.opportunity_score === 'number' ? body.opportunity_score : 50,
            webhook_source: String(rawSource), // keep original for traceability
        }

        if (email) payload.email = email
        if (phone) payload.phone = phone
        if (body.industry) payload.industry = body.industry.toString().trim()
        if (body.notes || body.note) payload.notes = (body.notes || body.note).toString()
        if (body.city || body.address1) payload.city = (body.city || body.address1).toString()

        const { data, error } = await supabase
            .from('clients')
            .insert(payload)
            .select()
            .single()

        if (error) throw error

        if (runId) {
            await supabase
                .from('automation_runs')
                .update({ status: 'success', ended_at: new Date().toISOString() })
                .eq('id', runId)
        }

        console.log("[GHL Webhook] Lead created:", data?.id)
        return NextResponse.json({ success: true, client_id: data?.id, client: data })

    } catch (error: any) {
        console.error("[GHL Webhook] Error:", error)
        if (runId) {
            await supabase
                .from('automation_runs')
                .update({ status: 'failed', ended_at: new Date().toISOString() })
                .eq('id', runId)
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
