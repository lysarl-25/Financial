import { defineStore } from 'pinia'
import type { User } from '@supabase/supabase-js'
import type { AppSettings } from '@/types'
import { defaultNotifications, defaultSettings, fromProfileRow, logActivity, supabase, toProfileUpsert } from '@/services/supabase'

interface SettingsState extends AppSettings {
  profileId: string | null
}

function createDefaultState(): SettingsState {
  return {
    profileId: null,
    profileName: defaultSettings.profileName,
    profileEmail: defaultSettings.profileEmail,
    currency: defaultSettings.currency,
    dateFormat: defaultSettings.dateFormat,
    theme: defaultSettings.theme,
    notifications: { ...defaultNotifications },
  }
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => createDefaultState(),
  actions: {
    reset() {
      Object.assign(this, createDefaultState())
    },

    async loadForUser(user?: User) {
      const currentUser = user ?? (await supabase.auth.getUser()).data.user
      if (!currentUser) {
        this.reset()
        this.applyTheme()
        return
      }

      this.profileId = currentUser.id
      this.profileEmail = currentUser.email ?? ''

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle()

      if (error) throw error

      if (data) {
        Object.assign(this, fromProfileRow(data, currentUser.email ?? ''))
      } else {
        const fallback = {
          profileName: currentUser.user_metadata?.full_name?.trim() || currentUser.email?.split('@')[0] || '',
          profileEmail: currentUser.email ?? '',
          currency: defaultSettings.currency,
          dateFormat: defaultSettings.dateFormat,
          theme: defaultSettings.theme,
          notifications: { ...defaultNotifications },
        }

        const { error: insertError } = await supabase.from('profiles').insert({
          id: currentUser.id,
          ...toProfileUpsert(fallback),
        })

        if (insertError) throw insertError
        Object.assign(this, fallback)
      }

      this.applyTheme()
    },

    async update(payload: Partial<AppSettings>) {
      Object.assign(this, payload)
      await this.persist()
      if (payload.profileName !== undefined) {
        await logActivity({ action: 'profile.update', entityType: 'settings', metadata: { profileName: payload.profileName } })
      } else {
        await logActivity({ action: 'preferences.update', entityType: 'settings', metadata: { changed: Object.keys(payload) } })
      }
    },

    async updateNotifications(payload: Partial<AppSettings['notifications']>) {
      this.notifications = { ...this.notifications, ...payload }
      await this.persist()
      await logActivity({ action: 'notifications.update', entityType: 'settings', metadata: payload })
    },

    async toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
      this.applyTheme()
      await this.persist()
      await logActivity({ action: 'theme.toggle', entityType: 'settings', metadata: { theme: this.theme } })
    },

    applyTheme() {
      const root = document.documentElement
      if (this.theme === 'dark') root.classList.add('dark')
      else root.classList.remove('dark')
    },

    async persist() {
      if (!this.profileId) return
      const payload = toProfileUpsert({
        profileName: this.profileName,
        currency: this.currency,
        dateFormat: this.dateFormat,
        theme: this.theme,
        notifications: this.notifications,
      })
      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', this.profileId)
      if (error) throw error
    },
  },
})
