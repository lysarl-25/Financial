<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Bell, Menu, PanelLeftClose, PanelLeft, Moon, Sun, User } from 'lucide-vue-next'
import { useSettingsStore } from '@/stores/settingsStore'

defineProps<{ collapsed: boolean }>()
const emit = defineEmits<{ 'toggle-collapse': []; 'open-mobile-menu': [] }>()

const route = useRoute()
const settingsStore = useSettingsStore()

const profileInitials = computed(() => {
  const name = settingsStore.profileName?.trim() || 'User'
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
})


</script>

<template>
  <header
    class="h-16 flex items-center justify-between gap-3 px-4 sm:px-6 border-b border-ink-100 dark:border-ink-800 bg-white/80 dark:bg-ink-900/80 backdrop-blur sticky top-0 z-30"
  >
    <div class="flex items-center gap-2">
      <button
        class="md:hidden p-2 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-600 dark:text-ink-300"
        aria-label="Open menu"
        @click="emit('open-mobile-menu')"
      >
        <Menu :size="20" />
      </button>
      <button
        class="hidden md:inline-flex p-2 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-600 dark:text-ink-300"
        :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        @click="emit('toggle-collapse')"
      >
        <PanelLeft v-if="collapsed" :size="18" />
        <PanelLeftClose v-else :size="18" />
      </button>
    </div>

    <div class="flex items-center gap-2">
      <button
        class="p-2 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-600 dark:text-ink-300"
        aria-label="Toggle theme"
        @click="settingsStore.toggleTheme()"
      >
        <Moon v-if="settingsStore.theme === 'light'" :size="18" />
        <Sun v-else :size="18" />
      </button>

      <button
        class="relative p-2 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-600 dark:text-ink-300"
        aria-label="Notifications"
      >
        <Bell :size="18" />
        <span class="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-expense ring-2 ring-white dark:ring-ink-900" />
      </button>

      <RouterLink
        to="/settings"
        class="flex items-center gap-2 rounded-full border border-ink-200 dark:border-ink-800 bg-white/80 dark:bg-ink-900/60 px-2 py-1.5 hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors"
        aria-label="View profile"
      >
        <span
          class="flex h-8 w-8 items-center justify-center rounded-full bg-ink-900 text-sm font-semibold text-white dark:bg-ink-100 dark:text-ink-900"
        >
          <template v-if="profileInitials">{{ profileInitials }}</template>
          <User v-else :size="16" />
        </span>
        <span class="hidden sm:flex flex-col items-start leading-tight pr-1">
          <span class="text-sm font-medium text-ink-900 dark:text-ink-50">{{ settingsStore.profileName }}</span>
          <span class="text-xs text-ink-500 dark:text-ink-400">View profile</span>
        </span>
      </RouterLink>
    </div>
  </header>
</template>
