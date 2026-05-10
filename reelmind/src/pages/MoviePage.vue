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
  } finally {
    ratingLoading.value = false
  }
}

function openTrailer() {
  const url = movieStore.currentMovie?.trailerUrl
  if (url) window.open(url, '_blank')
}

async function onRemoveRating() {
  if (!userRating.value) return
  await movieStore.removeRating(userRating.value.id)
  ratingValue.value = 0
  reviewText.value = ''
}
</script>

<template>
  <div class="movie-page">
    <div v-if="movieStore.loading" class="skeleton-page">
      <AppSkeleton height="500px" />
      <div class="skeleton-info">
        <AppSkeleton height="40px" width="60%" />
        <AppSkeleton height="20px" width="30%" />
        <AppSkeleton height="100px" />
      </div>
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
        <button class="back-btn" @click="router.back()">← {{ t('movie.back') }}</button>

        <div class="movie-layout">
          <div class="movie-poster-wrap">
            <img :src="movieStore.currentMovie.posterUrl" :alt="movieStore.currentMovie.title" class="movie-poster" />
          </div>

          <div class="movie-info">
            <div class="movie-header">
              <h1 class="movie-title">{{ movieStore.currentMovie.title }}</h1>
              <div class="movie-meta">
                <span class="global-rating">
                  <span class="star-icon">★</span> {{ formatRating(movieStore.currentMovie.rating) }}
                </span>
                <span class="movie-year">{{ movieStore.currentMovie.year }}</span>
                <span class="movie-duration">{{ formatDuration(movieStore.currentMovie.duration) }}</span>
              </div>
              <div class="movie-genres">
                <AppBadge v-for="g in movieStore.currentMovie.genre" :key="g">{{ g }}</AppBadge>
              </div>
            </div>

            <p class="movie-description">{{ movieStore.currentMovie.description }}</p>

            <div class="movie-details">
              <div class="detail-row">
                <span class="detail-label">{{ t('movie.director') }}</span>
                <span>{{ movieStore.currentMovie.director }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ t('movie.cast') }}</span>
                <span>{{ movieStore.currentMovie.cast.join(', ') }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">{{ t('movie.language') ?? 'Language' }}</span>
                <span>{{ movieStore.currentMovie.language.toUpperCase() }}</span>
              </div>
            </div>

            <div class="movie-actions">
              <AppButton
                :variant="inWatchlist ? 'secondary' : 'primary'"
                size="lg"
                @click="onToggleWatchlist"
              >
                {{ inWatchlist ? `★ ${t('movie.remove_watchlist')}` : `☆ ${t('movie.add_watchlist')}` }}
              </AppButton>

              <AppButton
                v-if="movieStore.currentMovie.trailerUrl"
                variant="secondary"
                size="lg"
                @click="openTrailer"
              >
                ▶ {{ t('movie.trailer') }}
              </AppButton>
            </div>

            <div v-if="authStore.isAuthenticated" class="rating-section">
              <h3>{{ t('movie.your_rating') }}</h3>

              <div v-if="userRating && !showRatingForm" class="current-rating">
                <StarRating :model-value="userRating.value" :max="10" readonly :size="22" />
                <span class="rating-num">{{ userRating.value }}/10</span>
                <p v-if="userRating.review" class="rating-review">"{{ userRating.review }}"</p>
                <div class="rating-actions">
                  <AppButton variant="ghost" size="sm" @click="showRatingForm = true">{{ t('common.edit') }}</AppButton>
                  <AppButton variant="danger" size="sm" @click="onRemoveRating">{{ t('common.delete') }}</AppButton>
                </div>
              </div>

              <div v-else class="rating-form">
                <StarRating v-model="ratingValue" :max="10" :size="28" />
                <span class="rating-num">{{ ratingValue }}/10</span>
                <textarea
                  v-model="reviewText"
                  :placeholder="t('movie.rate_movie')"
                  class="review-input"
                  rows="3"
                />
                <div class="rating-form-actions">
                  <AppButton :loading="ratingLoading" @click="onSubmitRating" :disabled="ratingValue === 0">
                    {{ t('common.save') }}
                  </AppButton>
                  <AppButton v-if="userRating" variant="ghost" @click="showRatingForm = false">
                    {{ t('common.cancel') }}
                  </AppButton>
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

.backdrop {
  position: fixed; inset: 0;
  background-size: cover; background-position: center;
  z-index: -1;
}
.backdrop-gradient {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(2,6,23,0.7) 0%, rgba(2,6,23,0.95) 50%, #020617 100%);
}

.skeleton-page { padding: 40px; display: flex; flex-direction: column; gap: 20px; }
.skeleton-info { display: flex; flex-direction: column; gap: 12px; }

.not-found { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 20px; color: #94a3b8; }

.movie-content { max-width: 1200px; margin: 0 auto; padding: 30px 40px 60px; }
.back-btn { background: none; border: none; color: #94a3b8; font-size: 14px; cursor: pointer; margin-bottom: 24px; display: inline-flex; align-items: center; gap: 6px; transition: color 0.2s; }
.back-btn:hover { color: #e2e8f0; }

.movie-layout { display: grid; grid-template-columns: 260px 1fr; gap: 40px; }
@media (max-width: 768px) { .movie-layout { grid-template-columns: 1fr; } .movie-content { padding: 20px; } }

.movie-poster-wrap { position: sticky; top: 80px; align-self: start; }
.movie-poster { width: 100%; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.8); }

.movie-header { margin-bottom: 24px; }
.movie-title { font-size: clamp(24px, 4vw, 42px); font-weight: 800; color: #f1f5f9; margin: 0 0 12px; }
.movie-meta { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
.global-rating { color: #f59e0b; font-weight: 700; font-size: 20px; display: flex; align-items: center; gap: 4px; }
.star-icon { font-size: 16px; }
.movie-year, .movie-duration { color: #64748b; font-size: 15px; }
.movie-genres { display: flex; gap: 8px; flex-wrap: wrap; }

.movie-description { color: #94a3b8; line-height: 1.8; font-size: 15px; margin-bottom: 24px; }

.movie-details { background: rgba(15,23,42,0.8); border: 1px solid #1e293b; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; display: flex; flex-direction: column; gap: 10px; }
.detail-row { display: flex; gap: 12px; font-size: 14px; }
.detail-label { color: #64748b; font-weight: 600; min-width: 80px; }

.movie-actions { display: flex; gap: 12px; margin-bottom: 32px; flex-wrap: wrap; }

.rating-section h3 { font-size: 18px; color: #e2e8f0; margin: 0 0 16px; }
.current-rating { display: flex; flex-direction: column; gap: 8px; }
.rating-num { color: #f59e0b; font-size: 18px; font-weight: 700; }
.rating-review { color: #94a3b8; font-style: italic; font-size: 14px; margin: 0; }
.rating-actions { display: flex; gap: 8px; }
.rating-form { display: flex; flex-direction: column; gap: 12px; }
.review-input {
  background: #0f172a; border: 1px solid #334155; border-radius: 8px;
  color: #e2e8f0; padding: 10px 14px; font-size: 14px; resize: vertical; outline: none;
}
.review-input:focus { border-color: #e11d48; }
.rating-form-actions { display: flex; gap: 8px; }
</style>
