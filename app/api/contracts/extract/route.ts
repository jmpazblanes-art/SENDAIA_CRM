import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

const EXTRACT_PROMPT = `Analiza este contrato y extrae en JSON:
{
  "titulo": "título del proyecto o servicio contratado",
  "empresa": "nombre de la empresa cliente",
  "servicios": ["lista de servicios"],
  "fases": [{"nombre": "...", "descripcion": "...", "importe": 0, "fecha_prevista": "YYYY-MM-DD o null"}],
  "valor_total": 0,
  "fecha_inicio": "YYYY-MM-DD o null",
  "notas": "condiciones importantes, forma de pago, etc."
}
Solo responde con el JSON, sin texto adicional, sin bloques de código.`

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No se ha enviado ningún archivo.' }, { status: 400 })
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Solo se admiten archivos PDF.' }, { status: 400 })
    }

    // Max 20MB
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'El archivo supera el límite de 20MB.' }, { status: 400 })
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENROUTER_API_KEY no configurada.' }, { status: 500 })
    }

    // Convert to base64
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    // Call OpenRouter with Gemini vision
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://sendaia.es',
        'X-Title': 'SendaIA CRM'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: EXTRACT_PROMPT
              },
              {
                type: 'file',
                file: {
                  filename: file.name,
                  file_data: `data:application/pdf;base64,${base64}`
                }
              }
            ]
          }
        ],
        temperature: 0.1
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('OpenRouter error:', errText)
      return NextResponse.json({ error: 'Error al procesar el PDF con IA. Inténtalo de nuevo.' }, { status: 500 })
    }

    const aiResult = await response.json()
    const content = aiResult.choices?.[0]?.message?.content || ''

    // Clean and parse JSON
    let cleaned = content.trim()
    // Remove markdown code blocks if present
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()

    let extracted: any
    try {
      extracted = JSON.parse(cleaned)
    } catch {
      console.error('JSON parse error, raw content:', content)
      return NextResponse.json({ error: 'No se pudo interpretar la respuesta de IA. El PDF puede no contener un contrato válido.' }, { status: 422 })
    }

    // Normalize into the shape the dialog expects
    const result = {
      titulo: extracted.titulo || extracted.empresa || 'Contrato importado',
      descripcion: extracted.servicios?.join(', ') || '',
      fecha_inicio: extracted.fecha_inicio || null,
      notas: extracted.notas || '',
      phases: (extracted.fases || []).map((f: any) => ({
        nombre: f.nombre || 'Fase',
        descripcion: f.descripcion || '',
        importe: typeof f.importe === 'number' ? f.importe : parseFloat(f.importe) || 0,
        fecha_prevista: f.fecha_prevista || null
      }))
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Extract contract error:', error)
    return NextResponse.json({ error: error.message || 'Error interno del servidor.' }, { status: 500 })
  }
}
