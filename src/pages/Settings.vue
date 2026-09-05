<script setup lang="ts">
import { reactive } from 'vue'
import Input from '@/components/common/Input.vue'
import Select from '@/components/common/Select.vue'
import Button from '@/components/common/Button.vue'
import { useSettingsStore } from '@/stores/settingsStore'
import { useToastStore } from '@/stores/toastStore'

const settingsStore = useSettingsStore()
const toastStore = useToastStore()

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
</script>

<template>
  <div class="max-w-3xl space-y-6">
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
          class="relative h-6 w-11 rounded-full transition-colors"
          :class="settingsStore.theme === 'dark' ? 'bg-ink-800' : 'bg-ink-200'"
          @click="settingsStore.toggleTheme()"
        >
          <span
            class="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform"
            :class="settingsStore.theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'"
          />
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
  </div>
</template>
