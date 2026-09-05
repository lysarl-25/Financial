<script setup lang="ts">
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
  BookText,
} from 'lucide-vue-next'

defineProps<{ collapsed: boolean }>()
const route = useRoute()

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/income', label: 'Income', icon: TrendingUp },
  { to: '/expenses', label: 'Expenses', icon: TrendingDown },
  { to: '/budgets', label: 'Budgets', icon: PiggyBank },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

function isActive(to: string) {
  return route.path.startsWith(to)
}
</script>

<template>
  <aside
    class="hidden md:flex h-screen sticky top-0 self-start flex-col shrink-0 border-r border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 transition-all duration-200"
    :class="collapsed ? 'w-[76px]' : 'w-64'"
  >
    <div class="h-16 flex items-center gap-2.5 px-5 border-b border-ink-100 dark:border-ink-800">
      <div class="h-8 w-8 rounded-lg bg-ink-900 dark:bg-ink-100 flex items-center justify-center shrink-0">
        <BookText :size="16" class="text-income" />
      </div>
      <span v-if="!collapsed" class="font-display text-lg font-semibold tracking-tight text-ink-900 dark:text-ink-50">
        Financial
      </span>
    </div>

    <nav class="flex-1 py-4 px-3 space-y-1">
      <RouterLink
        v-for="item in nav"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
        :class="
          isActive(item.to)
            ? 'bg-ink-900 text-white dark:bg-ink-100 dark:text-ink-900'
            : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800'
        "
      >
        <component :is="item.icon" :size="18" class="shrink-0" />
        <span v-if="!collapsed">{{ item.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>
