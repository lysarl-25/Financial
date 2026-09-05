<script setup lang="ts">
import Modal from './Modal.vue'
import Button from './Button.vue'

withDefaults(
  defineProps<{
    open: boolean
    title?: string
    message: string
    confirmLabel?: string
  }>(),
  { title: 'Are you sure?', confirmLabel: 'Delete' },
)
const emit = defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <Modal :open="open" :title="title" @close="emit('cancel')">
    <p class="text-sm text-ink-600 dark:text-ink-300 mb-6">{{ message }}</p>
    <div class="flex justify-end gap-3">
      <Button variant="secondary" @click="emit('cancel')">Cancel</Button>
      <Button variant="danger" @click="emit('confirm')">{{ confirmLabel }}</Button>
    </div>
  </Modal>
</template>
