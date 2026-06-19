<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMovieStore } from '@/stores/movie.store'
import { useAuthStore } from '@/stores/auth.store'
import { useRecommendationStore } from '@/stores/recommendation.store'
import MovieRow from '@/components/MovieRow.vue'
import AppButton from '@/components/ui/AppButton.vue'

const { t } = useI18n()
const router = useRouter()
const movieStore = useMovieStore()
const authStore = useAuthStore()
const recStore = useRecommendationStore()

const topRated = computed(() =>
  [...movieStore.movies].sort((a, b) => b.rating - a.rating).slice(0, 10),
)
const newReleases = computed(() =>
  [...movieStore.movies].sort((a, b) => b.year - a.year).slice(0, 10),
)
const recommendedMovies = computed(() =>
  recStore.recommendations.map((r) => r.movie).slice(0, 10),
)
const heroMovie = computed(() => topRated.value[0])

onMounted(async () => {
  await movieStore.fetchMovies({ limit: 50 })
  if (authStore.isAuthenticated) {
    await Promise.all([recStore.fetchRecommendations(), movieStore.fetchWatchlist()])
  }
})
</script>

<template>
  <div class="home">
    <section v-if="heroMovie" class="hero" :style="{ backgroundImage: `url(${heroMovie.backdropUrl})` }">
      <div class="hero-overlay" />
      <div class="hero-content">
        <div class="hero-origin">
          <span class="hero-rm-badge">RM</span>
          <span class="hero-original-text">ReelMind original</span>
        </div>

        <h1 class="hero-title">{{ heroMovie.title }}</h1>

        <div class="hero-meta">
          <span class="hero-year">{{ heroMovie.year }}</span>
          <span class="hero-sep">·</span>
          <span class="hero-duration">{{ heroMovie.duration }} min</span>
          <span class="hero-sep">·</span>
          <span class="hero-genre-badge">{{ heroMovie.genre[0] }}</span>
        </div>

        <div class="hero-rank">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          <span>#1 Najwyżej oceniany dzisiaj</span>
        </div>

        <p class="hero-desc">{{ heroMovie.description?.slice(0, 160) }}{{ (heroMovie.description?.length ?? 0) > 160 ? '...' : '' }}</p>

        <div class="hero-actions">
          <AppButton size="lg" @click="router.push({ name: 'movie', params: { id: heroMovie.id } })">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Odtwórz
          </AppButton>
          <AppButton size="lg" variant="secondary" @click="router.push({ name: 'movie', params: { id: heroMovie.id } })">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Więcej info
          </AppButton>
        </div>
      </div>
    </section>

    <div class="content">
      <MovieRow
        v-if="authStore.isAuthenticated && movieStore.watchlist.length > 0"
        :title="t('home.your_watchlist')"
        :movies="movieStore.watchlist"
        :loading="movieStore.loading"
        see-all-route="/profile"
        :see-all-label="t('home.see_all')"
      />

      <MovieRow
        v-if="authStore.isAuthenticated && recommendedMovies.length > 0"
        :title="t('nav.recommendations')"
        :movies="recommendedMovies"
        :loading="recStore.loading"
        see-all-route="/recommendations"
        :see-all-label="t('home.see_all')"
      />

      <MovieRow
        :title="`Popularne na ReelMind`"
        :movies="movieStore.movies.slice(0, 10)"
        :loading="movieStore.loading"
        see-all-route="/movies"
        :see-all-label="t('home.see_all')"
      />

      <MovieRow
        :title="t('home.top_rated')"
        :movies="topRated"
        :loading="movieStore.loading"
        see-all-route="/movies?sortBy=rating"
        :see-all-label="t('home.see_all')"
      />

      <MovieRow
        :title="t('home.new_releases')"
        :movies="newReleases"
        :loading="movieStore.loading"
        see-all-route="/movies?sortBy=year"
        :see-all-label="t('home.see_all')"
      />
    </div>
  </div>
</template>

<style scoped>
.home { min-height: 100vh; }

.hero {
  position: relative;
  height: 88vh; min-height: 560px; max-height: 780px;
  background-size: cover; background-position: center 15%;
  display: flex; align-items: flex-end;
}
.hero-overlay {
  position: absolute; inset: 0;
  background:
    linear-gradient(to right, rgba(7,9,26,0.97) 0%, rgba(7,9,26,0.55) 50%, rgba(7,9,26,0.1) 100%),
    linear-gradient(to top, var(--bg, #07091a) 0%, rgba(7,9,26,0.6) 25%, transparent 55%);
}
.hero-content {
  position: relative; z-index: 1;
  padding: 0 52px 72px;
  max-width: 580px;
}

.hero-origin { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.hero-rm-badge {
  background: var(--blue, #4361ee); color: #fff;
  font-size: 11px; font-weight: 900; padding: 4px 9px; border-radius: 7px;
  letter-spacing: 0.05em;
}
.hero-original-text { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.7); letter-spacing: 0.02em; }

.hero-title {
  font-size: clamp(38px, 5vw, 68px);
  font-weight: 900; color: #fff;
  margin: 0 0 16px; line-height: 1.0;
  letter-spacing: -0.04em;
}

.hero-meta {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 12px; flex-wrap: wrap;
}
.hero-year, .hero-duration { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.65); }
.hero-sep { color: rgba(255,255,255,0.25); }
.hero-genre-badge {
  border: 1px solid rgba(255,255,255,0.35); border-radius: 4px;
  padding: 2px 8px; font-size: 12px; font-weight: 700;
  color: rgba(255,255,255,0.75); letter-spacing: 0.04em;
}

.hero-rank {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.85);
  margin-bottom: 16px;
}
.hero-rank svg { color: rgba(255,255,255,0.5); }

.hero-desc {
  font-size: 15px; color: rgba(255,255,255,0.65);
  margin: 0 0 28px; max-width: 420px; line-height: 1.75;
}

.hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }

.content {
  max-width: 1500px; margin: 0 auto;
  padding: 44px 52px 72px;
}

@media (max-width: 1024px) {
  .content { padding: 36px 32px 60px; }
}

@media (max-width: 768px) {
  .hero { height: 72vh; min-height: 420px; max-height: 640px; }
  .hero-content { padding: 0 20px 40px; max-width: 100%; }
  .hero-title { font-size: clamp(28px, 8vw, 48px); }
  .hero-desc { font-size: 14px; }
  .content { padding: 24px 16px 48px; }
}

@media (max-width: 480px) {
  .hero { height: 65vh; min-height: 380px; }
  .hero-actions { gap: 8px; }
}
</style>
