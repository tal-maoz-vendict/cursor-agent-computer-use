import type { BrowserContext, Page } from '@playwright/test'

import { buildScopeRows } from './aggregate'
import {
  getMountTimeoutMs,
  getVisitsPerTab,
  SEQUENCE_SEED,
  TAB_LABEL,
} from './constants'
import {
  applyNetworkProfile,
  NETWORK_PROFILES,
  type NetworkProfile,
} from './network-throttle'
import { goToTab, type TabSample } from './navigation'
import type { ProfileReport } from './report-html'
import { buildPseudoRandomSequence } from './sequence'

export interface BenchmarkProfileResult {
  profile: NetworkProfile
  mountTimeoutMs: number
  passed: boolean
  failureReasons: string[]
  samples: TabSample[]
  rows: ReturnType<typeof buildScopeRows>
}

export interface TabLoadingBenchmarkResult {
  ok: boolean
  startedAtIso: string
  finishedAtIso: string
  sequenceSeed: number
  visitsPerTab: number
  profiles: BenchmarkProfileResult[]
}

function evaluateProfile(
  profile: (typeof NETWORK_PROFILES)[number],
  samples: TabSample[],
): Pick<BenchmarkProfileResult, 'passed' | 'failureReasons'> {
  const mountTimeoutMs = getMountTimeoutMs(profile.id)
  const failureReasons: string[] = []
  for (const s of samples) {
    if (s.ms >= mountTimeoutMs) {
      failureReasons.push(
        `${TAB_LABEL[s.tab]} exceeded mount timeout: ${s.ms.toFixed(0)} ms ≥ ${mountTimeoutMs} ms`,
      )
    }
  }
  return { passed: failureReasons.length === 0, failureReasons }
}

export async function runTabLoadingBenchmark(
  page: Page,
  context: BrowserContext,
): Promise<TabLoadingBenchmarkResult> {
  const startedAtIso = new Date().toISOString()
  const visitsPerTab = getVisitsPerTab()
  const sequence = buildPseudoRandomSequence(SEQUENCE_SEED, visitsPerTab)
  const profiles: BenchmarkProfileResult[] = []

  for (const profile of NETWORK_PROFILES) {
    await applyNetworkProfile(context, page, profile)
    const mountTimeoutMs = getMountTimeoutMs(profile.id)
    const samples: TabSample[] = []

    await page.goto('/home')
    await page.waitForURL('**/home')

    for (const path of sequence) {
      await goToTab(page, path, samples, mountTimeoutMs)
    }

    const rows = buildScopeRows(samples)
    const { passed, failureReasons } = evaluateProfile(profile, samples)

    profiles.push({
      profile,
      mountTimeoutMs,
      passed,
      failureReasons,
      samples,
      rows,
    })
  }

  const finishedAtIso = new Date().toISOString()
  const ok = profiles.every((p) => p.passed)

  return {
    ok,
    startedAtIso,
    finishedAtIso,
    sequenceSeed: SEQUENCE_SEED,
    visitsPerTab,
    profiles,
  }
}

export function benchmarkResultToProfileReports(
  result: TabLoadingBenchmarkResult,
): ProfileReport[] {
  return result.profiles.map((p) => ({
    profile: p.profile,
    samples: p.samples,
    rows: p.rows,
  }))
}
