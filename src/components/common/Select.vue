<script setup lang="ts">
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
    <select
      :value="modelValue"
      class="input"
      :class="{ '!border-expense !ring-expense/30': error }"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
    <p v-if="error" class="mt-1 text-xs text-expense">{{ error }}</p>
  </div>
</template>
