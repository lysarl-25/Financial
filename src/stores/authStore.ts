import { defineStore } from 'pinia'
import type { Session, User } from '@supabase/supabase-js'
import { categories as defaultCategories } from '@/data/categories'
import { supabase, ensureDefaultProfileAndCategories } from '@/services/supabase'
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

  const settingsStore = useSettingsStore()
  await settingsStore.loadForUser(user)
  settingsStore.applyTheme()
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
    loading: false,
    initialized: false,
    error: '' as string,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.user),
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

    async signIn(payload: { email: string; password?: string; magicLink?: boolean }) {
      this.loading = true
      this.error = ''
      try {
        if (payload.magicLink) {
          const { error } = await supabase.auth.signInWithOtp({
            email: payload.email,
            options: {
              emailRedirectTo: window.location.origin,
            },
          })
          if (error) throw error
          return { magicLinkSent: true }
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: payload.email,
          password: payload.password ?? '',
        })
        if (error) throw error
        return data
      } finally {
        this.loading = false
      }
    },

    async signUp(payload: { email: string; password: string; magicLink?: boolean }) {
      this.loading = true
      this.error = ''
      try {
        if (payload.magicLink) {
          const { error } = await supabase.auth.signInWithOtp({
            email: payload.email,
            options: {
              emailRedirectTo: window.location.origin,
            },
          })
          if (error) throw error
          return { magicLinkSent: true }
        }

        const { data, error } = await supabase.auth.signUp({
          email: payload.email,
          password: payload.password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        })
        if (error) throw error
        return data
      } finally {
        this.loading = false
      }
    },

    async signOut() {
      this.loading = true
      this.error = ''
      try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        clearAppState()
      } finally {
        this.loading = false
      }
    },
  },
})
