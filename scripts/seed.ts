
import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
    console.log("Seeding data...")

    // 1. Employees
    const { data: emps, error: empError } = await supabase.from('employees').upsert([
        {
            first_name: 'José María',
            last_name: 'Paz',
            email: 'pazblanes@sendaia.es',
            role: 'founder',
            specialty: 'Estrategia & Ventas',
            clients_assigned: 45,
            total_deals_closed: 20,
            total_revenue_generated: 125000
        },
        {
            first_name: 'Ana',
            last_name: 'García',
            email: 'ana@sendaia.es',
            role: 'sales',
            specialty: 'Cierre de Ventas',
            clients_assigned: 28,
            total_deals_closed: 15,
            total_revenue_generated: 80000
        },
        {
            first_name: 'Carlos',
            last_name: 'Dev',
            email: 'tech@sendaia.es',
            role: 'technical',
            specialty: 'Automatización n8n',
            clients_assigned: 12,
            total_deals_closed: 5,
            total_revenue_generated: 25000
        }
    ]).select()

    if (empError) console.error("Error seeding employees:", empError)
    else console.log("Employees seeded.")

    const pachiId = emps?.find(e => e.first_name === 'José María')?.id

    // 2. Clients
    const { data: cls, error: clError } = await supabase.from('clients').upsert([
        {
            first_name: 'Juan',
            last_name: 'Pérez',
            company_name: 'Clínica Dental Sur',
            email: 'juan@dentalsur.com',
            phone: '600111222',
            status: 'active',
            priority: 'high',
            source: 'web',
            industry: 'Salud',
            opportunity_score: 85,
            assigned_to: pachiId
        },
        {
            first_name: 'Marta',
            last_name: 'Sánchez',
            company_name: 'Asesoría Pérez',
            email: 'marta@asesoriaperez.com',
            phone: '600333444',
            status: 'lead',
            priority: 'medium',
            source: 'referral',
            industry: 'Legal',
            opportunity_score: 40,
            assigned_to: pachiId
        },
        {
            first_name: 'Roberto',
            last_name: 'Gómez',
            company_name: 'Tech Solutions',
            email: 'roberto@techsol.es',
            phone: '600555666',
            status: 'qualified',
            priority: 'urgent',
            source: 'cold_outreach',
            industry: 'Tecnología',
            opportunity_score: 95,
            assigned_to: pachiId
        },
        {
            first_name: 'Elena',
            last_name: 'Ruiz',
            company_name: 'Restaurante El Olivo',
            email: 'elena@elolivo.com',
            phone: '600777888',
            status: 'closed',
            priority: 'low',
            source: 'instagram',
            industry: 'Hostelería',
            opportunity_score: 10,
            assigned_to: pachiId
        }
    ]).select()

    if (clError) console.error("Error seeding clients:", clError)
    else console.log("Clients seeded.")

    const clienteId = cls?.[0]?.id

    // 3. Appointments
    const { error: aptError } = await supabase.from('appointments').upsert([
        {
            client_id: clienteId,
            employee_id: pachiId,
            title: 'Demos Agente de Voz',
            type: 'demo',
            start_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            end_time: new Date(Date.now() + 86400000 + 3600000).toISOString(),
            status: 'scheduled',
            notes_before: 'Interesado en automatizar recepción.'
        },
        {
            client_id: cls?.[1]?.id,
            employee_id: pachiId,
            title: 'Sesión de Estrategia',
            type: 'discovery_call',
            start_time: new Date(Date.now() + 172800000).toISOString(), // In 2 days
            end_time: new Date(Date.now() + 172800000 + 3600000).toISOString(),
            status: 'confirmed'
        }
    ])

    if (aptError) console.error("Error seeding appointments:", aptError)
    else console.log("Appointments seeded.")

    // 4. Invoices
    const { error: invError } = await supabase.from('invoices').upsert([
        {
            client_id: clienteId,
            invoice_number: 'INV-2024-001',
            invoice_date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 1296000000).toISOString().split('T')[0],
            subtotal: 1500,
            status: 'paid',
            items: [{ description: 'Implantación Agente IA', amount: 1500 }]
        }
    ])

    if (invError) console.error("Error seeding invoices:", invError)
    else console.log("Invoices seeded.")

    console.log("Seeding complete.")
}

seed()
