<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMovieStore } from '@/stores/movie.store'
import { useAuthStore } from '@/stores/auth.store'
import { MoviesAPI } from '@/api/modules/movies.api'
import StarRating from '@/components/ui/StarRating.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppSkeleton from '@/components/ui/AppSkeleton.vue'
import { formatDuration, formatRating, formatDate } from '@/utils/format'
import type { MovieReview } from '@/types/rating'

const { t, locale } = useI18n()
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

// ── Reviews ────────────────────────────────────────────────────
const reviews = ref<MovieReview[]>([])
const reviewsCount = ref(0)
const reviewsAvg = ref<number | null>(null)
const reviewsLoading = ref(false)
const showAllReviews = ref(false)
const PREVIEW_COUNT = 3

const visibleReviews = computed(() =>
  showAllReviews.value ? reviews.value : reviews.value.slice(0, PREVIEW_COUNT)
)

async function loadReviews() {
  reviewsLoading.value = true
  try {
    const res = await MoviesAPI.getReviews(movieId.value)
    reviews.value = res.reviews
    reviewsCount.value = res.count
    reviewsAvg.value = res.averageRating
  } catch { /* silent */ }
  finally { reviewsLoading.value = false }
}

function avatarUrl(review: MovieReview): string {
  if (review.userAvatar) return review.userAvatar
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(review.userName)}&backgroundColor=4361ee&textColor=ffffff`
}

function scoreClass(v: number) {
  if (v >= 8) return 'score-great'
  if (v >= 6) return 'score-good'
  if (v >= 4) return 'score-avg'
  return 'score-bad'
}
// ─────────────────────────────────────────────────────────────

onMounted(async () => {
  await movieStore.fetchMovie(movieId.value)
  if (authStore.isAuthenticated) {
    await Promise.all([movieStore.fetchWatchlist(), movieStore.fetchUserRatings()])
    ratingValue.value = userRating.value?.value ?? 0
    reviewText.value = userRating.value?.review ?? ''
  }
  await loadReviews()
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
    await loadReviews()
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
  await loadReviews()
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

        <!-- ── REVIEWS ─────────────────────────────────────────── -->
        <section class="reviews-section">
          <div class="reviews-header">
            <div class="reviews-title-row">
              <h2 class="reviews-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Recenzje
                <span v-if="reviewsCount" class="reviews-count-badge">{{ reviewsCount }}</span>
              </h2>

              <div v-if="reviewsAvg" class="reviews-avg">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                  fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <span>{{ reviewsAvg.toFixed(1) }}</span>
                <span class="reviews-avg-sub">/ 10 średnia</span>
              </div>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="reviewsLoading" class="reviews-loading">
            <div v-for="i in 2" :key="i" class="review-skeleton">
              <AppSkeleton height="14px" width="120px" />
              <AppSkeleton height="60px" />
            </div>
          </div>

          <!-- Empty -->
          <div v-else-if="reviews.length === 0" class="reviews-empty">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <p>Brak recenzji. Bądź pierwszy!</p>
          </div>

          <!-- List -->
          <div v-else class="reviews-list">
            <article
              v-for="review in visibleReviews"
              :key="review.id"
              class="review-card"
              :class="{ 'review-own': review.userId === authStore.user?.id }"
            >
              <div class="review-top">
                <div class="review-user">
                  <img :src="avatarUrl(review)" :alt="review.userName" class="review-avatar" />
                  <div class="review-user-info">
                    <span class="review-username">
                      {{ review.userName }}
                      <span v-if="review.userId === authStore.user?.id" class="review-you">Ty</span>
                    </span>
                    <span class="review-date">{{ formatDate(review.createdAt, locale) }}</span>
                  </div>
                </div>

                <div class="review-score" :class="scoreClass(review.value)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"
                    fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  {{ review.value }}<span class="review-score-max">/10</span>
                </div>
              </div>

              <!-- Stars mini -->
              <StarRating :model-value="review.value" :max="10" readonly :size="13" />

              <!-- Text -->
              <p v-if="review.review" class="review-text">"{{ review.review }}"</p>
              <p v-else class="review-no-text">Ocena bez komentarza</p>
            </article>

            <button
              v-if="reviews.length > PREVIEW_COUNT"
              class="reviews-show-more"
              @click="showAllReviews = !showAllReviews"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <polyline v-if="!showAllReviews" points="6 9 12 15 18 9"/>
                <polyline v-else points="18 15 12 9 6 15"/>
              </svg>
              {{ showAllReviews ? 'Pokaż mniej' : `Pokaż wszystkie ${reviews.length} recenzje` }}
            </button>
          </div>
        </section>

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

@media (max-width: 1024px) {
  .movie-content { padding: 28px 32px 60px; }
  .movie-layout { grid-template-columns: 200px 1fr; gap: 28px; }
}
@media (max-width: 768px) {
  .movie-content { padding: 16px 16px 48px; }
  .movie-layout { grid-template-columns: 1fr; gap: 0; }
  .movie-poster-wrap {
    position: static;
    display: flex;
    justify-content: center;
    margin-bottom: 24px;
  }
  .movie-poster { max-width: 200px; }
  .movie-title { font-size: clamp(22px, 6vw, 36px); }
  .movie-actions { flex-direction: column; }
  .movie-actions > * { width: 100%; justify-content: center; }
}

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

/* ── Reviews ─────────────────────────────────────────────────── */
.reviews-section {
  margin-top: 52px;
  padding-top: 36px;
  border-top: 1px solid rgba(255,255,255,0.07);
}

.reviews-header { margin-bottom: 24px; }
.reviews-title-row {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 12px;
}

.reviews-title {
  display: flex; align-items: center; gap: 10px;
  font-size: 20px; font-weight: 800; color: #fff; margin: 0;
  letter-spacing: -0.03em;
}
.reviews-title svg { color: rgba(255,255,255,0.45); }
.reviews-count-badge {
  background: rgba(67,97,238,0.18);
  border: 1px solid rgba(67,97,238,0.3);
  color: #7b8ff5;
  font-size: 12px; font-weight: 700;
  padding: 2px 9px; border-radius: 100px;
}

.reviews-avg {
  display: flex; align-items: center; gap: 5px;
  font-size: 15px; font-weight: 800; color: #f59e0b;
}
.reviews-avg-sub { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.35); }

/* Loading skeletons */
.reviews-loading { display: flex; flex-direction: column; gap: 12px; }
.review-skeleton {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px; padding: 20px;
  display: flex; flex-direction: column; gap: 12px;
  animation: rev-pulse 1.4s ease-in-out infinite;
}
@keyframes rev-pulse { 0%,100%{opacity:1} 50%{opacity:.5} }

/* Empty */
.reviews-empty {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  padding: 48px 20px; color: rgba(255,255,255,0.1);
}
.reviews-empty p { font-size: 14px; color: rgba(255,255,255,0.3); margin: 0; }

/* List */
.reviews-list { display: flex; flex-direction: column; gap: 12px; }

.review-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px;
  padding: 20px;
  display: flex; flex-direction: column; gap: 10px;
  transition: border-color 0.2s;
}
.review-card:hover { border-color: rgba(255,255,255,0.12); }
.review-card.review-own {
  border-color: rgba(67,97,238,0.25);
  background: rgba(67,97,238,0.05);
}

.review-top {
  display: flex; align-items: center;
  justify-content: space-between; gap: 12px;
}

.review-user { display: flex; align-items: center; gap: 12px; }

.review-avatar {
  width: 38px; height: 38px; border-radius: 50%;
  object-fit: cover; flex-shrink: 0;
  background: rgba(67,97,238,0.2);
  border: 2px solid rgba(255,255,255,0.08);
}

.review-user-info { display: flex; flex-direction: column; gap: 2px; }
.review-username {
  font-size: 14px; font-weight: 700; color: #fff;
  display: flex; align-items: center; gap: 6px;
}
.review-you {
  font-size: 10px; font-weight: 700;
  background: rgba(67,97,238,0.25);
  color: #7b8ff5;
  border: 1px solid rgba(67,97,238,0.35);
  padding: 1px 6px; border-radius: 4px;
  letter-spacing: 0.04em;
}
.review-date { font-size: 11.5px; color: rgba(255,255,255,0.35); }

/* Score badge */
.review-score {
  display: flex; align-items: center; gap: 4px;
  font-size: 15px; font-weight: 900;
  padding: 4px 12px; border-radius: 8px;
  flex-shrink: 0;
}
.review-score-max { font-size: 10px; font-weight: 600; opacity: 0.6; }
.score-great { background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25); color: #10b981; }
.score-good  { background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.25); color: #f59e0b; }
.score-avg   { background: rgba(249,115,22,0.12); border: 1px solid rgba(249,115,22,0.25); color: #f97316; }
.score-bad   { background: rgba(239,68,68,0.12);  border: 1px solid rgba(239,68,68,0.25);  color: #ef4444; }

/* Text */
.review-text {
  font-size: 14px; color: rgba(255,255,255,0.65);
  line-height: 1.7; margin: 0;
  font-style: italic;
  padding-left: 12px;
  border-left: 2px solid rgba(67,97,238,0.35);
}
.review-no-text {
  font-size: 12px; color: rgba(255,255,255,0.2);
  margin: 0; font-style: italic;
}

/* Show more button */
.reviews-show-more {
  display: flex; align-items: center; justify-content: center; gap: 7px;
  width: 100%; padding: 12px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  color: rgba(255,255,255,0.5);
  font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all 0.15s;
  font-family: inherit;
}
.reviews-show-more:hover {
  background: rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.8);
  border-color: rgba(255,255,255,0.14);
}
</style>
