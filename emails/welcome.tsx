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
    Link,
} from '@react-email/components'

interface WelcomeEmailProps {
    name: string
    company?: string
}

export default function WelcomeEmail({ name, company }: WelcomeEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Bienvenido a SendaIA — Automatización e IA para tu empresa</Preview>
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

                    {/* Welcome content */}
                    <Section style={{ backgroundColor: '#111111', borderRadius: '12px', padding: '32px', marginBottom: '16px' }}>
                        <Heading style={{ margin: '0 0 24px 0', fontSize: '22px', fontWeight: 'bold', color: '#7c3aed' }}>
                            Bienvenido a SendaIA
                        </Heading>
                        <Text style={{ margin: '0 0 16px 0', color: '#ffffff', fontSize: '16px', fontWeight: 'bold' }}>
                            Hola {name}{company ? ` de ${company}` : ''},
                        </Text>
                        <Text style={{ margin: '0 0 16px 0', color: '#cccccc', fontSize: '15px', lineHeight: '1.7' }}>
                            Gracias por tu interés en SendaIA. Hemos recibido tus datos correctamente.
                        </Text>
                        <Text style={{ margin: '0 0 16px 0', color: '#cccccc', fontSize: '15px', lineHeight: '1.7' }}>
                            En SendaIA diseñamos sistemas operativos con IA que eliminan tareas manuales
                            en tu empresa. Desde automatización de procesos con n8n, agentes
                            conversacionales 24/7, hasta agentes de voz con IA — ayudamos a PYMEs
                            españolas a ahorrar tiempo y escalar sin ampliar equipo.
                        </Text>

                        <Hr style={{ borderColor: '#333333', margin: '24px 0' }} />

                        <Text style={{ margin: '0 0 8px 0', color: '#7c3aed', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            ¿Qué sigue?
                        </Text>
                        <Text style={{ margin: '0 0 16px 0', color: '#cccccc', fontSize: '15px', lineHeight: '1.7' }}>
                            Un miembro de nuestro equipo se pondrá en contacto contigo pronto para
                            entender tus necesidades y ofrecerte una propuesta personalizada.
                        </Text>
                        <Text style={{ margin: '0', color: '#999999', fontSize: '13px', lineHeight: '1.6' }}>
                            Si mientras tanto tienes alguna pregunta, no dudes en escribirnos.
                        </Text>
                    </Section>

                    {/* Contact info */}
                    <Section style={{ backgroundColor: '#111111', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
                        <Text style={{ margin: '0 0 12px 0', color: '#666666', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            Contacto
                        </Text>
                        <Text style={{ margin: '0 0 4px 0', color: '#cccccc', fontSize: '14px' }}>
                            Email: <Link href="mailto:info@sendaia.es" style={{ color: '#7c3aed', textDecoration: 'none' }}>info@sendaia.es</Link>
                        </Text>
                        <Text style={{ margin: '0', color: '#cccccc', fontSize: '14px' }}>
                            Web: <Link href="https://sendaia.es" style={{ color: '#7c3aed', textDecoration: 'none' }}>sendaia.es</Link>
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
