import type { Transaction } from '@/types'

/** Sum of all income transactions in a list */
export function totalIncome(transactions: Transaction[]): number {
  return round2(transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0))
}

/** Sum of all expense transactions in a list */
export function totalExpenses(transactions: Transaction[]): number {
  return round2(transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0))
}

/** Net balance = income - expenses */
export function balance(transactions: Transaction[]): number {
  return round2(totalIncome(transactions) - totalExpenses(transactions))
}

/** Savings is defined the same way as balance for a given period */
export function savings(transactions: Transaction[]): number {
  return balance(transactions)
}

/**
 * Percentage change between current and previous values.
 * When previous is 0, we can't compute a ratio, so we surface the raw
 * current value instead of an undefined/misleading percentage.
 */
export function percentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? current : 0
  }
  return round2(((current - previous) / previous) * 100)
}

/**
 * Formats a percentage-change value for display.
 * Falls back to a raw "+amount" when there's no previous baseline.
 */
export function formatChange(current: number, previous: number, currencyFormatter?: (n: number) => string): string {
  if (previous === 0) {
    if (current === 0) return '0%'
    const formatted = currencyFormatter ? currencyFormatter(current) : String(current)
    return `+${formatted}`
  }
  const pct = percentageChange(current, previous)
  const sign = pct > 0 ? '+' : ''
  return `${sign}${pct.toFixed(1)}%`
}

export function sumByCategory(transactions: Transaction[]): Record<string, number> {
  const result: Record<string, number> = {}
  for (const t of transactions) {
    result[t.categoryId] = round2((result[t.categoryId] || 0) + t.amount)
  }
  return result
}

export function groupByMonth(transactions: Transaction[]): Record<string, Transaction[]> {
  const result: Record<string, Transaction[]> = {}
  for (const t of transactions) {
    const key = t.date.slice(0, 7) // YYYY-MM
    if (!result[key]) result[key] = []
    result[key].push(t)
  }
  return result
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}
