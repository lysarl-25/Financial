<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search, X } from 'lucide-vue-next'
import Select from '@/components/common/Select.vue'
import { useTransactionStore } from '@/stores/transactionStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { debounce } from '@/utils/format'
import type { TransactionType } from '@/types'

const props = defineProps<{ fixedType?: TransactionType }>()

const transactionStore = useTransactionStore()
const categoryStore = useCategoryStore()

const searchInput = ref(transactionStore.filters.search)
const debouncedSetSearch = debounce((value: string) => transactionStore.setFilters({ search: value }), 300)

watch(searchInput, (value) => debouncedSetSearch(value))

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
]

const categoryOptions = () => {
  const relevant = props.fixedType
    ? categoryStore.categories.filter((c) => c.type === props.fixedType)
    : categoryStore.categories

  return [{ value: 'all', label: 'All Categories' }, ...relevant.map((c) => ({ value: c.id, label: c.name }))]
}

const sortOptions = [
  { value: 'date-desc', label: 'Date (Newest)' },
  { value: 'date-asc', label: 'Date (Oldest)' },
  { value: 'amount-desc', label: 'Amount (High to Low)' },
  { value: 'amount-asc', label: 'Amount (Low to High)' },
  { value: 'description-asc', label: 'Description (A-Z)' },
]

function handleSort(value: string) {
  const [sortBy, sortDir] = value.split('-') as ['date' | 'amount' | 'description', 'asc' | 'desc']
  transactionStore.setFilters({ sortBy, sortDir })
}

function clearAll() {
  searchInput.value = ''
  transactionStore.resetFilters()
  if (props.fixedType) transactionStore.setFilters({ type: props.fixedType })
}
</script>

<template>
  <div class="card w-full p-4">
    <div class="flex flex-col gap-4">
      <div class="min-w-0">
        <label class="label">Search</label>
        <div class="relative">
          <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input v-model="searchInput" type="text" placeholder="Search transactions..." class="input min-w-0 pl-9" />
        </div>
      </div>

      <div class="flex flex-col gap-4 lg:flex-row lg:flex-nowrap lg:items-end">
        <div v-if="!fixedType" class="min-w-0 lg:flex-1">
        <Select
          class="w-full"
          :model-value="transactionStore.filters.type"
          label="Type"
          :options="typeOptions"
          @update:model-value="(v) => transactionStore.setFilters({ type: v as any })"
        />
        </div>

        <div class="min-w-0 lg:flex-1">
        <Select
          class="w-full"
          :model-value="transactionStore.filters.categoryId"
          label="Category"
          :options="categoryOptions()"
          @update:model-value="(v) => transactionStore.setFilters({ categoryId: v })"
        />
        </div>

        <div class="min-w-0 lg:flex-1">
        <label class="label">From</label>
        <input
          type="date"
          class="input min-w-0"
          :value="transactionStore.filters.dateFrom || ''"
          @change="(e) => transactionStore.setFilters({ dateFrom: (e.target as HTMLInputElement).value || null })"
        />
        </div>

        <div class="min-w-0 lg:flex-1">
        <label class="label">To</label>
        <input
          type="date"
          class="input min-w-0"
          :value="transactionStore.filters.dateTo || ''"
          @change="(e) => transactionStore.setFilters({ dateTo: (e.target as HTMLInputElement).value || null })"
        />
        </div>

        <div class="min-w-0 lg:flex-1">
        <Select
          class="w-full"
          :model-value="`${transactionStore.filters.sortBy}-${transactionStore.filters.sortDir}`"
          label="Sort By"
          :options="sortOptions"
          @update:model-value="handleSort"
        />
        </div>

        <div class="flex lg:flex-none lg:items-end">
          <button class="btn-ghost shrink-0 whitespace-nowrap" @click="clearAll">
            <X :size="14" /> Clear
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
