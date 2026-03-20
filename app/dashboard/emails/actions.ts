'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendFollowUpEmailAction(formData: FormData) {
    const supabase = await createClient()

    const client_id = formData.get('client_id') as string
    const to_email = formData.get('to_email') as string
    const to_name = formData.get('to_name') as string
    const subject = formData.get('subject') as string
    const message = formData.get('message') as string
    const agent_name = formData.get('agent_name') as string || 'El equipo de SendaIA'
    const company_name = formData.get('company_name') as string || ''

    if (!to_email || !subject || !message) {
        return { error: 'Email, asunto y mensaje son obligatorios' }
    }

    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const res = await fetch(`${baseUrl}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'follow_up',
                to_email,
                to_name,
                subject,
                client_id,
                templateData: {
                    clientName: to_name || 'Cliente',
                    agentName: agent_name,
                    message,
                    companyName: company_name,
                },
            }),
        })

        const result = await res.json()
        if (!res.ok) return { error: result.error || 'Error al enviar el email' }

        revalidatePath('/dashboard/clients')
        revalidatePath(`/dashboard/clients/${client_id}`)
        return { success: true }

    } catch (error: any) {
        return { error: error.message }
    }
}

export async function sendInvoiceEmailAction(invoiceId: string) {
    const supabase = await createClient()

    // Obtener factura con datos del cliente
    const { data: invoice, error } = await supabase
        .from('invoices')
        .select(`*, clients(first_name, last_name, company_name, email)`)
        .eq('id', invoiceId)
        .single()

    if (error || !invoice) return { error: 'Factura no encontrada' }

    const client = invoice.clients as any
    const clientEmail = client?.email
    if (!clientEmail) return { error: 'El cliente no tiene email registrado' }

    const clientName = client.company_name || `${client.first_name} ${client.last_name}`.trim()
    const items = Array.isArray(invoice.items) ? invoice.items : []

    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const res = await fetch(`${baseUrl}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'invoice',
                to_email: clientEmail,
                to_name: clientName,
                subject: `Factura ${invoice.invoice_number} — SendaIA`,
                client_id: invoice.client_id,
                invoice_id: invoiceId,
                templateData: {
                    clientName,
                    invoiceNumber: invoice.invoice_number,
                    invoiceDate: invoice.invoice_date,
                    dueDate: invoice.due_date,
                    items,
                    subtotal: invoice.subtotal,
                    taxRate: invoice.tax_rate,
                    taxAmount: invoice.tax_amount,
                    total: invoice.total,
                    notes: invoice.notes || '',
                },
            }),
        })

        const result = await res.json()
        if (!res.ok) return { error: result.error || 'Error al enviar la factura' }

        // Marcar factura como enviada
        await supabase
            .from('invoices')
            .update({ status: 'sent' })
            .eq('id', invoiceId)
            .eq('status', 'draft')

        revalidatePath('/dashboard/invoices')
        return { success: true }

    } catch (error: any) {
        return { error: error.message }
    }
}

export async function getEmailLogsAction(clientId?: string) {
    const supabase = await createClient()

    let query = supabase
        .from('email_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

    if (clientId) {
        query = query.eq('client_id', clientId)
    }

    const { data, error } = await query
    if (error) return { error: error.message, data: [] }
    return { data: data || [] }
}
