'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

interface InvoiceItem {
    description: string
    quantity: number
    unit_price: number
    total?: number
}

export async function createInvoiceAction(formData: FormData, items: InvoiceItem[], taxRate: number) {
    const supabase = await createClient()

    const client_id = formData.get('client_id') as string
    const invoice_number = formData.get('invoice_number') as string
    const invoice_date = formData.get('invoice_date') as string
    const due_date = formData.get('due_date') as string
    const notes = formData.get('notes') as string

    if (!client_id || !invoice_number || !invoice_date || !due_date) {
        return { error: 'Faltan campos obligatorios' }
    }

    if (!items.length || items.some(i => !i.description)) {
        return { error: 'Añade al menos un concepto con descripción' }
    }

    const itemsWithTotals = items.map(item => ({
        ...item,
        total: item.quantity * item.unit_price,
    }))

    const subtotal = itemsWithTotals.reduce((acc, i) => acc + i.total, 0)

    const { error } = await supabase.from('invoices').insert({
        client_id,
        invoice_number,
        invoice_date,
        due_date,
        subtotal,
        tax_rate: taxRate,
        items: itemsWithTotals,
        notes: notes || null,
        status: 'draft',
    })

    if (error) {
        console.error('Error creating invoice:', error)
        if (error.code === '23505') return { error: 'Ya existe una factura con ese número' }
        return { error: 'Error al crear la factura' }
    }

    revalidatePath('/dashboard/invoices')
    revalidatePath('/dashboard')
    return { success: true }
}

export async function updateInvoiceStatusAction(invoiceId: string, status: string) {
    const supabase = await createClient()

    const validStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled']
    if (!validStatuses.includes(status)) return { error: 'Estado inválido' }

    const update: Record<string, any> = { status }
    if (status === 'paid') update.paid_date = new Date().toISOString().split('T')[0]

    const { error } = await supabase
        .from('invoices')
        .update(update)
        .eq('id', invoiceId)

    if (error) return { error: error.message }

    revalidatePath('/dashboard/invoices')
    return { success: true }
}

export async function deleteInvoiceAction(invoiceId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId)

    if (error) return { error: error.message }

    revalidatePath('/dashboard/invoices')
    return { success: true }
}

export async function getClientsForInvoiceAction() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('clients')
        .select('id, first_name, last_name, company_name, email')
        .order('company_name', { ascending: true })

    if (error) return []

    return (data || []).map(c => ({
        id: c.id,
        name: (c.company_name || `${c.first_name} ${c.last_name}`).trim(),
        email: c.email || '',
    }))
}
