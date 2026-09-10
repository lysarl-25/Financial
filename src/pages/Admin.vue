<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Users, Activity as ActivityIcon, RefreshCw } from 'lucide-vue-next'
import type { ActivityLog, UserRecord } from '@/types'
import { listActivity, listUsers, logActivity, updateUser, deleteUser, fetchMyRole } from '@/services/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import { useSettingsStore } from '@/stores/settingsStore'
import AdminUsersTable from '@/components/admin/AdminUsersTable.vue'
import AdminActivityTable from '@/components/admin/AdminActivityTable.vue'
import UserEditModal from '@/components/admin/UserEditModal.vue'
import TableSkeleton from '@/components/common/TableSkeleton.vue'
import Modal from '@/components/common/Modal.vue'
import Button from '@/components/common/Button.vue'

const authStore = useAuthStore()
const toastStore = useToastStore()
const settingsStore = useSettingsStore()

const tab = ref<'users' | 'activity'>('users')
const users = ref<UserRecord[]>([])
const activities = ref<ActivityLog[]>([])
const loading = ref(false)
const editing = ref<UserRecord | null>(null)
const editOpen = ref(false)
const deleting = ref<UserRecord | null>(null)
const deleteOpen = ref(false)
const deletingUser = ref(false)

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

function openDelete(user: UserRecord) {
  deleting.value = user
  deleteOpen.value = true
}

async function confirmDelete() {
  const user = deleting.value
  if (!user) return

  deletingUser.value = true
  try {
    await deleteUser(user.id)
    users.value = users.value.filter((u) => u.id !== user.id)
    await logActivity({
      action: 'user.delete',
      entityType: 'user',
      entityId: user.id,
      metadata: { targetEmail: user.email, targetName: user.fullName },
    })
    toastStore.success(`User ${user.email} has been permanently deleted.`)
  } catch {
    toastStore.error('Could not delete user. Make sure the Edge Function is deployed.')
  } finally {
    deletingUser.value = false
    deleteOpen.value = false
    deleting.value = null
    activities.value = await listActivity()
  }
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
        @delete="openDelete"
      />
      <AdminActivityTable v-else :activities="activities" />
    </div>

    <UserEditModal
      :open="editOpen"
      :user="editing"
      @save="saveUser"
      @close="editOpen = false"
    />

    <Modal :open="deleteOpen" title="Delete User" @close="deleteOpen = false">
      <div v-if="deleting" class="space-y-4">
        <div class="rounded-xl bg-red-50 dark:bg-red-900/20 p-4">
          <p class="text-sm text-red-700 dark:text-red-400">
            <strong>Warning:</strong> This action cannot be undone. All data associated with this user will be permanently deleted, including:
          </p>
          <ul class="mt-2 text-sm text-red-600 dark:text-red-400 list-disc list-inside space-y-1">
            <li>Transactions and budgets</li>
            <li>Categories and profiles</li>
            <li>Activity logs</li>
          </ul>
        </div>
        <div class="flex items-center gap-3 rounded-xl border border-ink-100 dark:border-ink-800 p-3">
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink-900 text-sm font-semibold text-white dark:bg-ink-100 dark:text-ink-900"
          >
            {{ (deleting.fullName || deleting.email || 'U').slice(0, 2).toUpperCase() }}
          </span>
          <div class="min-w-0">
            <p class="truncate text-sm font-medium text-ink-900 dark:text-ink-50">{{ deleting.fullName || '—' }}</p>
            <p class="truncate text-xs text-ink-500 dark:text-ink-400">{{ deleting.email }}</p>
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-1">
          <Button variant="ghost" :disabled="deletingUser" @click="deleteOpen = false">Cancel</Button>
          <Button variant="danger" :disabled="deletingUser" @click="confirmDelete">
            {{ deletingUser ? 'Deleting...' : 'Delete User' }}
          </Button>
        </div>
      </div>
    </Modal>
  </div>
</template>