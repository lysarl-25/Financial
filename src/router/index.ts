import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: () => import('@/pages/Login.vue') },
    {
      path: '/',
      component: DefaultLayout,
      children: [
        { path: '', redirect: '/dashboard' },
        { path: 'dashboard', name: 'dashboard', component: () => import('@/pages/Dashboard.vue') },
        { path: 'transactions', name: 'transactions', component: () => import('@/pages/Transactions.vue') },
        { path: 'income', name: 'income', component: () => import('@/pages/Income.vue') },
        { path: 'expenses', name: 'expenses', component: () => import('@/pages/Expenses.vue') },
        { path: 'budgets', name: 'budgets', component: () => import('@/pages/Budgets.vue') },
        { path: 'reports', name: 'reports', component: () => import('@/pages/Reports.vue') },
        { path: 'categories', name: 'categories', component: () => import('@/pages/Categories.vue') },
        { path: 'settings', name: 'settings', component: () => import('@/pages/Settings.vue') },
        { path: 'admin', name: 'admin', component: () => import('@/pages/Admin.vue'), meta: { requiresAdmin: true } },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  if (!authStore.initialized) {
    await authStore.initialize()
  }

  if (to.path === '/login' && authStore.isAuthenticated) {
    return { path: '/dashboard' }
  }

  if (to.path !== '/login' && !authStore.isAuthenticated) {
    return { path: '/login', query: to.fullPath !== '/' ? { redirect: to.fullPath } : undefined }
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return { path: '/dashboard' }
  }

  return true
})

export default router
