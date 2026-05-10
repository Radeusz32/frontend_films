<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMovieStore } from '@/stores/movie.store'
import { useAuthStore } from '@/stores/auth.store'
import StarRating from '@/components/ui/StarRating.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppSkeleton from '@/components/ui/AppSkeleton.vue'
import { formatDuration, formatRating } from '@/utils/format'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const movieStore = useMovieStore()
const authStore = useAuthStore()

const movieId = computed(() => Number(route.params['id']))
const userRating = computed(() => movieStore.getUserRatingForMovie(movieId.value))
const ratingValue = ref(userRating.value?.value ?? 0)
const reviewText = ref(userRating.value?.review ?? '')
const inWatchlist = computed(() => movieStore.isInWatchlist(movieId.value))
const ratingLoading = ref(false)
const showRatingForm = ref(false)

onMounted(async () => {
  await movieStore.fetchMovie(movieId.value)
  if (authStore.isAuthenticated) {
    await Promise.all([movieStore.fetchWatchlist(), movieStore.fetchUserRatings()])
    ratingValue.value = userRating.value?.value ?? 0
    reviewText.value = userRating.value?.review ?? ''
  }
})

async function onToggleWatchlist() {
  if (!authStore.isAuthenticated) { router.push({ name: 'login' }); return }
  await movieStore.toggleWatchlist(movieId.value)
}
async function onSubmitRating() {
  if (!authStore.isAuthenticated) { router.push({ name: 'login' }); return }
  ratingLoading.value = true
  try {
    await movieStore.rateMovie({ movieId: movieId.value, value: ratingValue.value, review: reviewText.value })
    showRatingForm.value = false
  } finally { ratingLoading.value = false }
}
function openTrailer() {
  const url = movieStore.currentMovie?.trailerUrl
  if (url) window.open(url, '_blank')
}
async function onRemoveRating() {
  if (!userRating.value) return
  await movieStore.removeRating(userRating.value.id)
  ratingValue.value = 0; reviewText.value = ''
}
</script>

<template>
  <div class="movie-page">
    <div v-if="movieStore.loading" class="skeleton-page">
      <AppSkeleton height="480px" />
      <div class="sk-info"><AppSkeleton height="44px" width="55%"/><AppSkeleton height="20px" width="35%"/><AppSkeleton height="120px"/></div>
    </div>

    <div v-else-if="!movieStore.currentMovie" class="not-found">
      <h2>{{ t('movie.not_found') }}</h2>
      <AppButton @click="router.push({ name: 'home' })">{{ t('movie.back') }}</AppButton>
    </div>

    <template v-else>
      <div class="backdrop" :style="{ backgroundImage: `url(${movieStore.currentMovie.backdropUrl})` }">
        <div class="backdrop-gradient" />
      </div>

      <div class="movie-content">
        <button class="back-btn" @click="router.back()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          {{ t('movie.back') }}
        </button>

        <div class="movie-layout">
          <div class="movie-poster-wrap">
            <img :src="movieStore.currentMovie.posterUrl" :alt="movieStore.currentMovie.title" class="movie-poster" />
          </div>

          <div class="movie-info">
            <div class="movie-genres">
              <AppBadge v-for="g in movieStore.currentMovie.genre" :key="g">{{ g }}</AppBadge>
            </div>
            <h1 class="movie-title">{{ movieStore.currentMovie.title }}</h1>
            <div class="movie-meta">
              <div class="rating-pill">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                {{ formatRating(movieStore.currentMovie.rating) }}
              </div>
              <span class="meta-sep">·</span>
              <span class="meta-item">{{ movieStore.currentMovie.year }}</span>
              <span class="meta-sep">·</span>
              <span class="meta-item">{{ formatDuration(movieStore.currentMovie.duration) }}</span>
            </div>

            <p class="movie-desc">{{ movieStore.currentMovie.description }}</p>

            <div class="movie-details">
              <div class="detail-row">
                <span class="detail-label">{{ t('movie.director') }}</span>
                <span class="detail-val">{{ movieStore.currentMovie.director }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ t('movie.cast') }}</span>
                <span class="detail-val">{{ movieStore.currentMovie.cast.join(', ') }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Język</span>
                <span class="detail-val">{{ movieStore.currentMovie.language.toUpperCase() }}</span>
              </div>
            </div>

            <div class="movie-actions">
              <AppButton size="lg" @click="onToggleWatchlist" :variant="inWatchlist ? 'secondary' : 'primary'">
                <svg v-if="inWatchlist" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                {{ inWatchlist ? t('movie.remove_watchlist') : t('movie.add_watchlist') }}
              </AppButton>
              <AppButton v-if="movieStore.currentMovie.trailerUrl" variant="ghost" size="lg" @click="openTrailer">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                {{ t('movie.trailer') }}
              </AppButton>
            </div>

            <div v-if="authStore.isAuthenticated" class="rating-section">
              <h3>{{ t('movie.your_rating') }}</h3>
              <div v-if="userRating && !showRatingForm" class="current-rating">
                <StarRating :model-value="userRating.value" :max="10" readonly :size="22" />
                <span class="rating-num">{{ userRating.value }}/10</span>
                <p v-if="userRating.review" class="rating-review">"{{ userRating.review }}"</p>
                <div class="rating-actions">
                  <AppButton variant="secondary" size="sm" @click="showRatingForm = true">{{ t('common.edit') }}</AppButton>
                  <AppButton variant="danger" size="sm" @click="onRemoveRating">{{ t('common.delete') }}</AppButton>
                </div>
              </div>
              <div v-else class="rating-form">
                <StarRating v-model="ratingValue" :max="10" :size="28" />
                <span class="rating-num">{{ ratingValue }}/10</span>
                <textarea v-model="reviewText" :placeholder="t('movie.rate_movie')" class="review-input" rows="3" />
                <div class="rating-form-actions">
                  <AppButton :loading="ratingLoading" @click="onSubmitRating" :disabled="ratingValue === 0">{{ t('common.save') }}</AppButton>
                  <AppButton v-if="userRating" variant="ghost" @click="showRatingForm = false">{{ t('common.cancel') }}</AppButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.movie-page { min-height: 100vh; position: relative; }
.backdrop { position: fixed; inset: 0; background-size: cover; background-position: center; z-index: -1; }
.backdrop-gradient { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(7,9,26,0.5) 0%, rgba(7,9,26,0.85) 40%, var(--bg, #07091a) 70%); }

.skeleton-page { padding: 40px; display: flex; flex-direction: column; gap: 20px; }
.sk-info { display: flex; flex-direction: column; gap: 14px; max-width: 600px; }
.not-found { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 20px; color: var(--text-muted); }

.movie-content { max-width: 1200px; margin: 0 auto; padding: 32px 44px 80px; }
.back-btn {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1);
  color: var(--text-muted); font-size: 13px; font-weight: 600;
  cursor: pointer; padding: 8px 16px; border-radius: 999px;
  margin-bottom: 28px; transition: all 0.2s; font-family: inherit;
}
.back-btn:hover { color: var(--text, #fff); background: rgba(255,255,255,0.12); }

.movie-layout { display: grid; grid-template-columns: 250px 1fr; gap: 44px; }
@media (max-width: 768px) { .movie-layout { grid-template-columns: 1fr; } .movie-content { padding: 20px; } }

.movie-poster-wrap { position: sticky; top: 80px; align-self: start; }
.movie-poster { width: 100%; border-radius: var(--radius-lg, 16px); box-shadow: 0 24px 60px rgba(0,0,0,0.8); }

.movie-genres { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
.movie-title { font-size: clamp(26px, 4vw, 44px); font-weight: 900; color: #fff; margin: 0 0 14px; letter-spacing: -0.04em; }
.movie-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
.rating-pill { display: flex; align-items: center; gap: 5px; background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.25); color: var(--rating, #f59e0b); font-weight: 800; font-size: 15px; padding: 4px 12px; border-radius: 8px; }
.meta-sep { color: rgba(255,255,255,0.2); }
.meta-item { color: var(--text-muted); font-size: 14px; font-weight: 600; }

.movie-desc { color: var(--text-muted); line-height: 1.8; font-size: 15px; margin-bottom: 24px; }

.movie-details { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: var(--radius-md, 12px); padding: 18px 20px; margin-bottom: 24px; display: flex; flex-direction: column; gap: 12px; }
.detail-row { display: flex; gap: 16px; font-size: 14px; }
.detail-label { color: var(--text-light); font-weight: 700; min-width: 80px; }
.detail-val { color: var(--text-muted); }

.movie-actions { display: flex; gap: 12px; margin-bottom: 36px; flex-wrap: wrap; }

.rating-section { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: var(--radius-lg, 16px); padding: 24px; }
.rating-section h3 { font-size: 16px; color: var(--text, #fff); margin: 0 0 16px; font-weight: 800; }
.current-rating { display: flex; flex-direction: column; gap: 10px; }
.rating-num { color: var(--rating, #f59e0b); font-size: 18px; font-weight: 800; }
.rating-review { color: var(--text-muted); font-style: italic; font-size: 14px; margin: 0; }
.rating-actions { display: flex; gap: 8px; }
.rating-form { display: flex; flex-direction: column; gap: 14px; }
.review-input { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius-sm, 8px); color: var(--text, #fff); padding: 10px 14px; font-size: 14px; resize: vertical; outline: none; font-family: inherit; transition: border-color 0.2s; }
.review-input:focus { border-color: var(--blue, #4361ee); box-shadow: 0 0 0 3px var(--blue-light, rgba(67,97,238,0.18)); }
.rating-form-actions { display: flex; gap: 8px; }
</style>
