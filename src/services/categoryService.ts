import type { Category } from '@/types'
import {
  fromCategoryRow,
  getCurrentUserId,
  supabase,
  toCategoryInsert,
  toCategoryUpdate,
  type CategoryRow,
} from './supabase'

export const categoryService = {
  async list(): Promise<Category[]> {
    const userId = await getCurrentUserId()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })
    if (error) throw error
    return (data ?? []).map((row) => fromCategoryRow(row as CategoryRow))
  },

  async create(payload: Omit<Category, 'id'>): Promise<Category> {
    const userId = await getCurrentUserId()
    const { data, error } = await supabase
      .from('categories')
      .insert(toCategoryInsert(payload, userId))
      .select('*')
      .single()

    if (error) throw error
    return fromCategoryRow(data as CategoryRow)
  },

  async update(id: string, payload: Partial<Omit<Category, 'id'>>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(toCategoryUpdate(payload))
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return fromCategoryRow(data as CategoryRow)
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
  },
}
