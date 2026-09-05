<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { Transaction } from '@/types'
import { useCategoryStore } from '@/stores/categoryStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { useToastStore } from '@/stores/toastStore'
import { formatCurrency, formatDate } from '@/utils/format'
import { useSettingsStore } from '@/stores/settingsStore'
import EmptyState from '@/components/common/EmptyState.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import TransactionModal from './TransactionModal.vue'

const props = defineProps<{ transactions: Transaction[] }>()

const categoryStore = useCategoryStore()
const transactionStore = useTransactionStore()
const toastStore = useToastStore()
const settingsStore = useSettingsStore()

const page = ref(1)
const pageSize = 10

const totalPages = computed(() => Math.max(1, Math.ceil(props.transactions.length / pageSize)))
const paginated = computed(() => {
  const start = (page.value - 1) * pageSize
  return props.transactions.slice(start, start + pageSize)
})

watch(
  () => props.transactions.length,
  () => {
    if (page.value > totalPages.value) page.value = totalPages.value
  },
)

const editing = ref<Transaction | undefined>(undefined)
const editOpen = ref(false)
const deletingId = ref<string | null>(null)

function openEdit(t: Transaction) {
  editing.value = t
  editOpen.value = true
}

async function confirmDelete() {
  if (!deletingId.value) return
  try {
    await transactionStore.remove(deletingId.value)
    toastStore.success('Transaction deleted successfully.')
  } catch {
    toastStore.error('Could not delete transaction.')
  } finally {
    deletingId.value = null
  }
}
</script>

<template>
  <div class="card overflow-hidden">
    <EmptyState v-if="!transactions.length" title="No transactions found" description="Try adjusting your filters or add a new transaction." />
    <template v-else>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-ink-100 dark:border-ink-800 text-left text-xs uppercase tracking-wide text-ink-500 dark:text-ink-400">
              <th class="px-5 py-3 font-medium">Date</th>
              <th class="px-5 py-3 font-medium">Description</th>
              <th class="px-5 py-3 font-medium">Category</th>
              <th class="px-5 py-3 font-medium hidden sm:table-cell">Payment</th>
              <th class="px-5 py-3 font-medium text-right">Amount</th>
              <th class="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-ink-100 dark:divide-ink-800">
            <tr v-for="t in paginated" :key="t.id" class="hover:bg-ink-50 dark:hover:bg-ink-800/50">
              <td class="px-5 py-3 whitespace-nowrap text-ink-600 dark:text-ink-300">{{ formatDate(t.date, settingsStore.dateFormat) }}</td>
              <td class="px-5 py-3">
                <p class="font-medium text-ink-800 dark:text-ink-100">{{ t.description }}</p>
                <p v-if="t.note" class="text-xs text-ink-400">{{ t.note }}</p>
              </td>
              <td class="px-5 py-3">
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                  :style="{ backgroundColor: (categoryStore.byId(t.categoryId)?.color || '#999') + '1f', color: categoryStore.byId(t.categoryId)?.color }"
                >
                  {{ categoryStore.byId(t.categoryId)?.name }}
                </span>
              </td>
              <td class="px-5 py-3 hidden sm:table-cell text-ink-500 dark:text-ink-400">{{ t.paymentMethod }}</td>
              <td class="px-5 py-3 text-right font-mono tabular-nums font-semibold" :class="t.type === 'income' ? 'text-income' : 'text-expense'">
                {{ t.type === 'income' ? '+' : '-' }}{{ formatCurrency(t.amount, settingsStore.currency) }}
              </td>
              <td class="px-5 py-3">
                <div class="flex justify-end gap-1">
                  <button class="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-500" aria-label="Edit" @click="openEdit(t)">
                    <Pencil :size="15" />
                  </button>
                  <button class="p-1.5 rounded-lg hover:bg-expense-light text-ink-500 hover:text-expense" aria-label="Delete" @click="deletingId = t.id">
                    <Trash2 :size="15" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex items-center justify-between px-5 py-3.5 border-t border-ink-100 dark:border-ink-800">
        <p class="text-xs text-ink-500 dark:text-ink-400">
          Showing {{ (page - 1) * pageSize + 1 }}–{{ Math.min(page * pageSize, transactions.length) }} of {{ transactions.length }}
        </p>
        <div class="flex items-center gap-1">
          <button class="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 disabled:opacity-30" :disabled="page === 1" @click="page--">
            <ChevronLeft :size="16" />
          </button>
          <span class="text-xs text-ink-500 px-2">{{ page }} / {{ totalPages }}</span>
          <button class="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 disabled:opacity-30" :disabled="page === totalPages" @click="page++">
            <ChevronRight :size="16" />
          </button>
        </div>
      </div>
    </template>

    <TransactionModal :open="editOpen" mode="edit" :transaction="editing" @close="editOpen = false" />
    <ConfirmDialog
      :open="!!deletingId"
      message="This will permanently delete the transaction. This action cannot be undone."
      @confirm="confirmDelete"
      @cancel="deletingId = null"
    />
  </div>
</template>
