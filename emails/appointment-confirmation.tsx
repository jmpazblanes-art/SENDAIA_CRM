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
    Link,
} from '@react-email/components'

interface AppointmentConfirmationEmailProps {
    name: string
    date: string
    time: string
    type: string
    duration?: number
}

export default function AppointmentConfirmationEmail({
    name,
    date,
    time,
    type,
    duration,
}: AppointmentConfirmationEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Tu cita ha sido confirmada — {date} a las {time}</Preview>
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

                    {/* Confirmation message */}
                    <Section style={{ backgroundColor: '#111111', borderRadius: '12px', padding: '32px', marginBottom: '16px' }}>
                        <Heading style={{ margin: '0 0 24px 0', fontSize: '22px', fontWeight: 'bold', color: '#7c3aed' }}>
                            Tu cita ha sido confirmada
                        </Heading>
                        <Text style={{ margin: '0 0 24px 0', color: '#cccccc', fontSize: '15px', lineHeight: '1.7' }}>
                            Hola {name}, te confirmamos que tu cita ha sido registrada correctamente.
                        </Text>

                        {/* Appointment details */}
                        <Section style={{ backgroundColor: '#1a1a1a', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
                            <Row style={{ marginBottom: '12px' }}>
                                <Column style={{ width: '120px' }}>
                                    <Text style={{ margin: '0', color: '#666666', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Fecha</Text>
                                </Column>
                                <Column>
                                    <Text style={{ margin: '0', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' }}>{date}</Text>
                                </Column>
                            </Row>
                            <Row style={{ marginBottom: '12px' }}>
                                <Column style={{ width: '120px' }}>
                                    <Text style={{ margin: '0', color: '#666666', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Hora</Text>
                                </Column>
                                <Column>
                                    <Text style={{ margin: '0', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' }}>{time}</Text>
                                </Column>
                            </Row>
                            <Row style={{ marginBottom: duration ? '12px' : '0' }}>
                                <Column style={{ width: '120px' }}>
                                    <Text style={{ margin: '0', color: '#666666', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Tipo</Text>
                                </Column>
                                <Column>
                                    <Text style={{ margin: '0', color: '#7c3aed', fontSize: '15px', fontWeight: 'bold' }}>{type}</Text>
                                </Column>
                            </Row>
                            {duration && (
                                <Row>
                                    <Column style={{ width: '120px' }}>
                                        <Text style={{ margin: '0', color: '#666666', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Duración</Text>
                                    </Column>
                                    <Column>
                                        <Text style={{ margin: '0', color: '#ffffff', fontSize: '15px' }}>{duration} minutos</Text>
                                    </Column>
                                </Row>
                            )}
                        </Section>

                        <Hr style={{ borderColor: '#333333', margin: '24px 0' }} />

                        <Text style={{ margin: '0', color: '#999999', fontSize: '13px', lineHeight: '1.6' }}>
                            Si necesitas cancelar o reagendar tu cita, contacta con nosotros en{' '}
                            <Link href="mailto:info@sendaia.es" style={{ color: '#7c3aed', textDecoration: 'none' }}>info@sendaia.es</Link>
                        </Text>
                    </Section>

                    {/* Footer */}
                    <Text style={{ textAlign: 'center', color: '#444444', fontSize: '11px', marginTop: '32px' }}>
                        SendaIA · Automatización e IA para Empresas
                    </Text>
                </Container>
            </Body>
        </Html>
    )
}
