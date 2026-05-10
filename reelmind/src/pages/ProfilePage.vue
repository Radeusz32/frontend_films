<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth.store'
import { useMovieStore } from '@/stores/movie.store'
import { UserAPI } from '@/api/modules/user.api'
import MovieCard from '@/components/MovieCard.vue'
import StarRating from '@/components/ui/StarRating.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import { formatDate } from '@/utils/format'

const { t, locale } = useI18n()
const authStore = useAuthStore()
const movieStore = useMovieStore()

const editing = ref(false)
const editName = ref('')
const editLoading = ref(false)
const activeTab = ref<'watchlist' | 'ratings'>('watchlist')

onMounted(async () => {
  await Promise.all([movieStore.fetchWatchlist(), movieStore.fetchUserRatings()])
})

function startEdit() {
  editName.value = authStore.user?.name ?? ''
  editing.value = true
}

async function saveEdit() {
  editLoading.value = true
  try {
    const updated = await UserAPI.updateProfile({ name: editName.value })
    if (authStore.user) authStore.user.name = updated.name
    editing.value = false
  } finally {
    editLoading.value = false
  }
}

function getRatedMovie(movieId: number) {
  return movieStore.movies.find((m) => m.id === movieId)
}
</script>

<template>
  <div class="profile-page">
    <div class="profile-header">
      <div class="profile-avatar-wrap">
        <img :src="authStore.user?.avatar" :alt="authStore.user?.name" class="profile-avatar" />
      </div>
      <div class="profile-meta">
        <template v-if="!editing">
          <h1 class="profile-name">{{ authStore.user?.name }}</h1>
          <p class="profile-email">{{ authStore.user?.email }}</p>
          <div class="profile-badges">
            <AppBadge :variant="authStore.isAdmin ? 'warning' : 'info'">
              {{ authStore.user?.role }}
            </AppBadge>
            <span class="member-since">
              {{ t('profile.member_since') }}
              {{ authStore.user?.createdAt ? formatDate(authStore.user.createdAt, locale) : '' }}
            </span>
          </div>
          <AppButton size="sm" variant="secondary" @click="startEdit">{{ t('profile.edit') }}</AppButton>
        </template>
        <template v-else>
          <AppInput v-model="editName" :label="t('auth.name')" />
          <div class="edit-actions">
            <AppButton size="sm" :loading="editLoading" @click="saveEdit">{{ t('profile.save') }}</AppButton>
            <AppButton size="sm" variant="ghost" @click="editing = false">{{ t('profile.cancel') }}</AppButton>
          </div>
        </template>
      </div>
    </div>

    <div class="profile-stats">
      <div class="stat">
        <span class="stat-num">{{ movieStore.watchlist.length }}</span>
        <span class="stat-label">Watchlist</span>
      </div>
      <div class="stat">
        <span class="stat-num">{{ movieStore.userRatings.length }}</span>
        <span class="stat-label">{{ t('profile.rated_movies') }}</span>
      </div>
    </div>

    <div class="tabs">
      <button :class="{ active: activeTab === 'watchlist' }" @click="activeTab = 'watchlist'">
        ★ {{ t('profile.my_watchlist') }} ({{ movieStore.watchlist.length }})
      </button>
      <button :class="{ active: activeTab === 'ratings' }" @click="activeTab = 'ratings'">
        🎬 {{ t('profile.my_ratings') }} ({{ movieStore.userRatings.length }})
      </button>
    </div>

    <div v-if="activeTab === 'watchlist'">
      <div v-if="movieStore.watchlist.length === 0" class="empty-state">
        <span>🎬</span>
        <p>{{ t('profile.empty_watchlist') }}</p>
      </div>
      <div v-else class="movie-grid">
        <MovieCard v-for="movie in movieStore.watchlist" :key="movie.id" :movie="movie" />
      </div>
    </div>

    <div v-else>
      <div v-if="movieStore.userRatings.length === 0" class="empty-state">
        <span>⭐</span>
        <p>{{ t('profile.empty_ratings') }}</p>
      </div>
      <div v-else class="ratings-list">
        <div v-for="rating in movieStore.userRatings" :key="rating.id" class="rating-item">
          <div class="rating-movie-info">
            <img
              v-if="getRatedMovie(rating.movieId)"
              :src="getRatedMovie(rating.movieId)?.posterUrl"
              :alt="getRatedMovie(rating.movieId)?.title"
              class="rating-poster"
            />
            <div>
              <h4>{{ getRatedMovie(rating.movieId)?.title ?? `Movie #${rating.movieId}` }}</h4>
              <p class="rating-date">{{ formatDate(rating.createdAt, locale) }}</p>
            </div>
          </div>
          <div class="rating-score">
            <StarRating :model-value="rating.value" :max="10" readonly :size="16" />
            <span class="rating-val">{{ rating.value }}/10</span>
            <p v-if="rating.review" class="rating-review">"{{ rating.review }}"</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page { max-width: 1200px; margin: 0 auto; padding: 40px; }

.profile-header {
  display: flex; gap: 28px; align-items: flex-start;
  background: #0f172a; border: 1px solid #1e293b; border-radius: 20px;
  padding: 28px; margin-bottom: 24px;
}
.profile-avatar { width: 100px; height: 100px; border-radius: 50%; border: 3px solid #e11d48; object-fit: cover; }
.profile-meta { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.profile-name { font-size: 24px; font-weight: 800; color: #e2e8f0; margin: 0; }
.profile-email { color: #64748b; font-size: 14px; margin: 0; }
.profile-badges { display: flex; align-items: center; gap: 10px; }
.member-since { font-size: 12px; color: #475569; }
.edit-actions { display: flex; gap: 8px; }

.profile-stats { display: flex; gap: 20px; margin-bottom: 28px; }
.stat { background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 16px 24px; text-align: center; }
.stat-num { display: block; font-size: 28px; font-weight: 800; color: #e11d48; }
.stat-label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }

.tabs { display: flex; gap: 4px; margin-bottom: 24px; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 4px; }
.tabs button {
  flex: 1; padding: 10px 16px; background: none; border: none;
  color: #64748b; font-size: 13px; font-weight: 600; cursor: pointer;
  border-radius: 8px; transition: all 0.2s;
}
.tabs button.active { background: #1e293b; color: #e2e8f0; }

.empty-state { text-align: center; padding: 60px; color: #64748b; font-size: 32px; }
.empty-state p { font-size: 14px; margin-top: 8px; }

.movie-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }

.ratings-list { display: flex; flex-direction: column; gap: 12px; }
.rating-item {
  background: #0f172a; border: 1px solid #1e293b; border-radius: 12px;
  padding: 16px; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap;
}
.rating-movie-info { display: flex; gap: 12px; align-items: center; }
.rating-poster { width: 48px; height: 72px; object-fit: cover; border-radius: 6px; }
.rating-movie-info h4 { font-size: 15px; color: #e2e8f0; margin: 0 0 4px; }
.rating-date { font-size: 12px; color: #64748b; margin: 0; }
.rating-score { display: flex; flex-direction: column; gap: 4px; align-items: flex-end; }
.rating-val { color: #f59e0b; font-weight: 700; font-size: 15px; }
.rating-review { font-size: 13px; color: #64748b; font-style: italic; margin: 0; }

@media (max-width: 768px) {
  .profile-page { padding: 20px; }
  .profile-header { flex-direction: column; }
}
</style>
