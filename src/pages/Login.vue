<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Input from '@/components/common/Input.vue'
import Button from '@/components/common/Button.vue'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'

const authStore = useAuthStore()
const toastStore = useToastStore()
const router = useRouter()
const route = useRoute()

const mode = ref<'signin' | 'signup' | 'magic'>('signin')
const form = reactive({
  email: '',
  password: '',
})

const submitLabel = computed(() => {
  if (mode.value === 'signup') return 'Create account'
  if (mode.value === 'magic') return 'Send magic link'
  return 'Sign in'
})

const redirectPath = computed(() => {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/dashboard'
})

async function submit() {
  try {
    if (mode.value === 'magic') {
      await authStore.signIn({ email: form.email, magicLink: true })
      toastStore.success('Magic link sent. Check your email.')
      return
    }

    if (mode.value === 'signup') {
      const result = await authStore.signUp({ email: form.email, password: form.password })
      if ('session' in result && result.session) {
        toastStore.success('Account created successfully.')
        await router.replace(redirectPath.value)
      } else {
        toastStore.success('Account created. Check your email to confirm your account.')
      }
      return
    }

    await authStore.signIn({ email: form.email, password: form.password })
    toastStore.success('Welcome back.')
    await router.replace(redirectPath.value)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication failed.'
    toastStore.error(message)
  }
}
</script>

<template>
  <div class="min-h-screen grid lg:grid-cols-[1.1fr_0.9fr] bg-[radial-gradient(circle_at_top_left,_rgba(15,157,112,0.18),_transparent_35%),linear-gradient(180deg,_#f7fbfa_0%,_#eef6f4_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(15,157,112,0.20),_transparent_35%),linear-gradient(180deg,_#051116_0%,_#08151a_100%)]">
    <div class="hidden lg:flex flex-col justify-between p-12 text-ink-900 dark:text-white">
      <div>
        <div class="inline-flex items-center gap-2 rounded-full border border-ink-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 px-4 py-2 backdrop-blur">
          <span class="h-2.5 w-2.5 rounded-full bg-income" />
          <span class="text-sm font-medium">Financial</span>
        </div>
        <h1 class="mt-8 max-w-lg font-display text-5xl font-semibold leading-tight">
          Track money with less friction and more clarity.
        </h1>
        <p class="mt-5 max-w-xl text-lg text-ink-600 dark:text-ink-300">
          Sign in to manage transactions, budgets, categories, and reports backed by Supabase.
        </p>
      </div>
      <div class="grid grid-cols-3 gap-4 max-w-xl">
        <div class="rounded-2xl border border-ink-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-widest text-ink-500 dark:text-ink-400">Realtime</p>
          <p class="mt-2 text-sm font-medium">Keep tabs on your numbers from any tab.</p>
        </div>
        <div class="rounded-2xl border border-ink-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-widest text-ink-500 dark:text-ink-400">Secure</p>
          <p class="mt-2 text-sm font-medium">Supabase Auth and row-level security.</p>
        </div>
        <div class="rounded-2xl border border-ink-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4 backdrop-blur">
          <p class="text-xs uppercase tracking-widest text-ink-500 dark:text-ink-400">Fast</p>
          <p class="mt-2 text-sm font-medium">Vue 3, Pinia, and a clean dashboard flow.</p>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-center p-6 sm:p-10">
      <div class="w-full max-w-md rounded-3xl border border-ink-200/70 dark:border-white/10 bg-white/90 dark:bg-ink-900/85 p-6 sm:p-8 shadow-2xl shadow-ink-900/5 backdrop-blur">
        <div class="lg:hidden mb-8">
          <p class="text-xs uppercase tracking-[0.25em] text-ink-500 dark:text-ink-400">Financial</p>
          <h1 class="mt-2 font-display text-3xl font-semibold text-ink-900 dark:text-white">Welcome back</h1>
          <p class="mt-2 text-sm text-ink-600 dark:text-ink-300">Sign in to continue to your dashboard.</p>
        </div>

        <div class="flex rounded-2xl bg-ink-100 dark:bg-ink-800 p-1">
          <button
            class="flex-1 rounded-xl px-3 py-2 text-sm font-medium transition"
            :class="mode === 'signin' ? 'bg-white dark:bg-ink-900 text-ink-900 dark:text-white shadow-sm' : 'text-ink-500'"
            @click="mode = 'signin'"
          >
            Sign in
          </button>
          <button
            class="flex-1 rounded-xl px-3 py-2 text-sm font-medium transition"
            :class="mode === 'signup' ? 'bg-white dark:bg-ink-900 text-ink-900 dark:text-white shadow-sm' : 'text-ink-500'"
            @click="mode = 'signup'"
          >
            Sign up
          </button>
          <button
            class="flex-1 rounded-xl px-3 py-2 text-sm font-medium transition"
            :class="mode === 'magic' ? 'bg-white dark:bg-ink-900 text-ink-900 dark:text-white shadow-sm' : 'text-ink-500'"
            @click="mode = 'magic'"
          >
            Magic link
          </button>
        </div>

        <form class="mt-6 space-y-4" @submit.prevent="submit">
          <Input v-model="form.email" type="email" label="Email" placeholder="you@example.com" />
          <Input v-if="mode !== 'magic'" v-model="form.password" type="password" label="Password" placeholder="Password" />
          <Button type="submit" class="w-full" :disabled="authStore.loading">
            {{ authStore.loading ? 'Please wait...' : submitLabel }}
          </Button>
        </form>

        <p class="mt-5 text-xs leading-5 text-ink-500 dark:text-ink-400">
          By continuing, you agree to use the app with your own Supabase project and data.
        </p>
      </div>
    </div>
  </div>
</template>
