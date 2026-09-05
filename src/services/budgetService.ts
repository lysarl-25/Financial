import type { Budget } from '@/types'
import {
  fromBudgetRow,
  getCurrentUserId,
  supabase,
  toBudgetInsert,
  toBudgetUpdate,
  type BudgetRow,
} from './supabase'

export const budgetService = {
  async list(): Promise<Budget[]> {
    const userId = await getCurrentUserId()
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .order('month', { ascending: false })
    if (error) throw error
    return (data ?? []).map((row) => fromBudgetRow(row as BudgetRow))
  },

  async create(payload: Omit<Budget, 'id'>): Promise<Budget> {
    const userId = await getCurrentUserId()
    const { data, error } = await supabase
      .from('budgets')
      .insert(toBudgetInsert(payload, userId))
      .select('*')
      .single()

    if (error) throw error
    return fromBudgetRow(data as BudgetRow)
  },

  async update(id: string, payload: Partial<Omit<Budget, 'id'>>): Promise<Budget> {
    const { data, error } = await supabase
      .from('budgets')
      .update(toBudgetUpdate(payload))
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return fromBudgetRow(data as BudgetRow)
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('budgets').delete().eq('id', id)
    if (error) throw error
  },
}
