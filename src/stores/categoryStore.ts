import { defineStore } from 'pinia'
import type { Category } from '@/types'
import { categoryService } from '@/services/categoryService'
import { supabase } from '@/services/supabaseClient'

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [] as Category[],
    loading: false,
    error: '' as string,
    loaded: false,
  }),
  getters: {
    incomeCategories: (state) => state.categories.filter((c) => c.type === 'income'),
    expenseCategories: (state) => state.categories.filter((c) => c.type === 'expense'),
    byId: (state) => (id: string) => state.categories.find((c) => c.id === id),
  },
  actions: {
    async fetchAll() {
      this.loading = true
      this.error = ''
      try {
        this.categories = await categoryService.list()
        this.loaded = true
      } catch (e) {
        this.error = 'Failed to load categories.'
      } finally {
        this.loading = false
      }
    },
    async create(payload: Omit<Category, 'id'>) {
      const record = await categoryService.create(payload)
      this.categories.push(record)
      return record
    },
    async update(id: string, payload: Partial<Omit<Category, 'id'>>) {
      const record = await categoryService.update(id, payload)
      const idx = this.categories.findIndex((c) => c.id === id)
      if (idx !== -1) this.categories[idx] = record
      return record
    },
    /** Returns false (and does not delete) if the category is still referenced by transactions. */
    async remove(id: string): Promise<boolean> {
      const { count, error } = await supabase
        .from('transactions')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', id)

      if (error) throw error
      if ((count ?? 0) > 0) return false

      await categoryService.remove(id)
      this.categories = this.categories.filter((c) => c.id !== id)
      return true
    },
  },
})
