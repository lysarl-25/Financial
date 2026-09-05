<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Plus, TrendingUp } from 'lucide-vue-next'
import TransactionFilters from '@/components/transactions/TransactionFilters.vue'
import TransactionTable from '@/components/transactions/TransactionTable.vue'
import TransactionModal from '@/components/transactions/TransactionModal.vue'
import Loading from '@/components/common/Loading.vue'
import Button from '@/components/common/Button.vue'
import { useTransactionStore } from '@/stores/transactionStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { formatCurrency } from '@/utils/format'

const transactionStore = useTransactionStore()
const settingsStore = useSettingsStore()
const addOpen = ref(false)

onMounted(() => {
  transactionStore.resetFilters()
  transactionStore.setFilters({ type: 'income' })
})

const filteredIncome = computed(() => transactionStore.filtered.filter((t) => t.type === 'income'))
const total = computed(() => filteredIncome.value.reduce((s, t) => s + t.amount, 0))
</script>

<template>
  <div class="space-y-5">
    <div class="card p-5 flex items-center justify-between bg-income-light/40 dark:bg-income/10 border-income/20">
      <div class="flex items-center gap-3">
        <span class="h-10 w-10 rounded-xl bg-income-light dark:bg-income/20 flex items-center justify-center">
          <TrendingUp :size="18" class="text-income-dark dark:text-income" />
        </span>
        <div>
          <p class="text-xs uppercase tracking-wide text-ink-500 dark:text-ink-400">Total Income</p>
          <p class="font-mono tabular-nums text-2xl font-semibold text-income-dark dark:text-income">
            {{ formatCurrency(total, settingsStore.currency) }}
          </p>
        </div>
      </div>
      <Button class="hidden sm:inline-flex" @click="addOpen = true">
        <Plus :size="16" /> Add Income
      </Button>
    </div>

    <TransactionFilters fixed-type="income" />

    <Loading v-if="transactionStore.loading && !transactionStore.loaded" label="Loading income…" />
    <TransactionTable v-else :transactions="filteredIncome" />

    <TransactionModal :open="addOpen" mode="create" forced-type="income" @close="addOpen = false" />
  </div>
</template>
