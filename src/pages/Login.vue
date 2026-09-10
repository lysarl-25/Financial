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

const mode = ref<'signin' | 'signup'>('signin')
const showForgotPassword = ref(false)
const resetEmailSent = ref(false)

const form = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  keepSession: false,
})

const errors = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const submitLabel = computed(() => {
  return mode.value === 'signup' ? 'Create account' : 'Sign in to Dashboard'
})

const redirectPath = computed(() => {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/dashboard'
})

function validate(): boolean {
  errors.fullName = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
  let valid = true

  if (mode.value === 'signup' && !form.fullName.trim()) {
    errors.fullName = 'Full name is required.'
    valid = false
  }

  if (!form.email.trim()) {
    errors.email = 'Email is required.'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address.'
    valid = false
  }

  if (!form.password) {
    errors.password = 'Password is required.'
    valid = false
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.'
    valid = false
  }

  if (mode.value === 'signup') {
    if (!form.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.'
      valid = false
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.'
      valid = false
    }
  }

  return valid
}

async function submit() {
  if (!validate()) return

  try {
    if (mode.value === 'signup') {
      const result = await authStore.signUp({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
      })
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

async function handleForgotPassword() {
  if (!form.email.trim()) {
    errors.email = 'Please enter your email address first.'
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address.'
    return
  }

  try {
    await authStore.resetPassword(form.email)
    showForgotPassword.value = true
    resetEmailSent.value = true
    toastStore.success('Password reset link sent. Check your email.')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send reset link.'
    toastStore.error(message)
  }
}

function switchMode(newMode: 'signin' | 'signup') {
  mode.value = newMode
  showForgotPassword.value = false
  resetEmailSent.value = false
  errors.fullName = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
}
</script>

<template>
  <div class="min-h-screen grid lg:grid-cols-[1.1fr_0.9fr] bg-[radial-gradient(circle_at_top_left,_rgba(15,157,112,0.18),_transparent_35%),linear-gradient(180deg,_#f7fbfa_0%,_#eef6f4_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(15,157,112,0.20),_transparent_35%),linear-gradient(180deg,_#051116_0%,_#08151a_100%)]">
    <!-- Left panel - branding -->
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
    </div>

    <!-- Right panel - auth form -->
    <div class="flex items-center justify-center p-6 sm:p-10">
      <div class="w-full max-w-md rounded-3xl border border-ink-200/70 dark:border-white/10 bg-white/90 dark:bg-ink-900/85 p-6 sm:p-8 shadow-2xl shadow-ink-900/5 backdrop-blur">
        <!-- Mobile header -->
        <div class="lg:hidden mb-8">
          <p class="text-xs uppercase tracking-[0.25em] text-ink-500 dark:text-ink-400">
            Financial
          </p>
          <h1 class="mt-2 font-display text-3xl font-semibold text-ink-900 dark:text-white">
            Welcome back
          </h1>
          <p class="mt-2 text-sm text-ink-600 dark:text-ink-300">
            Sign in to continue to your dashboard.
          </p>
        </div>

        <!-- Tab switcher -->
        <div class="flex rounded-2xl bg-ink-100 dark:bg-ink-800 p-1">
          <button
            class="flex-1 rounded-xl px-3 py-2 text-sm font-medium transition"
            :class="mode === 'signin' ? 'bg-white dark:bg-ink-900 text-ink-900 dark:text-white shadow-sm' : 'text-ink-500'"
            @click="switchMode('signin')"
          >
            Sign in
          </button>
          <button
            class="flex-1 rounded-xl px-3 py-2 text-sm font-medium transition"
            :class="mode === 'signup' ? 'bg-white dark:bg-ink-900 text-ink-900 dark:text-white shadow-sm' : 'text-ink-500'"
            @click="switchMode('signup')"
          >
            Sign up
          </button>
        </div>

        <!-- Forgot password sent state -->
        <div v-if="showForgotPassword && resetEmailSent" class="mt-6 text-center">
          <div class="rounded-2xl bg-income-light dark:bg-income/10 p-6">
            <p class="text-sm font-medium text-income-dark dark:text-income">
              Reset link sent!
            </p>
            <p class="mt-2 text-sm text-ink-600 dark:text-ink-300">
              Check your email <strong>{{ form.email }}</strong> for a password reset link.
            </p>
          </div>
          <button
            class="mt-4 text-sm font-medium text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white transition-colors"
            @click="showForgotPassword = false"
          >
            Back to sign in
          </button>
        </div>

        <!-- Auth form -->
        <form
          v-else
          class="mt-6 space-y-4"
          @submit.prevent="submit"
        >
          <!-- Full name (signup only) -->
          <Input
            v-if="mode === 'signup'"
            v-model="form.fullName"
            label="Full Name"
            placeholder="John Doe"
            :error="errors.fullName"
          />

          <!-- Email -->
          <Input
            v-model="form.email"
            type="email"
            label="Email Address"
            placeholder="you@example.com"
            :error="errors.email"
          />

          <!-- Password -->
          <Input
            v-model="form.password"
            type="password"
            label="Password"
            placeholder="Password"
            :error="errors.password"
          />

          <!-- Confirm password (signup only) -->
          <Input
            v-if="mode === 'signup'"
            v-model="form.confirmPassword"
            type="password"
            label="Confirm Password"
            placeholder="Confirm password"
            :error="errors.confirmPassword"
          />

          <!-- Forgot password link (signin only) -->
          <div v-if="mode === 'signin'" class="flex justify-end">
            <button
              type="button"
              class="text-xs font-medium text-income hover:text-income-dark dark:text-income dark:hover:text-income-light transition-colors"
              @click="handleForgotPassword"
            >
              Forgot password?
            </button>
          </div>

          <!-- Keep session checkbox (signin only) -->
          <label v-if="mode === 'signin'" class="flex items-center gap-2 cursor-pointer">
            <input
              v-model="form.keepSession"
              type="checkbox"
              class="h-4 w-4 rounded border-ink-300 dark:border-ink-600 text-income focus:ring-income/30 bg-white dark:bg-ink-900"
            />
            <span class="text-sm text-ink-600 dark:text-ink-300">Keep me signed in</span>
          </label>

          <!-- Submit button -->
          <Button
            type="submit"
            class="w-full"
            :disabled="authStore.loading"
          >
            {{ authStore.loading ? 'Please wait...' : submitLabel }}
          </Button>
        </form>

        <!-- Switch mode link -->
        <p v-if="!showForgotPassword || !resetEmailSent" class="mt-5 text-center text-sm text-ink-600 dark:text-ink-300">
          <template v-if="mode === 'signin'">
            Don't have an account?
            <button
              type="button"
              class="font-medium text-income hover:text-income-dark dark:text-income dark:hover:text-income-light transition-colors"
              @click="switchMode('signup')"
            >
              Sign up
            </button>
          </template>
          <template v-else>
            Already have an account?
            <button
              type="button"
              class="font-medium text-income hover:text-income-dark dark:text-income dark:hover:text-income-light transition-colors"
              @click="switchMode('signin')"
            >
              Sign in
            </button>
          </template>
        </p>

        <!-- Terms / notice -->
        <p class="mt-5 text-xs leading-5 text-ink-500 dark:text-ink-400 text-center">
          By continuing, you agree to use the app with your own Supabase project and data.
        </p>
      </div>
    </div>
  </div>
</template>