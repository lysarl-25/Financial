<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Shield, ShieldOff, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { UserRecord } from '@/types'
import EmptyState from '@/components/common/EmptyState.vue'

const props = defineProps<{ users: UserRecord[]; currentUserId: string | null }>()
const emit = defineEmits<{ edit: [user: UserRecord]; delete: [user: UserRecord] }>()

const page = ref(1)
const pageSize = 10

const totalPages = computed(() => Math.max(1, Math.ceil(props.users.length / pageSize)))
const paginated = computed(() => {
  const start = (page.value - 1) * pageSize
  return props.users.slice(start, start + pageSize)
})

watch(
  () => props.users.length,
  () => {
    if (page.value > totalPages.value) page.value = totalPages.value
  },
)

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="card overflow-hidden">
    <EmptyState
      v-if="!users.length"
      title="No users found"
      description="Registered users will appear here."
    />
    <template v-else>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-ink-100 dark:border-ink-800 text-left text-xs uppercase tracking-wide text-ink-500 dark:text-ink-400">
              <th class="px-5 py-3 font-medium">User</th>
              <th class="px-5 py-3 font-medium">Role</th>
              <th class="px-5 py-3 font-medium">Status</th>
              <th class="px-5 py-3 font-medium hidden md:table-cell">Joined</th>
              <th class="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-ink-100 dark:divide-ink-800">
            <tr v-for="u in paginated" :key="u.id" class="hover:bg-ink-50 dark:hover:bg-ink-800/50">
              <td class="px-5 py-3">
                <div class="flex items-center gap-3">
                  <span
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-900 text-xs font-semibold text-white dark:bg-ink-100 dark:text-ink-900"
                  >
                    {{ (u.fullName || u.email || 'U').slice(0, 2).toUpperCase() }}
                  </span>
                  <div class="min-w-0">
                    <p class="flex items-center gap-1.5 font-medium text-ink-800 dark:text-ink-100">
                      {{ u.fullName || '—' }}
                      <span v-if="u.id === currentUserId" class="text-xs text-ink-400">(you)</span>
                    </p>
                    <p class="truncate text-xs text-ink-500 dark:text-ink-400">{{ u.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-3">
                <span
                  class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                  :class="u.role === 'admin' ? 'bg-income-light text-income-dark dark:bg-income/15 dark:text-income' : 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300'"
                >
                  <Shield v-if="u.role === 'admin'" :size="12" />
                  <ShieldOff v-else :size="12" />
                  {{ u.role === 'admin' ? 'Admin' : 'User' }}
                </span>
              </td>
              <td class="px-5 py-3">
                <span
                  class="inline-flex items-center gap-1.5 text-xs font-medium"
                  :class="u.isActive ? 'text-income-dark dark:text-income' : 'text-expense'"
                >
                  <span
                    class="h-1.5 w-1.5 rounded-full"
                    :class="u.isActive ? 'bg-income' : 'bg-expense'"
                  />
                  {{ u.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-5 py-3 hidden md:table-cell text-ink-500 dark:text-ink-400">
                {{ formatDate(u.createdAt) }}
              </td>
              <td class="px-5 py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button
                    class="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-500 hover:text-ink-700 dark:hover:text-ink-200"
                    aria-label="Edit user"
                    @click="emit('edit', u)"
                  >
                    <Pencil :size="15" />
                  </button>
                  <button
                    v-if="u.id !== currentUserId"
                    class="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-ink-400 hover:text-red-600 dark:hover:text-red-400"
                    aria-label="Delete user"
                    @click="emit('delete', u)"
                  >
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
          Showing {{ (page - 1) * pageSize + 1 }}–{{ Math.min(page * pageSize, users.length) }} of {{ users.length }}
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
</template>