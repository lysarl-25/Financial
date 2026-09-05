<script setup lang="ts">
import { reactive, computed } from 'vue'
import Input from '@/components/common/Input.vue'
import Select from '@/components/common/Select.vue'
import Button from '@/components/common/Button.vue'
import { useCategoryStore } from '@/stores/categoryStore'
import { useBudgetStore } from '@/stores/budgetStore'
import type { Budget } from '@/types'

const props = defineProps<{ initial?: Partial<Budget> }>()
const emit = defineEmits<{ submit: [payload: Omit<Budget, 'id'>]; cancel: [] }>()

const categoryStore = useCategoryStore()
const budgetStore = useBudgetStore()

const form = reactive({
  categoryId: props.initial?.categoryId || categoryStore.expenseCategories[0]?.id || '',
  amount: props.initial?.amount?.toString() || '',
  month: props.initial?.month || budgetStore.selectedMonth,
})

const errors = reactive({ categoryId: '', amount: '' })

const categoryOptions = computed(() => categoryStore.expenseCategories.map((c) => ({ value: c.id, label: c.name })))

function validate(): boolean {
  errors.categoryId = ''
  errors.amount = ''
  let valid = true
  if (!form.categoryId) {
    errors.categoryId = 'Category is required.'
    valid = false
  }
  const amountNum = Number(form.amount)
  if (!form.amount || isNaN(amountNum) || amountNum <= 0) {
    errors.amount = 'Budget amount must be greater than 0.'
    valid = false
  }
  return valid
}

function handleSubmit() {
  if (!validate()) return
  emit('submit', { categoryId: form.categoryId, amount: Number(form.amount), month: form.month })
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <Select v-model="form.categoryId" label="Category" :options="categoryOptions" :error="errors.categoryId" />
    <Input v-model="form.amount" type="number" step="0.01" min="0" label="Monthly Budget Amount" placeholder="0.00" :error="errors.amount" />
    <div class="flex justify-end gap-3 pt-2">
      <Button variant="secondary" type="button" @click="emit('cancel')">Cancel</Button>
      <Button type="submit">Save Budget</Button>
    </div>
  </form>
</template>
