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
  { value: 'rating', label: '⭐ Rating' },
  { value: 'year', label: '📅 Year' },
  { value: 'title', label: '🔤 Title' },
]

const selectedGenre = ref<MovieGenre | undefined>(undefined)
const sortBy = ref<'rating' | 'year' | 'title'>('rating')
const page = ref(1)

async function load() {
  await movieStore.fetchMovies({
    genre: selectedGenre.value,
    sortBy: sortBy.value,
    page: page.value,
    limit: 20,
  })
}

watch([selectedGenre, sortBy], () => {
  page.value = 1
  load()
})

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
      <div class="genre-filters">
        <button
          class="genre-btn"
          :class="{ active: !selectedGenre }"
          @click="selectedGenre = undefined"
        >All</button>
        <button
          v-for="g in genres"
          :key="g"
          class="genre-btn"
          :class="{ active: selectedGenre === g }"
          @click="selectedGenre = g"
        >{{ g }}</button>
      </div>

      <div class="sort-filters">
        <button
          v-for="opt in sortOptions"
          :key="opt.value"
          class="sort-btn"
          :class="{ active: sortBy === opt.value }"
          @click="sortBy = opt.value as typeof sortBy"
        >{{ opt.label }}</button>
      </div>
    </div>

    <MovieGrid :movies="movieStore.movies" :loading="movieStore.loading" :skeleton-count="20" />

    <div v-if="!movieStore.loading && movieStore.pagination.count > 0" class="pagination">
      <AppButton variant="secondary" :disabled="page === 1" @click="page--; load()">
        ← {{ t('common.previous') }}
      </AppButton>
      <span class="page-info">
        {{ page }} {{ t('common.page_of') }} {{ Math.ceil(movieStore.pagination.count / 20) }}
      </span>
      <AppButton variant="secondary" :disabled="!movieStore.pagination.next" @click="page++; load()">
        {{ t('common.next') }} →
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.movies-page { max-width: 1400px; margin: 0 auto; padding: 40px; }
.page-header { margin-bottom: 28px; }
.page-header h1 { font-size: 32px; font-weight: 800; color: #e2e8f0; margin: 0; }

.filters { display: flex; flex-direction: column; gap: 16px; margin-bottom: 28px; }
.genre-filters { display: flex; flex-wrap: wrap; gap: 8px; }
.sort-filters { display: flex; gap: 8px; }

.genre-btn, .sort-btn {
  padding: 6px 14px; border-radius: 20px;
  background: #1e293b; border: 1px solid #334155;
  color: #94a3b8; font-size: 13px; cursor: pointer; transition: all 0.2s;
}
.genre-btn:hover, .sort-btn:hover { color: #e2e8f0; border-color: #64748b; }
.genre-btn.active, .sort-btn.active { background: #e11d48; border-color: #e11d48; color: #fff; }

.pagination { display: flex; align-items: center; justify-content: center; gap: 20px; margin-top: 40px; }
.page-info { color: #94a3b8; font-size: 14px; }

@media (max-width: 768px) { .movies-page { padding: 20px; } }
</style>
