import { defineStore } from 'pinia'
import { useTransactionStore } from './transactionStore'
import { totalIncome, totalExpenses, balance, sumByCategory } from '@/utils/calculations'
import { currentMonthKey, shiftMonthKey } from '@/utils/format'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({}),
  getters: {
    currentMonthTransactions() {
      const transactionStore = useTransactionStore()
      const month = currentMonthKey()
      return transactionStore.transactions.filter((t) => t.date.startsWith(month))
    },
    previousMonthTransactions() {
      const transactionStore = useTransactionStore()
      const month = shiftMonthKey(currentMonthKey(), -1)
      return transactionStore.transactions.filter((t) => t.date.startsWith(month))
    },
    stats(): {
      balance: number
      income: number
      expenses: number
      savings: number
      prevBalance: number
      prevIncome: number
      prevExpenses: number
      prevSavings: number
    } {
      const current = this.currentMonthTransactions
      const previous = this.previousMonthTransactions

      const income = totalIncome(current)
      const expenses = totalExpenses(current)
      const bal = balance(current)

      const prevIncome = totalIncome(previous)
      const prevExpenses = totalExpenses(previous)
      const prevBalance = balance(previous)

      return {
        balance: bal,
        income,
        expenses,
        savings: bal,
        prevBalance,
        prevIncome,
        prevExpenses,
        prevSavings: prevBalance,
      }
    },
    expenseBreakdown(): { categoryId: string; amount: number }[] {
      const current = this.currentMonthTransactions.filter((t: any) => t.type === 'expense')
      const totals = sumByCategory(current)
      return Object.entries(totals)
        .map(([categoryId, amount]) => ({ categoryId, amount }))
        .sort((a, b) => b.amount - a.amount)
    },
    monthlyTrend(): { month: string; income: number; expenses: number }[] {
      const transactionStore = useTransactionStore()
      const months: string[] = []
      let key = currentMonthKey()
      for (let i = 0; i < 6; i++) {
        months.unshift(key)
        key = shiftMonthKey(key, -1)
      }
      return months.map((m) => {
        const txns = transactionStore.transactions.filter((t) => t.date.startsWith(m))
        return { month: m, income: totalIncome(txns), expenses: totalExpenses(txns) }
      })
    },
  },
})
