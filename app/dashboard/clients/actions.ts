
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createClientAction(formData: FormData) {
    const supabase = await createClient()

    const first_name = formData.get('first_name') as string
    const last_name = formData.get('last_name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const status = formData.get('status') as string
    const company_name = formData.get('company_name') as string
    const source = formData.get('source') as string

    const { error } = await supabase.from('clients').insert({
        first_name,
        last_name,
        email,
        phone,
        status: status || 'lead',
        company_name,
        source
    })

    if (error) {
        console.error('Error creating client:', error)
        return { error: 'Error creating client' }
    }


    revalidatePath('/dashboard/clients')
    revalidatePath('/dashboard')
    return { success: true }
}

export async function createNoteAction(formData: FormData) {
    const supabase = await createClient()

    const client_id = formData.get('client_id') as string
    const content = formData.get('content') as string
    const category = (formData.get('category') as string) || 'general'

    const { error } = await supabase.from('lead_notes').insert({
        client_id,
        content,
        category
        // employee_id derived from user later
    })

    if (error) {
        console.error('Error creating note:', error)
        return { error: 'Error creating note' }
    }


    revalidatePath(`/dashboard/clients/${client_id}`)
    return { success: true }
}

export async function importClientsAction(clients: any[]) {
    const supabase = await createClient()

    const formattedClients = clients.map(c => ({
        first_name: c.first_name || 'Nuevo',
        last_name: c.last_name || 'Lead',
        email: c.email,
        phone: c.phone,
        company_name: c.company_name || c.company,
        status: 'lead',
        source: 'csv_import'
    }))

    const { error } = await supabase.from('clients').insert(formattedClients)

    if (error) {
        console.error('Error importing clients:', error)
        return { error: 'Error importing clients' }
    }

    revalidatePath('/dashboard/clients')
    return { success: true }
}

export async function extractLeadFromURLAction(url: string) {
    const supabase = await createClient()

    try {
        // Dynamic imports to avoid issues if NPM is still installing
        const axios = (await import('axios')).default
        const cheerio = await import('cheerio')

        // 1. Fetch content
        let textContent = ""
        try {
            const response = await axios.get(url, {
                timeout: 10000,
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
            })
            const $ = cheerio.load(response.data)

            // Remove scripts, styles, etc.
            $('script, style, nav, footer, header').remove()
            textContent = $('body').text().replace(/\s+/g, ' ').substring(0, 5000)
        } catch (e) {
            console.error("Fetch error:", e)
            return { error: 'No se pudo leer la URL. Asegúrate de que es pública.' }
        }

        // 2. Call OpenRouter AI
        const apiKey = process.env.OPENROUTER_API_KEY
        let leadData: any = null

        if (!apiKey) {
            console.warn("OPENROUTER_API_KEY missing, using mock extraction for demo")
            leadData = {
                first_name: "Demo",
                last_name: "Lead",
                company_name: "Empresa de Prueba",
                email: "contacto@demo.com",
                phone: "+34 900 000 000",
                industry: "Consultoría",
                opportunity_score: 85
            }
        } else {
            const aiResponse = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
                model: "openai/gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "Extract lead information from the following web content. Return ONLY a JSON object with: {first_name, last_name, email, phone, company_name, industry, opportunity_score (0-100)}. If not found, use null."
                    },
                    {
                        role: "user",
                        content: textContent
                    }
                ],
                response_format: { type: "json_object" }
            }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            })

            let content = aiResponse.data.choices[0].message.content
            // Cleaning just in case
            content = content.replace(/```json\n?/, '').replace(/\n?```/, '').trim()
            leadData = JSON.parse(content)
        }

        // 3. Save to Supabase
        const { data, error } = await supabase.from('clients').insert({
            first_name: leadData.first_name || 'Explorado',
            last_name: leadData.last_name || 'IA',
            email: leadData.email,
            phone: leadData.phone,
            company_name: leadData.company_name,
            industry: leadData.industry,
            opportunity_score: leadData.opportunity_score || 50,
            status: 'lead',
            source: 'ai_extraction'
        }).select().single()

        if (error) throw error

        revalidatePath('/dashboard/clients')
        return { success: true, data }

    } catch (error: any) {
        console.error('AI Extraction Error:', error)
        return { error: 'No se pudieron extraer datos válidos. Verifica la URL o intenta manualmente.' }
    }
}


