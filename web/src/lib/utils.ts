export function formatScore(score: number, unit = '%'): string {
  return `${score.toFixed(0)}${unit}`
}

export function formatLatency(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

export function severityToColor(severity: string): string {
  switch (severity) {
    case 'critical': return 'var(--color-error)'
    case 'high': return '#e8a55a'
    case 'medium': return 'var(--color-accent-amber)'
    case 'low': return 'var(--color-accent-teal)'
    default: return 'var(--color-muted)'
  }
}

export function scoreToVerdict(score: number): 'high' | 'medium' | 'low' {
  if (score >= 70) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}

export function groupBy<T>(items: T[], key: keyof T): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const k = String(item[key])
    if (!acc[k]) acc[k] = []
    acc[k].push(item)
    return acc
  }, {})
}

export function sortByKey<T>(items: T[], key: keyof T, dir: 'asc' | 'desc' = 'desc'): T[] {
  return [...items].sort((a, b) => {
    const va = a[key]
    const vb = b[key]
    if (va < vb) return dir === 'asc' ? -1 : 1
    if (va > vb) return dir === 'asc' ? 1 : -1
    return 0
  })
}

export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max)
}

export function percentage(part: number, total: number): number {
  if (total === 0) return 0
  return Math.round((part / total) * 100)
}
