export function formatCurrency(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(iso: string, format = 'DD/MM/YYYY'): string {
  const [y, m, d] = iso.split('-')
  switch (format) {
    case 'MM/DD/YYYY':
      return `${m}/${d}/${y}`
    case 'YYYY-MM-DD':
      return `${y}-${m}-${d}`
    case 'DD/MM/YYYY':
    default:
      return `${d}/${m}/${y}`
  }
}

export function formatMonthLabel(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number)
  const date = new Date(y, m - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function currentMonthKey(): string {
  return new Date().toISOString().slice(0, 7)
}

export function shiftMonthKey(monthKey: string, delta: number): string {
  const [y, m] = monthKey.split('-').map(Number)
  const date = new Date(y, m - 1 + delta, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function debounce<T extends (...args: any[]) => void>(fn: T, wait = 300): T {
  let timeout: ReturnType<typeof setTimeout> | undefined
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), wait)
  }) as T
}

export function uid(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
