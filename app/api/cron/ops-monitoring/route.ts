import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendOpsAlert } from '@/lib/ops-telegram'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface GitHubRun {
  id: number
  conclusion: string | null
  status: string
  html_url: string
  name: string
}

async function checkGitHubActions(repo: string): Promise<{
  estado: 'ok' | 'warning' | 'error'
  github_actions_status: string | null
  github_actions_url: string | null
  ultimo_error: string | null
  test_summary: string | null
  workflow_name: string | null
}> {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    return { estado: 'warning', github_actions_status: 'no_token', github_actions_url: null, ultimo_error: 'GITHUB_TOKEN no configurado', test_summary: null, workflow_name: null }
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/actions/runs?per_page=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    )

    if (!res.ok) {
      return { estado: 'warning', github_actions_status: `api_error_${res.status}`, github_actions_url: null, ultimo_error: `GitHub API error: ${res.status}`, test_summary: null, workflow_name: null }
    }

    const data = await res.json()
    const runs = data.workflow_runs as GitHubRun[] | undefined

    if (!runs || runs.length === 0) {
      return { estado: 'ok', github_actions_status: 'no_runs', github_actions_url: null, ultimo_error: null, test_summary: null, workflow_name: null }
    }

    const latest = runs[0]

    if (latest.status === 'in_progress' || latest.status === 'queued') {
      return { estado: 'ok', github_actions_status: latest.status, github_actions_url: latest.html_url, ultimo_error: null, test_summary: null, workflow_name: latest.name }
    }

    // Try to get job summary for completed runs
    let test_summary: string | null = null
    try {
      const jobsRes = await fetch(
        `https://api.github.com/repos/${repo}/actions/runs/${latest.id}/jobs`,
        { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' } }
      )
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json()
        const jobs = jobsData.jobs || []
        test_summary = jobs.map((j: any) => `${j.name}: ${j.conclusion}`).join(', ')
      }
    } catch {}

    if (latest.conclusion === 'success') {
      return { estado: 'ok', github_actions_status: 'success', github_actions_url: latest.html_url, ultimo_error: null, test_summary, workflow_name: latest.name }
    }

    if (latest.conclusion === 'failure') {
      return {
        estado: 'error',
        github_actions_status: 'failure',
        github_actions_url: latest.html_url,
        ultimo_error: `GitHub Actions failed: ${latest.name}`,
        test_summary,
        workflow_name: latest.name,
      }
    }

    // cancelled, skipped, etc
    return { estado: 'warning', github_actions_status: latest.conclusion || 'unknown', github_actions_url: latest.html_url, ultimo_error: null, test_summary, workflow_name: latest.name }
  } catch (err) {
    return { estado: 'warning', github_actions_status: 'fetch_error', github_actions_url: null, ultimo_error: `Error checking GitHub: ${err}`, test_summary: null, workflow_name: null }
  }
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch products dynamically from ops_monitoring
    const { data: products, error: fetchError } = await supabase
      .from('ops_monitoring')
      .select('producto, repo')

    if (fetchError || !products || products.length === 0) {
      return NextResponse.json({ ok: true, summary: 'No products to monitor', results: [] })
    }

    const results: Array<{ producto: string; estado: string; test_summary?: string | null; workflow_name?: string | null; error?: string }> = []

    for (const product of products) {
      const ghResult = await checkGitHubActions(product.repo)

      // Get current error to detect new ones
      const { data: existing } = await supabase
        .from('ops_monitoring')
        .select('ultimo_error')
        .eq('producto', product.producto)
        .single()

      const currentError = existing?.ultimo_error ?? null
      const isNewError = ghResult.estado === 'error' && ghResult.ultimo_error && ghResult.ultimo_error !== currentError

      // Upsert monitoring
      const { error: upsertError } = await supabase
        .from('ops_monitoring')
        .upsert(
          {
            producto: product.producto,
            repo: product.repo,
            estado: ghResult.estado,
            github_actions_status: ghResult.github_actions_status,
            github_actions_url: ghResult.github_actions_url,
            ultimo_error: ghResult.ultimo_error,
            test_summary: ghResult.test_summary,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'producto' }
        )

      if (upsertError) {
        console.error(`[ops-cron] Upsert error for ${product.producto}:`, upsertError)
        results.push({ producto: product.producto, estado: 'upsert_error', error: upsertError.message })
        continue
      }

      // Create alert + send Telegram if new error
      if (isNewError) {
        await supabase.from('ops_alertas').insert({
          producto: product.producto,
          tipo_error: 'github_actions',
          log_error: ghResult.ultimo_error,
          estado: 'pendiente',
          confianza: 'media',
        })

        try {
          await sendOpsAlert(product.producto, 'GitHub Actions Failed', ghResult.ultimo_error)
        } catch (tgErr) {
          console.error(`[ops-cron] Telegram alert failed for ${product.producto}:`, tgErr)
        }
      }

      results.push({ producto: product.producto, estado: ghResult.estado, test_summary: ghResult.test_summary, workflow_name: ghResult.workflow_name })
    }

    const errors = results.filter((r) => r.estado === 'error').length
    const summary = `Ops check complete: ${results.length} products, ${errors} errors`
    console.log(`[ops-cron] ${summary}`)

    return NextResponse.json({ ok: true, summary, results })
  } catch (err) {
    console.error('[ops-cron] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
