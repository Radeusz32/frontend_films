<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

function handleLogout() {
  auth.logout()
  router.push({ name: 'home' })
}
</script>

<template>
  <nav class="bottom-nav" aria-label="Nawigacja mobilna">
    <RouterLink to="/" class="bn-item" :class="{ active: route.name === 'home' }">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
      <span>Główna</span>
    </RouterLink>

    <RouterLink to="/movies" class="bn-item" :class="{ active: route.name === 'movies' || route.name === 'movie' }">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/>
      </svg>
      <span>Filmy</span>
    </RouterLink>

    <RouterLink
      v-if="auth.isAuthenticated"
      to="/recommendations"
      class="bn-item"
      :class="{ active: route.name === 'recommendations' }"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
      <span>Polecane</span>
    </RouterLink>

    <RouterLink
      v-if="auth.isAuthenticated"
      to="/profile"
      class="bn-item"
      :class="{ active: route.name === 'profile' }"
    >
      <img
        v-if="auth.user?.avatar"
        :src="auth.user.avatar"
        :alt="auth.user.name"
        class="bn-avatar"
        :class="{ active: route.name === 'profile' }"
      />
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
      <span>Profil</span>
    </RouterLink>

    <button v-if="auth.isAuthenticated" class="bn-item bn-item--logout" @click="handleLogout">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
      <span>Wyloguj</span>
    </button>

    <RouterLink v-else to="/login" class="bn-item" :class="{ active: route.name === 'login' }">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
        <polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
      </svg>
      <span>Logowanie</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.bottom-nav {
  display: none;
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: 60px;
  background: rgba(7, 9, 26, 0.97);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  z-index: 300;
  padding: 0 4px;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  justify-content: space-around;
  align-items: center;
}

@media (max-width: 768px) {
  .bottom-nav { display: flex; }
}

.bn-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 6px 4px;
  color: rgba(255, 255, 255, 0.4);
  text-decoration: none;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
  border-radius: 10px;
  transition: color 0.18s, background 0.18s;
  min-width: 0;
}
.bn-item span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}
.bn-item:hover { color: rgba(255, 255, 255, 0.75); }
.bn-item.active { color: var(--blue, #4361ee); }

.bn-item--logout {
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}
.bn-item--logout:hover { color: #f87171; }

.bn-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  transition: border-color 0.18s;
}
.bn-avatar.active { border-color: var(--blue, #4361ee); }
</style>
