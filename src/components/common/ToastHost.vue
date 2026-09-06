<script setup lang="ts">
import { useToastStore } from '@/stores/toastStore'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-vue-next'

const toastStore = useToastStore()
</script>

<template>
  <div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] sm:w-80">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        class="flex items-start gap-2.5 rounded-xl px-4 py-3 shadow-card text-sm bg-white dark:bg-ink-800 border"
        :class="{
          'border-income/30': toast.variant === 'success',
          'border-expense/30': toast.variant === 'error',
          'border-ink-200 dark:border-ink-700': toast.variant === 'info',
        }"
      >
        <CheckCircle2
          v-if="toast.variant === 'success'"
          :size="18"
          class="text-income shrink-0 mt-0.5"
        />
        <AlertCircle
          v-else-if="toast.variant === 'error'"
          :size="18"
          class="text-expense shrink-0 mt-0.5"
        />
        <Info
          v-else
          :size="18"
          class="text-ink-500 shrink-0 mt-0.5"
        />
        <p class="flex-1 text-ink-800 dark:text-ink-100">
          {{ toast.message }}
        </p>
        <button
          class="text-ink-400 hover:text-ink-600"
          @click="toastStore.dismiss(toast.id)"
        >
          <X :size="14" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from { opacity: 0; transform: translateX(20px); }
.toast-leave-to { opacity: 0; transform: translateX(20px); }
</style>
