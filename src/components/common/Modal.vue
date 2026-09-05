<script setup lang="ts">
import { X } from 'lucide-vue-next'

defineProps<{ open: boolean; title: string }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div class="absolute inset-0 bg-ink-950/40" @click="emit('close')" />
        <Transition name="slide-up">
          <div
            v-if="open"
            class="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white dark:bg-ink-900 shadow-card p-6"
          >
            <div class="flex items-center justify-between mb-5">
              <h2 class="font-display text-lg font-semibold text-ink-900 dark:text-ink-50">{{ title }}</h2>
              <button
                class="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-500"
                aria-label="Close"
                @click="emit('close')"
              >
                <X :size="18" />
              </button>
            </div>
            <slot />
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.25s ease, opacity 0.25s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(16px); opacity: 0; }
</style>
