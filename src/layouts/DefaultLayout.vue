<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import Header from '@/components/layout/Header.vue'
import MobileMenu from '@/components/layout/MobileMenu.vue'
import { useTransactionStore } from '@/stores/transactionStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useBudgetStore } from '@/stores/budgetStore'

const collapsed = ref(false)
const mobileMenuOpen = ref(false)

const transactionStore = useTransactionStore()
const categoryStore = useCategoryStore()
const budgetStore = useBudgetStore()

onMounted(() => {
  if (!transactionStore.loaded) transactionStore.fetchAll()
  if (!categoryStore.loaded) categoryStore.fetchAll()
  if (!budgetStore.loaded) budgetStore.fetchAll()
})
</script>

<template>
  <div class="min-h-screen flex bg-surface-alt dark:bg-ink-950">
    <Sidebar :collapsed="collapsed" @toggle-collapse="collapsed = !collapsed" />
    <MobileMenu
      :open="mobileMenuOpen"
      @close="mobileMenuOpen = false"
    />

    <div class="flex-1 min-w-0 flex flex-col">
      <Header
        :collapsed="collapsed"
        @toggle-collapse="collapsed = !collapsed"
        @open-mobile-menu="mobileMenuOpen = true"
      />
      <main class="flex-1 p-4 sm:p-6 w-full max-w-[1440px] mx-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>
