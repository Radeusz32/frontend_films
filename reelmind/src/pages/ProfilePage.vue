<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth.store'
import { useMovieStore } from '@/stores/movie.store'
import { useToastStore } from '@/stores/toast.store'
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
const toastStore = useToastStore()

const editing = ref(false)
const editName = ref('')
const editLoading = ref(false)
const activeTab = ref<'watchlist' | 'ratings'>('watchlist')

onMounted(async () => { await Promise.all([movieStore.fetchWatchlist(), movieStore.fetchUserRatings()]) })

function startEdit() { editName.value = authStore.user?.name ?? ''; editing.value = true }
async function saveEdit() {
  editLoading.value = true
  try {
    const updated = await UserAPI.updateProfile({ name: editName.value })
    if (authStore.user) authStore.user.name = updated.name
    editing.value = false
    toastStore.success(t('toast.profile_saved'))
  } catch {
    toastStore.error(t('toast.error_profile'))
  } finally { editLoading.value = false }
}
function getRatedMovie(movieId: number) { return movieStore.movies.find((m) => m.id === movieId) }
</script>

<template>
  <div class="profile-page">
    <div class="profile-header">
      <img :src="authStore.user?.avatar" :alt="authStore.user?.name" class="profile-avatar" />
      <div class="profile-meta">
        <template v-if="!editing">
          <div class="profile-name-row">
            <h1 class="profile-name">{{ authStore.user?.name }}</h1>
            <AppBadge :variant="authStore.isAdmin ? 'warning' : 'info'">{{ authStore.user?.role }}</AppBadge>
          </div>
          <p class="profile-email">{{ authStore.user?.email }}</p>
          <span class="member-since">{{ t('profile.member_since') }} {{ authStore.user?.createdAt ? formatDate(authStore.user.createdAt, locale) : '' }}</span>
          <AppButton size="sm" variant="secondary" @click="startEdit">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            {{ t('profile.edit') }}
          </AppButton>
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
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        {{ t('profile.my_watchlist') }} ({{ movieStore.watchlist.length }})
      </button>
      <button :class="{ active: activeTab === 'ratings' }" @click="activeTab = 'ratings'">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        {{ t('profile.my_ratings') }} ({{ movieStore.userRatings.length }})
      </button>
    </div>

    <div v-if="activeTab === 'watchlist'">
      <div v-if="movieStore.watchlist.length === 0" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        <p>{{ t('profile.empty_watchlist') }}</p>
      </div>
      <div v-else class="movie-grid">
        <MovieCard v-for="movie in movieStore.watchlist" :key="movie.id" :movie="movie" />
      </div>
    </div>

    <div v-else>
      <div v-if="movieStore.userRatings.length === 0" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <p>{{ t('profile.empty_ratings') }}</p>
      </div>
      <div v-else class="ratings-list">
        <div v-for="rating in movieStore.userRatings" :key="rating.id" class="rating-item">
          <div class="rating-movie-info">
            <img v-if="getRatedMovie(rating.movieId)" :src="getRatedMovie(rating.movieId)?.posterUrl" :alt="getRatedMovie(rating.movieId)?.title" class="rating-poster" />
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
.profile-page { max-width: 1200px; margin: 0 auto; padding: 44px 52px; }
.profile-header { display: flex; gap: 28px; align-items: flex-start; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: var(--radius-xl, 20px); padding: 32px; margin-bottom: 20px; }
.profile-avatar { width: 96px; height: 96px; border-radius: 50%; border: 3px solid var(--blue, #4361ee); object-fit: cover; box-shadow: 0 0 0 4px rgba(67,97,238,0.2); }
.profile-meta { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.profile-name-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.profile-name { font-size: 24px; font-weight: 900; color: var(--text, #fff); margin: 0; letter-spacing: -0.04em; }
.profile-email { color: var(--text-muted); font-size: 14px; margin: 0; }
.member-since { font-size: 12px; color: var(--text-light); }
.edit-actions { display: flex; gap: 8px; }

.profile-stats { display: flex; gap: 14px; margin-bottom: 28px; }
.stat { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: var(--radius-md, 12px); padding: 20px 28px; text-align: center; flex: 1; }
.stat-num { display: block; font-size: 30px; font-weight: 900; color: var(--blue, #4361ee); line-height: 1; letter-spacing: -0.05em; }
.stat-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 700; }

.tabs { display: flex; gap: 4px; margin-bottom: 24px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: var(--radius-md, 12px); padding: 4px; width: fit-content; }
.tabs button { display: flex; align-items: center; gap: 7px; padding: 9px 18px; background: none; border: none; color: var(--text-muted); font-size: 13px; font-weight: 700; cursor: pointer; border-radius: var(--radius-sm, 8px); transition: all 0.18s; font-family: inherit; }
.tabs button.active { background: var(--blue, #4361ee); color: #fff; }

.empty-state { text-align: center; padding: 64px 20px; display: flex; flex-direction: column; align-items: center; gap: 12px; color: rgba(255,255,255,0.1); }
.empty-state p { font-size: 14px; color: var(--text-muted); margin: 0; }

.movie-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 16px; }

.ratings-list { display: flex; flex-direction: column; gap: 10px; }
.rating-item { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: var(--radius-md, 12px); padding: 16px; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; transition: border-color 0.2s; }
.rating-item:hover { border-color: rgba(67,97,238,0.3); }
.rating-movie-info { display: flex; gap: 12px; align-items: center; }
.rating-poster { width: 48px; height: 72px; object-fit: cover; border-radius: 6px; }
.rating-movie-info h4 { font-size: 14px; color: var(--text, #fff); margin: 0 0 4px; font-weight: 700; }
.rating-date { font-size: 12px; color: var(--text-muted); margin: 0; }
.rating-score { display: flex; flex-direction: column; gap: 4px; align-items: flex-end; }
.rating-val { color: var(--rating, #f59e0b); font-weight: 800; font-size: 15px; }
.rating-review { font-size: 13px; color: var(--text-muted); font-style: italic; margin: 0; }

@media (max-width: 768px) { .profile-page { padding: 24px 20px; } .profile-header { flex-direction: column; align-items: center; text-align: center; } .profile-name-row { justify-content: center; } }
</style>
