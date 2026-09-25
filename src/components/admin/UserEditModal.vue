<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { UserRecord } from '@/types'
import Modal from '@/components/common/Modal.vue'
import Select from '@/components/common/Select.vue'
import Button from '@/components/common/Button.vue'

const props = defineProps<{ open: boolean; user: UserRecord | null }>()
const emit = defineEmits<{ save: [payload: { role: UserRecord['role']; isActive: boolean }]; close: [] }>()

const form = reactive({ role: 'user' as UserRecord['role'], isActive: true })

watch(
  () => props.user,
  (user) => {
    if (user) {
      form.role = user.role
      form.isActive = user.isActive
    }
  },
  { immediate: true },
)

function submit() {
  emit('save', { role: form.role, isActive: form.isActive })
}
</script>

<template>
  <Modal :open="open" title="Edit User" @close="emit('close')">
    <div v-if="user" class="space-y-4">
      <div class="flex items-center gap-3 rounded-xl border border-ink-100 dark:border-ink-800 p-3">
        <span
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink-900 text-sm font-semibold text-white dark:bg-ink-100 dark:text-ink-900"
        >
          {{ (user.fullName || user.email || 'U').slice(0, 2).toUpperCase() }}
        </span>
        <div class="min-w-0">
          <p class="truncate text-sm font-medium text-ink-900 dark:text-ink-50">{{ user.fullName || '—' }}</p>
          <p class="truncate text-xs text-ink-500 dark:text-ink-400">{{ user.email }}</p>
        </div>
      </div>

      <Select
        v-model="form.role"
        label="Role"
        :options="[
          { value: 'user', label: 'User' },
          { value: 'admin', label: 'Admin' },
        ]"
      />

      <label class="flex items-center justify-between rounded-xl border border-ink-100 dark:border-ink-800 px-4 py-3 cursor-pointer">
        <span>
          <span class="block text-sm font-medium text-ink-800 dark:text-ink-100">Account active</span>
          <span class="text-xs text-ink-500 dark:text-ink-400">Inactive users cannot sign in to the app.</span>
        </span>
        <input
          type="checkbox"
          class="h-4 w-4 accent-ink-800"
          :checked="form.isActive"
          @change="form.isActive = ($event.target as HTMLInputElement).checked"
        />
      </label>

      <div class="flex justify-end gap-2 pt-1">
        <Button variant="ghost" @click="emit('close')">Cancel</Button>
        <Button @click="submit">Save Changes</Button>
      </div>
    </div>
  </Modal>
</template>