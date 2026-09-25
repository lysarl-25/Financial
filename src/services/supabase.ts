import type { User } from '@supabase/supabase-js'
import type { ActivityLog, AppSettings, Budget, Category, Transaction, UserRecord, UserRole } from '@/types'
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

export interface UserRow {
  id: string
  email: string | null
  full_name: string | null
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ActivityLogRow {
  id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
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

// ---- Role & activity logging -------------------------------------------------

export function fromUserRow(row: UserRow, email = ''): UserRecord {
  return {
    id: row.id,
    fullName: row.full_name ?? '',
    role: row.role,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    email,
  }
}

/** Reads the current user's role from public.users, falling back to 'user'. */
export async function fetchMyRole(): Promise<UserRole> {
  const user = (await supabase.auth.getUser()).data.user
  if (!user) return 'user'
  const { data, error } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle<{ role: UserRole }>()
  if (error || !data) return 'user'
  return data.role
}

/** Whether the current user is active (missing row counts as active). */
export async function isCurrentUserActive(): Promise<boolean> {
  const user = (await supabase.auth.getUser()).data.user
  if (!user) return false
  const { data } = await supabase.from('users').select('is_active').eq('id', user.id).maybeSingle<{ is_active: boolean }>()
  return data?.is_active ?? true
}

/** Keeps the users.email copy in sync with auth.users on each session load. */
export async function syncUserEmail(user: User) {
  const email = user.email ?? ''
  if (!email) return
  const { data, error } = await supabase.from('users').select('id').eq('id', user.id).maybeSingle()
  if (error) return
  if (!data) {
    await supabase.from('users').insert({ id: user.id, email, full_name: user.user_metadata?.full_name?.trim() || null })
  } else if (user.email) {
    await supabase.from('users').update({ email, full_name: user.user_metadata?.full_name?.trim() || null }).eq('id', user.id)
  }
}

/** Fire-and-forget activity log entry for the current user. Never throws. */
export async function logActivity(input: {
  action: string
  entityType?: string
  entityId?: string
  metadata?: Record<string, unknown>
}) {
  const user = (await supabase.auth.getUser()).data.user
  if (!user) return
  try {
    await supabase.from('user_activity_log').insert({
      user_id: user.id,
      action: input.action,
      entity_type: input.entityType ?? 'app',
      entity_id: input.entityId ?? null,
      metadata: input.metadata ?? null,
    })
  } catch {
    // Activity logging must never break the primary operation.
  }
}

/** Admin: list all users. */
export async function listUsers(): Promise<UserRecord[]> {
  const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row: UserRow) => fromUserRow(row, row.email ?? ''))
}

/** Admin: update a user's role and/or active status. */
export async function updateUser(id: string, payload: { role?: UserRole; is_active?: boolean }) {
  const update: { role?: UserRole; is_active?: boolean } = {}
  if (payload.role !== undefined) update.role = payload.role
  if (payload.is_active !== undefined) update.is_active = payload.is_active
  const { data, error } = await supabase.from('users').update(update).eq('id', id).select('*').single()
  if (error) throw error
  return fromUserRow(data, (data as UserRow).email ?? '')
}

/** Admin: list activity entries joined with user names/emails. */
export async function listActivity(limit = 200): Promise<ActivityLog[]> {
  const { data: rows, error } = await supabase
    .from('user_activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  if (!rows || rows.length === 0) return []

  const userIds = [...new Set(rows.map((r: ActivityLogRow) => r.user_id))]
  const { data: userRows } = await supabase
    .from('users')
    .select('id, full_name, email')
    .in('id', userIds)

  const userMap = new Map<string, { full_name: string | null; email: string | null }>()
  for (const u of userRows ?? []) {
    userMap.set(u.id, { full_name: u.full_name, email: u.email })
  }

  return rows.map((row) => {
    const user = userMap.get(row.user_id)
    return {
      id: row.id,
      userId: row.user_id,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      metadata: row.metadata,
      createdAt: row.created_at,
      userFullName: user?.full_name ?? '',
      userEmail: user?.email ?? '',
    }
  })
}

/** Admin: permanently delete a user from auth.users (cascades to all public tables). */
export async function deleteUser(userId: string): Promise<void> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
  const { data: sessionData } = await supabase.auth.getSession()
  const accessToken = sessionData.session?.access_token

  const { data, error: fnError } = await supabase.functions.invoke<{ success?: boolean; emailReusable?: boolean; error?: string }>('delete-user', {
    body: { userId },
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  })

  if (fnError) throw fnError
  if (data?.error) throw new Error(data.error)
  if (!data?.success) throw new Error('Failed to delete user')
  if (data.emailReusable === false) {
    throw new Error('User was deleted, but Supabase still reserves this email. Enable email reuse in your Auth settings.')
  }
}
