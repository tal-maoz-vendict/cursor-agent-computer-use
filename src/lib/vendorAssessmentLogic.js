/**
 * Vendor security assessment — pure scoring and workflow rules.
 * Used by the Vendict 2026 assessment UI (no I/O).
 */

export const INHERENT_POINTS = {
  critical: 100,
  high: 72,
  medium: 48,
  low: 24,
}

export const POSTURE_RESIDUAL = {
  compliant: 0.12,
  partial: 0.42,
  non_compliant: 1,
  not_evaluated: 1,
}

export const PHASES = ['intake', 'assessment', 'remediation', 'signoff']

export function createInitialControls() {
  return [
    {
      id: 'soc2',
      title: 'SOC 2 Type II attestation',
      category: 'Compliance',
      inherent: 'critical',
      posture: 'not_evaluated',
      evidence: '',
    },
    {
      id: 'dpa',
      title: 'Data processing agreement',
      category: 'Legal',
      inherent: 'high',
      posture: 'not_evaluated',
      evidence: '',
    },
    {
      id: 'encryption',
      title: 'Encryption at rest and in transit',
      category: 'Technical',
      inherent: 'high',
      posture: 'not_evaluated',
      evidence: '',
    },
    {
      id: 'access',
      title: 'Access control & SSO',
      category: 'Technical',
      inherent: 'medium',
      posture: 'not_evaluated',
      evidence: '',
    },
    {
      id: 'incident',
      title: 'Incident response & notification SLAs',
      category: 'Operational',
      inherent: 'medium',
      posture: 'not_evaluated',
      evidence: '',
    },
    {
      id: 'subprocessors',
      title: 'Subprocessor transparency',
      category: 'Governance',
      inherent: 'low',
      posture: 'not_evaluated',
      evidence: '',
    },
  ]
}

/**
 * Weighted residual risk (0–100). Lower is better.
 */
export function computeResidualRisk(controls) {
  if (!controls.length) {
    return 0
  }

  let weighted = 0
  let totalWeight = 0

  for (const c of controls) {
    const base = INHERENT_POINTS[c.inherent] ?? 0
    const mult = POSTURE_RESIDUAL[c.posture] ?? 1
    weighted += base * mult
    totalWeight += base
  }

  return totalWeight ? Math.round((weighted / totalWeight) * 100) / 100 : 0
}

export function riskTier(score) {
  if (score <= 18) return 'low'
  if (score <= 38) return 'medium'
  if (score <= 58) return 'high'
  return 'critical'
}

export function deriveMetrics(controls) {
  const evaluated = controls.filter((c) => c.posture !== 'not_evaluated')
  const gaps = controls.filter((c) => c.posture === 'non_compliant')
  const partial = controls.filter((c) => c.posture === 'partial')
  const score = computeResidualRisk(controls)
  const tier = riskTier(score)

  return {
    score,
    tier,
    evaluatedCount: evaluated.length,
    total: controls.length,
    gapCount: gaps.length,
    partialCount: partial.length,
    allEvaluated: evaluated.length === controls.length,
  }
}

export function phaseGateMessage(phase, controls, metrics) {
  if (phase === 'intake') {
    return 'Complete vendor profile to begin structured assessment.'
  }

  if (phase === 'assessment') {
    if (!metrics.allEvaluated) {
      return `Evaluate all controls (${metrics.evaluatedCount}/${metrics.total} done).`
    }
    return 'All controls evaluated. Move to remediation to track fixes and evidence.'
  }

  if (phase === 'remediation') {
    const criticalGaps = controls.some(
      (c) => c.inherent === 'critical' && c.posture === 'non_compliant',
    )
    if (criticalGaps) {
      return 'Resolve or formally accept risk on all critical gaps before sign-off.'
    }
    if (metrics.score > 35) {
      return 'Residual risk must be 35 or below to sign off (or improve partial / non-compliant items).'
    }
    return 'Remediation criteria met. Ready for procurement / security sign-off.'
  }

  return 'Assessment archived for this session. Export or reset to start over.'
}

export function canAdvancePhase(phase, controls, vendorName) {
  const metrics = deriveMetrics(controls)
  const nameOk = Boolean(vendorName && vendorName.trim().length >= 2)

  if (phase === 'intake') {
    return nameOk
  }

  if (phase === 'assessment') {
    return metrics.allEvaluated
  }

  if (phase === 'remediation') {
    const criticalGaps = controls.some(
      (c) => c.inherent === 'critical' && c.posture === 'non_compliant',
    )
    return !criticalGaps && metrics.score <= 35
  }

  return false
}

export function nextPhase(phase) {
  const i = PHASES.indexOf(phase)
  if (i < 0 || i >= PHASES.length - 1) {
    return phase
  }
  return PHASES[i + 1]
}

export const STORAGE_KEY = 'vendict-vendor-assessment-v1'

export function loadSession() {
  if (typeof sessionStorage === 'undefined') {
    return null
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveSession(payload) {
  if (typeof sessionStorage === 'undefined') {
    return
  }
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    /* ignore quota */
  }
}
