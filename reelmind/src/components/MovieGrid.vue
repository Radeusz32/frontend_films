<script setup lang="ts">
import MovieCard from './MovieCard.vue'
import MovieCardSkeleton from './MovieCardSkeleton.vue'
import type { Movie } from '@/types/movie'
import { useI18n } from 'vue-i18n'

withDefaults(defineProps<{
  movies: Movie[]
  loading?: boolean
  skeletonCount?: number
  showRating?: boolean
  emptyTitle?: string
  emptyDesc?: string
}>(), { loading: false, skeletonCount: 8, showRating: false })

const { t } = useI18n()
</script>

<template>
  <div>
    <div v-if="loading" class="grid">
      <MovieCardSkeleton v-for="i in skeletonCount" :key="i" />
    </div>
    <div v-else-if="movies.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
          <line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
        </svg>
      </div>
      <h3>{{ emptyTitle ?? t('movie.no_movies') }}</h3>
      <p>{{ emptyDesc ?? t('movie.no_movies_desc') }}</p>
    </div>
    <div v-else class="grid">
      <MovieCard v-for="movie in movies" :key="movie.id" :movie="movie" :show-rating="showRating" />
    </div>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}
@media (min-width: 640px) { .grid { grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); } }
@media (min-width: 1024px) { .grid { grid-template-columns: repeat(auto-fill, minmax(185px, 1fr)); } }

.empty-state {
  text-align: center; padding: 64px 20px;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.empty-icon { color: rgba(255,255,255,0.1); }
.empty-state h3 { color: var(--text-muted); font-size: 18px; margin: 0; }
.empty-state p { font-size: 14px; color: var(--text-light); margin: 0; }
</style>
