<script setup lang="ts">
import { ref, computed } from 'vue'
import { Bar, Line, Doughnut } from 'vue-chartjs'
import { Printer, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import '@/utils/chartSetup'
import Select from '@/components/common/Select.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { useTransactionStore } from '@/stores/transactionStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { resolveDateRange, dateRangeOptions } from '@/utils/dateRange'
import { totalIncome, totalExpenses, balance, sumByCategory, groupByMonth, round2 } from '@/utils/calculations'
import { formatCurrency, formatMonthLabel, formatDate } from '@/utils/format'
import type { DateRangeKey, Transaction } from '@/types'

const transactionStore = useTransactionStore()
const categoryStore = useCategoryStore()
const settingsStore = useSettingsStore()

const rangeKey = ref<DateRangeKey>('last-6-months')
const customStart = ref('')
const customEnd = ref('')

const range = computed(() =>
  resolveDateRange(rangeKey.value, { start: customStart.value, end: customEnd.value }),
)

const filteredTransactions = computed(() =>
  transactionStore.transactions.filter((t) => t.date >= range.value.start && t.date <= range.value.end),
)

const income = computed(() => totalIncome(filteredTransactions.value))
const expenses = computed(() => totalExpenses(filteredTransactions.value))
const netBalance = computed(() => balance(filteredTransactions.value))
const netSavings = computed(() => netBalance.value)

const rangeOptionsForSelect = dateRangeOptions.map((o) => ({ value: o.key, label: o.label }))

const monthlyBreakdown = computed(() => {
  const grouped = groupByMonth(filteredTransactions.value)
  return Object.keys(grouped)
    .sort()
    .map((month) => ({
      month,
      income: totalIncome(grouped[month]),
      expenses: totalExpenses(grouped[month]),
    }))
})

const trendChartData = computed(() => ({
  labels: monthlyBreakdown.value.map((m) => formatMonthLabel(m.month)),
  datasets: [
    { label: 'Income', data: monthlyBreakdown.value.map((m) => m.income), backgroundColor: '#0f9d70', borderRadius: 6, maxBarThickness: 26 },
    { label: 'Expenses', data: monthlyBreakdown.value.map((m) => m.expenses), backgroundColor: '#e0603f', borderRadius: 6, maxBarThickness: 26 },
  ],
}))

const cashFlowData = computed(() => ({
  labels: monthlyBreakdown.value.map((m) => formatMonthLabel(m.month)),
  datasets: [
    {
      label: 'Net Cash Flow',
      data: monthlyBreakdown.value.map((m) => m.income - m.expenses),
      borderColor: '#2e5b54',
      backgroundColor: 'rgba(46,91,84,0.12)',
      fill: true,
      tension: 0.35,
      pointBackgroundColor: '#2e5b54',
    },
  ],
}))

const expenseByCategory = computed(() => {
  const totals = sumByCategory(filteredTransactions.value.filter((t) => t.type === 'expense'))
  return Object.entries(totals)
    .map(([categoryId, amount]) => ({ categoryId, amount, name: categoryStore.byId(categoryId)?.name || categoryId, color: categoryStore.byId(categoryId)?.color || '#999' }))
    .sort((a, b) => b.amount - a.amount)
})

const incomeByCategory = computed(() => {
  const totals = sumByCategory(filteredTransactions.value.filter((t) => t.type === 'income'))
  return Object.entries(totals)
    .map(([categoryId, amount]) => ({ categoryId, amount, name: categoryStore.byId(categoryId)?.name || categoryId, color: categoryStore.byId(categoryId)?.color || '#999' }))
    .sort((a, b) => b.amount - a.amount)
})

const expenseDoughnutData = computed(() => ({
  labels: expenseByCategory.value.map((c) => c.name),
  datasets: [{ data: expenseByCategory.value.map((c) => c.amount), backgroundColor: expenseByCategory.value.map((c) => c.color), borderWidth: 0 }],
}))

const incomeDoughnutData = computed(() => ({
  labels: incomeByCategory.value.map((c) => c.name),
  datasets: [{ data: incomeByCategory.value.map((c) => c.amount), backgroundColor: incomeByCategory.value.map((c) => c.color), borderWidth: 0 }],
}))

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' as const, labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true } } },
  scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(148,163,184,0.15)' } } },
}
const lineOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(148,163,184,0.15)' } } } }
const doughnutOptions = { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom' as const, labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true, font: { size: 11 } } } } }

const reportType = ref<'income' | 'expense'>('income')
const viewMode = ref<'year' | 'month'>('year')
const selectedYear = ref(String(new Date().getFullYear()))
const selectedMonthNum = ref(String(new Date().getMonth() + 1).padStart(2, '0'))

const typeToggleOptions = [
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expenses' },
] as const
const viewToggleOptions = [
  { value: 'year', label: 'Year' },
  { value: 'month', label: 'Month' },
] as const

const availableYears = computed(() => {
  const years = new Set<number>([new Date().getFullYear(), Number(selectedYear.value)])
  for (const t of transactionStore.transactions) years.add(Number(t.date.slice(0, 4)))
  return Array.from(years).sort((a, b) => b - a)
})

const yearOptions = computed(() => availableYears.value.map((y) => ({ value: String(y), label: String(y) })))

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1).padStart(2, '0'),
  label: new Date(2000, i, 1).toLocaleDateString('en-US', { month: 'long' }),
}))

const selectedMonthKey = computed(() => `${selectedYear.value}-${selectedMonthNum.value}`)

const reportTransactions = computed(() => transactionStore.transactions.filter((t) => t.type === reportType.value))

const reportTypeLabel = computed(() => (reportType.value === 'income' ? 'Income' : 'Expenses'))

const reportPeriodLabel = computed(() =>
  viewMode.value === 'year' ? `Year · ${selectedYear.value}` : `Month · ${formatMonthLabel(selectedMonthKey.value)}`,
)

const yearReportRows = computed(() => {
  const y = Number(selectedYear.value)
  return Array.from({ length: 12 }, (_, i) => {
    const monthKey = `${y}-${String(i + 1).padStart(2, '0')}`
    const tx = reportTransactions.value.filter((t) => t.date.slice(0, 7) === monthKey)
    return {
      monthKey,
      label: formatMonthLabel(monthKey),
      count: tx.length,
      total: round2(tx.reduce((s, t) => s + t.amount, 0)),
    }
  })
})

const yearCount = computed(() => yearReportRows.value.reduce((s, r) => s + r.count, 0))
const yearTotal = computed(() => yearReportRows.value.reduce((s, r) => s + r.total, 0))

const monthReport = computed(() => {
  const tx = reportTransactions.value
    .filter((t) => t.date.slice(0, 7) === selectedMonthKey.value)
    .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt))

  const map = new Map<string, Transaction[]>()
  for (const t of tx) {
    const day = t.date.slice(8, 10)
    if (!map.has(day)) map.set(day, [])
    map.get(day)!.push(t)
  }

  return Array.from(map.keys()).map((day) => {
    const transactions = map.get(day)!
    return { day, transactions, count: transactions.length, total: round2(transactions.reduce((s, t) => s + t.amount, 0)) }
  })
})

const monthCount = computed(() => monthReport.value.reduce((s, g) => s + g.count, 0))
const monthTotal = computed(() => monthReport.value.reduce((s, g) => s + g.total, 0))

const statementSummary = computed(() => {
  if (viewMode.value === 'year') return `${yearCount.value} ${yearCount.value === 1 ? 'transaction' : 'transactions'} · ${formatCurrency(yearTotal.value, settingsStore.currency)}`
  return `${monthCount.value} ${monthCount.value === 1 ? 'transaction' : 'transactions'} · ${formatCurrency(monthTotal.value, settingsStore.currency)}`
})

function dayLabel(day: string) {
  const d = new Date(`${selectedMonthKey.value}-${day}T00:00:00`)
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

function openMonth(monthKey: string) {
  const [y, m] = monthKey.split('-').map(Number)
  selectedYear.value = String(y)
  selectedMonthNum.value = String(m).padStart(2, '0')
  viewMode.value = 'month'
}

function shiftYear(delta: number) {
  selectedYear.value = String(Number(selectedYear.value) + delta)
}

function shiftMonth(delta: number) {
  let year = Number(selectedYear.value)
  let monthNum = Number(selectedMonthNum.value) + delta
  if (monthNum < 1) {
    monthNum = 12
    year -= 1
  } else if (monthNum > 12) {
    monthNum = 1
    year += 1
  }
  selectedYear.value = String(year)
  selectedMonthNum.value = String(monthNum).padStart(2, '0')
}

function formatToday() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

function printReport() {
  window.print()
}
</script>

<template>
  <div class="space-y-10">
    <section class="space-y-4">
      <div>
        <h2 class="font-display text-lg font-semibold text-ink-900 dark:text-ink-50">Overview</h2>
        <p class="text-sm text-ink-500 dark:text-ink-400 mt-0.5">Income, expenses, and trends for the selected date range.</p>
      </div>

      <div class="card p-4 flex flex-col sm:flex-row gap-3 sm:items-end">
        <div class="w-full sm:w-56">
          <Select v-model="rangeKey" label="Date Range" :options="rangeOptionsForSelect" />
        </div>
        <template v-if="rangeKey === 'custom'">
          <div class="w-full sm:w-44">
            <label class="label">Start Date</label>
            <input v-model="customStart" type="date" class="input" />
          </div>
          <div class="w-full sm:w-44">
            <label class="label">End Date</label>
            <input v-model="customEnd" type="date" class="input" />
          </div>
        </template>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="card p-5">
          <p class="text-xs uppercase tracking-wide text-ink-500 dark:text-ink-400">Income Report</p>
          <p class="font-mono tabular-nums text-2xl font-semibold text-income mt-2">{{ formatCurrency(income, settingsStore.currency) }}</p>
        </div>
        <div class="card p-5">
          <p class="text-xs uppercase tracking-wide text-ink-500 dark:text-ink-400">Expense Report</p>
          <p class="font-mono tabular-nums text-2xl font-semibold text-expense mt-2">{{ formatCurrency(expenses, settingsStore.currency) }}</p>
        </div>
        <div class="card p-5">
          <p class="text-xs uppercase tracking-wide text-ink-500 dark:text-ink-400">Savings Report</p>
          <p class="font-mono tabular-nums text-2xl font-semibold text-ink-900 dark:text-ink-50 mt-2">{{ formatCurrency(netSavings, settingsStore.currency) }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="card p-5">
          <h3 class="font-display text-base font-semibold text-ink-900 dark:text-ink-50 mb-4">Income vs Expense Trend</h3>
          <div class="h-72"><Bar :data="trendChartData" :options="barOptions" /></div>
        </div>
        <div class="card p-5">
          <h3 class="font-display text-base font-semibold text-ink-900 dark:text-ink-50 mb-4">Cash Flow</h3>
          <div class="h-56"><Line :data="cashFlowData" :options="lineOptions" /></div>
        </div>
      </div>
    </section>

    <section class="space-y-4">
      <div>
        <h2 class="font-display text-lg font-semibold text-ink-900 dark:text-ink-50">Statement</h2>
        <p class="text-sm text-ink-500 dark:text-ink-400 mt-0.5">Detailed income and expense records by year or month.</p>
      </div>

      <div class="card overflow-hidden print:shadow-none" id="print-report">
        <div class="p-5 border-b border-ink-100 dark:border-ink-800 print:hidden">
          <div class="flex flex-wrap items-end gap-x-3 gap-y-4">
            <div class="flex flex-col gap-1.5">
              <span class="label">Type</span>
              <div class="flex rounded-xl bg-ink-100 dark:bg-ink-800 p-1" aria-label="Transaction type">
                <button
                  v-for="opt in typeToggleOptions"
                  :key="opt.value"
                  type="button"
                  class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                  :aria-pressed="reportType === opt.value"
                  :class="reportType === opt.value ? 'bg-white dark:bg-ink-700 text-ink-900 dark:text-ink-100 shadow-sm' : 'text-ink-500 dark:text-ink-400 hover:text-ink-700 dark:hover:text-ink-200'"
                  @click="reportType = opt.value"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>
            <div class="flex flex-col gap-1.5">
              <span class="label">Period</span>
              <div class="flex rounded-xl bg-ink-100 dark:bg-ink-800 p-1" aria-label="Report period">
                <button
                  v-for="opt in viewToggleOptions"
                  :key="opt.value"
                  type="button"
                  class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                  :aria-pressed="viewMode === opt.value"
                  :class="viewMode === opt.value ? 'bg-white dark:bg-ink-700 text-ink-900 dark:text-ink-100 shadow-sm' : 'text-ink-500 dark:text-ink-400 hover:text-ink-700 dark:hover:text-ink-200'"
                  @click="viewMode = opt.value"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>
            <div class="flex flex-col gap-1.5">
              <span class="label">Year</span>
              <div class="flex items-center gap-1">
                <button type="button" class="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-500" aria-label="Previous year" @click="shiftYear(-1)">
                  <ChevronLeft :size="15" />
                </button>
                <Select class="w-24" v-model="selectedYear" :options="yearOptions" />
                <button type="button" class="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-500" aria-label="Next year" @click="shiftYear(1)">
                  <ChevronRight :size="15" />
                </button>
              </div>
            </div>
            <div v-if="viewMode === 'month'" class="flex flex-col gap-1.5">
              <span class="label">Month</span>
              <div class="flex items-center gap-1">
                <button type="button" class="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-500" aria-label="Previous month" @click="shiftMonth(-1)">
                  <ChevronLeft :size="15" />
                </button>
                <Select class="w-36" v-model="selectedMonthNum" :options="monthOptions" />
                <button type="button" class="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-500" aria-label="Next month" @click="shiftMonth(1)">
                  <ChevronRight :size="15" />
                </button>
              </div>
            </div>
            <div class="ml-auto">
              <button type="button" class="btn-secondary" @click="printReport">
                <Printer :size="16" /> Print
              </button>
            </div>
          </div>
        </div>

        <div class="p-5 sm:p-6">
          <div class="mb-5 border-b border-ink-100 dark:border-ink-800 pb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
            <div>
              <h3 class="font-display text-lg font-semibold text-ink-900 dark:text-ink-50">{{ reportTypeLabel }} Statement</h3>
              <p class="text-sm text-ink-500 dark:text-ink-400 mt-0.5">
                {{ reportPeriodLabel }}
                <button
                  v-if="viewMode === 'month'"
                  type="button"
                  class="print:hidden ml-2 inline-flex items-center gap-0.5 text-xs font-medium text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white underline-offset-4 hover:underline"
                  @click="viewMode = 'year'"
                >
                  <ChevronLeft :size="13" /> Year view
                </button>
              </p>
              <p class="print:hidden text-xs text-ink-400 dark:text-ink-500 mt-1.5">Printed {{ formatToday() }} · {{ settingsStore.profileName || settingsStore.profileEmail }}</p>
            </div>
            <p class="text-sm font-medium text-ink-700 dark:text-ink-200">{{ statementSummary }}</p>
          </div>

          <template v-if="viewMode === 'year'">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-ink-100 dark:border-ink-800 text-left text-xs uppercase tracking-wide text-ink-500 dark:text-ink-400">
                    <th class="px-4 py-2.5 font-medium">Month</th>
                    <th class="px-4 py-2.5 font-medium text-right">Transactions</th>
                    <th class="px-4 py-2.5 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-ink-100 dark:divide-ink-800">
                  <tr v-for="row in yearReportRows" :key="row.monthKey" class="hover:bg-ink-50 dark:hover:bg-ink-800/50">
                    <td class="px-4 py-2.5">
                      <button
                        v-if="row.count > 0"
                        type="button"
                        class="group inline-flex items-center gap-1 font-medium text-ink-800 dark:text-ink-100 hover:text-ink-600 dark:hover:text-ink-300 underline-offset-4 hover:underline"
                        @click="openMonth(row.monthKey)"
                      >
                        {{ row.label }}
                        <ChevronRight :size="14" class="text-ink-400 group-hover:text-ink-600 dark:group-hover:text-ink-300" />
                      </button>
                      <span v-else class="text-ink-500 dark:text-ink-400">{{ row.label }}</span>
                    </td>
                    <td class="px-4 py-2.5 text-right text-ink-500 dark:text-ink-400">{{ row.count }}</td>
                    <td class="px-4 py-2.5 text-right font-mono tabular-nums font-semibold" :class="reportType === 'income' ? 'text-income' : 'text-expense'">
                      {{ formatCurrency(row.total, settingsStore.currency) }}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="border-t-2 border-ink-200 dark:border-ink-700">
                    <td class="px-4 py-3 font-semibold text-ink-900 dark:text-ink-50">Total for {{ selectedYear }}</td>
                    <td class="px-4 py-3 text-right font-medium text-ink-500 dark:text-ink-400">{{ yearCount }}</td>
                    <td class="px-4 py-3 text-right font-mono tabular-nums font-semibold" :class="reportType === 'income' ? 'text-income' : 'text-expense'">
                      {{ formatCurrency(yearTotal, settingsStore.currency) }}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p v-if="!yearCount" class="mt-4 text-sm text-ink-500 dark:text-ink-400 text-center py-4">No {{ reportTypeLabel.toLowerCase() }} recorded in {{ selectedYear }}.</p>
          </template>

          <template v-else>
            <EmptyState v-if="!monthReport.length" title="No transactions this month" description="Try a different month or jump back to the year view." />
            <div v-else class="space-y-4">
              <div
                v-for="group in monthReport"
                :key="group.day"
                class="border border-ink-100 dark:border-ink-800 rounded-xl overflow-hidden"
              >
                <div class="flex items-center justify-between gap-3 px-4 py-2.5 bg-ink-50 dark:bg-ink-800/50">
                  <p class="text-sm font-semibold text-ink-900 dark:text-ink-50">{{ dayLabel(group.day) }}</p>
                  <p class="text-xs text-ink-500 dark:text-ink-400">
                    {{ group.count }} {{ group.count === 1 ? 'transaction' : 'transactions' }} ·
                    <span class="font-mono tabular-nums font-semibold" :class="reportType === 'income' ? 'text-income' : 'text-expense'">
                      {{ formatCurrency(group.total, settingsStore.currency) }}
                    </span>
                  </p>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead>
                      <tr class="border-b border-ink-100 dark:border-ink-800 text-left text-xs uppercase tracking-wide text-ink-500 dark:text-ink-400">
                        <th class="px-4 py-2 font-medium">Date</th>
                        <th class="px-4 py-2 font-medium">Description</th>
                        <th class="px-4 py-2 font-medium">Category</th>
                        <th class="px-4 py-2 font-medium text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-ink-100 dark:divide-ink-800">
                      <tr v-for="t in group.transactions" :key="t.id">
                        <td class="px-4 py-2 whitespace-nowrap text-ink-600 dark:text-ink-300">{{ formatDate(t.date, settingsStore.dateFormat) }}</td>
                        <td class="px-4 py-2">
                          <p class="font-medium text-ink-800 dark:text-ink-100">{{ t.description }}</p>
                          <p v-if="t.note" class="text-xs text-ink-400">{{ t.note }}</p>
                        </td>
                        <td class="px-4 py-2">
                          <span
                            class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                            :style="{ backgroundColor: (categoryStore.byId(t.categoryId)?.color || '#999') + '1f', color: categoryStore.byId(t.categoryId)?.color }"
                          >
                            {{ categoryStore.byId(t.categoryId)?.name }}
                          </span>
                        </td>
                        <td class="px-4 py-2 text-right font-mono tabular-nums font-semibold" :class="reportType === 'income' ? 'text-income' : 'text-expense'">
                          {{ formatCurrency(t.amount, settingsStore.currency) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="flex items-center justify-end gap-3 pt-1">
                <p class="text-sm text-ink-500 dark:text-ink-400">{{ monthCount }} transactions in total</p>
                <p class="text-sm font-semibold text-ink-900 dark:text-ink-50">
                  Total:
                  <span class="font-mono tabular-nums" :class="reportType === 'income' ? 'text-income' : 'text-expense'">
                    {{ formatCurrency(monthTotal, settingsStore.currency) }}
                  </span>
                </p>
              </div>
            </div>
          </template>
        </div>
      </div>
    </section>

    <section class="space-y-4">
      <div>
        <h2 class="font-display text-lg font-semibold text-ink-900 dark:text-ink-50">Breakdown</h2>
        <p class="text-sm text-ink-500 dark:text-ink-400 mt-0.5">How expenses and income distribute across categories.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="card p-5">
          <h3 class="font-display text-base font-semibold text-ink-900 dark:text-ink-50 mb-4">Expense by Category</h3>
          <div v-if="expenseByCategory.length" class="h-64"><Doughnut :data="expenseDoughnutData" :options="doughnutOptions" /></div>
          <p v-else class="text-sm text-ink-500 py-10 text-center">No expense data for this range.</p>
        </div>
        <div class="card p-5">
          <h3 class="font-display text-base font-semibold text-ink-900 dark:text-ink-50 mb-4">Income by Category</h3>
          <div v-if="incomeByCategory.length" class="h-64"><Doughnut :data="incomeDoughnutData" :options="doughnutOptions" /></div>
          <p v-else class="text-sm text-ink-500 py-10 text-center">No income data for this range.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  #print-report,
  #print-report * {
    visibility: visible;
  }
  #print-report {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    max-width: none !important;
    background: #ffffff !important;
    border: none !important;
    box-shadow: none !important;
    color: #122522 !important;
  }
  #print-report * {
    color: #122522 !important;
  }
  #print-report .text-income {
    color: #0f9d70 !important;
  }
  #print-report .text-expense {
    color: #e0603f !important;
  }
}
</style>