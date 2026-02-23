
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase' // Note: This uses browser client, unsafe for server? 
// We should use createServerClient in API routes context or just basic supabase-js if needed.
// But for MVP we used createBrowserClient in lib/supabase.ts.
// Actually, API routes run on server. We need `@supabase/ssr` createServerClient or just standard `createClient` from `@supabase/supabase-js` with Service Role Key for webhooks.

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { call_sid, client_id, status, transcript, summary, sentiment } = body

        // Insert into call_logs
        const normalizedSentiment = (sentiment || 'neutral').toLowerCase();

        const { error } = await supabase
            .from('call_logs')
            .insert({
                call_sid,
                client_id: client_id || null,
                status: status || 'completed',
                transcript: transcript || '',
                summary: summary || '',
                sentiment: normalizedSentiment,
                direction: 'outbound'
            })

        if (error) {
            console.error('Database insert error:', error);
            throw error;
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
