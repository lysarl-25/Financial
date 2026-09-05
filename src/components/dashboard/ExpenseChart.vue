<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import '@/utils/chartSetup'
import { useCategoryStore } from '@/stores/categoryStore'
import { formatCurrency } from '@/utils/format'
import { useSettingsStore } from '@/stores/settingsStore'

const props = defineProps<{ data: { categoryId: string; amount: number }[] }>()

const categoryStore = useCategoryStore()
const settingsStore = useSettingsStore()

const top = computed(() => props.data.slice(0, 6))

const chartData = computed(() => ({
  labels: top.value.map((d) => categoryStore.byId(d.categoryId)?.name || 'Other'),
  datasets: [
    {
      data: top.value.map((d) => d.amount),
      backgroundColor: top.value.map((d) => categoryStore.byId(d.categoryId)?.color || '#a8a29e'),
      borderWidth: 0,
      hoverOffset: 6,
    },
  ],
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: any) => ` ${ctx.label}: ${formatCurrency(ctx.parsed, settingsStore.currency)}`,
      },
    },
  },
}

const total = computed(() => top.value.reduce((s, d) => s + d.amount, 0))
</script>

<template>
  <div v-if="top.length" class="flex flex-col xl:flex-row xl:items-center gap-6">
    <div class="relative mx-auto h-56 w-56 shrink-0 xl:mx-0">
      <Doughnut :data="chartData" :options="options" />
      <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span class="text-xs text-ink-400 uppercase tracking-wide">Total</span>
        <span class="font-mono text-lg font-semibold text-ink-900 dark:text-ink-50">
          {{ formatCurrency(total, settingsStore.currency) }}
        </span>
      </div>
    </div>
    <ul class="flex-1 min-w-0 w-full space-y-2.5">
      <li v-for="d in top" :key="d.categoryId" class="flex min-w-0 items-center justify-between gap-3 text-sm">
        <span class="flex min-w-0 items-center gap-2 text-ink-600 dark:text-ink-300">
          <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: categoryStore.byId(d.categoryId)?.color }" />
          <span class="truncate">{{ categoryStore.byId(d.categoryId)?.name }}</span>
        </span>
        <span class="font-mono tabular-nums text-ink-800 dark:text-ink-100">
          {{ total > 0 ? Math.round((d.amount / total) * 100) : 0 }}%
        </span>
      </li>
    </ul>
  </div>
  <p v-else class="text-sm text-ink-500 py-10 text-center">No expenses recorded this month yet.</p>
</template>
