<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import StatCard from '@/components/dashboard/StatCard.vue'
import IncomeExpenseChart from '@/components/dashboard/IncomeExpenseChart.vue'
import ExpenseChart from '@/components/dashboard/ExpenseChart.vue'
import SavingsChart from '@/components/dashboard/SavingsChart.vue'
import RecentTransactions from '@/components/dashboard/RecentTransactions.vue'
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton.vue'
import { useDashboardStore } from '@/stores/dashboardStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { useBudgetStore } from '@/stores/budgetStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { formatChange } from '@/utils/calculations'
import { formatCurrency } from '@/utils/format'
import { useSettingsStore } from '@/stores/settingsStore'

const dashboardStore = useDashboardStore()
const transactionStore = useTransactionStore()
const budgetStore = useBudgetStore()
const categoryStore = useCategoryStore()
const settingsStore = useSettingsStore()

const stats = computed(() => dashboardStore.stats)
const currencyFmt = (n: number) => formatCurrency(n, settingsStore.currency)

const balanceChangeLabel = computed(() => formatChange(stats.value.balance, stats.value.prevBalance, currencyFmt))
const incomeChangeLabel = computed(() => formatChange(stats.value.income, stats.value.prevIncome, currencyFmt))
const expensesChangeLabel = computed(() => formatChange(stats.value.expenses, stats.value.prevExpenses, currencyFmt))
const savingsChangeLabel = computed(() => formatChange(stats.value.savings, stats.value.prevSavings, currencyFmt))

const topBudgets = computed(() => [...budgetStore.progress].sort((a, b) => b.percentUsed - a.percentUsed).slice(0, 3))

function categoryName(categoryId: string) {
  return categoryStore.byId(categoryId)?.name || categoryId
}
</script>

<template>
  <div v-if="transactionStore.loading && !transactionStore.loaded">
    <DashboardSkeleton />
  </div>
  <div v-else class="space-y-6">
    <div class="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4">
      <StatCard label="Total Balance" :value="stats.balance" icon="balance" :change-label="balanceChangeLabel" />
      <StatCard label="Total Income" :value="stats.income" icon="income" :change-label="incomeChangeLabel" />
      <StatCard label="Total Expenses" :value="stats.expenses" icon="expenses" :change-label="expensesChangeLabel" />
      <StatCard label="Savings" :value="stats.savings" icon="savings" :change-label="savingsChangeLabel" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
      <div class="card p-5 2xl:col-span-2">
        <h3 class="font-display text-base font-semibold text-ink-900 dark:text-ink-50 mb-4">Income vs Expenses</h3>
        <IncomeExpenseChart :data="dashboardStore.monthlyTrend" />
      </div>
      <div class="card p-5">
        <h3 class="font-display text-base font-semibold text-ink-900 dark:text-ink-50 mb-4">Expense Breakdown</h3>
        <ExpenseChart :data="dashboardStore.expenseBreakdown" />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
      <div class="2xl:col-span-2">
        <RecentTransactions />
      </div>
      <div class="card p-5">
        <h3 class="font-display text-base font-semibold text-ink-900 dark:text-ink-50 mb-4">Monthly Savings Trend</h3>
        <SavingsChart :data="dashboardStore.monthlyTrend" />
      </div>
    </div>

    <div class="card p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-display text-base font-semibold text-ink-900 dark:text-ink-50">Budget Progress</h3>
        <RouterLink to="/budgets" class="text-sm font-medium text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white">
          View all
        </RouterLink>
      </div>
      <p v-if="!topBudgets.length" class="text-sm text-ink-500 py-6 text-center">No budgets set for this month yet.</p>
      <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div v-for="b in topBudgets" :key="b.id">
          <div class="flex justify-between text-sm mb-1.5">
            <span class="text-ink-600 dark:text-ink-300">{{ categoryName(b.categoryId) }}</span>
            <span
              class="font-mono font-medium"
              :class="b.status === 'over' ? 'text-expense' : b.status === 'warning' ? 'text-amber-600' : 'text-income'"
            >
              {{ b.percentUsed }}%
            </span>
          </div>
          <div class="h-2 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
            <div
              class="h-full rounded-full"
              :class="b.status === 'over' ? 'bg-expense' : b.status === 'warning' ? 'bg-amber-500' : 'bg-income'"
              :style="{ width: Math.min(b.percentUsed, 100) + '%' }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
