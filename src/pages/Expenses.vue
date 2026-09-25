<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Plus, TrendingDown } from 'lucide-vue-next'
import TransactionFilters from '@/components/transactions/TransactionFilters.vue'
import TransactionTable from '@/components/transactions/TransactionTable.vue'
import TransactionModal from '@/components/transactions/TransactionModal.vue'
import TableSkeleton from '@/components/common/TableSkeleton.vue'
import Button from '@/components/common/Button.vue'
import { useTransactionStore } from '@/stores/transactionStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { formatCurrency } from '@/utils/format'

const transactionStore = useTransactionStore()
const settingsStore = useSettingsStore()
const addOpen = ref(false)

onMounted(() => {
  transactionStore.resetFilters()
  transactionStore.setFilters({ type: 'expense' })
})

const filteredExpenses = computed(() => transactionStore.filtered.filter((t) => t.type === 'expense'))
const total = computed(() => filteredExpenses.value.reduce((s, t) => s + t.amount, 0))
</script>

<template>
  <div class="space-y-5">
    <div>
      <h2 class="font-display text-xl font-semibold text-ink-900 dark:text-ink-50">
        Expenses Overview
      </h2>
      <p class="text-sm text-ink-500 dark:text-ink-400 mt-0.5">
        Track and manage your spending to better understand where your money goes.
      </p>
    </div>

    <div class="card p-5 flex items-center justify-between bg-expense-light/40 dark:bg-expense/10 border-expense/20">
      <div class="flex items-center gap-3">
        <span class="h-10 w-10 rounded-xl bg-expense-light dark:bg-expense/20 flex items-center justify-center">
          <TrendingDown
            :size="18"
            class="text-expense-dark dark:text-expense"
          />
        </span>
        <div>
          <p class="text-xs uppercase tracking-wide text-ink-500 dark:text-ink-400">
            Total Expenses
          </p>
          <p class="font-mono tabular-nums text-2xl font-semibold text-expense-dark dark:text-expense">
            {{ formatCurrency(total, settingsStore.currency) }}
          </p>
        </div>
      </div>
      <Button
        class="hidden sm:inline-flex"
        @click="addOpen = true"
      >
        <Plus :size="16" /> Add Expense
      </Button>
    </div>

    <TransactionFilters fixed-type="expense" />

    <TableSkeleton
      v-if="transactionStore.loading && !transactionStore.loaded"
      :rows="5"
      show-summary
    />
    <TransactionTable
      v-else
      :transactions="filteredExpenses"
    />

    <TransactionModal
      :open="addOpen"
      mode="create"
      forced-type="expense"
      @close="addOpen = false"
    />
  </div>
</template>
