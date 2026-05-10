<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth.store'
import { useMovieStore } from '@/stores/movie.store'
import { useLocale } from '@/composables/useLocale'
import { useDebounce } from '@/composables/useDebounce'
import type { SupportedLocale } from '@/i18n'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const movieStore = useMovieStore()
const { currentLocale, setLocale } = useLocale()

const searchQuery = ref('')
const debouncedQuery = useDebounce(searchQuery, 350)
const mobileMenuOpen = ref(false)

watch(debouncedQuery, async (q) => {
  await movieStore.search(q)
})

watch(() => route.path, () => {
  mobileMenuOpen.value = false
  searchQuery.value = ''
  movieStore.clearSearch()
})

function onSearchSelect(id: number) {
  searchQuery.value = ''
  movieStore.clearSearch()
  router.push({ name: 'movie', params: { id } })
}

function handleLogout() {
  authStore.logout()
  router.push({ name: 'home' })
}

function switchLocale() {
  const next: SupportedLocale = currentLocale.value === 'pl' ? 'en' : 'pl'
  setLocale(next)
}
</script>

<template>
  <nav class="navbar">
    <div class="navbar-inner">
      <div class="navbar-left">
        <RouterLink to="/" class="logo">
          <span class="logo-reel">Reel</span><span class="logo-mind">Mind</span>
        </RouterLink>
        <div class="nav-links">
          <RouterLink to="/" :class="{ active: route.name === 'home' }">{{ t('nav.home') }}</RouterLink>
          <RouterLink to="/movies" :class="{ active: route.name === 'movies' }">{{ t('nav.movies') }}</RouterLink>
          <RouterLink v-if="authStore.isAuthenticated" to="/recommendations" :class="{ active: route.name === 'recommendations' }">{{ t('nav.recommendations') }}</RouterLink>
          <RouterLink v-if="authStore.isAdmin" to="/admin" class="admin-link" :class="{ active: route.name === 'admin' }">{{ t('nav.admin') }}</RouterLink>
        </div>
      </div>

      <div class="navbar-right">
        <div class="search-wrapper">
          <input
            v-model="searchQuery"
            :placeholder="t('nav.search')"
            class="search-input"
            type="search"
          />
          <div v-if="movieStore.searchResults.length > 0 && searchQuery" class="search-dropdown">
            <button
              v-for="movie in movieStore.searchResults.slice(0, 6)"
              :key="movie.id"
              class="search-item"
              @click="onSearchSelect(movie.id)"
            >
              <img :src="movie.posterUrl" :alt="movie.title" class="search-poster" />
              <div>
                <div class="search-title">{{ movie.title }}</div>
                <div class="search-year">{{ movie.year }}</div>
              </div>
            </button>
          </div>
        </div>

        <button class="locale-btn" @click="switchLocale" :title="currentLocale === 'pl' ? 'Switch to English' : 'Zmień na polski'">
          {{ currentLocale === 'pl' ? '🇵🇱' : '🇬🇧' }}
        </button>

        <template v-if="authStore.isAuthenticated">
          <RouterLink to="/profile" class="avatar-link">
            <img :src="authStore.user?.avatar" :alt="authStore.user?.name" class="avatar" />
          </RouterLink>
          <button class="logout-btn" @click="handleLogout">{{ t('nav.logout') }}</button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="nav-btn nav-btn--ghost">{{ t('nav.login') }}</RouterLink>
          <RouterLink to="/register" class="nav-btn nav-btn--primary">{{ t('nav.register') }}</RouterLink>
        </template>

        <button class="hamburger" @click="mobileMenuOpen = !mobileMenuOpen" aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>
    </div>

    <div v-if="mobileMenuOpen" class="mobile-menu">
      <RouterLink to="/" @click="mobileMenuOpen = false">{{ t('nav.home') }}</RouterLink>
      <RouterLink to="/movies" @click="mobileMenuOpen = false">{{ t('nav.movies') }}</RouterLink>
      <RouterLink v-if="authStore.isAuthenticated" to="/recommendations" @click="mobileMenuOpen = false">{{ t('nav.recommendations') }}</RouterLink>
      <RouterLink v-if="authStore.isAuthenticated" to="/profile" @click="mobileMenuOpen = false">{{ t('nav.profile') }}</RouterLink>
      <RouterLink v-if="authStore.isAdmin" to="/admin" @click="mobileMenuOpen = false">{{ t('nav.admin') }}</RouterLink>
      <template v-if="authStore.isAuthenticated">
        <button @click="handleLogout">{{ t('nav.logout') }}</button>
      </template>
      <template v-else>
        <RouterLink to="/login" @click="mobileMenuOpen = false">{{ t('nav.login') }}</RouterLink>
        <RouterLink to="/register" @click="mobileMenuOpen = false">{{ t('nav.register') }}</RouterLink>
      </template>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  position: sticky; top: 0; z-index: 100;
  background: rgba(2,6,23,0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #1e293b;
}
.navbar-inner {
  max-width: 1400px; margin: 0 auto;
  padding: 0 20px; height: 64px;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
}
.navbar-left { display: flex; align-items: center; gap: 32px; }
.logo { font-size: 22px; font-weight: 800; text-decoration: none; }
.logo-reel { color: #e2e8f0; }
.logo-mind { color: #e11d48; }

.nav-links { display: flex; gap: 24px; }
.nav-links a {
  color: #94a3b8; text-decoration: none; font-size: 14px; font-weight: 500;
  transition: color 0.2s; padding: 4px 0;
}
.nav-links a:hover, .nav-links a.active { color: #e2e8f0; }
.admin-link { color: #f59e0b !important; }

.navbar-right { display: flex; align-items: center; gap: 12px; }

.search-wrapper { position: relative; }
.search-input {
  background: #0f172a; border: 1px solid #334155;
  border-radius: 20px; padding: 8px 16px;
  color: #e2e8f0; font-size: 13px; outline: none;
  width: 220px; transition: border-color 0.2s, width 0.2s;
}
.search-input:focus { border-color: #e11d48; width: 280px; }
.search-input::-webkit-search-cancel-button { display: none; }

.search-dropdown {
  position: absolute; top: calc(100% + 8px); left: 0; right: 0;
  background: #0f172a; border: 1px solid #334155; border-radius: 12px;
  overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.8);
  min-width: 300px;
}
.search-item {
  display: flex; align-items: center; gap: 10px;
  width: 100%; padding: 10px 12px;
  background: none; border: none; cursor: pointer;
  text-align: left; transition: background 0.15s;
}
.search-item:hover { background: #1e293b; }
.search-poster { width: 32px; height: 48px; object-fit: cover; border-radius: 4px; flex-shrink: 0; }
.search-title { font-size: 13px; font-weight: 600; color: #e2e8f0; }
.search-year { font-size: 11px; color: #64748b; }

.locale-btn { background: none; border: none; cursor: pointer; font-size: 18px; padding: 4px; }

.avatar-link { display: flex; }
.avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid #334155; transition: border-color 0.2s; }
.avatar:hover { border-color: #e11d48; }
.logout-btn { background: none; border: none; color: #94a3b8; font-size: 13px; cursor: pointer; transition: color 0.2s; }
.logout-btn:hover { color: #ef4444; }

.nav-btn {
  padding: 7px 16px; border-radius: 8px; font-size: 13px; font-weight: 600;
  text-decoration: none; transition: all 0.2s;
}
.nav-btn--ghost { color: #94a3b8; border: 1px solid #334155; }
.nav-btn--ghost:hover { color: #e2e8f0; border-color: #64748b; }
.nav-btn--primary { background: #e11d48; color: #fff; }
.nav-btn--primary:hover { background: #be123c; }

.hamburger {
  display: none; flex-direction: column; gap: 5px;
  background: none; border: none; cursor: pointer; padding: 4px;
}
.hamburger span { display: block; width: 22px; height: 2px; background: #e2e8f0; border-radius: 2px; }

.mobile-menu {
  display: flex; flex-direction: column;
  background: #020617; border-top: 1px solid #1e293b; padding: 12px 20px 20px;
}
.mobile-menu a, .mobile-menu button {
  padding: 12px 0; color: #94a3b8; text-decoration: none; font-size: 15px;
  border: none; background: none; cursor: pointer; text-align: left;
  border-bottom: 1px solid #0f172a; transition: color 0.2s;
}
.mobile-menu a:hover, .mobile-menu button:hover { color: #e2e8f0; }

@media (max-width: 768px) {
  .nav-links { display: none; }
  .search-input { width: 140px; }
  .search-input:focus { width: 180px; }
  .hamburger { display: flex; }
  .logout-btn, .nav-btn { display: none; }
}
</style>
