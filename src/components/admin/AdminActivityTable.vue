<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Search, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { ActivityLog } from '@/types'
import EmptyState from '@/components/common/EmptyState.vue'

const props = defineProps<{ activities: ActivityLog[] }>()
const search = ref('')
const actionFilter = ref('all')
const page = ref(1)
const pageSize = 10

const actionLabels: Record<string, { label: string; kind: 'auth' | 'data' }> = {
  'auth.login': { label: 'Signed in', kind: 'auth' },
  'auth.signup': { label: 'Registered', kind: 'auth' },
  'auth.logout': { label: 'Signed out', kind: 'auth' },
  'transaction.create': { label: 'Created transaction', kind: 'data' },
  'transaction.update': { label: 'Updated transaction', kind: 'data' },
  'transaction.delete': { label: 'Deleted transaction', kind: 'data' },
  'category.create': { label: 'Created category', kind: 'data' },
  'category.update': { label: 'Updated category', kind: 'data' },
  'category.delete': { label: 'Deleted category', kind: 'data' },
  'budget.create': { label: 'Created budget', kind: 'data' },
  'budget.update': { label: 'Updated budget', kind: 'data' },
  'budget.delete': { label: 'Deleted budget', kind: 'data' },
  'profile.update': { label: 'Updated profile', kind: 'data' },
  'preferences.update': { label: 'Updated preferences', kind: 'data' },
  'notifications.update': { label: 'Changed notifications', kind: 'data' },
  'theme.toggle': { label: 'Changed theme', kind: 'data' },
  'user.role_update': { label: 'Changed user role', kind: 'data' },
  'user.status_update': { label: 'Changed user status', kind: 'data' },
}

function actionInfo(action: string) {
  return actionLabels[action] ?? { label: action, kind: 'data' as const }
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return props.activities.filter((a) => {
    if (actionFilter.value === 'auth' && actionInfo(a.action).kind !== 'auth') return false
    if (actionFilter.value === 'data' && actionInfo(a.action).kind !== 'data') return false
    if (!q) return true
    return (
      a.userFullName.toLowerCase().includes(q) ||
      a.userEmail.toLowerCase().includes(q) ||
      a.action.toLowerCase().includes(q) ||
      actionInfo(a.action).label.toLowerCase().includes(q)
    )
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const paginated = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

watch([filtered], () => {
  if (page.value > totalPages.value) page.value = totalPages.value
})

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          v-model="search"
          type="text"
          placeholder="Search by user, email, or action…"
          class="input pl-9"
        />
      </div>
      <select v-model="actionFilter" class="input sm:w-52 appearance-none cursor-pointer">
        <option value="all">All activity</option>
        <option value="auth">Auth events</option>
        <option value="data">Data changes</option>
      </select>
    </div>

    <div class="card overflow-hidden">
      <EmptyState
        v-if="!filtered.length"
        title="No activity found"
        description="User actions will appear here as they use the app."
      />
      <template v-else>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-ink-100 dark:border-ink-800 text-left text-xs uppercase tracking-wide text-ink-500 dark:text-ink-400">
                <th class="px-5 py-3 font-medium">User</th>
                <th class="px-5 py-3 font-medium">Action</th>
                <th class="px-5 py-3 font-medium hidden sm:table-cell">Entity</th>
                <th class="px-5 py-3 font-medium text-right">Time</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-ink-100 dark:divide-ink-800">
              <tr v-for="a in paginated" :key="a.id" class="hover:bg-ink-50 dark:hover:bg-ink-800/50">
                <td class="px-5 py-3">
                  <p class="font-medium text-ink-800 dark:text-ink-100">{{ a.userFullName || 'Unknown user' }}</p>
                  <p class="truncate text-xs text-ink-500 dark:text-ink-400">{{ a.userEmail }}</p>
                </td>
                <td class="px-5 py-3">
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                    :class="actionInfo(a.action).kind === 'auth' ? 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300' : 'bg-income-light text-income-dark dark:bg-income/15 dark:text-income'"
                  >
                    {{ actionInfo(a.action).label }}
                  </span>
                </td>
                <td class="px-5 py-3 hidden sm:table-cell text-ink-500 dark:text-ink-400">
                  {{ a.entityType }}
                </td>
                <td class="px-5 py-3 text-right whitespace-nowrap text-ink-500 dark:text-ink-400">
                  {{ formatDateTime(a.createdAt) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between px-5 py-3.5 border-t border-ink-100 dark:border-ink-800">
          <p class="text-xs text-ink-500 dark:text-ink-400">
            Showing {{ (page - 1) * pageSize + 1 }}–{{ Math.min(page * pageSize, filtered.length) }} of {{ filtered.length }}
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
    </div>
  </div>
</template>