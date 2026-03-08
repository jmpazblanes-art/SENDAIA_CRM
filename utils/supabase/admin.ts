
import { createClient } from '@supabase/supabase-js'

export async function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
        throw new Error("⚠️ SUPABASE_SERVICE_ROLE_KEY no configurada. Añádela a tu .env local.")
    }

    return createClient(
        supabaseUrl,
        supabaseKey
    )
}
