<script setup lang="ts">
import { computed } from 'vue'
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-vue-next'
import { formatCurrency } from '@/utils/format'
import { useSettingsStore } from '@/stores/settingsStore'

const props = defineProps<{
  label: string
  value: number
  changeLabel: string
  icon: 'balance' | 'income' | 'expenses' | 'savings'
}>()

const settingsStore = useSettingsStore()

const icons = { balance: Wallet, income: TrendingUp, expenses: TrendingDown, savings: PiggyBank }

const isPositiveChange = computed(() => props.changeLabel.trim().startsWith('+'))
const isNeutralChange = computed(() => props.changeLabel.trim() === '0%')

const accent = computed(() => {
  if (props.icon === 'income') return { bg: 'bg-income-light', text: 'text-income-dark dark:text-income' }
  if (props.icon === 'expenses') return { bg: 'bg-expense-light', text: 'text-expense-dark dark:text-expense' }
  return { bg: 'bg-ink-100 dark:bg-ink-800', text: 'text-ink-700 dark:text-ink-200' }
})
</script>

<template>
  <div class="card p-5">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-xs font-medium uppercase tracking-wide text-ink-500 dark:text-ink-400">{{ label }}</p>
        <p class="font-mono tabular-nums text-2xl font-semibold text-ink-900 dark:text-ink-50 mt-2">
          {{ formatCurrency(value, settingsStore.currency) }}
        </p>
      </div>
      <div class="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" :class="accent.bg">
        <component :is="icons[icon]" :size="18" :class="accent.text" />
      </div>
    </div>
    <p
      class="text-xs font-medium mt-3"
      :class="isNeutralChange ? 'text-ink-400' : isPositiveChange ? 'text-income' : 'text-expense'"
    >
      {{ changeLabel }} <span class="text-ink-400 font-normal">vs last month</span>
    </p>
  </div>
</template>
