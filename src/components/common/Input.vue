<script setup lang="ts">
defineProps<{
  modelValue: string | number
  label?: string
  type?: string
  placeholder?: string
  error?: string
  step?: string
  min?: string
  readonly?: boolean
}>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div>
    <label v-if="label" class="label">{{ label }}</label>
    <input
      :value="modelValue"
      :type="type || 'text'"
      :placeholder="placeholder"
      :step="step"
      :min="min"
      :readonly="readonly"
      class="input"
      :class="{ '!border-expense !ring-expense/30': error }"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" class="mt-1 text-xs text-expense">{{ error }}</p>
  </div>
</template>
