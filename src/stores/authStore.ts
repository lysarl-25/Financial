import { defineStore } from 'pinia'
import type { Session, User } from '@supabase/supabase-js'
import type { UserRole } from '@/types'
import { categories as defaultCategories } from '@/data/categories'
import { supabase, ensureDefaultProfileAndCategories, fetchMyRole, isCurrentUserActive, logActivity, syncUserEmail } from '@/services/supabase'
import { useBudgetStore } from './budgetStore'
import { useCategoryStore } from './categoryStore'
import { useSettingsStore } from './settingsStore'
import { useTransactionStore } from './transactionStore'

let authSubscription: { unsubscribe: () => void } | null = null
let lastUserId: string | null = null

async function syncUserData(user: User) {
  await ensureDefaultProfileAndCategories(
    user,
    defaultCategories.map(({ name, type, icon, color }) => ({ name, type, icon, color })),
  )
  await syncUserEmail(user)

  const settingsStore = useSettingsStore()
  await settingsStore.loadForUser(user)
  settingsStore.applyTheme()

  const authStore = useAuthStore()
  authStore.role = await fetchMyRole()

  const active = await isCurrentUserActive()
  if (!active) {
    await supabase.auth.signOut()
    authStore.role = 'user'
    clearAppState()
  }
}

function clearAppState() {
  const settingsStore = useSettingsStore()
  useTransactionStore().$reset()
  useCategoryStore().$reset()
  useBudgetStore().$reset()
  settingsStore.$reset()
  settingsStore.applyTheme()
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    session: null as Session | null,
    user: null as User | null,
    role: 'user' as UserRole,
    loading: false,
    initialized: false,
    error: '' as string,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.user),
    isAdmin: (state) => state.role === 'admin',
  },
  actions: {
    async initialize() {
      if (this.initialized) return
      this.loading = true
      this.error = ''
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        this.session = data.session
        this.user = data.session?.user ?? null
        lastUserId = this.user?.id ?? null

        if (this.user) {
          await syncUserData(this.user)
        } else {
          this.role = 'user'
          clearAppState()
        }

        if (!authSubscription) {
          const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
            this.session = session
            this.user = session?.user ?? null

            const nextUserId = this.user?.id ?? null
            const userChanged = nextUserId !== lastUserId
            lastUserId = nextUserId

            if (!this.user) {
              clearAppState()
              return
            }

            if (userChanged || event === 'SIGNED_IN') {
              await syncUserData(this.user)
            } else if (event === 'TOKEN_REFRESHED') {
              useSettingsStore().applyTheme()
            }
          })
          authSubscription = listener.subscription
        }

        this.initialized = true
      } finally {
        this.loading = false
      }
    },

    async signIn(payload: { email: string; password: string }) {
      this.loading = true
      this.error = ''
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: payload.email,
          password: payload.password,
        })
        if (error) throw error
        if (data.user && !(await isCurrentUserActive())) {
          await supabase.auth.signOut()
          throw new Error('Your account has been disabled. Contact an administrator.')
        }
        await logActivity({ action: 'auth.login', entityType: 'auth' })
        return data
      } finally {
        this.loading = false
      }
    },

    async signUp(payload: { email: string; password: string; fullName?: string }) {
      this.loading = true
      this.error = ''
      try {
        const { data, error } = await supabase.auth.signUp({
          email: payload.email,
          password: payload.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: payload.fullName ? { full_name: payload.fullName } : undefined,
          },
        })
        if (error) throw error
        if (data.user) await logActivity({ action: 'auth.signup', entityType: 'auth' })
        return data
      } finally {
        this.loading = false
      }
    },

    async resetPassword(email: string) {
      this.loading = true
      this.error = ''
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        })
        if (error) throw error
      } finally {
        this.loading = false
      }
    },

    async signOut() {
      this.loading = true
      this.error = ''
      try {
        await logActivity({ action: 'auth.logout', entityType: 'auth' })
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        this.role = 'user'
        clearAppState()
      } finally {
        this.loading = false
      }
    },
  },
})
