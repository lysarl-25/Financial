<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'block' | 'text' | 'circle'
    width?: string
    height?: string
  }>(),
  { variant: 'block', width: undefined, height: undefined },
)
</script>

<template>
  <div
    class="skeleton skeleton-pulse"
    :class="variant === 'circle' ? 'rounded-full' : variant === 'text' ? 'h-3' : ''"
    :style="{ width, height: variant === 'text' ? undefined : height }"
  />
</template>