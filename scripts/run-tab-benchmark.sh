#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPORT_NAME="tabs-loading-report-$(date -u +%Y-%m-%dT%H-%M-%SZ).md"
REPORT_PATH="${ROOT}/benchmarks-output/reports/${REPORT_NAME}"
export TAB_BENCHMARK_REPORT_MD="${REPORT_PATH}"

mkdir -p "$(dirname "${REPORT_PATH}")"

PW="${ROOT}/node_modules/.bin/playwright"
if [[ ! -x "${PW}" ]]; then
  echo "Playwright CLI not found at ${PW}. Run npm install." >&2
  exit 1
fi

echo "Report will be written to: ${REPORT_PATH}"
"${PW}" test benchmarks/tabs-loading-normal-and-throttle.spec.ts --project=chromium "$@"
