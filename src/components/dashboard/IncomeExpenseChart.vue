<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import '@/utils/chartSetup'
import { formatMonthLabel } from '@/utils/format'

const props = defineProps<{ data: { month: string; income: number; expenses: number }[] }>()

const chartData = computed(() => ({
  labels: props.data.map((d) => formatMonthLabel(d.month).split(' ')[0]),
  datasets: [
    {
      label: 'Income',
      data: props.data.map((d) => d.income),
      backgroundColor: '#0f9d70',
      borderRadius: 6,
      maxBarThickness: 28,
    },
    {
      label: 'Expenses',
      data: props.data.map((d) => d.expenses),
      backgroundColor: '#e0603f',
      borderRadius: 6,
      maxBarThickness: 28,
    },
  ],
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' as const, labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true } },
  },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: 'rgba(148,163,184,0.15)' }, ticks: { callback: (v: any) => `$${v}` } },
  },
}
</script>

<template>
  <div class="h-72">
    <Bar :data="chartData" :options="options" />
  </div>
</template>
