<script setup lang="ts">
import { ref, computed } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'

const props = defineProps<{
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

const showPassword = ref(false)
const isPassword = computed(() => props.type === 'password')
const actualType = computed(() => {
  if (!isPassword.value) return props.type || 'text'
  return showPassword.value ? 'text' : 'password'
})
</script>

<template>
  <div>
    <label v-if="label" class="label">{{ label }}</label>
    <div class="relative">
      <input
        :value="modelValue"
        :type="actualType"
        :placeholder="placeholder"
        :step="step"
        :min="min"
        :readonly="readonly"
        class="input"
        :class="{
          '!border-expense !ring-expense/30': error,
          'pr-10': isPassword,
        }"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <button
        v-if="isPassword"
        type="button"
        tabindex="-1"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 dark:hover:text-ink-200 transition-colors"
        @click="showPassword = !showPassword"
      >
        <EyeOff v-if="showPassword" :size="18" />
        <Eye v-else :size="18" />
      </button>
    </div>
    <p v-if="error" class="mt-1 text-xs text-expense">{{ error }}</p>
  </div>
</template>