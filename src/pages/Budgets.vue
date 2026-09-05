<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import BudgetCard from '@/components/budgets/BudgetCard.vue'
import BudgetForm from '@/components/budgets/BudgetForm.vue'
import Modal from '@/components/common/Modal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import Loading from '@/components/common/Loading.vue'
import Button from '@/components/common/Button.vue'
import { useBudgetStore } from '@/stores/budgetStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { useToastStore } from '@/stores/toastStore'
import { formatMonthLabel, shiftMonthKey } from '@/utils/format'
import type { Budget } from '@/types'

const budgetStore = useBudgetStore()
const transactionStore = useTransactionStore()
const toastStore = useToastStore()

const formOpen = ref(false)
const editing = ref<Budget | undefined>(undefined)
const deletingId = ref<string | null>(null)

onMounted(() => {
  if (!transactionStore.loaded) transactionStore.fetchAll()
})

function openCreate() {
  editing.value = undefined
  formOpen.value = true
}
function openEdit(b: Budget) {
  editing.value = b
  formOpen.value = true
}

async function handleSubmit(payload: Omit<Budget, 'id'>) {
  try {
    if (editing.value) {
      await budgetStore.update(editing.value.id, payload)
      toastStore.success('Budget updated successfully.')
    } else {
      await budgetStore.create(payload)
      toastStore.success('Budget created successfully.')
    }
    formOpen.value = false
  } catch {
    toastStore.error('Something went wrong. Please try again.')
  }
}

async function confirmDelete() {
  if (!deletingId.value) return
  try {
    await budgetStore.remove(deletingId.value)
    toastStore.success('Budget deleted successfully.')
  } catch {
    toastStore.error('Could not delete budget.')
  } finally {
    deletingId.value = null
  }
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div class="flex items-center gap-2">
        <button class="p-2 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800" @click="budgetStore.setSelectedMonth(shiftMonthKey(budgetStore.selectedMonth, -1))">
          <ChevronLeft :size="18" />
        </button>
        <span class="font-display font-medium text-ink-800 dark:text-ink-100 min-w-[9rem] text-center">
          {{ formatMonthLabel(budgetStore.selectedMonth) }}
        </span>
        <button class="p-2 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800" @click="budgetStore.setSelectedMonth(shiftMonthKey(budgetStore.selectedMonth, 1))">
          <ChevronRight :size="18" />
        </button>
      </div>
      <Button @click="openCreate">
        <Plus :size="16" /> New Budget
      </Button>
    </div>

    <Loading v-if="budgetStore.loading && !budgetStore.loaded" label="Loading budgets…" />
    <EmptyState
      v-else-if="!budgetStore.progress.length"
      title="No budgets for this month"
      description="Create a budget to start tracking your spending by category."
    >
      <template #action>
        <Button @click="openCreate"><Plus :size="16" /> New Budget</Button>
      </template>
    </EmptyState>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <BudgetCard
        v-for="b in budgetStore.progress"
        :key="b.id"
        :budget="b"
        @edit="openEdit(b)"
        @delete="deletingId = b.id"
      />
    </div>

    <Modal :open="formOpen" :title="editing ? 'Edit Budget' : 'New Budget'" @close="formOpen = false">
      <BudgetForm :key="editing?.id || 'new'" :initial="editing" @submit="handleSubmit" @cancel="formOpen = false" />
    </Modal>

    <ConfirmDialog
      :open="!!deletingId"
      message="This will permanently delete the budget. This action cannot be undone."
      @confirm="confirmDelete"
      @cancel="deletingId = null"
    />
  </div>
</template>
