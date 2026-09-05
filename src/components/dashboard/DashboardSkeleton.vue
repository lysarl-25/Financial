<script setup lang="ts">
import Skeleton from '@/components/common/Skeleton.vue'

const statRows = [1, 2, 3, 4]
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4">
      <div
        v-for="i in statRows"
        :key="i"
        class="card p-5"
      >
        <div class="flex items-start justify-between">
          <div class="space-y-2.5">
            <Skeleton class="skeleton-text w-24" />
            <Skeleton class="skeleton-text w-32" />
          </div>
          <div class="flex justify-end">
            <Skeleton class="h-10 w-10 rounded-xl" />
          </div>
        </div>
        <div class="flex items-center gap-2 mt-4">
          <Skeleton class="skeleton-text w-10" />
          <Skeleton class="skeleton-text w-16 opacity-60" />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
      <div class="card p-5 2xl:col-span-2">
        <Skeleton class="skeleton-text w-44" />
        <div class="mt-5 h-64 flex items-end justify-between gap-3 px-2">
          <Skeleton
            v-for="i in 12"
            :key="i"
            class="w-6 h-24"
          />
        </div>
      </div>
      <div class="card p-5">
        <Skeleton class="skeleton-text w-36" />
        <div class="mt-5 h-64 flex items-center justify-center">
          <Skeleton class="h-36 w-36 rounded-full" />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
      <div class="card p-5 2xl:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <Skeleton class="skeleton-text w-40" />
          <Skeleton class="skeleton-text w-16" />
        </div>
        <div
          v-for="i in 5"
          :key="i"
          class="flex items-center justify-between py-2.5"
        >
          <div class="flex items-center gap-3 min-w-0">
            <Skeleton class="h-9 w-9 rounded-xl shrink-0" />
            <div class="space-y-1.5 min-w-0">
              <Skeleton class="skeleton-text w-36" />
              <Skeleton class="skeleton-text w-24 opacity-60" />
            </div>
          </div>
          <Skeleton class="skeleton-text w-16 shrink-0 ml-3" />
        </div>
      </div>
      <div class="card p-5">
        <Skeleton class="skeleton-text w-44" />
        <div class="mt-5 h-56 flex items-end justify-between gap-2 px-2">
          <Skeleton
            v-for="i in 12"
            :key="i"
            class="w-5 h-20"
          />
        </div>
      </div>
    </div>

    <div class="card p-5">
      <div class="flex items-center justify-between mb-5">
        <Skeleton class="skeleton-text w-36" />
        <Skeleton class="skeleton-text w-16" />
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div
          v-for="i in 3"
          :key="i"
          class="space-y-2"
        >
          <div class="flex justify-between">
            <Skeleton class="skeleton-text w-28" />
            <Skeleton class="skeleton-text w-8" />
          </div>
          <Skeleton class="h-2 w-full" />
        </div>
      </div>
    </div>
  </div>
</template>