<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import Input from '@/components/common/Input.vue'
import Select from '@/components/common/Select.vue'
import Button from '@/components/common/Button.vue'
import { useCategoryStore } from '@/stores/categoryStore'
import type { Transaction, TransactionType } from '@/types'
import { todayISO } from '@/utils/format'

const props = defineProps<{
  initial?: Partial<Transaction>
  forcedType?: TransactionType
}>()
const emit = defineEmits<{ submit: [payload: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>]; cancel: [] }>()

const categoryStore = useCategoryStore()

const form = reactive({
  type: (props.forcedType || props.initial?.type || 'expense') as TransactionType,
  amount: props.initial?.amount?.toString() || '',
  description: props.initial?.description || '',
  categoryId: props.initial?.categoryId || '',
  date: props.initial?.date || todayISO(),
  paymentMethod: props.initial?.paymentMethod || 'Bank Transfer',
  note: props.initial?.note || '',
})

const errors = reactive({ amount: '', description: '', categoryId: '', date: '' })

const categoryOptions = computed(() =>
  (form.type === 'income' ? categoryStore.incomeCategories : categoryStore.expenseCategories).map((c) => ({
    value: c.id,
    label: c.name,
  })),
)

watch(
  () => form.type,
  () => {
    if (!categoryOptions.value.find((o) => o.value === form.categoryId)) {
      form.categoryId = categoryOptions.value[0]?.value || ''
    }
  },
  { immediate: true },
)

const paymentOptions = [
  { value: 'Credit Card', label: 'Credit Card' },
  { value: 'Debit Card', label: 'Debit Card' },
  { value: 'Cash', label: 'Cash' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
]

function validate(): boolean {
  errors.amount = ''
  errors.description = ''
  errors.categoryId = ''
  errors.date = ''
  let valid = true

  const amountNum = Number(form.amount)
  if (!form.amount || isNaN(amountNum) || amountNum <= 0) {
    errors.amount = 'Amount is required and must be greater than 0.'
    valid = false
  }
  if (!form.description.trim()) {
    errors.description = 'Description is required.'
    valid = false
  }
  if (!form.categoryId) {
    errors.categoryId = 'Category is required.'
    valid = false
  }
  if (!form.date) {
    errors.date = 'Date is required.'
    valid = false
  }
  return valid
}

function handleSubmit() {
  if (!validate()) return
  emit('submit', {
    type: form.type,
    amount: Number(form.amount),
    description: form.description.trim(),
    categoryId: form.categoryId,
    date: form.date,
    paymentMethod: form.paymentMethod,
    note: form.note.trim(),
  })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <div v-if="!forcedType">
      <label class="label">Transaction Type</label>
      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          class="rounded-xl border py-2.5 text-sm font-medium transition-colors"
          :class="
            form.type === 'income'
              ? 'border-income bg-income-light text-income-dark'
              : 'border-ink-200 text-ink-500 dark:border-ink-700'
          "
          @click="form.type = 'income'"
        >
          Income
        </button>
        <button
          type="button"
          class="rounded-xl border py-2.5 text-sm font-medium transition-colors"
          :class="
            form.type === 'expense'
              ? 'border-expense bg-expense-light text-expense-dark'
              : 'border-ink-200 text-ink-500 dark:border-ink-700'
          "
          @click="form.type = 'expense'"
        >
          Expense
        </button>
      </div>
    </div>

    <Input v-model="form.amount" type="number" step="0.01" min="0" label="Amount" placeholder="0.00" :error="errors.amount" />
    <Input v-model="form.description" label="Description" placeholder="e.g. Grocery shopping" :error="errors.description" />
    <Select v-model="form.categoryId" label="Category" :options="categoryOptions" :error="errors.categoryId" />
    <Input v-model="form.date" type="date" label="Date" :error="errors.date" />
    <Select v-model="form.paymentMethod" label="Payment Method" :options="paymentOptions" />
    <Input v-model="form.note" label="Note (optional)" placeholder="Add a note" />

    <div class="flex justify-end gap-3 pt-2">
      <Button variant="secondary" type="button" @click="emit('cancel')">Cancel</Button>
      <Button type="submit">Save</Button>
    </div>
  </form>
</template>
