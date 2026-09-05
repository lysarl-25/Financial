<script setup lang="ts">
import Skeleton from '@/components/common/Skeleton.vue'

withDefaults(
  defineProps<{
    cards?: number
    columns?: number
    variant?: 'row' | 'card'
  }>(),
  { cards: 6, columns: 3, variant: 'row' },
)
</script>

<template>
  <div
    class="grid gap-4"
    :class="{
      'grid-cols-1': columns === 1,
      'sm:grid-cols-2': columns === 2,
      'sm:grid-cols-2 lg:grid-cols-3': columns === 3,
    }"
  >
    <div v-for="c in cards" :key="c" class="card flex items-center justify-between p-4" :class="variant === 'card' ? 'flex-col items-stretch gap-0 p-5' : ''">
      <template v-if="variant === 'row'">
        <div class="flex items-center gap-3 min-w-0">
          <Skeleton class="h-10 w-10 rounded-xl shrink-0" />
          <div class="space-y-2">
            <Skeleton class="skeleton-text w-28" />
            <Skeleton class="skeleton-text w-20 opacity-60" />
          </div>
        </div>
        <div class="flex justify-end gap-1.5 shrink-0">
          <Skeleton class="h-7 w-7" />
          <Skeleton class="h-7 w-7" />
        </div>
      </template>

      <template v-else>
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-2.5">
            <Skeleton class="h-8 w-8 rounded-lg" />
            <Skeleton class="skeleton-text w-24" />
          </div>
          <div class="flex gap-1">
            <Skeleton class="h-7 w-7" />
            <Skeleton class="h-7 w-7" />
          </div>
        </div>
        <div class="flex items-baseline justify-between mb-2.5">
          <Skeleton class="skeleton-text w-32" />
          <Skeleton class="skeleton-text w-8" />
        </div>
        <Skeleton class="h-2 w-full rounded-full" />
        <Skeleton class="skeleton-text w-24 mt-3 opacity-60" />
      </template>
    </div>
  </div>
</template>