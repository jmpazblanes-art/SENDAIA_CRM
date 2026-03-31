// =============================================================
// BAREMO DE PRECIOS SENDAIA 2025
// Fuente: Sendaia_Baremo_Precios_2025.xlsx
// =============================================================

export interface BaremoServicio {
  nombre: string
  descripcion: string
  nivel: string
  setup_min: number
  setup_max: number
  mensual_min: number
  mensual_max: number
}

export interface BaremoCategoria {
  categoria: string
  servicios: BaremoServicio[]
}

export interface PresupuestoServicio {
  categoria: string
  nombre: string
  descripcion: string
  nivel: string
  precio_setup: number
  precio_mensual: number
}

export const BAREMO: BaremoCategoria[] = [
  {
    categoria: "Automatizacion (n8n)",
    servicios: [
      { nombre: "Workflow simple", descripcion: "1-2 integraciones", nivel: "Basico", setup_min: 500, setup_max: 900, mensual_min: 59, mensual_max: 99 },
      { nombre: "Workflow medio", descripcion: "3-5 integraciones con logica condicional", nivel: "Medio", setup_min: 1000, setup_max: 2500, mensual_min: 99, mensual_max: 199 },
      { nombre: "Workflow complejo", descripcion: "6+ integraciones, multiples ramas logicas", nivel: "Alto", setup_min: 2500, setup_max: 5000, mensual_min: 199, mensual_max: 399 },
      { nombre: "Sistema multi-workflow", descripcion: "Varios workflows coordinados", nivel: "Muy alto", setup_min: 5000, setup_max: 15000, mensual_min: 299, mensual_max: 799 },
    ]
  },
  {
    categoria: "Agente Conversacional",
    servicios: [
      { nombre: "Agente basico", descripcion: "1 canal, respuestas FAQ", nivel: "Basico", setup_min: 600, setup_max: 1200, mensual_min: 79, mensual_max: 149 },
      { nombre: "Agente con CRM", descripcion: "1-2 canales + CRM", nivel: "Medio", setup_min: 1200, setup_max: 3000, mensual_min: 149, mensual_max: 299 },
      { nombre: "Agente multi-canal avanzado", descripcion: "WhatsApp + Telegram + Web, IA avanzada", nivel: "Alto", setup_min: 3000, setup_max: 6000, mensual_min: 299, mensual_max: 499 },
    ]
  },
  {
    categoria: "Agente de Voz",
    servicios: [
      { nombre: "Recepcionista virtual basica", descripcion: "Atencion llamadas, gestion citas", nivel: "Medio", setup_min: 1500, setup_max: 3000, mensual_min: 199, mensual_max: 349 },
      { nombre: "Agente de voz avanzado", descripcion: "Flujos complejos, integracion CRM", nivel: "Alto", setup_min: 3000, setup_max: 6000, mensual_min: 349, mensual_max: 599 },
    ]
  },
  {
    categoria: "Automatizacion Documental",
    servicios: [
      { nombre: "OCR simple", descripcion: "1 tipo de documento", nivel: "Basico", setup_min: 800, setup_max: 1500, mensual_min: 99, mensual_max: 179 },
      { nombre: "OCR avanzado multi-documento", descripcion: "Varios tipos, validacion", nivel: "Medio", setup_min: 1500, setup_max: 3500, mensual_min: 179, mensual_max: 299 },
      { nombre: "Sistema documental completo", descripcion: "Facturas, expedientes, informes", nivel: "Alto", setup_min: 3500, setup_max: 7000, mensual_min: 299, mensual_max: 499 },
    ]
  },
  {
    categoria: "Desarrollo Web",
    servicios: [
      { nombre: "Landing page basica", descripcion: "Web informativa hasta 5 secciones", nivel: "Basico", setup_min: 500, setup_max: 900, mensual_min: 0, mensual_max: 0 },
      { nombre: "Landing profesional", descripcion: "Web completa con formulario, SEO", nivel: "Basico-Medio", setup_min: 900, setup_max: 2000, mensual_min: 0, mensual_max: 0 },
      { nombre: "Landing + automatizacion", descripcion: "Web con CRM, email automatico", nivel: "Medio", setup_min: 2000, setup_max: 4000, mensual_min: 99, mensual_max: 199 },
      { nombre: "Landing + agente IA", descripcion: "Web con chatbot IA", nivel: "Medio-Alto", setup_min: 3000, setup_max: 6000, mensual_min: 199, mensual_max: 349 },
      { nombre: "SaaS a medida", descripcion: "App web completa con IA", nivel: "Muy alto", setup_min: 8000, setup_max: 20000, mensual_min: 299, mensual_max: 799 },
    ]
  },
  {
    categoria: "Consultoria",
    servicios: [
      { nombre: "Auditoria de procesos", descripcion: "Analisis flujos, quick wins", nivel: "\u2014", setup_min: 0, setup_max: 300, mensual_min: 0, mensual_max: 0 },
      { nombre: "Consultoria estrategica", descripcion: "Hoja de ruta + ROI", nivel: "\u2014", setup_min: 500, setup_max: 1500, mensual_min: 0, mensual_max: 0 },
    ]
  },
]

/** Format currency in ES locale */
export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\u20AC`
}
