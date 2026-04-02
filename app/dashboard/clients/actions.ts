
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

    // Intentamos insertar con categoría, si falla probamos sin ella (por si la tabla no se ha actualizado)
    const { error } = await supabase.from('lead_notes').insert({
        client_id,
        content,
        category
    })

    if (error) {
        console.warn('Error creating note with category, retrying without it:', error.message)
        const { error: retryError } = await supabase.from('lead_notes').insert({
            client_id,
            content
        })

        if (retryError) {
            console.error('Final error creating note:', retryError)
            return { error: 'No se pudo guardar la nota en la base de datos.' }
        }
    }

    revalidatePath(`/dashboard/clients/${client_id}`)
    revalidatePath('/dashboard')
    return { success: true }
}

export async function updateClientAction(clientId: string, formData: FormData) {
    const supabase = await createClient()

    const fields: Record<string, any> = {}

    // Text fields
    const textFields = [
        'first_name', 'last_name', 'email', 'phone', 'phone2',
        'company_name', 'industry', 'company_size', 'website', 'linkedin',
        'city', 'status', 'priority', 'source', 'notes'
    ]
    for (const key of textFields) {
        const val = formData.get(key)
        if (val !== null) {
            fields[key] = (val as string) || null
        }
    }

    // Numeric field
    const opportunityScore = formData.get('opportunity_score')
    if (opportunityScore !== null) {
        fields.opportunity_score = opportunityScore ? parseInt(opportunityScore as string, 10) : null
    }

    // Date field
    const nextFollowUp = formData.get('next_follow_up')
    if (nextFollowUp !== null) {
        fields.next_follow_up = (nextFollowUp as string) || null
    }

    // Array fields (comma-separated)
    const tags = formData.get('tags')
    if (tags !== null) {
        fields.tags = (tags as string) ? (tags as string).split(',').map(t => t.trim()).filter(Boolean) : []
    }

    const painPoints = formData.get('pain_points')
    if (painPoints !== null) {
        fields.pain_points = (painPoints as string) ? (painPoints as string).split(',').map(t => t.trim()).filter(Boolean) : []
    }

    const { error } = await supabase
        .from('clients')
        .update(fields)
        .eq('id', clientId)

    if (error) {
        console.error('Error updating client:', error)
        return { error: 'Error al actualizar el cliente.' }
    }

    revalidatePath(`/dashboard/clients/${clientId}`)
    revalidatePath('/dashboard/clients')
    revalidatePath('/dashboard')
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

// =============================================================
// DOCUMENT MANAGEMENT ACTIONS
// =============================================================

export async function uploadDocumentAction(clientId: string, formData: FormData) {
    const supabase = await createClient()

    try {
        const file = formData.get('file') as File
        const description = (formData.get('description') as string) || ''
        const category = (formData.get('category') as string) || 'general'

        if (!file || !file.name) {
            return { error: 'No se ha seleccionado ningún archivo.' }
        }

        // Max 50MB
        if (file.size > 50 * 1024 * 1024) {
            return { error: 'El archivo supera el límite de 50MB.' }
        }

        // Generate unique storage path
        const timestamp = Date.now()
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const storagePath = `${clientId}/${timestamp}_${sanitizedName}`

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('client-documents')
            .upload(storagePath, file, {
                cacheControl: '3600',
                upsert: false
            })

        if (uploadError) {
            console.error('Storage upload error:', uploadError)
            return { error: `Error al subir archivo: ${uploadError.message}` }
        }

        // Create DB record
        const { error: dbError } = await supabase.from('client_documents').insert({
            client_id: clientId,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type || 'application/octet-stream',
            storage_path: storagePath,
            description,
            category
        })

        if (dbError) {
            // Rollback: delete uploaded file
            await supabase.storage.from('client-documents').remove([storagePath])
            console.error('DB insert error:', dbError)
            return { error: 'Error al registrar el documento en la base de datos.' }
        }

        revalidatePath(`/dashboard/clients/${clientId}`)
        return { success: true }
    } catch (error: any) {
        console.error('Upload document error:', error)
        return { error: error.message || 'Error inesperado al subir el documento.' }
    }
}

export async function deleteDocumentAction(documentId: string) {
    const supabase = await createClient()

    try {
        // Get the document record first
        const { data: doc, error: fetchError } = await supabase
            .from('client_documents')
            .select('*')
            .eq('id', documentId)
            .single()

        if (fetchError || !doc) {
            return { error: 'Documento no encontrado.' }
        }

        // Delete from Storage
        const { error: storageError } = await supabase.storage
            .from('client-documents')
            .remove([doc.storage_path])

        if (storageError) {
            console.error('Storage delete error:', storageError)
            // Continue to delete DB record anyway
        }

        // Delete DB record
        const { error: dbError } = await supabase
            .from('client_documents')
            .delete()
            .eq('id', documentId)

        if (dbError) {
            console.error('DB delete error:', dbError)
            return { error: 'Error al eliminar el registro del documento.' }
        }

        revalidatePath(`/dashboard/clients/${doc.client_id}`)
        return { success: true }
    } catch (error: any) {
        console.error('Delete document error:', error)
        return { error: error.message || 'Error inesperado al eliminar el documento.' }
    }
}

export async function getClientDocumentsAction(clientId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('client_documents')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching documents:', error)
        return { error: 'Error al obtener documentos.', data: [] }
    }

    return { data: data || [] }
}

export async function getDocumentSignedUrl(storagePath: string) {
    const supabase = await createClient()

    const { data, error } = await supabase.storage
        .from('client-documents')
        .createSignedUrl(storagePath, 60 * 60) // 1 hour expiry

    if (error) {
        console.error('Signed URL error:', error)
        return { error: 'Error al generar enlace de descarga.' }
    }

    return { url: data.signedUrl }
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
            phone: leadData.phone || 'Pendiente',
            company_name: leadData.company_name || 'Nuevo Prospecto',
            industry: leadData.industry,
            opportunity_score: leadData.opportunity_score || 50,
            status: 'lead',
            source: 'ai_extraction'
        }).select().single()

        if (error) {
            console.error("Supabase insert error:", error)
            // Error específico si el email ya existe
            if (error.code === '23505') {
                return { error: 'Este cliente ya existe en la base de datos (Email duplicado).' }
            }
            throw error
        }

        revalidatePath('/dashboard/clients')
        revalidatePath('/dashboard')
        return { success: true, data }

    } catch (error: any) {
        console.error('AI Extraction Error:', error)
        return { error: error.message || 'No se pudieron extraer datos válidos. Verifica la URL o intenta manualmente.' }
    }
}


