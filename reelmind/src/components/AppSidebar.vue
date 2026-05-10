<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-top">
      <RouterLink to="/" class="sidebar-logo">
        <span>RM</span>
      </RouterLink>
    </div>

    <nav class="sidebar-nav">
      <RouterLink to="/" class="sidebar-link" :class="{ active: route.name === 'home' }" title="Strona główna">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </RouterLink>

      <RouterLink to="/movies" class="sidebar-link" :class="{ active: route.name === 'movies' || route.name === 'movie' }" title="Filmy">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
          <line x1="7" y1="2" x2="7" y2="22"/>
          <line x1="17" y1="2" x2="17" y2="22"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <line x1="2" y1="7" x2="7" y2="7"/>
          <line x1="2" y1="17" x2="7" y2="17"/>
          <line x1="17" y1="17" x2="22" y2="17"/>
          <line x1="17" y1="7" x2="22" y2="7"/>
        </svg>
      </RouterLink>

      <RouterLink
        v-if="authStore.isAuthenticated"
        to="/recommendations"
        class="sidebar-link"
        :class="{ active: route.name === 'recommendations' }"
        title="Rekomendacje"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </RouterLink>

      <RouterLink
        v-if="authStore.isAuthenticated"
        to="/profile"
        class="sidebar-link"
        :class="{ active: route.name === 'profile' }"
        title="Profil"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </RouterLink>

      <RouterLink
        v-if="authStore.isAdmin"
        to="/admin"
        class="sidebar-link sidebar-link--admin"
        :class="{ active: route.name === 'admin' }"
        title="Admin"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </RouterLink>
    </nav>

    <div class="sidebar-bottom">
      <button class="sidebar-link" title="Ustawienia">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>

      <RouterLink v-if="authStore.isAuthenticated" to="/profile" class="sidebar-avatar-link" title="Mój profil">
        <img :src="authStore.user?.avatar" :alt="authStore.user?.name" class="sidebar-avatar" />
      </RouterLink>
      <RouterLink v-else to="/login" class="sidebar-link" title="Zaloguj się">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
          <polyline points="10 17 15 12 10 7"/>
          <line x1="15" y1="12" x2="3" y2="12"/>
        </svg>
      </RouterLink>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  left: 0; top: 0; bottom: 0;
  width: var(--sidebar-w, 64px);
  background: var(--bg-sidebar, #050714);
  border-right: 1px solid var(--border, rgba(255,255,255,0.07));
  display: flex; flex-direction: column;
  align-items: center;
  z-index: 200;
  padding: 16px 0;
}

.sidebar-top { margin-bottom: 28px; }
.sidebar-logo {
  width: 40px; height: 40px; border-radius: 12px;
  background: var(--blue, #4361ee);
  display: flex; align-items: center; justify-content: center;
  text-decoration: none; color: #fff;
  font-size: 12px; font-weight: 900; letter-spacing: -0.02em;
  box-shadow: 0 4px 16px rgba(67,97,238,0.4);
}

.sidebar-nav {
  display: flex; flex-direction: column;
  align-items: center; gap: 4px;
  flex: 1;
}

.sidebar-link {
  width: 44px; height: 44px;
  border-radius: var(--radius-sm, 8px);
  display: flex; align-items: center; justify-content: center;
  color: var(--text-muted, rgba(255,255,255,0.45));
  text-decoration: none; transition: all 0.2s;
  background: none; border: none; cursor: pointer;
  position: relative;
}
.sidebar-link:hover { color: var(--text, #fff); background: rgba(255,255,255,0.06); }
.sidebar-link.active { color: var(--blue, #4361ee); background: var(--blue-soft, rgba(67,97,238,0.12)); }
.sidebar-link.active::before {
  content: '';
  position: absolute; left: -1px;
  width: 3px; height: 24px;
  background: var(--blue, #4361ee);
  border-radius: 0 3px 3px 0;
}
.sidebar-link--admin { color: var(--admin, #f59e0b) !important; }
.sidebar-link--admin:hover { background: rgba(245,158,11,0.1) !important; }
.sidebar-link--admin.active { background: rgba(245,158,11,0.12) !important; }

.sidebar-bottom {
  display: flex; flex-direction: column;
  align-items: center; gap: 8px;
  padding-bottom: 4px;
}
.sidebar-avatar-link { display: flex; }
.sidebar-avatar {
  width: 36px; height: 36px; border-radius: 50%; object-fit: cover;
  border: 2px solid rgba(255,255,255,0.12);
  transition: border-color 0.2s;
  cursor: pointer;
}
.sidebar-avatar:hover { border-color: var(--blue, #4361ee); }

@media (max-width: 768px) {
  .sidebar { display: none; }
}
</style>
