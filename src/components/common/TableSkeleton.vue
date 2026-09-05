<script setup lang="ts">
import Skeleton from '@/components/common/Skeleton.vue'

withDefaults(
  defineProps<{
    rows?: number
    showSummary?: boolean
  }>(),
  { rows: 5, showSummary: false },
)
</script>

<template>
  <div class="space-y-5">
    <div v-if="showSummary" class="card p-5 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <Skeleton class="h-10 w-10 rounded-xl" />
        <div class="space-y-2">
          <Skeleton class="skeleton-text w-24" />
          <Skeleton class="skeleton-text w-32" />
        </div>
      </div>
      <div class="flex justify-end gap-2">
        <Skeleton class="h-9 w-9" />
        <Skeleton class="h-9 w-36" />
      </div>
    </div>

    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-ink-100 dark:border-ink-800">
              <th v-for="i in 6" :key="i" class="px-5 py-3">
                <Skeleton class="skeleton-text w-14" />
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-ink-100 dark:divide-ink-800">
            <tr v-for="r in rows" :key="r">
              <td class="px-5 py-3.5"><Skeleton class="skeleton-text w-20" /></td>
              <td class="px-5 py-3.5">
                <div class="flex flex-col gap-1.5">
                  <Skeleton class="skeleton-text w-40" />
                  <Skeleton class="skeleton-text w-24 opacity-60" />
                </div>
              </td>
              <td class="px-5 py-3.5"><Skeleton class="h-6 w-24 rounded-full" /></td>
              <td class="px-5 py-3.5 hidden sm:table-cell"><Skeleton class="skeleton-text w-16" /></td>
              <td class="px-5 py-3.5 flex justify-end"><Skeleton class="skeleton-text w-20" /></td>
              <td class="px-5 py-3.5 flex justify-end gap-1.5">
                <Skeleton class="h-7 w-7" />
                <Skeleton class="h-7 w-7" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>