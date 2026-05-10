<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMovieStore } from '@/stores/movie.store'
import { useAuthStore } from '@/stores/auth.store'
import StarRating from '@/components/ui/StarRating.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import type { Movie } from '@/types/movie'

const props = defineProps<{ movie: Movie; showRating?: boolean }>()

const router = useRouter()
const movieStore = useMovieStore()
const authStore = useAuthStore()

const inWatchlist = computed(() => movieStore.isInWatchlist(props.movie.id))

function goToMovie() {
  router.push({ name: 'movie', params: { id: props.movie.id } })
}

async function onToggleWatchlist(e: Event) {
  e.stopPropagation()
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login' })
    return
  }
  await movieStore.toggleWatchlist(props.movie.id)
}
</script>

<template>
  <article class="card" @click="goToMovie" role="button" tabindex="0" @keydown.enter="goToMovie">
    <div class="card-poster">
      <img :src="movie.posterUrl" :alt="movie.title" class="poster-img" loading="lazy" />
      <div class="card-overlay">
        <button class="watchlist-btn" :class="{ active: inWatchlist }" @click="onToggleWatchlist" :title="inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'">
          {{ inWatchlist ? '★' : '☆' }}
        </button>
      </div>
      <div class="card-rating">
        <span class="rating-star">★</span>
        <span>{{ movie.rating.toFixed(1) }}</span>
      </div>
    </div>
    <div class="card-body">
      <h3 class="card-title">{{ movie.title }}</h3>
      <div class="card-meta">
        <span class="card-year">{{ movie.year }}</span>
        <AppBadge v-for="g in movie.genre.slice(0, 2)" :key="g">{{ g }}</AppBadge>
      </div>
      <div v-if="showRating" class="card-user-rating">
        <StarRating :model-value="movieStore.getUserRatingForMovie(movie.id)?.value ?? 0" :max="10" readonly :size="14" />
      </div>
    </div>
  </article>
</template>

<style scoped>
.card {
  background: #0f172a;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.25s, box-shadow 0.25s;
  border: 1px solid #1e293b;
  outline: none;
}
.card:hover, .card:focus { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.5); }

.card-poster { position: relative; aspect-ratio: 2/3; overflow: hidden; }
.poster-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.card:hover .poster-img { transform: scale(1.04); }

.card-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%);
  opacity: 0; transition: opacity 0.25s;
  display: flex; align-items: flex-start; justify-content: flex-end; padding: 10px;
}
.card:hover .card-overlay { opacity: 1; }

.watchlist-btn {
  background: rgba(0,0,0,0.6);
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  width: 36px; height: 36px;
  color: #fff; font-size: 18px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.watchlist-btn.active { background: #e11d48; border-color: #e11d48; }
.watchlist-btn:hover { background: #e11d48; border-color: #e11d48; }

.card-rating {
  position: absolute; bottom: 8px; left: 8px;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(4px);
  padding: 3px 8px; border-radius: 6px;
  font-size: 13px; font-weight: 700;
  color: #f59e0b;
  display: flex; align-items: center; gap: 3px;
}
.rating-star { font-size: 11px; }

.card-body { padding: 10px 12px 12px; }
.card-title { font-size: 14px; font-weight: 600; color: #e2e8f0; margin: 0 0 6px; line-height: 1.3; }
.card-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.card-year { font-size: 12px; color: #64748b; }
.card-user-rating { margin-top: 6px; }
</style>
