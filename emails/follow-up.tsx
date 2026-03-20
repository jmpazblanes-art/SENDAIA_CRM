import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
} from '@react-email/components'

interface FollowUpEmailProps {
    clientName: string
    agentName: string
    message: string
    companyName?: string
}

export default function FollowUpEmail({ clientName, agentName, message, companyName }: FollowUpEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Mensaje de seguimiento de {agentName} — SendaIA</Preview>
            <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#0a0a0a', color: '#ffffff' }}>
                <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
                    <Section style={{ backgroundColor: '#111111', borderRadius: '12px', padding: '32px', marginBottom: '24px', borderLeft: '4px solid #7c3aed' }}>
                        <Heading style={{ margin: '0 0 4px 0', fontSize: '28px', fontWeight: '900', color: '#ffffff', letterSpacing: '-1px' }}>
                            SENDAIA
                        </Heading>
                        <Text style={{ margin: '0', color: '#7c3aed', fontSize: '11px', fontWeight: 'bold', letterSpacing: '3px', textTransform: 'uppercase' }}>
                            Automatización e IA para Empresas
                        </Text>
                    </Section>

                    <Section style={{ backgroundColor: '#111111', borderRadius: '12px', padding: '32px' }}>
                        <Text style={{ margin: '0 0 8px 0', color: '#999999', fontSize: '13px' }}>
                            Hola{companyName ? `, equipo de ${companyName}` : ''}.
                        </Text>
                        <Text style={{ margin: '0 0 24px 0', color: '#ffffff', fontSize: '20px', fontWeight: 'bold' }}>
                            {clientName},
                        </Text>
                        <Text style={{ margin: '0 0 32px 0', color: '#cccccc', fontSize: '15px', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                            {message}
                        </Text>
                        <Text style={{ margin: '0', color: '#999999', fontSize: '13px' }}>
                            Un saludo,<br />
                            <strong style={{ color: '#ffffff' }}>{agentName}</strong><br />
                            <span style={{ color: '#7c3aed' }}>SendaIA</span>
                        </Text>
                    </Section>

                    <Text style={{ textAlign: 'center', color: '#444444', fontSize: '11px', marginTop: '32px' }}>
                        SendaIA · Automatización e IA para Empresas
                    </Text>
                </Container>
            </Body>
        </Html>
    )
}
