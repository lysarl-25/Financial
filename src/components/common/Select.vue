<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'
defineProps<{
  modelValue: string
  label?: string
  options: { value: string; label: string }[]
  error?: string
}>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div>
    <label v-if="label" class="label">{{ label }}</label>
    <div class="relative">
      <select
        :value="modelValue"
        class="input appearance-none pr-9 cursor-pointer"
        :class="{ '!border-expense !ring-expense/30': error }"
        @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <ChevronDown
        :size="16"
        class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"
        aria-hidden="true"
      />
    </div>
    <p v-if="error" class="mt-1 text-xs text-expense">{{ error }}</p>
  </div>
</template>
