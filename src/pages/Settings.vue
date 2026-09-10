<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Sun, Moon, LogOut, Trash2 } from 'lucide-vue-next'
import Input from '@/components/common/Input.vue'
import Select from '@/components/common/Select.vue'
import Button from '@/components/common/Button.vue'
import Modal from '@/components/common/Modal.vue'
import { useAuthStore } from '@/stores/authStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useToastStore } from '@/stores/toastStore'
import { deleteUser } from '@/services/supabase'

const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const toastStore = useToastStore()
const router = useRouter()

const profile = reactive({ profileName: settingsStore.profileName })

const currencyOptions = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
]
const dateFormatOptions = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
]

async function saveProfile() {
  try {
    await settingsStore.update({ profileName: profile.profileName })
    toastStore.success('Profile updated successfully.')
  } catch {
    toastStore.error('Could not save profile changes.')
  }
}

async function updateCurrency(value: string) {
  try {
    await settingsStore.update({ currency: value })
    toastStore.success('Currency preference saved.')
  } catch {
    toastStore.error('Could not save currency preference.')
  }
}
async function updateDateFormat(value: string) {
  try {
    await settingsStore.update({ dateFormat: value })
    toastStore.success('Date format saved.')
  } catch {
    toastStore.error('Could not save date format preference.')
  }
}

async function handleSignOut() {
  try {
    await authStore.signOut()
    toastStore.success('Signed out successfully.')
    router.replace('/login')
  } catch {
    toastStore.error('Could not sign out.')
  }
}

const deleteOpen = ref(false)
const deletingAccount = ref(false)

function openDeleteAccount() {
  deleteOpen.value = true
}

async function confirmDeleteAccount() {
  if (!authStore.user) return

  deletingAccount.value = true
  try {
    await deleteUser(authStore.user.id)
    await authStore.signOut()
    toastStore.success('Your account has been permanently deleted.')
    router.replace('/login')
  } catch {
    toastStore.error('Could not delete account. Please try again or contact support.')
  } finally {
    deletingAccount.value = false
    deleteOpen.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl space-y-6">
    <div>
      <h2 class="font-display text-xl font-semibold text-ink-900 dark:text-ink-50">Account Settings</h2>
      <p class="text-sm text-ink-500 dark:text-ink-400 mt-0.5">Manage your account, preferences, and financial application settings.</p>
    </div>

    <div class="card p-6">
      <h3 class="font-display text-base font-semibold text-ink-900 dark:text-ink-50 mb-4">Profile</h3>
      <form class="grid grid-cols-1 sm:grid-cols-2 gap-4" @submit.prevent="saveProfile">
        <Input v-model="profile.profileName" label="Full Name" />
        <Input :model-value="settingsStore.profileEmail" type="email" label="Email" readonly />
        <div class="sm:col-span-2 flex justify-end">
          <Button type="submit">Save Profile</Button>
        </div>
      </form>
    </div>

    <div class="card p-6">
      <h3 class="font-display text-base font-semibold text-ink-900 dark:text-ink-50 mb-4">Preferences</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select :model-value="settingsStore.currency" label="Currency" :options="currencyOptions" @update:model-value="updateCurrency" />
        <Select :model-value="settingsStore.dateFormat" label="Date Format" :options="dateFormatOptions" @update:model-value="updateDateFormat" />
      </div>
      <div class="mt-5 flex items-center justify-between rounded-xl border border-ink-100 dark:border-ink-800 px-4 py-3">
        <div>
          <p class="text-sm font-medium text-ink-800 dark:text-ink-100">Dark Mode</p>
          <p class="text-xs text-ink-500 dark:text-ink-400">Switch between light and dark theme</p>
        </div>
        <button
          class="relative h-6 w-11 rounded-full transition-colors flex items-center"
          :class="settingsStore.theme === 'dark' ? 'bg-ink-800 justify-end pr-0.5' : 'bg-ink-200 justify-start pl-0.5'"
          @click="settingsStore.toggleTheme()"
          :aria-label="`Switch to ${settingsStore.theme === 'dark' ? 'light' : 'dark'} mode`"
        >
          <span class="h-5 w-5 rounded-full bg-white shadow-sm flex items-center justify-center">
            <Sun v-if="settingsStore.theme === 'light'" :size="12" class="text-amber-500" />
            <Moon v-else :size="12" class="text-ink-800" />
          </span>
        </button>
      </div>
    </div>

    <div class="card p-6">
      <h3 class="font-display text-base font-semibold text-ink-900 dark:text-ink-50 mb-4">Notifications</h3>
      <div class="space-y-3">
        <label class="flex items-center justify-between rounded-xl border border-ink-100 dark:border-ink-800 px-4 py-3 cursor-pointer">
          <div>
            <p class="text-sm font-medium text-ink-800 dark:text-ink-100">Budget Alerts</p>
            <p class="text-xs text-ink-500 dark:text-ink-400">Get notified when spending nears a budget limit</p>
          </div>
          <input
            type="checkbox"
            class="h-4 w-4 accent-ink-800"
            :checked="settingsStore.notifications.budgetAlerts"
            @change="settingsStore.updateNotifications({ budgetAlerts: ($event.target as HTMLInputElement).checked })"
          />
        </label>
        <label class="flex items-center justify-between rounded-xl border border-ink-100 dark:border-ink-800 px-4 py-3 cursor-pointer">
          <div>
            <p class="text-sm font-medium text-ink-800 dark:text-ink-100">Weekly Summary</p>
            <p class="text-xs text-ink-500 dark:text-ink-400">A weekly recap of your income and spending</p>
          </div>
          <input
            type="checkbox"
            class="h-4 w-4 accent-ink-800"
            :checked="settingsStore.notifications.weeklySummary"
            @change="settingsStore.updateNotifications({ weeklySummary: ($event.target as HTMLInputElement).checked })"
          />
        </label>
        <label class="flex items-center justify-between rounded-xl border border-ink-100 dark:border-ink-800 px-4 py-3 cursor-pointer">
          <div>
            <p class="text-sm font-medium text-ink-800 dark:text-ink-100">Large Transaction Alerts</p>
            <p class="text-xs text-ink-500 dark:text-ink-400">Notify me for unusually large transactions</p>
          </div>
          <input
            type="checkbox"
            class="h-4 w-4 accent-ink-800"
            :checked="settingsStore.notifications.largeTransactions"
            @change="settingsStore.updateNotifications({ largeTransactions: ($event.target as HTMLInputElement).checked })"
          />
        </label>
      </div>
    </div>

    <div class="card p-6">
      <h3 class="font-display text-base font-semibold text-ink-900 dark:text-ink-50 mb-4">Session</h3>
      <p class="text-sm text-ink-500 dark:text-ink-400 mb-4">Sign out of your account on this device.</p>
      <Button variant="danger" :disabled="authStore.loading" @click="handleSignOut">
        <LogOut :size="16" />
        Sign Out
      </Button>
    </div>

    <div class="card p-6 border-red-200 dark:border-red-900/50">
      <h3 class="font-display text-base font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
      <p class="text-sm text-ink-500 dark:text-ink-400 mb-4">
        Permanently delete your account and all associated data. This action cannot be undone.
      </p>
      <Button variant="danger" :disabled="authStore.loading" @click="openDeleteAccount">
        <Trash2 :size="16" />
        Delete Account
      </Button>
    </div>

    <Modal :open="deleteOpen" title="Delete Account" @close="deleteOpen = false">
      <div class="space-y-4">
        <div class="rounded-xl bg-red-50 dark:bg-red-900/20 p-4">
          <p class="text-sm text-red-700 dark:text-red-400">
            <strong>Warning:</strong> This action cannot be undone. All your data will be permanently deleted, including:
          </p>
          <ul class="mt-2 text-sm text-red-600 dark:text-red-400 list-disc list-inside space-y-1">
            <li>All transactions and budgets</li>
            <li>Custom categories</li>
            <li>Profile and settings</li>
            <li>Activity history</li>
          </ul>
        </div>
        <div class="flex justify-end gap-2 pt-1">
          <Button variant="ghost" :disabled="deletingAccount" @click="deleteOpen = false">Cancel</Button>
          <Button variant="danger" :disabled="deletingAccount" @click="confirmDeleteAccount">
            {{ deletingAccount ? 'Deleting...' : 'Yes, Delete My Account' }}
          </Button>
        </div>
      </div>
    </Modal>
  </div>
</template>
