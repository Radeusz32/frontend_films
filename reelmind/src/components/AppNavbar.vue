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
        <div class="nav-links">
          <RouterLink to="/" :class="{ active: route.name === 'home' }">{{ t('nav.home') }}</RouterLink>
          <RouterLink to="/movies" :class="{ active: route.name === 'movies' || route.name === 'movie' }">{{ t('nav.movies') }}</RouterLink>
          <RouterLink v-if="authStore.isAuthenticated" to="/recommendations" :class="{ active: route.name === 'recommendations' }">{{ t('nav.recommendations') }}</RouterLink>
          <RouterLink v-if="authStore.isAdmin" to="/admin" class="admin-link" :class="{ active: route.name === 'admin' }">{{ t('nav.admin') }}</RouterLink>
        </div>
      </div>

      <div class="navbar-right">
        <div class="search-wrapper">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
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

        <button class="icon-btn" @click="switchLocale" :title="currentLocale === 'pl' ? 'Switch to English' : 'Zmień na polski'">
          {{ currentLocale === 'pl' ? '🇵🇱' : '🇬🇧' }}
        </button>

        <button class="icon-btn" title="Powiadomienia">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        </button>

        <template v-if="authStore.isAuthenticated">
          <RouterLink to="/profile" class="user-chip">
            <img :src="authStore.user?.avatar" :alt="authStore.user?.name" class="user-avatar" />
            <span class="user-name">{{ authStore.user?.name?.split(' ')[0] }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </RouterLink>
          <button class="icon-btn logout-btn" @click="handleLogout" title="Wyloguj">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
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
  background: var(--bg-nav, rgba(7,9,26,0.88));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border, rgba(255,255,255,0.07));
  height: var(--topbar-h, 60px);
}
.navbar-inner {
  height: 100%; padding: 0 28px;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
}

.navbar-left { display: flex; align-items: center; }
.nav-links { display: flex; gap: 2px; }
.nav-links a {
  color: var(--text-muted, rgba(255,255,255,0.55));
  text-decoration: none; font-size: 14px; font-weight: 600;
  transition: color 0.2s, background 0.2s;
  padding: 6px 14px; border-radius: var(--radius-sm, 8px);
  letter-spacing: -0.01em;
}
.nav-links a:hover { color: var(--text, #fff); background: rgba(255,255,255,0.06); }
.nav-links a.active { color: var(--text, #fff); }
.admin-link { color: var(--admin, #f59e0b) !important; }

.navbar-right { display: flex; align-items: center; gap: 8px; }

.search-wrapper { position: relative; display: flex; align-items: center; }
.search-icon {
  position: absolute; left: 12px;
  color: var(--text-muted); pointer-events: none;
}
.search-input {
  background: rgba(255,255,255,0.07);
  border: 1px solid var(--border, rgba(255,255,255,0.07));
  border-radius: 24px;
  padding: 7px 16px 7px 32px;
  color: var(--text, #fff); font-size: 13px; outline: none;
  width: 190px; transition: all 0.25s; font-family: inherit;
}
.search-input::placeholder { color: var(--text-muted); }
.search-input:focus {
  border-color: var(--blue, #4361ee);
  width: 250px;
  box-shadow: 0 0 0 3px var(--blue-light, rgba(67,97,238,0.18));
  background: rgba(255,255,255,0.1);
}
.search-input::-webkit-search-cancel-button { display: none; }

.search-dropdown {
  position: absolute; top: calc(100% + 8px); left: 0;
  background: #111827; border: 1px solid rgba(255,255,255,0.1);
  border-radius: var(--radius-md, 12px);
  overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.7);
  min-width: 300px; z-index: 200;
}
.search-item {
  display: flex; align-items: center; gap: 10px;
  width: 100%; padding: 10px 14px;
  background: none; border: none; cursor: pointer; text-align: left;
  transition: background 0.15s;
}
.search-item:hover { background: rgba(255,255,255,0.05); }
.search-poster { width: 32px; height: 48px; object-fit: cover; border-radius: 4px; flex-shrink: 0; }
.search-title { font-size: 13px; font-weight: 700; color: var(--text, #fff); }
.search-year { font-size: 11px; color: var(--text-muted); }

.icon-btn {
  width: 36px; height: 36px; border-radius: 50%;
  background: none; border: none; cursor: pointer;
  color: var(--text-muted); font-size: 16px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.icon-btn:hover { color: var(--text, #fff); background: rgba(255,255,255,0.08); }
.logout-btn:hover { color: var(--error, #ef4444); background: rgba(239,68,68,0.1); }

.user-chip {
  display: flex; align-items: center; gap: 8px;
  padding: 4px 10px 4px 4px;
  border-radius: 999px;
  background: rgba(255,255,255,0.07);
  border: 1px solid var(--border, rgba(255,255,255,0.07));
  text-decoration: none; color: var(--text, #fff);
  transition: all 0.2s; cursor: pointer;
}
.user-chip:hover { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.15); }
.user-avatar { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; }
.user-name { font-size: 13px; font-weight: 600; max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.nav-btn {
  padding: 7px 16px; border-radius: var(--radius-sm, 8px);
  font-size: 13px; font-weight: 700;
  text-decoration: none; transition: all 0.18s;
}
.nav-btn--ghost { color: var(--text-muted); border: 1px solid rgba(255,255,255,0.15); }
.nav-btn--ghost:hover { color: var(--text, #fff); border-color: rgba(255,255,255,0.3); }
.nav-btn--primary { background: var(--blue, #4361ee); color: #fff; box-shadow: 0 2px 10px rgba(67,97,238,0.35); }
.nav-btn--primary:hover { background: var(--blue-dark, #3451db); }

.hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 6px; }
.hamburger span { display: block; width: 20px; height: 2px; background: var(--text-muted); border-radius: 2px; }

.mobile-menu {
  display: flex; flex-direction: column;
  background: var(--bg-card, #0d1426);
  border-top: 1px solid var(--border); padding: 12px 20px 20px;
}
.mobile-menu a, .mobile-menu button {
  padding: 12px 0; color: var(--text-muted); text-decoration: none; font-size: 15px;
  border: none; background: none; cursor: pointer; text-align: left;
  border-bottom: 1px solid var(--border); transition: color 0.2s; font-family: inherit;
}
.mobile-menu a:hover, .mobile-menu button:hover { color: var(--text, #fff); }

@media (max-width: 768px) {
  .nav-links { display: none; }
  .search-input { width: 120px; }
  .search-input:focus { width: 160px; }
  .hamburger { display: flex; }
  .nav-btn { display: none; }
  .user-name { display: none; }
}
</style>
