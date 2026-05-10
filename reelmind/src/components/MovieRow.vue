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
}>(), {
  loading: false,
})

const router = useRouter()
const scrollEl = ref<HTMLElement | null>(null)

function scroll(dir: 'left' | 'right') {
  scrollEl.value?.scrollBy({ left: dir === 'right' ? 300 : -300, behavior: 'smooth' })
}
</script>

<template>
  <section class="row-section">
    <div class="row-header">
      <h2 class="row-title">{{ title }}</h2>
      <button v-if="seeAllRoute" class="see-all" @click="router.push(seeAllRoute)">
        {{ seeAllLabel ?? 'See all' }} →
      </button>
    </div>

    <div class="row-wrapper">
      <button class="scroll-btn scroll-btn--left" @click="scroll('left')" aria-label="Scroll left">‹</button>
      <div ref="scrollEl" class="row-scroll">
        <template v-if="loading">
          <div v-for="i in 6" :key="i" class="row-item"><MovieCardSkeleton /></div>
        </template>
        <template v-else>
          <div v-for="movie in movies" :key="movie.id" class="row-item">
            <MovieCard :movie="movie" />
          </div>
        </template>
      </div>
      <button class="scroll-btn scroll-btn--right" @click="scroll('right')" aria-label="Scroll right">›</button>
    </div>
  </section>
</template>

<style scoped>
.row-section { margin-bottom: 40px; }
.row-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.row-title { font-size: 22px; font-weight: 700; color: #e2e8f0; margin: 0; }
.see-all { background: none; border: none; color: #e11d48; font-size: 14px; font-weight: 600; cursor: pointer; padding: 4px 0; }
.see-all:hover { color: #f43f5e; }

.row-wrapper { position: relative; }
.row-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  padding: 4px 0 8px;
}
.row-scroll::-webkit-scrollbar { display: none; }
.row-item { flex: 0 0 160px; scroll-snap-align: start; }
@media (min-width: 640px) { .row-item { flex: 0 0 180px; } }

.scroll-btn {
  position: absolute; top: 50%; transform: translateY(-50%);
  background: rgba(15,23,42,0.9);
  border: 1px solid #334155;
  color: #e2e8f0; font-size: 24px;
  width: 36px; height: 36px;
  border-radius: 50%;
  cursor: pointer; z-index: 1;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
}
.scroll-btn:hover { background: #1e293b; }
.scroll-btn--left { left: -18px; }
.scroll-btn--right { right: -18px; }
@media (max-width: 640px) { .scroll-btn { display: none; } }
</style>
