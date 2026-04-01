"use server"

import { createAdminClient } from "@/utils/supabase/admin"

export type AgencySettings = {
    agency_name: string
    agency_email: string
}

export async function getAgencySettings(): Promise<AgencySettings> {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from("agency_settings")
        .select("key, value")
        .in("key", ["agency_name", "agency_email"])

    if (error || !data) {
        return { agency_name: "SendaIA", agency_email: "hola@sendaia.es" }
    }

    const map = Object.fromEntries(data.map((row) => [row.key, row.value]))

    return {
        agency_name: map["agency_name"] ?? "SendaIA",
        agency_email: map["agency_email"] ?? "hola@sendaia.es",
    }
}

export async function saveAgencySettings(
    settings: AgencySettings
): Promise<{ success: boolean; error?: string }> {
    const supabase = createAdminClient()

    const rows = [
        { key: "agency_name", value: settings.agency_name, updated_at: new Date().toISOString() },
        { key: "agency_email", value: settings.agency_email, updated_at: new Date().toISOString() },
    ]

    const { error } = await supabase
        .from("agency_settings")
        .upsert(rows, { onConflict: "key" })

    if (error) {
        console.error("[saveAgencySettings] error:", error)
        return { success: false, error: error.message }
    }

    return { success: true }
}
