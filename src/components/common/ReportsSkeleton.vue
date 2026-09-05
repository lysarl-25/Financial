<script setup lang="ts">
import Skeleton from '@/components/common/Skeleton.vue'
</script>

<template>
  <div class="space-y-10">
    <section class="space-y-4">
      <div class="space-y-2">
        <Skeleton class="skeleton-text w-32" />
        <Skeleton class="skeleton-text w-56 opacity-60" />
      </div>

      <div class="card p-4 flex flex-col sm:flex-row gap-3 sm:items-end">
        <div class="w-full sm:w-56">
          <Skeleton class="skeleton-text w-16 mb-1.5" />
          <Skeleton class="h-10 w-full" />
        </div>
        <div class="w-full sm:w-44">
          <Skeleton class="skeleton-text w-16 mb-1.5" />
          <Skeleton class="h-10 w-full" />
        </div>
        <div class="w-full sm:w-44">
          <Skeleton class="skeleton-text w-16 mb-1.5" />
          <Skeleton class="h-10 w-full" />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          v-for="i in 3"
          :key="i"
          class="card p-5"
        >
          <Skeleton class="skeleton-text w-28" />
          <Skeleton class="skeleton-text w-24 mt-3" />
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="card p-5">
          <Skeleton class="skeleton-text w-48" />
          <div class="mt-5 h-72 flex items-end justify-between gap-3 px-2">
            <Skeleton
              v-for="i in 12"
              :key="i"
              class="w-6 h-24"
            />
          </div>
        </div>
        <div class="card p-5">
          <Skeleton class="skeleton-text w-32" />
          <div class="mt-5 h-56 flex items-center justify-center">
            <Skeleton class="h-40 w-40 rounded-full" />
          </div>
        </div>
      </div>
    </section>

    <section class="space-y-4">
      <div class="space-y-2">
        <Skeleton class="skeleton-text w-28" />
        <Skeleton class="skeleton-text w-48 opacity-60" />
      </div>

      <div class="card overflow-hidden">
        <div class="p-5 border-b border-ink-100 dark:border-ink-800">
          <div class="flex flex-wrap gap-x-3 gap-y-4">
            <Skeleton class="h-9 w-40" />
            <Skeleton class="h-9 w-40" />
            <Skeleton class="h-9 w-40" />
            <Skeleton class="ml-auto h-9 w-28" />
          </div>
        </div>
        <div class="p-5 sm:p-6">
          <div class="mb-5 border-b border-ink-100 dark:border-ink-800 pb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
            <div class="space-y-2">
              <Skeleton class="skeleton-text w-40" />
              <Skeleton class="skeleton-text w-56 opacity-60" />
            </div>
            <Skeleton class="skeleton-text w-40" />
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-ink-100 dark:border-ink-800">
                  <th
                    v-for="i in 3"
                    :key="i"
                    class="px-4 py-2.5 text-left"
                  >
                    <Skeleton class="skeleton-text w-14" />
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-ink-100 dark:divide-ink-800">
                <tr
                  v-for="r in 6"
                  :key="r"
                >
                  <td class="px-4 py-2.5">
                    <Skeleton class="skeleton-text w-20" />
                  </td>
                  <td class="px-4 py-2.5">
                    <Skeleton class="skeleton-text w-12" />
                  </td>
                  <td class="px-4 py-2.5">
                    <Skeleton class="skeleton-text w-20" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>