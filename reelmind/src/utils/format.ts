export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export function formatDate(iso: string, locale = 'pl'): string {
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(
    new Date(iso),
  )
}

export function formatRating(value: number): string {
  return value.toFixed(1)
}

export function getScoreColor(score: number): string {
  if (score >= 0.9) return '#22c55e'
  if (score >= 0.7) return '#eab308'
  return '#ef4444'
}

export function getScorePercent(score: number): string {
  return `${Math.round(score * 100)}%`
}

export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '…' : str
}
