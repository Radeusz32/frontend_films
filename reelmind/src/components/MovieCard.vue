<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMovieStore } from '@/stores/movie.store'
import { useAuthStore } from '@/stores/auth.store'
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
    <div class="card-inner">
      <img :src="movie.posterUrl" :alt="movie.title" class="card-img" loading="lazy" />

      <div class="card-badge">
        <span class="rm-badge">RM</span>
      </div>

      <div class="card-overlay">
        <div class="card-overlay-top">
          <button
            class="watchlist-btn"
            :class="{ active: inWatchlist }"
            @click="onToggleWatchlist"
            :title="inWatchlist ? 'Usuń z listy' : 'Dodaj do listy'"
          >
            <svg v-if="inWatchlist" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        </div>
        <div class="card-play">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
      </div>

      <div class="card-footer">
        <div class="card-rating">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          {{ movie.rating.toFixed(1) }}
        </div>
        <h3 class="card-title">{{ movie.title }}</h3>
        <p class="card-year">{{ movie.year }}</p>
      </div>
    </div>
  </article>
</template>

<style scoped>
.card {
  cursor: pointer; outline: none; border-radius: var(--radius-md, 12px); overflow: hidden;
  transition: transform 0.28s, box-shadow 0.28s;
}
.card:hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 20px 50px rgba(0,0,0,0.7); }
.card:focus { box-shadow: 0 0 0 3px var(--blue, #4361ee); }

.card-inner { position: relative; aspect-ratio: 2/3; border-radius: var(--radius-md, 12px); overflow: hidden; }
.card-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.35s; }
.card:hover .card-img { transform: scale(1.06); }

.card-badge { position: absolute; top: 10px; left: 10px; z-index: 2; }
.rm-badge {
  background: var(--blue, #4361ee);
  color: #fff; font-size: 9px; font-weight: 900;
  padding: 3px 7px; border-radius: 6px;
  letter-spacing: 0.05em;
}

.card-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(7,9,26,0.95) 0%, rgba(7,9,26,0.2) 40%, transparent 65%);
  display: flex; flex-direction: column; justify-content: space-between;
  padding: 10px;
  opacity: 0; transition: opacity 0.25s;
}
.card:hover .card-overlay { opacity: 1; }

.card-overlay-top { display: flex; justify-content: flex-end; }
.watchlist-btn {
  width: 30px; height: 30px; border-radius: 50%;
  background: rgba(255,255,255,0.15); backdrop-filter: blur(4px);
  border: 1px solid rgba(255,255,255,0.2);
  color: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.watchlist-btn.active, .watchlist-btn:hover { background: var(--blue, #4361ee); border-color: var(--blue, #4361ee); }

.card-play {
  display: flex; align-items: center; justify-content: center;
  width: 44px; height: 44px; border-radius: 50%;
  background: rgba(255,255,255,0.92);
  color: var(--bg, #07091a);
  margin: 0 auto;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
}

.card-footer {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 32px 12px 12px;
  background: linear-gradient(to top, rgba(7,9,26,0.98) 0%, transparent 100%);
}
.card-rating {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: 11px; font-weight: 700; color: var(--rating, #f59e0b);
  margin-bottom: 4px;
}
.card-title { font-size: 13px; font-weight: 700; color: #fff; margin: 0 0 2px; line-height: 1.3; }
.card-year { font-size: 11px; color: rgba(255,255,255,0.5); margin: 0; }
</style>
