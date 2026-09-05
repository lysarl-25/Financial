import type { User } from '@supabase/supabase-js'
import type { AppSettings, Budget, Category, Transaction } from '@/types'
import { supabase } from './supabaseClient'

// Keep the service module as the shared import surface for existing callers.
export { supabase } from './supabaseClient'

export const defaultNotifications: AppSettings['notifications'] = {
  budgetAlerts: true,
  weeklySummary: true,
  largeTransactions: false,
}

export const defaultSettings = {
  profileName: '',
  profileEmail: '',
  currency: 'USD',
  dateFormat: 'DD/MM/YYYY',
  theme: 'light' as const,
  notifications: { ...defaultNotifications },
}

export interface TransactionRow {
  id: string
  user_id: string
  date: string
  description: string
  type: Transaction['type']
  category_id: string
  amount: number | string
  payment_method: string | null
  note: string | null
  created_at: string
  updated_at: string
}

export interface CategoryRow {
  id: string
  user_id: string
  name: string
  type: Category['type']
  icon: string | null
  color: string | null
  created_at: string
}

export interface BudgetRow {
  id: string
  user_id: string
  category_id: string
  amount: number | string
  month: string
  created_at: string
}

export interface ProfileRow {
  id: string
  profile_name: string | null
  currency: string | null
  date_format: string | null
  theme: AppSettings['theme'] | null
  notifications: AppSettings['notifications'] | null
}

const amount = (value: number | string) => Number(value)

export function fromTransactionRow(row: TransactionRow): Transaction {
  return {
    id: row.id,
    date: row.date,
    description: row.description,
    type: row.type,
    categoryId: row.category_id,
    amount: amount(row.amount),
    paymentMethod: row.payment_method ?? undefined,
    note: row.note ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toTransactionInsert(payload: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>, userId: string) {
  return {
    user_id: userId,
    date: payload.date,
    description: payload.description,
    type: payload.type,
    category_id: payload.categoryId,
    amount: payload.amount,
    payment_method: payload.paymentMethod ?? null,
    note: payload.note ?? null,
  }
}

export function toTransactionUpdate(payload: Partial<Omit<Transaction, 'id' | 'createdAt'>>) {
  const update: Partial<Omit<TransactionRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>> = {}
  if (payload.date !== undefined) update.date = payload.date
  if (payload.description !== undefined) update.description = payload.description
  if (payload.type !== undefined) update.type = payload.type
  if (payload.categoryId !== undefined) update.category_id = payload.categoryId
  if (payload.amount !== undefined) update.amount = payload.amount
  if (payload.paymentMethod !== undefined) update.payment_method = payload.paymentMethod
  if (payload.note !== undefined) update.note = payload.note ?? null
  return update
}

export function fromCategoryRow(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    icon: row.icon ?? undefined,
    color: row.color ?? undefined,
  }
}

export function toCategoryInsert(payload: Omit<Category, 'id'>, userId: string) {
  return {
    user_id: userId,
    name: payload.name,
    type: payload.type,
    icon: payload.icon ?? null,
    color: payload.color ?? null,
  }
}

export function toCategoryUpdate(payload: Partial<Omit<Category, 'id'>>) {
  const update: Partial<Omit<CategoryRow, 'id' | 'user_id' | 'created_at'>> = {}
  if (payload.name !== undefined) update.name = payload.name
  if (payload.type !== undefined) update.type = payload.type
  if (payload.icon !== undefined) update.icon = payload.icon ?? null
  if (payload.color !== undefined) update.color = payload.color ?? null
  return update
}

export function fromBudgetRow(row: BudgetRow): Budget {
  return {
    id: row.id,
    categoryId: row.category_id,
    amount: amount(row.amount),
    month: row.month,
  }
}

export function toBudgetInsert(payload: Omit<Budget, 'id'>, userId: string) {
  return {
    user_id: userId,
    category_id: payload.categoryId,
    amount: payload.amount,
    month: payload.month,
  }
}

export function toBudgetUpdate(payload: Partial<Omit<Budget, 'id'>>) {
  const update: Partial<Omit<BudgetRow, 'id' | 'user_id' | 'created_at'>> = {}
  if (payload.categoryId !== undefined) update.category_id = payload.categoryId
  if (payload.amount !== undefined) update.amount = payload.amount
  if (payload.month !== undefined) update.month = payload.month
  return update
}

export function fromProfileRow(row: ProfileRow, email = ''): AppSettings {
  return {
    profileName: row.profile_name ?? '',
    profileEmail: email,
    currency: row.currency ?? defaultSettings.currency,
    dateFormat: row.date_format ?? defaultSettings.dateFormat,
    theme: row.theme ?? defaultSettings.theme,
    notifications: row.notifications ?? { ...defaultNotifications },
  }
}

export function toProfileUpsert(payload: Partial<AppSettings>) {
  return {
    profile_name: payload.profileName,
    currency: payload.currency,
    date_format: payload.dateFormat,
    theme: payload.theme,
    notifications: payload.notifications,
  }
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!data.user) throw new Error('You must be signed in to use this app.')
  return data.user
}

export async function getCurrentUserId() {
  return (await getCurrentUser()).id
}

export async function getCurrentUserEmail() {
  return (await getCurrentUser()).email ?? ''
}

export async function ensureDefaultProfileAndCategories(user: User, defaultCategoryRows: Omit<Category, 'id'>[]) {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) throw profileError
  if (!profile) {
    const fallbackName = user.user_metadata?.full_name?.trim() || user.email?.split('@')[0] || 'User'
    const { error: insertProfileError } = await supabase.from('profiles').insert({
      id: user.id,
      profile_name: fallbackName,
      currency: defaultSettings.currency,
      date_format: defaultSettings.dateFormat,
      theme: defaultSettings.theme,
      notifications: defaultNotifications,
    })
    if (insertProfileError) throw insertProfileError
  }

  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)

  if (categoriesError) throw categoriesError
  if (categories && categories.length > 0) return

  const { error: insertCategoriesError } = await supabase.from('categories').insert(
    defaultCategoryRows.map((category) => ({
      user_id: user.id,
      name: category.name,
      type: category.type,
      icon: category.icon ?? null,
      color: category.color ?? null,
    })),
  )

  if (insertCategoriesError) throw insertCategoriesError
}
