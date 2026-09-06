<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useTransactionStore } from '@/stores/transactionStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { formatCurrency, formatDate } from '@/utils/format'
import EmptyState from '@/components/common/EmptyState.vue'

const transactionStore = useTransactionStore()
const categoryStore = useCategoryStore()
const settingsStore = useSettingsStore()
</script>

<template>
  <div class="card p-5">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-display text-base font-semibold text-ink-900 dark:text-ink-50">
        Recent Transactions
      </h3>
      <RouterLink
        to="/transactions"
        class="text-sm font-medium text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white"
      >
        View all
      </RouterLink>
    </div>

    <EmptyState
      v-if="!transactionStore.recent.length"
      title="No transactions yet"
      description="Add your first transaction to see it here."
    />
    <ul
      v-else
      class="divide-y divide-ink-100 dark:divide-ink-800"
    >
      <li
        v-for="t in transactionStore.recent"
        :key="t.id"
        class="flex items-center justify-between py-3"
      >
        <div class="flex items-center gap-3 min-w-0">
          <span
            class="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-semibold"
            :style="{ backgroundColor: (categoryStore.byId(t.categoryId)?.color || '#999') + '22', color: categoryStore.byId(t.categoryId)?.color }"
          >
            {{ categoryStore.byId(t.categoryId)?.name?.slice(0, 2).toUpperCase() }}
          </span>
          <div class="min-w-0">
            <p class="text-sm font-medium text-ink-800 dark:text-ink-100 truncate">
              {{ t.description }}
            </p>
            <p class="text-xs text-ink-500 dark:text-ink-400">
              {{ formatDate(t.date, settingsStore.dateFormat) }} · {{ categoryStore.byId(t.categoryId)?.name }}
            </p>
          </div>
        </div>
        <span
          class="font-mono tabular-nums text-sm font-semibold shrink-0 ml-3"
          :class="t.type === 'income' ? 'text-income' : 'text-expense'"
        >
          {{ t.type === 'income' ? '+' : '-' }}{{ formatCurrency(t.amount, settingsStore.currency) }}
        </span>
      </li>
    </ul>
  </div>
</template>
