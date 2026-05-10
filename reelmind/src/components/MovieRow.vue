<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import MovieCard from './MovieCard.vue'
import MovieCardSkeleton from './MovieCardSkeleton.vue'
import type { Movie } from '@/types/movie'

const props = withDefaults(defineProps<{
  title: string
  movies: Movie[]
  loading?: boolean
  seeAllRoute?: string
  seeAllLabel?: string
}>(), { loading: false })

const router = useRouter()
const scrollEl = ref<HTMLElement | null>(null)

function scroll(dir: 'left' | 'right') {
  scrollEl.value?.scrollBy({ left: dir === 'right' ? 340 : -340, behavior: 'smooth' })
}
</script>

<template>
  <section class="row-section">
    <div class="row-header">
      <h2 class="row-title">{{ title }}</h2>
      <button v-if="seeAllRoute" class="see-all" @click="router.push(seeAllRoute)">
        {{ seeAllLabel ?? 'Zobacz wszystkie' }}
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>

    <div class="row-wrapper">
      <button class="scroll-btn scroll-btn--left" @click="scroll('left')" aria-label="Przewiń w lewo">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <div ref="scrollEl" class="row-scroll">
        <template v-if="loading">
          <div v-for="i in 7" :key="i" class="row-item"><MovieCardSkeleton /></div>
        </template>
        <template v-else>
          <div v-for="movie in movies" :key="movie.id" class="row-item">
            <MovieCard :movie="movie" />
          </div>
        </template>
      </div>
      <button class="scroll-btn scroll-btn--right" @click="scroll('right')" aria-label="Przewiń w prawo">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
  </section>
</template>

<style scoped>
.row-section { margin-bottom: 44px; }
.row-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.row-title { font-size: 20px; font-weight: 800; color: var(--text, #fff); margin: 0; letter-spacing: -0.03em; }
.see-all {
  display: flex; align-items: center; gap: 4px;
  background: none; border: none;
  color: var(--blue, #4361ee); font-size: 13px; font-weight: 700;
  cursor: pointer; padding: 4px 0; font-family: inherit;
  transition: gap 0.2s;
}
.see-all:hover { gap: 8px; }

.row-wrapper { position: relative; }
.row-scroll {
  display: flex; gap: 12px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  padding: 4px 0 10px;
}
.row-scroll::-webkit-scrollbar { display: none; }
.row-item { flex: 0 0 155px; scroll-snap-align: start; }
@media (min-width: 640px) { .row-item { flex: 0 0 175px; } }
@media (min-width: 1200px) { .row-item { flex: 0 0 190px; } }

.scroll-btn {
  position: absolute; top: 50%; transform: translateY(-65%);
  background: rgba(13,20,38,0.95); backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.1);
  color: var(--text, #fff);
  width: 38px; height: 38px; border-radius: 50%;
  cursor: pointer; z-index: 2;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; box-shadow: var(--shadow-md);
}
.scroll-btn:hover { background: var(--blue, #4361ee); border-color: var(--blue, #4361ee); }
.scroll-btn--left { left: -19px; }
.scroll-btn--right { right: -19px; }
@media (max-width: 640px) { .scroll-btn { display: none; } }
</style>
