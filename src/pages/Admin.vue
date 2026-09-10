<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Users, Activity as ActivityIcon, RefreshCw } from 'lucide-vue-next'
import type { ActivityLog, UserRecord } from '@/types'
import { listActivity, listUsers, logActivity, updateUser, fetchMyRole } from '@/services/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import { useSettingsStore } from '@/stores/settingsStore'
import AdminUsersTable from '@/components/admin/AdminUsersTable.vue'
import AdminActivityTable from '@/components/admin/AdminActivityTable.vue'
import UserEditModal from '@/components/admin/UserEditModal.vue'
import TableSkeleton from '@/components/common/TableSkeleton.vue'

const authStore = useAuthStore()
const toastStore = useToastStore()
const settingsStore = useSettingsStore()

const tab = ref<'users' | 'activity'>('users')
const users = ref<UserRecord[]>([])
const activities = ref<ActivityLog[]>([])
const loading = ref(false)
const editing = ref<UserRecord | null>(null)
const editOpen = ref(false)

const tabs = [
  { key: 'users' as const, label: 'Users', icon: Users },
  { key: 'activity' as const, label: 'Activity', icon: ActivityIcon },
]

async function loadAll() {
  loading.value = true
  try {
    const [userRows, activityRows] = await Promise.all([listUsers(), listActivity()])
    users.value = userRows
    activities.value = activityRows
  } catch {
    toastStore.error('Could not load admin data.')
  } finally {
    loading.value = false
  }
}

onMounted(loadAll)

function openEdit(user: UserRecord) {
  editing.value = user
  editOpen.value = true
}

async function saveUser(payload: { role: UserRecord['role']; isActive: boolean }) {
  const user = editing.value
  if (!user) return

  try {
    if (user.role !== payload.role && (await cannotDemote(user.id, payload.role))) {
      toastStore.error('You cannot demote the last remaining admin.')
      return
    }
    if (!payload.isActive && user.id === authStore.user?.id) {
      toastStore.error('You cannot deactivate your own account.')
      return
    }

    const updated = await updateUser(user.id, {
      role: payload.role,
      is_active: payload.isActive,
    })

    users.value = users.value.map((u) => (u.id === updated.id ? updated : u))

    if (user.role !== payload.role) {
      await logActivity({
        action: 'user.role_update',
        entityType: 'user',
        entityId: user.id,
        metadata: { from: user.role, to: payload.role, targetEmail: user.email },
      })
      toastStore.success(`Role changed to ${payload.role}.`)
    }
    if (user.isActive !== payload.isActive) {
      await logActivity({
        action: 'user.status_update',
        entityType: 'user',
        entityId: user.id,
        metadata: { to: payload.isActive ? 'active' : 'inactive', targetEmail: user.email },
      })
      toastStore.success(payload.isActive ? 'User activated.' : 'User deactivated.')
    }

    if (user.id === authStore.user?.id && payload.role !== user.role) {
      await refreshRoleAndSettings()
    }

    activities.value = await listActivity()
  } catch {
    toastStore.error('Could not update user.')
  } finally {
    editOpen.value = false
    editing.value = null
  }
}

/** Returns true when demoting `userId` to `role` would leave zero admins. */
async function cannotDemote(userId: string, role: UserRecord['role']): Promise<boolean> {
  if (role === 'admin') return false
  const admins = users.value.filter((u) => u.role === 'admin')
  if (admins.length > 1) return false
  return admins.some((u) => u.id === userId)
}

async function refreshRoleAndSettings() {
  authStore.role = await fetchMyRole()
  if (authStore.role !== 'admin') {
    toastStore.success('Your role was updated. Redirecting…')
    setTimeout(() => window.location.assign('/dashboard'), 800)
    return
  }
  await settingsStore.loadForUser()
}

const activeCount = computed(() => users.value.filter((u) => u.isActive).length)
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h2 class="font-display text-xl font-semibold text-ink-900 dark:text-ink-50">
          Admin Panel
        </h2>
        <p class="text-sm text-ink-500 dark:text-ink-400 mt-0.5">
          Manage users, set permissions, and track user activity.
        </p>
        <p class="text-sm text-ink-500 dark:text-ink-400 mt-2">
          {{ users.length }} registered users · {{ activeCount }} active
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="p-2 rounded-xl border border-ink-200 dark:border-ink-800 text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
          aria-label="Refresh"
          title="Refresh"
          @click="loadAll"
        >
          <RefreshCw :size="16" :class="{ 'animate-spin': loading }" />
        </button>
      </div>
    </div>

    <div class="flex rounded-2xl bg-ink-100 dark:bg-ink-800 p-1 w-fit">
      <button
        v-for="t in tabs"
        :key="t.key"
        class="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200"
        :class="tab === t.key ? 'bg-white dark:bg-ink-900 text-ink-900 dark:text-white shadow-sm' : 'text-ink-500 hover:text-ink-700 dark:hover:text-ink-300'"
        @click="tab = t.key"
      >
        <component :is="t.icon" :size="16" />
        {{ t.label }}
      </button>
    </div>

    <TableSkeleton v-if="loading && !users.length" :rows="6" />

    <div v-else>
      <AdminUsersTable
        v-if="tab === 'users'"
        :users="users"
        :current-user-id="authStore.user?.id ?? null"
        @edit="openEdit"
      />
      <AdminActivityTable v-else :activities="activities" />
    </div>

    <UserEditModal
      :open="editOpen"
      :user="editing"
      @save="saveUser"
      @close="editOpen = false"
    />
  </div>
</template>