<script setup lang="ts">
import Modal from './Modal.vue'
import Button from './Button.vue'

withDefaults(
  defineProps<{
    open: boolean
    title?: string
    message: string
    confirmLabel?: string
    loading?: boolean
  }>(),
  { title: 'Are you sure?', confirmLabel: 'Delete', loading: false },
)
const emit = defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <Modal :open="open" :title="title" @close="emit('cancel')">
    <p class="text-sm text-ink-600 dark:text-ink-300 mb-6">{{ message }}</p>
    <div class="flex justify-end gap-3">
      <Button variant="secondary" :disabled="loading" @click="emit('cancel')">Cancel</Button>
      <Button variant="danger" :disabled="loading" @click="emit('confirm')">
        <span v-if="loading" class="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        {{ loading ? 'Deleting…' : confirmLabel }}
      </Button>
    </div>
  </Modal>
</template>
