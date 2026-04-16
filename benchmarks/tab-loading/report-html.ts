import type { ScopeRow } from './aggregate'
import type { NetworkProfile } from './network-throttle'
import type { TabSample } from './navigation'

export interface ProfileReport {
  profile: NetworkProfile
  samples: TabSample[]
  rows: ScopeRow[]
}

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function scoreClass(score: string): string {
  if (score === 'Good') return 'score-good'
  if (score === 'Medium') return 'score-medium'
  if (score === 'Low') return 'score-low'
  return 'score-fail'
}

function rowsTableHtml(rows: ScopeRow[]): string {
  const head =
    '<thead><tr><th>Scope</th><th class="num">Avg (ms)</th><th class="num">Min</th><th class="num">Max</th><th class="num">Std dev</th><th>Score (avg)</th><th>Score (max)</th></tr></thead>'
  const body = rows
    .map(
      (r) => `<tr>
  <td>${escapeHtml(r.scope)}</td>
  <td class="num">${r.avg.toFixed(1)}</td>
  <td class="num">${r.min.toFixed(1)}</td>
  <td class="num">${r.max.toFixed(1)}</td>
  <td class="num">${r.stdDev.toFixed(1)}</td>
  <td><span class="pill ${scoreClass(r.scoreAvg)}">${escapeHtml(r.scoreAvg)}</span></td>
  <td><span class="pill ${scoreClass(r.scoreMax)}">${escapeHtml(r.scoreMax)}</span></td>
</tr>`,
    )
    .join('\n')
  return `<table class="vh-table">${head}<tbody>${body}</tbody></table>`
}

export function buildTabLoadingReportHtml(
  title: string,
  generatedAtIso: string,
  sections: ProfileReport[],
): string {
  const sectionHtml = sections
    .map((s) => {
      const cdp = s.profile.cdp
      const downMbps = ((cdp.downloadThroughput * 8) / 1_000_000).toFixed(2)
      const upMbps = ((cdp.uploadThroughput * 8) / 1_000_000).toFixed(2)
      const meta =
        s.profile.id === 'normal'
          ? 'No network throttling (CDP defaults cleared).'
          : `Approximate limits: down ${downMbps} Mbps, up ${upMbps} Mbps, latency ${cdp.latency.toFixed(0)} ms.`
      return `<section class="vh-section">
  <h2>${escapeHtml(s.profile.label)}</h2>
  <p class="vh-meta">${escapeHtml(meta)}</p>
  ${rowsTableHtml(s.rows)}
</section>`
    })
    .join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #12142c;
      background: #f5f4fb;
    }
    body { margin: 0; padding: 2rem 1.25rem 3rem; }
    .vh-shell {
      max-width: 960px;
      margin: 0 auto;
      background: #fff;
      border: 1px solid #e8e7f5;
      border-radius: 0.75rem;
      box-shadow: 0 12px 40px rgba(76, 47, 209, 0.08);
      padding: 1.75rem 1.5rem 2rem;
    }
    h1 {
      margin: 0 0 0.35rem;
      font-size: 1.35rem;
      color: #4c2fd1;
    }
    .vh-sub {
      margin: 0 0 1.5rem;
      color: #5a4f8e;
      font-size: 0.92rem;
    }
    .vh-section { margin-bottom: 2rem; }
    .vh-section h2 {
      margin: 0 0 0.35rem;
      font-size: 1.05rem;
      color: #12142c;
    }
    .vh-meta {
      margin: 0 0 0.75rem;
      font-size: 0.85rem;
      color: #6b628f;
    }
    .vh-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.88rem;
    }
    .vh-table th, .vh-table td {
      border-bottom: 1px solid #e8e7f5;
      padding: 0.55rem 0.45rem;
      text-align: left;
    }
    .vh-table th {
      background: #f7f6fd;
      color: #4c2fd1;
      font-weight: 600;
    }
    .vh-table .num { text-align: right; font-variant-numeric: tabular-nums; }
    .pill {
      display: inline-block;
      padding: 0.15rem 0.5rem;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 600;
    }
    .score-good { background: #e6f7ec; color: #1b6b3a; }
    .score-medium { background: #fff4e0; color: #8a5a00; }
    .score-low { background: #ffe8e0; color: #a63b12; }
    .score-fail { background: #fde8ea; color: #b4232c; }
  </style>
</head>
<body>
  <div class="vh-shell">
    <h1>${escapeHtml(title)}</h1>
    <p class="vh-sub">Generated ${escapeHtml(generatedAtIso)} · Playwright + CDP <code>Network.emulateNetworkConditions</code> (Chromium)</p>
    ${sectionHtml}
  </div>
</body>
</html>`
}
