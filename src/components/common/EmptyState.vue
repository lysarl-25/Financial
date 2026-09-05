<script setup lang="ts">
import { Inbox } from 'lucide-vue-next'

withDefaults(
  defineProps<{ title?: string; description?: string }>(),
  { title: 'Nothing here yet', description: 'Once you add data, it will show up here.' },
)
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 text-center px-4">
    <div class="h-12 w-12 rounded-2xl bg-ink-100 dark:bg-ink-800 flex items-center justify-center mb-4">
      <Inbox :size="22" class="text-ink-400" />
    </div>
    <h3 class="font-display text-base font-semibold text-ink-800 dark:text-ink-100">{{ title }}</h3>
    <p class="text-sm text-ink-500 dark:text-ink-400 mt-1 max-w-sm">{{ description }}</p>
    <div v-if="$slots.action" class="mt-4">
      <slot name="action" />
    </div>
  </div>
</template>
