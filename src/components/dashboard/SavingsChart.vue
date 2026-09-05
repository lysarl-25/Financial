<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import '@/utils/chartSetup'
import { formatMonthLabel } from '@/utils/format'

const props = defineProps<{ data: { month: string; income: number; expenses: number }[] }>()

const chartData = computed(() => ({
  labels: props.data.map((d) => formatMonthLabel(d.month).split(' ')[0]),
  datasets: [
    {
      label: 'Savings',
      data: props.data.map((d) => d.income - d.expenses),
      borderColor: '#0f9d70',
      backgroundColor: (ctx: any) => {
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 220)
        gradient.addColorStop(0, 'rgba(15,157,112,0.25)')
        gradient.addColorStop(1, 'rgba(15,157,112,0)')
        return gradient
      },
      fill: true,
      tension: 0.35,
      pointRadius: 3,
      pointBackgroundColor: '#0f9d70',
    },
  ],
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: 'rgba(148,163,184,0.15)' }, ticks: { callback: (v: any) => `$${v}` } },
  },
}
</script>

<template>
  <div class="h-56">
    <Line :data="chartData" :options="options" />
  </div>
</template>
