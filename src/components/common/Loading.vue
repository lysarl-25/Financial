<script setup lang="ts">
withDefaults(defineProps<{ label?: string }>(), { label: 'Loading…' })
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 text-ink-500 dark:text-ink-400 gap-3">
    <div class="h-8 w-8 rounded-full border-2 border-ink-200 border-t-ink-600 animate-spin dark:border-ink-700 dark:border-t-ink-300" />
    <p class="text-sm">{{ label }}</p>
  </div>
</template>
