export interface OpsMonitoring {
  id: string
  producto: string
  repo: string | null
  url_app: string | null
  estado: 'ok' | 'warning' | 'error'
  ultimo_error: string | null
  github_actions_status: string | null
  github_actions_url: string | null
  uptime_ok: boolean
  coste_anthropic_mes: number
  coste_openai_mes: number
  coste_supabase_mes: number
  test_summary: string | null
  created_at: string
  updated_at: string
}

export interface OpsAlerta {
  id: string
  producto: string
  tipo_error: string | null
  log_error: string | null
  estado: 'pendiente' | 'en_analisis' | 'fix_propuesto' | 'reparado' | 'ignorado' | 'fallido'
  fix_propuesto: string | null
  fix_aplicado: string | null
  fix_commit_url: string | null
  aprobado_por: string | null
  confianza: 'alta' | 'media' | 'baja' | null
  created_at: string
  fecha_resolucion: string | null
}
