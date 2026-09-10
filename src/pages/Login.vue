<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { TrendingUp, Shield, BarChart3 } from 'lucide-vue-next'
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

const features = [
  { icon: TrendingUp, text: 'Real-time transaction tracking' },
  { icon: Shield, text: 'Bank-level data security' },
  { icon: BarChart3, text: 'Insightful financial reports' },
]
</script>

<template>
  <div
    class="min-h-screen grid lg:grid-cols-[1.1fr_0.9fr] bg-[radial-gradient(circle_at_top_left,_rgba(15,157,112,0.18),_transparent_35%),linear-gradient(180deg,_#f7fbfa_0%,_#eef6f4_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(15,157,112,0.20),_transparent_35%),linear-gradient(180deg,_#051116_0%,_#08151a_100%)]"
  >
    <!-- Left panel - branding -->
    <div class="hidden lg:flex flex-col justify-between p-12 text-ink-900 dark:text-white animate-login-fade-in-left">
      <div>
        <div
          class="inline-flex items-center gap-2 rounded-full border border-ink-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 px-4 py-2 backdrop-blur"
        >
          <span class="h-2.5 w-2.5 rounded-full bg-income animate-pulse" />
          <span class="text-sm font-medium">Financial</span>
        </div>

        <h1 class="mt-8 max-w-lg font-display text-5xl font-semibold leading-[1.15]">
          Track money with
          <span class="text-income">less friction</span>
          and more
          <span class="text-income">clarity.</span>
        </h1>

        <p class="mt-5 max-w-xl text-lg text-ink-600 dark:text-ink-300 leading-relaxed">
          Sign in to manage transactions, budgets, categories, and reports backed by Supabase.
        </p>

        <!-- Feature list -->
        <div class="mt-8 space-y-3">
          <div
            v-for="(feature, i) in features"
            :key="feature.text"
            class="flex items-center gap-3 text-ink-600 dark:text-ink-300 animate-login-fade-in-left"
            :style="{ animationDelay: `${200 + i * 100}ms` }"
          >
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-income/10 dark:bg-income/15"
            >
              <component :is="feature.icon" :size="16" class="text-income" />
            </div>
            <span class="text-sm font-medium">{{ feature.text }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right panel - auth form -->
    <div class="flex items-center justify-center p-6 sm:p-10 animate-login-fade-in">
      <div
        class="w-full max-w-md rounded-3xl border border-ink-200/70 dark:border-white/10 bg-white/90 dark:bg-ink-900/85 p-6 sm:p-8 shadow-[0_2px_4px_rgba(18,37,34,0.04),0_8px_32px_rgba(18,37,34,0.08),0_0_0_1px_rgba(15,157,112,0.05)] dark:shadow-[0_2px_4px_rgba(0,0,0,0.2),0_8px_32px_rgba(0,0,0,0.3),0_0_0_1px_rgba(15,157,112,0.08)] backdrop-blur hover:shadow-[0_2px_4px_rgba(18,37,34,0.04),0_12px_40px_rgba(18,37,34,0.1),0_0_0_1px_rgba(15,157,112,0.08)] dark:hover:shadow-[0_2px_4px_rgba(0,0,0,0.2),0_12px_40px_rgba(0,0,0,0.35),0_0_0_1px_rgba(15,157,112,0.12)] transition-shadow duration-300"
      >
        <!-- Mobile header -->
        <div class="lg:hidden mb-8 animate-login-fade-in">
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
        <div class="flex rounded-2xl bg-ink-100 dark:bg-ink-800 p-1 animate-login-fade-in delay-75">
          <button
            class="flex-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200"
            :class="mode === 'signin' ? 'bg-white dark:bg-ink-900 text-ink-900 dark:text-white shadow-sm' : 'text-ink-500 hover:text-ink-700 dark:hover:text-ink-300'"
            @click="switchMode('signin')"
          >
            Sign in
          </button>
          <button
            class="flex-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200"
            :class="mode === 'signup' ? 'bg-white dark:bg-ink-900 text-ink-900 dark:text-white shadow-sm' : 'text-ink-500 hover:text-ink-700 dark:hover:text-ink-300'"
            @click="switchMode('signup')"
          >
            Sign up
          </button>
        </div>

        <!-- Forgot password sent state -->
        <Transition name="login-form" mode="out-in">
          <div v-if="showForgotPassword && resetEmailSent" key="forgot-sent" class="mt-6 text-center">
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
            key="auth-form"
            class="mt-6 space-y-4"
            @submit.prevent="submit"
          >
            <!-- Full name (signup only) -->
            <div
              v-if="mode === 'signup'"
              class="animate-login-fade-in delay-75"
            >
              <Input
                v-model="form.fullName"
                label="Full Name"
                placeholder="Your Name"
                :error="errors.fullName"
              />
            </div>

            <!-- Email -->
            <div class="animate-login-fade-in delay-150">
              <Input
                v-model="form.email"
                type="email"
                label="Email Address"
                placeholder="Email Address"
                :error="errors.email"
              />
            </div>

            <!-- Password -->
            <div class="animate-login-fade-in delay-225">
              <Input
                v-model="form.password"
                type="password"
                label="Password"
                placeholder="Password"
                :error="errors.password"
              />
            </div>

            <!-- Confirm password (signup only) -->
            <div
              v-if="mode === 'signup'"
              class="animate-login-fade-in delay-300"
            >
              <Input
                v-model="form.confirmPassword"
                type="password"
                label="Confirm Password"
                placeholder="Confirm password"
                :error="errors.confirmPassword"
              />
            </div>

            <!-- Forgot password link (signin only) -->
            <div v-if="mode === 'signin'" class="flex justify-end animate-login-fade-in delay-225">
              <button
                type="button"
                class="text-xs font-medium text-income hover:text-income-dark dark:text-income dark:hover:text-income-light transition-colors"
                @click="handleForgotPassword"
              >
                Forgot password?
              </button>
            </div>

            <!-- Keep session checkbox (signin only) -->
            <label
              v-if="mode === 'signin'"
              class="flex items-center gap-2.5 cursor-pointer group animate-login-fade-in delay-300"
            >
              <span class="relative flex h-4 w-4 shrink-0 items-center justify-center">
                <input
                  v-model="form.keepSession"
                  type="checkbox"
                  class="peer h-4 w-4 rounded border-ink-300 dark:border-ink-600 bg-white dark:bg-ink-900 text-income focus:ring-income/30 focus:ring-2 focus:ring-offset-0 transition-colors"
                />
              </span>
              <span class="text-sm text-ink-600 dark:text-ink-300 group-hover:text-ink-800 dark:group-hover:text-ink-100 transition-colors">Keep me signed in</span>
            </label>

            <!-- Submit button -->
            <div class="animate-login-fade-in delay-400">
              <Button
                type="submit"
                class="w-full !py-2.5 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 transition-all duration-200"
                :disabled="authStore.loading"
              >
                {{ authStore.loading ? 'Please wait...' : submitLabel }}
              </Button>
            </div>
          </form>
        </Transition>

        <!-- Switch mode link -->
        <p
          v-if="!showForgotPassword || !resetEmailSent"
          class="mt-5 text-center text-sm text-ink-600 dark:text-ink-300 animate-login-fade-in delay-500"
        >
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
          By continuing, you agree to use this application with your own project and data.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.input:focus) {
  --tw-ring-color: rgba(15, 157, 112, 0.25);
  border-color: rgba(15, 157, 112, 0.4);
}

:deep(.input:focus:not(:focus-visible)) {
  outline: none;
}

:deep(.btn-primary),
:deep(.btn) {
  box-shadow: 0 1px 2px rgba(18, 37, 34, 0.08);
}
</style>
