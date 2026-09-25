export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  date: string // ISO date, e.g. 2026-08-24
  description: string
  type: TransactionType
  categoryId: string
  amount: number
  paymentMethod?: string
  note?: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  type: TransactionType
  icon?: string
  color?: string
}

export interface Budget {
  id: string
  categoryId: string
  amount: number
  month: string // 'YYYY-MM'
}

export interface Toast {
  id: string
  message: string
  variant: 'success' | 'error' | 'info'
}

export type DateRangeKey =
  | 'this-month'
  | 'last-month'
  | 'last-3-months'
  | 'last-6-months'
  | 'this-year'
  | 'custom'

export interface DateRange {
  start: string
  end: string
}

export interface TransactionFilters {
  search: string
  type: TransactionType | 'all'
  categoryId: string | 'all'
  dateFrom: string | null
  dateTo: string | null
  sortBy: 'date' | 'amount' | 'description'
  sortDir: 'asc' | 'desc'
}

export type Theme = 'light' | 'dark'

export interface AppSettings {
  profileName: string
  profileEmail: string
  currency: string
  dateFormat: string
  theme: Theme
  notifications: {
    budgetAlerts: boolean
    weeklySummary: boolean
    largeTransactions: boolean
  }
}

export type UserRole = 'user' | 'admin'

export interface UserRecord {
  id: string
  fullName: string
  role: UserRole
  isActive: boolean
  createdAt: string
  updatedAt: string
  email: string
}

export interface ActivityLog {
  id: string
  userId: string
  action: string
  entityType: string
  entityId: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  userFullName: string
  userEmail: string
}
