import { defineStore } from 'pinia'
import type { Budget } from '@/types'
import { budgetService } from '@/services/budgetService'
import { logActivity } from '@/services/supabase'
import { useTransactionStore } from './transactionStore'
import { currentMonthKey } from '@/utils/format'
import { round2 } from '@/utils/calculations'

export interface BudgetProgress extends Budget {
  spent: number
  remaining: number
  percentUsed: number
  status: 'ok' | 'warning' | 'over'
}

export const useBudgetStore = defineStore('budget', {
  state: () => ({
    budgets: [] as Budget[],
    loading: false,
    error: '' as string,
    loaded: false,
    selectedMonth: currentMonthKey(),
  }),
  getters: {
    forSelectedMonth: (state) => state.budgets.filter((b) => b.month === state.selectedMonth),
    /** Budgets for the selected month enriched with live spending data. */
    progress(state): BudgetProgress[] {
      const transactionStore = useTransactionStore()
      const monthBudgets = state.budgets.filter((b) => b.month === state.selectedMonth)
      return monthBudgets.map((b) => {
        const spent = round2(
          transactionStore.transactions
            .filter(
              (t) => t.type === 'expense' && t.categoryId === b.categoryId && t.date.startsWith(state.selectedMonth),
            )
            .reduce((sum, t) => sum + t.amount, 0),
        )
        const remaining = round2(b.amount - spent)
        const percentUsed = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0
        let status: BudgetProgress['status'] = 'ok'
        if (percentUsed >= 100) status = 'over'
        else if (percentUsed >= 80) status = 'warning'
        return { ...b, spent, remaining, percentUsed, status }
      })
    },
  },
  actions: {
    async fetchAll() {
      this.loading = true
      this.error = ''
      try {
        this.budgets = await budgetService.list()
        this.loaded = true
      } catch (e) {
        this.error = 'Failed to load budgets.'
      } finally {
        this.loading = false
      }
    },
    async create(payload: Omit<Budget, 'id'>) {
      const record = await budgetService.create(payload)
      this.budgets.push(record)
      await logActivity({
        action: 'budget.create',
        entityType: 'budget',
        entityId: record.id,
        metadata: { amount: record.amount, month: record.month },
      })
      return record
    },
    async update(id: string, payload: Partial<Omit<Budget, 'id'>>) {
      const record = await budgetService.update(id, payload)
      const idx = this.budgets.findIndex((b) => b.id === id)
      if (idx !== -1) this.budgets[idx] = record
      await logActivity({
        action: 'budget.update',
        entityType: 'budget',
        entityId: id,
        metadata: { amount: record.amount, month: record.month },
      })
      return record
    },
    async remove(id: string) {
      await budgetService.remove(id)
      this.budgets = this.budgets.filter((b) => b.id !== id)
      await logActivity({ action: 'budget.delete', entityType: 'budget', entityId: id })
    },
    setSelectedMonth(month: string) {
      this.selectedMonth = month
    },
  },
})
