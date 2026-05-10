import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { i18n } from './i18n'
import router from './router'
import App from './App.vue'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)

const { useAuthStore } = await import('./stores/auth.store')
const auth = useAuthStore()
await auth.fetchMe()

const savedLocale = localStorage.getItem('reelmind_locale')
if (savedLocale === 'pl' || savedLocale === 'en') {
  i18n.global.locale.value = savedLocale
}

app.mount('#app')
