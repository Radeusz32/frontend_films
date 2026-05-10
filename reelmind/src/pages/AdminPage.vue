<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { AdminAPI } from '@/api/modules/admin.api'
import { MoviesAPI } from '@/api/modules/movies.api'
import { useMovieStore } from '@/stores/movie.store'
import AppButton from '@/components/ui/AppButton.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import type { AdminStats } from '@/api/modules/admin.api'
import type { User } from '@/types/user'

const { t } = useI18n()
const movieStore = useMovieStore()
const stats = ref<AdminStats | null>(null)
const users = ref<User[]>([])
const activeTab = ref<'movies' | 'users'>('movies')
const deleteConfirm = ref<number | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    await movieStore.fetchMovies({ limit: 50 })
    const [s, u] = await Promise.all([AdminAPI.getStats(), AdminAPI.getUsers()])
    stats.value = s; users.value = u
  } finally { loading.value = false }
})

async function onDelete(id: number) {
  await MoviesAPI.remove(id)
  await movieStore.fetchMovies({ limit: 50 })
  stats.value = await AdminAPI.getStats()
  deleteConfirm.value = null
}
</script>

<template>
  <div class="admin-page">
    <div class="page-header">
      <h1>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        {{ t('admin.title') }}
      </h1>
    </div>

    <div v-if="stats" class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(67,97,238,0.15);color:#818cf8">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
        </div>
        <span class="stat-num">{{ stats.totalMovies }}</span>
        <span class="stat-label">{{ t('admin.total_movies') }}</span>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(139,92,246,0.15);color:#a78bfa">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <span class="stat-num">{{ stats.totalUsers }}</span>
        <span class="stat-label">{{ t('admin.total_users') }}</span>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(245,158,11,0.15);color:#fbbf24">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>
        <span class="stat-num">{{ stats.totalRatings }}</span>
        <span class="stat-label">{{ t('admin.total_ratings') }}</span>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(34,197,94,0.12);color:#4ade80">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        </div>
        <span class="stat-num">{{ stats.averageRating }}</span>
        <span class="stat-label">{{ t('admin.avg_rating') }}</span>
      </div>
    </div>

    <div class="tabs">
      <button :class="{ active: activeTab === 'movies' }" @click="activeTab = 'movies'">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
        {{ t('admin.manage_movies') }}
      </button>
      <button :class="{ active: activeTab === 'users' }" @click="activeTab = 'users'">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        {{ t('admin.manage_users') }}
      </button>
    </div>

    <div class="table-wrap">
      <table class="data-table" v-if="activeTab === 'movies'">
        <thead><tr><th>Poster</th><th>Tytuł</th><th>Rok</th><th>Gatunek</th><th>Ocena</th><th>Akcje</th></tr></thead>
        <tbody>
          <tr v-for="movie in movieStore.movies" :key="movie.id">
            <td><img :src="movie.posterUrl" :alt="movie.title" class="table-poster" /></td>
            <td class="title-cell">{{ movie.title }}</td>
            <td class="muted-cell">{{ movie.year }}</td>
            <td><AppBadge v-for="g in movie.genre.slice(0,2)" :key="g" style="margin-right:4px">{{ g }}</AppBadge></td>
            <td class="rating-cell"><svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> {{ movie.rating.toFixed(1) }}</td>
            <td>
              <div class="action-btns">
                <AppButton v-if="deleteConfirm !== movie.id" size="sm" variant="danger" @click="deleteConfirm = movie.id">{{ t('admin.delete_movie') }}</AppButton>
                <template v-else>
                  <AppButton size="sm" variant="danger" @click="onDelete(movie.id)">Potwierdź</AppButton>
                  <AppButton size="sm" variant="ghost" @click="deleteConfirm = null">Anuluj</AppButton>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <table class="data-table" v-else>
        <thead><tr><th>Avatar</th><th>Imię</th><th>Email</th><th>Rola</th><th>Od</th></tr></thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td><img :src="user.avatar" :alt="user.name" class="table-avatar" /></td>
            <td class="title-cell">{{ user.name }}</td>
            <td class="muted-cell">{{ user.email }}</td>
            <td><AppBadge :variant="user.role === 'admin' ? 'warning' : 'info'">{{ user.role }}</AppBadge></td>
            <td class="muted-cell">{{ user.createdAt.slice(0,10) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.admin-page { max-width: 1500px; margin: 0 auto; padding: 44px 52px; }
.page-header { margin-bottom: 28px; }
.page-header h1 { font-size: 30px; font-weight: 900; color: var(--text, #fff); margin: 0; display: flex; align-items: center; gap: 10px; letter-spacing: -0.04em; }
.page-header h1 svg { color: var(--admin, #f59e0b); }

.stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; margin-bottom: 28px; }
.stat-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: var(--radius-lg, 16px); padding: 24px; display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; transition: border-color 0.2s; }
.stat-card:hover { border-color: rgba(67,97,238,0.25); }
.stat-icon { width: 48px; height: 48px; border-radius: var(--radius-sm, 8px); display: flex; align-items: center; justify-content: center; margin-bottom: 4px; }
.stat-num { font-size: 30px; font-weight: 900; color: var(--text, #fff); line-height: 1; letter-spacing: -0.05em; }
.stat-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 700; }

.tabs { display: flex; gap: 4px; margin-bottom: 20px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: var(--radius-md, 12px); padding: 4px; width: fit-content; }
.tabs button { display: flex; align-items: center; gap: 7px; padding: 9px 18px; background: none; border: none; color: var(--text-muted); font-size: 13px; font-weight: 700; cursor: pointer; border-radius: var(--radius-sm, 8px); transition: all 0.18s; font-family: inherit; }
.tabs button.active { background: var(--blue, #4361ee); color: #fff; }

.table-wrap { overflow-x: auto; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: var(--radius-lg, 16px); }
.data-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.data-table th { text-align: left; padding: 12px 16px; color: var(--text-muted); font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.02); }
.data-table td { padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); color: var(--text-secondary, rgba(255,255,255,0.85)); vertical-align: middle; }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: rgba(255,255,255,0.03); }
.table-poster { width: 36px; height: 54px; object-fit: cover; border-radius: 5px; }
.table-avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,0.1); }
.title-cell { font-weight: 700; max-width: 200px; color: var(--text, #fff); }
.muted-cell { color: var(--text-muted); }
.rating-cell { display: flex; align-items: center; gap: 4px; color: var(--rating, #f59e0b); font-weight: 800; }
.action-btns { display: flex; gap: 6px; }

@media (max-width: 768px) { .admin-page { padding: 24px 20px; } }
</style>
