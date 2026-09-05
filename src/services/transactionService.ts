import type { Transaction } from '@/types'
import {
  fromTransactionRow,
  getCurrentUserId,
  supabase,
  toTransactionInsert,
  toTransactionUpdate,
  type TransactionRow,
} from './supabase'

export const transactionService = {
  async list(): Promise<Transaction[]> {
    const userId = await getCurrentUserId()
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data ?? []).map((row) => fromTransactionRow(row as TransactionRow))
  },

  async create(payload: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const userId = await getCurrentUserId()
    const { data, error } = await supabase
      .from('transactions')
      .insert(toTransactionInsert(payload, userId))
      .select('*')
      .single()

    if (error) throw error
    return fromTransactionRow(data as TransactionRow)
  },

  async update(id: string, payload: Partial<Omit<Transaction, 'id' | 'createdAt'>>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .update(toTransactionUpdate(payload))
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return fromTransactionRow(data as TransactionRow)
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) throw error
  },
}
