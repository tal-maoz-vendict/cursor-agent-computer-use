<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import {
  PHASES,
  canAdvancePhase,
  createInitialControls,
  deriveMetrics,
  loadSession,
  nextPhase,
  phaseGateMessage,
  saveSession,
  STORAGE_KEY,
} from '@/lib/vendorAssessmentLogic.js'

const vendorName = ref('')
const phase = ref('intake')
const controls = ref(createInitialControls())
const toast = ref('')
let toastTimer = 0

const metrics = computed(() => deriveMetrics(controls.value))
const gateMessage = computed(() => phaseGateMessage(phase.value, controls.value, metrics.value))
const advanceAllowed = computed(() => canAdvancePhase(phase.value, controls.value, vendorName.value))

const inherentOptions = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

const postureOptions = [
  { value: 'compliant', label: 'Compliant' },
  { value: 'partial', label: 'Partial' },
  { value: 'non_compliant', label: 'Gap' },
  { value: 'not_evaluated', label: 'Not evaluated' },
]

function showToast(text) {
  toast.value = text
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    toast.value = ''
  }, 2400)
}

function persist() {
  saveSession({
    vendorName: vendorName.value,
    phase: phase.value,
    controls: controls.value,
  })
}

function hydrate() {
  const saved = loadSession()
  if (!saved) {
    return
  }
  if (typeof saved.vendorName === 'string') {
    vendorName.value = saved.vendorName
  }
  if (PHASES.includes(saved.phase)) {
    phase.value = saved.phase
  }
  if (Array.isArray(saved.controls) && saved.controls.length) {
    const template = createInitialControls()
    const byId = new Map(saved.controls.map((c) => [c.id, c]))
    controls.value = template.map((row) => ({ ...row, ...(byId.get(row.id) || {}) }))
  }
}

onMounted(hydrate)

watch([vendorName, phase, controls], persist, { deep: true })

function advanceWorkflow() {
  if (!advanceAllowed.value) {
    showToast('Complete the checklist for this phase before continuing.')
    return
  }
  phase.value = nextPhase(phase.value)
  showToast('Phase updated.')
}

function resetSession() {
  vendorName.value = ''
  phase.value = 'intake'
  controls.value = createInitialControls()
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(STORAGE_KEY)
  }
  showToast('Session cleared.')
}

function exportSummary() {
  const summary = {
    vendor: vendorName.value.trim(),
    phase: phase.value,
    residualRiskScore: metrics.value.score,
    tier: metrics.value.tier,
    controls: controls.value.map((c) => ({
      id: c.id,
      title: c.title,
      inherent: c.inherent,
      posture: c.posture,
      evidence: c.evidence,
    })),
    exportedAt: new Date().toISOString(),
  }
  const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `vendict-assessment-${(vendorName.value || 'vendor').replace(/\s+/g, '-').toLowerCase()}.json`
  a.click()
  URL.revokeObjectURL(url)
  showToast('JSON summary downloaded.')
}

function tierLabel(tier) {
  if (tier === 'low') return 'Acceptable'
  if (tier === 'medium') return 'Elevated'
  if (tier === 'high') return 'High'
  return 'Critical'
}
</script>

<template>
  <section class="va-root">
    <header class="va-hero">
      <div class="va-brand">
        <span class="va-mark" aria-hidden="true">
          <svg viewBox="0 0 40 40" width="40" height="40">
            <defs>
              <linearGradient id="va-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#6366f1" />
                <stop offset="100%" stop-color="#22d3ee" />
              </linearGradient>
            </defs>
            <path
              d="M6 6h9l5 18 5-18h9L23 34h-6L6 6z"
              fill="url(#va-grad)"
            />
          </svg>
        </span>
        <div>
          <p class="va-eyebrow">Vendict 2026</p>
          <h2 class="va-title">Vendor risk assessment</h2>
          <p class="va-lead">
            Score residual risk from inherent exposure and evidence-backed posture. Advance the workflow when gates pass.
          </p>
        </div>
      </div>

      <div class="va-score-card" :data-tier="metrics.tier">
        <p class="va-score-label">Residual risk</p>
        <p class="va-score-value">{{ metrics.score.toFixed(2) }}</p>
        <p class="va-score-tier">{{ tierLabel(metrics.tier) }}</p>
        <dl class="va-mini-stats">
          <div>
            <dt>Evaluated</dt>
            <dd>{{ metrics.evaluatedCount }} / {{ metrics.total }}</dd>
          </div>
          <div>
            <dt>Gaps</dt>
            <dd>{{ metrics.gapCount }}</dd>
          </div>
          <div>
            <dt>Partial</dt>
            <dd>{{ metrics.partialCount }}</dd>
          </div>
        </dl>
      </div>
    </header>

    <div class="va-workflow">
      <ol class="va-steps" aria-label="Assessment workflow">
        <li
          v-for="p in PHASES"
          :key="p"
          :class="['va-step', { 'va-step-active': p === phase, 'va-step-done': PHASES.indexOf(p) < PHASES.indexOf(phase) }]"
        >
          <span class="va-step-dot" />
          <span class="va-step-name">{{ p }}</span>
        </li>
      </ol>
      <p class="va-gate">{{ gateMessage }}</p>
    </div>

    <div class="va-toolbar">
      <label class="va-field va-field-grow">
        <span class="va-field-label">Vendor name</span>
        <input
          v-model.trim="vendorName"
          type="text"
          class="va-input"
          placeholder="e.g. Acme Analytics"
          autocomplete="organization"
        />
      </label>
      <div class="va-toolbar-actions">
        <button
          type="button"
          class="btn accent"
          :disabled="!advanceAllowed || phase === 'signoff'"
          @click="advanceWorkflow"
        >
          Advance phase
        </button>
        <button type="button" class="btn" @click="exportSummary">Export JSON</button>
        <button type="button" class="btn" @click="resetSession">Reset</button>
      </div>
    </div>

    <div v-if="toast" class="va-toast" role="status">{{ toast }}</div>

    <div class="va-table-wrap">
      <table class="va-table">
        <thead>
          <tr>
            <th scope="col">Control</th>
            <th scope="col">Inherent</th>
            <th scope="col">Posture</th>
            <th scope="col">Evidence / notes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in controls" :key="c.id">
            <td>
              <span class="va-cell-title">{{ c.title }}</span>
              <span class="va-cell-meta">{{ c.category }}</span>
            </td>
            <td>
              <select v-model="c.inherent" class="va-select">
                <option v-for="opt in inherentOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </td>
            <td>
              <select v-model="c.posture" class="va-select">
                <option v-for="opt in postureOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </td>
            <td>
              <input
                v-model="c.evidence"
                type="text"
                class="va-input va-input-table"
                placeholder="Ticket ID, doc link, or reviewer"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="va-footnote">
      Scoring weights inherent severity and posture multipliers; remediation requires no critical gaps and residual risk ≤ 35.
      Progress is saved in session storage for this browser tab.
    </p>
  </section>
</template>
