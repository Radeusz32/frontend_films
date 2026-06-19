<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMovieStore } from '@/stores/movie.store'
import MovieGrid from '@/components/MovieGrid.vue'
import AppButton from '@/components/ui/AppButton.vue'
import type { MovieGenre } from '@/types/movie'

const { t } = useI18n()
const route = useRoute()
const movieStore = useMovieStore()

const genres: MovieGenre[] = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller', 'Romance', 'Animation', 'Documentary', 'Fantasy']
const sortOptions = [
  { value: 'rating', label: 'Ocena' },
  { value: 'year', label: 'Rok' },
  { value: 'title', label: 'Tytuł' },
]

const selectedGenre = ref<MovieGenre | undefined>(undefined)
const sortBy = ref<'rating' | 'year' | 'title'>('rating')
const page = ref(1)

async function load() {
  await movieStore.fetchMovies({ genre: selectedGenre.value, sortBy: sortBy.value, page: page.value, limit: 20 })
}

watch([selectedGenre, sortBy], () => { page.value = 1; load() })

onMounted(() => {
  const q = route.query
  if (q.sortBy === 'rating' || q.sortBy === 'year' || q.sortBy === 'title') sortBy.value = q.sortBy
  load()
})
</script>

<template>
  <div class="movies-page">
    <div class="page-header">
      <h1>{{ t('nav.movies') }}</h1>
    </div>

    <div class="filters">
      <div class="filter-row">
        <div class="genre-filters">
          <button class="chip" :class="{ active: !selectedGenre }" @click="selectedGenre = undefined">Wszystkie</button>
          <button v-for="g in genres" :key="g" class="chip" :class="{ active: selectedGenre === g }" @click="selectedGenre = g">{{ g }}</button>
        </div>
      </div>
      <div class="filter-row">
        <div class="sort-filters">
          <span class="sort-label">Sortuj:</span>
          <button v-for="opt in sortOptions" :key="opt.value" class="sort-btn" :class="{ active: sortBy === opt.value }" @click="sortBy = opt.value as typeof sortBy">{{ opt.label }}</button>
        </div>
      </div>
    </div>

    <MovieGrid :movies="movieStore.movies" :loading="movieStore.loading" :skeleton-count="20" />

    <div v-if="!movieStore.loading && movieStore.pagination.count > 0" class="pagination">
      <AppButton variant="ghost" :disabled="page === 1" @click="page--; load()">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        {{ t('common.previous') }}
      </AppButton>
      <span class="page-info">{{ page }} / {{ Math.ceil(movieStore.pagination.count / 20) }}</span>
      <AppButton variant="ghost" :disabled="!movieStore.pagination.next" @click="page++; load()">
        {{ t('common.next') }}
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.movies-page { max-width: 1500px; margin: 0 auto; padding: 44px 52px; }
.page-header { margin-bottom: 28px; }
.page-header h1 { font-size: 30px; font-weight: 900; color: var(--text, #fff); margin: 0; letter-spacing: -0.04em; }

.filters { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
.filter-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.genre-filters, .sort-filters { display: flex; flex-wrap: wrap; gap: 7px; align-items: center; }
.sort-label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin-right: 4px; }

.chip, .sort-btn {
  padding: 6px 14px; border-radius: 999px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  color: var(--text-muted); font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all 0.18s; font-family: inherit;
}
.chip:hover, .sort-btn:hover { color: var(--text, #fff); background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.15); }
.chip.active, .sort-btn.active { background: var(--blue, #4361ee); border-color: var(--blue, #4361ee); color: #fff; }

.sort-btn { border-radius: var(--radius-sm, 8px); }

.pagination { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 48px; }
.page-info { color: var(--text-muted); font-size: 14px; font-weight: 600; min-width: 60px; text-align: center; }

@media (max-width: 1024px) { .movies-page { padding: 32px 28px; } }
@media (max-width: 768px) {
  .movies-page { padding: 20px 16px; }
  .page-header h1 { font-size: 24px; }
  .chip, .sort-btn { padding: 5px 11px; font-size: 12px; }
}
</style>
