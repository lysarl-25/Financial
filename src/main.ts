import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/authStore'
import { useSettingsStore } from './stores/settingsStore'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

async function bootstrap() {
  const authStore = useAuthStore()
  await authStore.initialize()

  const settingsStore = useSettingsStore()
  settingsStore.applyTheme()

  app.mount('#app')
}

bootstrap()
