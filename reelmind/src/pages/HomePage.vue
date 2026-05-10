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
    await Promise.all([
      recStore.fetchRecommendations(),
      movieStore.fetchWatchlist(),
    ])
  }
})
</script>

<template>
  <div class="home">
    <section v-if="heroMovie" class="hero" :style="{ backgroundImage: `url(${heroMovie.backdropUrl})` }">
      <div class="hero-gradient" />
      <div class="hero-content">
        <h1 class="hero-title">
          {{ t('home.hero_title') }}
          <span class="hero-highlight">{{ t('home.hero_title_highlight') }}</span>
        </h1>
        <p class="hero-subtitle">{{ t('home.hero_subtitle') }}</p>
        <div class="hero-actions">
          <AppButton size="lg" @click="router.push({ name: 'movies' })">
            🎬 {{ t('home.hero_cta') }}
          </AppButton>
          <AppButton
            v-if="authStore.isAuthenticated"
            size="lg"
            variant="secondary"
            @click="router.push({ name: 'recommendations' })"
          >
            ✨ {{ t('home.hero_cta_recommendations') }}
          </AppButton>
          <AppButton
            v-else
            size="lg"
            variant="secondary"
            @click="router.push({ name: 'login' })"
          >
            {{ t('auth.sign_in') }}
          </AppButton>
        </div>
      </div>
    </section>

    <div class="content">
      <MovieRow
        v-if="authStore.isAuthenticated && recommendedMovies.length > 0"
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
        :title="t('home.popular')"
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
  height: 580px;
  background-size: cover;
  background-position: center top;
  display: flex; align-items: flex-end;
}
.hero-gradient {
  position: absolute; inset: 0;
  background: linear-gradient(to right, rgba(2,6,23,0.9) 0%, rgba(2,6,23,0.4) 60%, transparent 100%),
              linear-gradient(to top, rgba(2,6,23,1) 0%, transparent 40%);
}
.hero-content {
  position: relative; z-index: 1;
  padding: 0 40px 60px;
  max-width: 600px;
}
.hero-title {
  font-size: clamp(36px, 5vw, 60px);
  font-weight: 800; color: #f1f5f9;
  margin: 0 0 16px; line-height: 1.1;
}
.hero-highlight { color: #e11d48; display: block; }
.hero-subtitle { font-size: 16px; color: #94a3b8; margin: 0 0 28px; max-width: 420px; line-height: 1.6; }
.hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }

.content { max-width: 1400px; margin: 0 auto; padding: 40px 40px; }

@media (max-width: 768px) {
  .hero { height: 440px; }
  .hero-content { padding: 0 20px 40px; }
  .content { padding: 30px 20px; }
}
</style>
