<script setup lang="ts">
import Modal from '@/components/common/Modal.vue'
import TransactionForm from './TransactionForm.vue'
import { useTransactionStore } from '@/stores/transactionStore'
import { useToastStore } from '@/stores/toastStore'
import type { Transaction, TransactionType } from '@/types'

const props = defineProps<{
  open: boolean
  mode: 'create' | 'edit'
  transaction?: Transaction
  forcedType?: TransactionType
}>()
const emit = defineEmits<{ close: [] }>()

const transactionStore = useTransactionStore()
const toastStore = useToastStore()

async function handleSubmit(payload: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    if (props.mode === 'edit' && props.transaction) {
      await transactionStore.update(props.transaction.id, payload)
      toastStore.success('Transaction updated successfully.')
    } else {
      await transactionStore.create(payload)
      toastStore.success('Transaction added successfully.')
    }
    emit('close')
  } catch (e) {
    toastStore.error('Something went wrong. Please try again.')
  }
}
</script>

<template>
  <Modal :open="open" :title="mode === 'edit' ? 'Edit Transaction' : 'Add Transaction'" @close="emit('close')">
    <TransactionForm
      :key="transaction?.id || 'new'"
      :initial="transaction"
      :forced-type="forcedType"
      @submit="handleSubmit"
      @cancel="emit('close')"
    />
  </Modal>
</template>
