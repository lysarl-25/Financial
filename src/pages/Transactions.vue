<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus } from 'lucide-vue-next'
import TransactionFilters from '@/components/transactions/TransactionFilters.vue'
import TransactionTable from '@/components/transactions/TransactionTable.vue'
import TransactionModal from '@/components/transactions/TransactionModal.vue'
import Loading from '@/components/common/Loading.vue'
import Button from '@/components/common/Button.vue'
import { useTransactionStore } from '@/stores/transactionStore'

const transactionStore = useTransactionStore()
const addOpen = ref(false)

onMounted(() => {
  transactionStore.resetFilters()
})
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <p class="text-sm text-ink-500 dark:text-ink-400">
        {{ transactionStore.transactions.length }} total transactions
      </p>
      <Button class="hidden sm:inline-flex" @click="addOpen = true">
        <Plus :size="16" /> Add Transaction
      </Button>
    </div>

    <TransactionFilters />

    <Loading v-if="transactionStore.loading && !transactionStore.loaded" label="Loading transactions…" />
    <TransactionTable v-else :transactions="transactionStore.filtered" />

    <TransactionModal :open="addOpen" mode="create" @close="addOpen = false" />
  </div>
</template>
