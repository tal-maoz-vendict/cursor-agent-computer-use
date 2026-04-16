export function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length
}

export function stdDev(values: number[]): number {
  if (values.length < 2) return 0
  const m = mean(values)
  const v = values.reduce((s, x) => s + (x - m) ** 2, 0) / (values.length - 1)
  return Math.sqrt(v)
}

export function scoreForMs(ms: number): 'Good' | 'Medium' | 'Low' | 'Fail' {
  if (ms < 3000) return 'Good'
  if (ms < 5000) return 'Medium'
  if (ms < 7000) return 'Low'
  return 'Fail'
}
