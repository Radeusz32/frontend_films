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
    stats.value = s
    users.value = u
  } finally {
    loading.value = false
  }
})

async function onDelete(id: number) {
  await MoviesAPI.remove(id)
  await movieStore.fetchMovies({ limit: 50 })
  const s = await AdminAPI.getStats()
  stats.value = s
  deleteConfirm.value = null
}
</script>

<template>
  <div class="admin-page">
    <div class="page-header">
      <h1>🛡️ {{ t('admin.title') }}</h1>
    </div>

    <div v-if="stats" class="stats-grid">
      <div class="stat-card">
        <span class="stat-icon">🎬</span>
        <span class="stat-num">{{ stats.totalMovies }}</span>
        <span class="stat-label">{{ t('admin.total_movies') }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">👥</span>
        <span class="stat-num">{{ stats.totalUsers }}</span>
        <span class="stat-label">{{ t('admin.total_users') }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">⭐</span>
        <span class="stat-num">{{ stats.totalRatings }}</span>
        <span class="stat-label">{{ t('admin.total_ratings') }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">📊</span>
        <span class="stat-num">{{ stats.averageRating }}</span>
        <span class="stat-label">{{ t('admin.avg_rating') }}</span>
      </div>
    </div>

    <div class="tabs">
      <button :class="{ active: activeTab === 'movies' }" @click="activeTab = 'movies'">
        🎬 {{ t('admin.manage_movies') }}
      </button>
      <button :class="{ active: activeTab === 'users' }" @click="activeTab = 'users'">
        👥 {{ t('admin.manage_users') }}
      </button>
    </div>

    <div v-if="activeTab === 'movies'" class="movies-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Poster</th>
            <th>Title</th>
            <th>Year</th>
            <th>Genre</th>
            <th>Rating</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="movie in movieStore.movies" :key="movie.id">
            <td><img :src="movie.posterUrl" :alt="movie.title" class="table-poster" /></td>
            <td class="title-cell">{{ movie.title }}</td>
            <td>{{ movie.year }}</td>
            <td><AppBadge v-for="g in movie.genre.slice(0, 2)" :key="g">{{ g }}</AppBadge></td>
            <td class="rating-cell">★ {{ movie.rating.toFixed(1) }}</td>
            <td>
              <div class="action-btns">
                <AppButton v-if="deleteConfirm !== movie.id" size="sm" variant="danger" @click="deleteConfirm = movie.id">
                  {{ t('admin.delete_movie') }}
                </AppButton>
                <template v-else>
                  <AppButton size="sm" variant="danger" @click="onDelete(movie.id)">Confirm</AppButton>
                  <AppButton size="sm" variant="ghost" @click="deleteConfirm = null">Cancel</AppButton>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="users-table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Avatar</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Member Since</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td><img :src="user.avatar" :alt="user.name" class="table-avatar" /></td>
            <td>{{ user.name }}</td>
            <td class="email-cell">{{ user.email }}</td>
            <td>
              <AppBadge :variant="user.role === 'admin' ? 'warning' : 'info'">{{ user.role }}</AppBadge>
            </td>
            <td>{{ user.createdAt.slice(0, 10) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.admin-page { max-width: 1400px; margin: 0 auto; padding: 40px; }
.page-header { margin-bottom: 28px; }
.page-header h1 { font-size: 32px; font-weight: 800; color: #e2e8f0; margin: 0; }

.stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
.stat-card {
  background: #0f172a; border: 1px solid #1e293b; border-radius: 16px;
  padding: 24px; display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center;
}
.stat-icon { font-size: 32px; }
.stat-num { font-size: 32px; font-weight: 800; color: #e11d48; }
.stat-label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }

.tabs { display: flex; gap: 4px; margin-bottom: 24px; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 4px; width: fit-content; }
.tabs button {
  padding: 10px 20px; background: none; border: none;
  color: #64748b; font-size: 14px; font-weight: 600; cursor: pointer;
  border-radius: 8px; transition: all 0.2s;
}
.tabs button.active { background: #1e293b; color: #e2e8f0; }

.movies-table-wrap, .users-table-wrap { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.data-table th {
  text-align: left; padding: 12px 16px;
  color: #64748b; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;
  border-bottom: 1px solid #1e293b;
}
.data-table td { padding: 12px 16px; border-bottom: 1px solid #0f172a; color: #e2e8f0; vertical-align: middle; }
.data-table tr:hover td { background: rgba(255,255,255,0.02); }
.table-poster { width: 36px; height: 54px; object-fit: cover; border-radius: 4px; }
.table-avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
.title-cell { font-weight: 600; max-width: 200px; }
.email-cell { color: #64748b; }
.rating-cell { color: #f59e0b; font-weight: 700; }
.action-btns { display: flex; gap: 6px; }

@media (max-width: 768px) { .admin-page { padding: 20px; } }
</style>
