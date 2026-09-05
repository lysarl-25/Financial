import type { DateRangeKey, DateRange } from '@/types'

/** Resolves a named date-range key into concrete start/end ISO dates. */
export function resolveDateRange(key: DateRangeKey, custom?: DateRange): DateRange {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()

  const toISO = (d: Date) => d.toISOString().slice(0, 10)

  switch (key) {
    case 'this-month':
      return { start: toISO(new Date(y, m, 1)), end: toISO(new Date(y, m + 1, 0)) }
    case 'last-month':
      return { start: toISO(new Date(y, m - 1, 1)), end: toISO(new Date(y, m, 0)) }
    case 'last-3-months':
      return { start: toISO(new Date(y, m - 2, 1)), end: toISO(new Date(y, m + 1, 0)) }
    case 'last-6-months':
      return { start: toISO(new Date(y, m - 5, 1)), end: toISO(new Date(y, m + 1, 0)) }
    case 'this-year':
      return { start: toISO(new Date(y, 0, 1)), end: toISO(new Date(y, 11, 31)) }
    case 'custom':
      return custom ?? { start: toISO(new Date(y, m, 1)), end: toISO(new Date(y, m + 1, 0)) }
    default:
      return { start: toISO(new Date(y, m, 1)), end: toISO(new Date(y, m + 1, 0)) }
  }
}

export const dateRangeOptions: { key: DateRangeKey; label: string }[] = [
  { key: 'this-month', label: 'This Month' },
  { key: 'last-month', label: 'Last Month' },
  { key: 'last-3-months', label: 'Last 3 Months' },
  { key: 'last-6-months', label: 'Last 6 Months' },
  { key: 'this-year', label: 'This Year' },
  { key: 'custom', label: 'Custom Range' },
]
