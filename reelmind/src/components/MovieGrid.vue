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
}>(), {
  loading: false,
  skeletonCount: 8,
  showRating: false,
})

const { t } = useI18n()
</script>

<template>
  <div>
    <div v-if="loading" class="grid">
      <MovieCardSkeleton v-for="i in skeletonCount" :key="i" />
    </div>
    <div v-else-if="movies.length === 0" class="empty-state">
      <span class="empty-icon">🎬</span>
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
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}
@media (min-width: 640px) { .grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); } }
@media (min-width: 1024px) { .grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); } }

.empty-state {
  text-align: center; padding: 60px 20px;
  color: #64748b; display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.empty-icon { font-size: 48px; }
.empty-state h3 { color: #94a3b8; font-size: 18px; margin: 0; }
.empty-state p { font-size: 14px; margin: 0; }
</style>
