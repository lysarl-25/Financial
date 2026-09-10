<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  BarChart3,
  Tags,
  Settings as SettingsIcon,
  ShieldCheck,
  X,
  DollarSign,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/authStore'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
const route = useRoute()
const authStore = useAuthStore()

const nav = computed(() => {
  const items = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { to: '/income', label: 'Income', icon: TrendingUp },
    { to: '/expenses', label: 'Expenses', icon: TrendingDown },
    { to: '/budgets', label: 'Budgets', icon: PiggyBank },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
    { to: '/categories', label: 'Categories', icon: Tags },
  ]
  if (authStore.isAdmin) {
    items.push({ to: '/admin', label: 'User Management', icon: ShieldCheck })
  }
  items.push({ to: '/settings', label: 'Settings', icon: SettingsIcon })
  return items
})

function isActive(to: string) {
  return route.path.startsWith(to)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fixed inset-0 z-50 md:hidden">
        <div class="absolute inset-0 bg-ink-950/40" @click="emit('close')" />
        <Transition name="slide-in">
          <div v-if="open" class="absolute inset-y-0 left-0 w-72 bg-white dark:bg-ink-900 shadow-card flex flex-col">
            <div class="h-16 flex items-center justify-between px-5 border-b border-ink-100 dark:border-ink-800">
              <div class="flex items-center gap-2.5">
                <div class="h-8 w-8 rounded-lg bg-ink-900 dark:bg-ink-100 flex items-center justify-center">
                  <DollarSign :size="16" class="text-income" />
                </div>
                <span class="font-display text-lg font-semibold text-ink-900 dark:text-ink-50">Financial</span>
              </div>
              <button class="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800" @click="emit('close')">
                <X :size="18" />
              </button>
            </div>
            <nav class="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
              <RouterLink
                v-for="item in nav"
                :key="item.to"
                :to="item.to"
                class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium"
                :class="
                  isActive(item.to)
                    ? 'bg-ink-900 text-white dark:bg-ink-100 dark:text-ink-900'
                    : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800'
                "
                @click="emit('close')"
              >
                <component :is="item.icon" :size="18" />
                <span>{{ item.label }}</span>
              </RouterLink>
            </nav>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-in-enter-active, .slide-in-leave-active { transition: transform 0.25s ease; }
.slide-in-enter-from, .slide-in-leave-to { transform: translateX(-100%); }
</style>
