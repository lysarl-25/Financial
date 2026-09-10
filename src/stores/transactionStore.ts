import { defineStore } from 'pinia'
import type { Transaction, TransactionFilters } from '@/types'
import { transactionService } from '@/services/transactionService'
import { logActivity } from '@/services/supabase'
import { totalIncome, totalExpenses, balance, sumByCategory } from '@/utils/calculations'

const defaultFilters: TransactionFilters = {
  search: '',
  type: 'all',
  categoryId: 'all',
  dateFrom: null,
  dateTo: null,
  sortBy: 'date',
  sortDir: 'desc',
}

export const useTransactionStore = defineStore('transaction', {
  state: () => ({
    transactions: [] as Transaction[],
    loading: false,
    error: '' as string,
    loaded: false,
    filters: { ...defaultFilters } as TransactionFilters,
  }),
  getters: {
    filtered(state): Transaction[] {
      let list = [...state.transactions]
      const f = state.filters

      if (f.search.trim()) {
        const q = f.search.trim().toLowerCase()
        list = list.filter(
          (t) => t.description.toLowerCase().includes(q) || (t.note ?? '').toLowerCase().includes(q),
        )
      }
      if (f.type !== 'all') list = list.filter((t) => t.type === f.type)
      if (f.categoryId !== 'all') list = list.filter((t) => t.categoryId === f.categoryId)
      if (f.dateFrom) list = list.filter((t) => t.date >= f.dateFrom!)
      if (f.dateTo) list = list.filter((t) => t.date <= f.dateTo!)

      list.sort((a, b) => {
        let cmp = 0
        if (f.sortBy === 'date') cmp = a.date.localeCompare(b.date)
        else if (f.sortBy === 'amount') cmp = a.amount - b.amount
        else cmp = a.description.localeCompare(b.description)
        return f.sortDir === 'asc' ? cmp : -cmp
      })

      return list
    },
    totalIncome: (state) => totalIncome(state.transactions),
    totalExpenses: (state) => totalExpenses(state.transactions),
    balance: (state) => balance(state.transactions),
    categoryTotals: (state) => sumByCategory(state.transactions),
    incomeTransactions: (state) => state.transactions.filter((t) => t.type === 'income'),
    expenseTransactions: (state) => state.transactions.filter((t) => t.type === 'expense'),
    recent: (state) =>
      [...state.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6),
  },
  actions: {
    async fetchAll() {
      this.loading = true
      this.error = ''
      try {
        this.transactions = await transactionService.list()
        this.loaded = true
      } catch (e) {
        this.error = 'Failed to load transactions.'
      } finally {
        this.loading = false
      }
    },
    async create(payload: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) {
      const record = await transactionService.create(payload)
      this.transactions = [record, ...this.transactions]
      await logActivity({
        action: 'transaction.create',
        entityType: 'transaction',
        entityId: record.id,
        metadata: { description: record.description, amount: record.amount, type: record.type },
      })
      return record
    },
    async update(id: string, payload: Partial<Omit<Transaction, 'id' | 'createdAt'>>) {
      const record = await transactionService.update(id, payload)
      const idx = this.transactions.findIndex((t) => t.id === id)
      if (idx !== -1) this.transactions[idx] = record
      await logActivity({
        action: 'transaction.update',
        entityType: 'transaction',
        entityId: id,
        metadata: { description: record.description, amount: record.amount },
      })
      return record
    },
    async remove(id: string) {
      const target = this.transactions.find((t) => t.id === id)
      await transactionService.remove(id)
      this.transactions = this.transactions.filter((t) => t.id !== id)
      await logActivity({
        action: 'transaction.delete',
        entityType: 'transaction',
        entityId: id,
        metadata: target ? { description: target.description } : undefined,
      })
    },
    setFilters(partial: Partial<TransactionFilters>) {
      this.filters = { ...this.filters, ...partial }
    },
    resetFilters() {
      this.filters = { ...defaultFilters }
    },
  },
})
