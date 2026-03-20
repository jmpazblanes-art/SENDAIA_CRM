import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Hr,
    Row,
    Column,
} from '@react-email/components'

interface InvoiceItem {
    description: string
    quantity: number
    unit_price: number
    total: number
}

interface InvoiceEmailProps {
    clientName: string
    invoiceNumber: string
    invoiceDate: string
    dueDate: string
    items: InvoiceItem[]
    subtotal: number
    taxRate: number
    taxAmount: number
    total: number
    notes?: string
}

export default function InvoiceEmail({
    clientName,
    invoiceNumber,
    invoiceDate,
    dueDate,
    items,
    subtotal,
    taxRate,
    taxAmount,
    total,
    notes,
}: InvoiceEmailProps) {
    const fmt = (n: number) => `${n.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€`

    return (
        <Html>
            <Head />
            <Preview>Factura {invoiceNumber} de SendaIA — {fmt(total)}</Preview>
            <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#0a0a0a', color: '#ffffff' }}>
                <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
                    {/* Header */}
                    <Section style={{ backgroundColor: '#111111', borderRadius: '12px', padding: '32px', marginBottom: '24px', borderLeft: '4px solid #7c3aed' }}>
                        <Heading style={{ margin: '0 0 4px 0', fontSize: '28px', fontWeight: '900', color: '#ffffff', letterSpacing: '-1px' }}>
                            SENDAIA
                        </Heading>
                        <Text style={{ margin: '0', color: '#7c3aed', fontSize: '11px', fontWeight: 'bold', letterSpacing: '3px', textTransform: 'uppercase' }}>
                            Automatización e IA para Empresas
                        </Text>
                    </Section>

                    {/* Invoice header */}
                    <Section style={{ backgroundColor: '#111111', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
                        <Row>
                            <Column>
                                <Text style={{ margin: '0 0 4px 0', color: '#666666', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Factura para</Text>
                                <Text style={{ margin: '0', color: '#ffffff', fontSize: '18px', fontWeight: 'bold' }}>{clientName}</Text>
                            </Column>
                            <Column style={{ textAlign: 'right' }}>
                                <Text style={{ margin: '0 0 4px 0', color: '#7c3aed', fontSize: '20px', fontWeight: '900' }}>#{invoiceNumber}</Text>
                                <Text style={{ margin: '0', color: '#666666', fontSize: '12px' }}>Fecha: {invoiceDate}</Text>
                                <Text style={{ margin: '0', color: '#ef4444', fontSize: '12px', fontWeight: 'bold' }}>Vence: {dueDate}</Text>
                            </Column>
                        </Row>
                    </Section>

                    {/* Items */}
                    <Section style={{ backgroundColor: '#111111', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
                        <Text style={{ margin: '0 0 16px 0', color: '#666666', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            Conceptos
                        </Text>
                        <Row style={{ borderBottom: '1px solid #222', paddingBottom: '8px', marginBottom: '8px' }}>
                            <Column style={{ width: '50%' }}><Text style={{ margin: '0', color: '#999999', fontSize: '11px', textTransform: 'uppercase' }}>Descripción</Text></Column>
                            <Column style={{ width: '15%', textAlign: 'center' }}><Text style={{ margin: '0', color: '#999999', fontSize: '11px', textTransform: 'uppercase' }}>Cant.</Text></Column>
                            <Column style={{ width: '20%', textAlign: 'right' }}><Text style={{ margin: '0', color: '#999999', fontSize: '11px', textTransform: 'uppercase' }}>Precio</Text></Column>
                            <Column style={{ width: '15%', textAlign: 'right' }}><Text style={{ margin: '0', color: '#999999', fontSize: '11px', textTransform: 'uppercase' }}>Total</Text></Column>
                        </Row>
                        {items.map((item, i) => (
                            <Row key={i} style={{ paddingBottom: '8px', marginBottom: '8px', borderBottom: '1px solid #1a1a1a' }}>
                                <Column style={{ width: '50%' }}><Text style={{ margin: '0', color: '#ffffff', fontSize: '13px' }}>{item.description}</Text></Column>
                                <Column style={{ width: '15%', textAlign: 'center' }}><Text style={{ margin: '0', color: '#aaaaaa', fontSize: '13px' }}>{item.quantity}</Text></Column>
                                <Column style={{ width: '20%', textAlign: 'right' }}><Text style={{ margin: '0', color: '#aaaaaa', fontSize: '13px' }}>{fmt(item.unit_price)}</Text></Column>
                                <Column style={{ width: '15%', textAlign: 'right' }}><Text style={{ margin: '0', color: '#ffffff', fontSize: '13px', fontWeight: 'bold' }}>{fmt(item.total)}</Text></Column>
                            </Row>
                        ))}
                    </Section>

                    {/* Totals */}
                    <Section style={{ backgroundColor: '#111111', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
                        <Row style={{ marginBottom: '8px' }}>
                            <Column><Text style={{ margin: '0', color: '#999999', fontSize: '13px' }}>Subtotal</Text></Column>
                            <Column style={{ textAlign: 'right' }}><Text style={{ margin: '0', color: '#ffffff', fontSize: '13px' }}>{fmt(subtotal)}</Text></Column>
                        </Row>
                        <Row style={{ marginBottom: '8px' }}>
                            <Column><Text style={{ margin: '0', color: '#999999', fontSize: '13px' }}>IVA ({taxRate}%)</Text></Column>
                            <Column style={{ textAlign: 'right' }}><Text style={{ margin: '0', color: '#ffffff', fontSize: '13px' }}>{fmt(taxAmount)}</Text></Column>
                        </Row>
                        <Hr style={{ borderColor: '#333333', margin: '12px 0' }} />
                        <Row>
                            <Column><Text style={{ margin: '0', color: '#7c3aed', fontSize: '18px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>Total</Text></Column>
                            <Column style={{ textAlign: 'right' }}><Text style={{ margin: '0', color: '#7c3aed', fontSize: '24px', fontWeight: '900' }}>{fmt(total)}</Text></Column>
                        </Row>
                    </Section>

                    {notes && (
                        <Section style={{ backgroundColor: '#111111', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
                            <Text style={{ margin: '0 0 8px 0', color: '#666666', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Notas</Text>
                            <Text style={{ margin: '0', color: '#aaaaaa', fontSize: '13px', lineHeight: '1.6' }}>{notes}</Text>
                        </Section>
                    )}

                    {/* Footer */}
                    <Text style={{ textAlign: 'center', color: '#444444', fontSize: '11px', marginTop: '32px' }}>
                        SendaIA · Automatización e IA para Empresas
                    </Text>
                </Container>
            </Body>
        </Html>
    )
}
