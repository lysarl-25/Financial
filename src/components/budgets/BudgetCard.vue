<script setup lang="ts">
import { Pencil, Trash2, TriangleAlert } from 'lucide-vue-next'
import type { BudgetProgress } from '@/stores/budgetStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { formatCurrency } from '@/utils/format'

const props = defineProps<{ budget: BudgetProgress }>()
defineEmits<{ edit: []; delete: [] }>()

const categoryStore = useCategoryStore()
const settingsStore = useSettingsStore()
const category = categoryStore.byId(props.budget.categoryId)
</script>

<template>
  <div class="card p-5">
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-2.5">
        <span class="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-semibold" :style="{ backgroundColor: (category?.color || '#999') + '22', color: category?.color }">
          {{ category?.name?.slice(0, 2).toUpperCase() }}
        </span>
        <h3 class="font-medium text-ink-800 dark:text-ink-100">{{ category?.name || 'Unknown' }}</h3>
      </div>
      <div class="flex gap-1">
        <button class="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-500" @click="$emit('edit')">
          <Pencil :size="14" />
        </button>
        <button class="p-1.5 rounded-lg hover:bg-expense-light text-ink-500 hover:text-expense" @click="$emit('delete')">
          <Trash2 :size="14" />
        </button>
      </div>
    </div>

    <div class="flex items-baseline justify-between mb-2 font-mono tabular-nums">
      <span class="text-sm text-ink-500 dark:text-ink-400">
        {{ formatCurrency(budget.spent, settingsStore.currency) }} / {{ formatCurrency(budget.amount, settingsStore.currency) }}
      </span>
      <span
        class="text-sm font-semibold"
        :class="{
          'text-income': budget.status === 'ok',
          'text-amber-600': budget.status === 'warning',
          'text-expense': budget.status === 'over',
        }"
      >
        {{ budget.percentUsed }}%
      </span>
    </div>

    <div class="h-2 w-full rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
      <div
        class="h-full rounded-full transition-all"
        :class="{
          'bg-income': budget.status === 'ok',
          'bg-amber-500': budget.status === 'warning',
          'bg-expense': budget.status === 'over',
        }"
        :style="{ width: Math.min(budget.percentUsed, 100) + '%' }"
      />
    </div>

    <p class="text-xs text-ink-500 dark:text-ink-400 mt-2 font-mono tabular-nums">
      {{ budget.remaining >= 0 ? formatCurrency(budget.remaining, settingsStore.currency) + ' remaining' : formatCurrency(Math.abs(budget.remaining), settingsStore.currency) + ' over budget' }}
    </p>
    <p v-if="budget.status !== 'ok'" class="flex items-center gap-1.5 text-xs mt-2" :class="budget.status === 'over' ? 'text-expense' : 'text-amber-600'">
      <TriangleAlert :size="13" />
      {{ budget.status === 'over' ? 'Over budget' : 'Approaching limit' }}
    </p>
  </div>
</template>
