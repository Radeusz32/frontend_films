<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useRecommendationStore } from '@/stores/recommendation.store'
import AppButton from '@/components/ui/AppButton.vue'
import AppSkeleton from '@/components/ui/AppSkeleton.vue'
import { getScoreColor, getScorePercent, formatDate } from '@/utils/format'

const { t, locale } = useI18n()
const router = useRouter()
const recStore = useRecommendationStore()
const formattedDate = computed(() => recStore.generatedAt ? formatDate(recStore.generatedAt, locale.value) : '')
onMounted(() => recStore.fetchRecommendations())
</script>

<template>
  <div class="rec-page">
    <div class="page-header">
      <div>
        <h1>{{ t('recommendations.title') }}</h1>
        <p class="subtitle">{{ t('recommendations.subtitle') }}</p>
        <p v-if="formattedDate" class="generated">{{ t('recommendations.generated') }}: {{ formattedDate }}</p>
      </div>
      <AppButton variant="secondary" :loading="recStore.loading" @click="recStore.fetchRecommendations()">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>
        {{ t('recommendations.refresh') }}
      </AppButton>
    </div>

    <div v-if="recStore.loading" class="skeleton-grid">
      <div v-for="i in 6" :key="i" class="skeleton-card">
        <AppSkeleton height="280px" />
        <div class="sk-body"><AppSkeleton height="16px" width="75%"/><AppSkeleton height="12px" width="45%"/></div>
      </div>
    </div>

    <div v-else-if="recStore.recommendations.length === 0" class="empty">
      <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
      <h3>{{ t('recommendations.empty') }}</h3>
      <p>{{ t('recommendations.empty_desc') }}</p>
      <AppButton @click="router.push({ name: 'movies' })">{{ t('home.hero_cta') }}</AppButton>
    </div>

    <div v-else class="rec-grid">
      <article v-for="rec in recStore.recommendations" :key="rec.movie.id" class="rec-card" @click="router.push({ name: 'movie', params: { id: rec.movie.id } })">
        <div class="rec-poster">
          <img :src="rec.movie.posterUrl" :alt="rec.movie.title" loading="lazy" />
          <div class="score-badge" :style="{ background: getScoreColor(rec.score) }">{{ getScorePercent(rec.score) }}</div>
        </div>
        <div class="rec-body">
          <h3>{{ rec.movie.title }}</h3>
          <p class="rec-year">{{ rec.movie.year }}</p>
          <div class="rec-rating">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            {{ rec.movie.rating.toFixed(1) }}
          </div>
          <p class="rec-reason"><span class="reason-label">{{ t('recommendations.reason') }}</span> {{ rec.reason }}</p>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.rec-page { max-width: 1500px; margin: 0 auto; padding: 44px 52px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; gap: 20px; flex-wrap: wrap; }
.page-header h1 { font-size: 30px; font-weight: 900; color: var(--text, #fff); margin: 0 0 8px; letter-spacing: -0.04em; }
.subtitle { color: var(--text-muted); font-size: 15px; margin: 0 0 4px; }
.generated { color: var(--text-light); font-size: 12px; margin: 0; }

.skeleton-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
.skeleton-card { background: rgba(255,255,255,0.04); border-radius: var(--radius-md, 12px); overflow: hidden; border: 1px solid rgba(255,255,255,0.07); }
.sk-body { padding: 12px; display: flex; flex-direction: column; gap: 8px; }

.empty { text-align: center; padding: 80px 20px; display: flex; flex-direction: column; align-items: center; gap: 16px; color: rgba(255,255,255,0.1); }
.empty h3 { color: var(--text-muted); font-size: 20px; margin: 0; }
.empty p { color: var(--text-light); font-size: 14px; margin: 0; }

.rec-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
.rec-card { background: rgba(255,255,255,0.04); border-radius: var(--radius-md, 12px); overflow: hidden; border: 1px solid rgba(255,255,255,0.07); cursor: pointer; transition: transform 0.25s, box-shadow 0.25s, border-color 0.2s; }
.rec-card:hover { transform: translateY(-5px); box-shadow: 0 16px 48px rgba(0,0,0,0.6); border-color: rgba(67,97,238,0.3); }
.rec-poster { position: relative; aspect-ratio: 2/3; }
.rec-poster img { width: 100%; height: 100%; object-fit: cover; }
.score-badge { position: absolute; top: 10px; right: 10px; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 800; color: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.4); }
.rec-body { padding: 14px; }
.rec-body h3 { font-size: 14px; font-weight: 800; color: var(--text, #fff); margin: 0 0 4px; line-height: 1.3; letter-spacing: -0.02em; }
.rec-year { color: var(--text-muted); font-size: 12px; margin: 0 0 8px; }
.rec-rating { display: flex; align-items: center; gap: 4px; color: var(--rating, #f59e0b); font-weight: 700; font-size: 13px; margin-bottom: 10px; }
.rec-reason { font-size: 12px; color: var(--text-muted); line-height: 1.5; margin: 0; }
.reason-label { color: var(--blue, #4361ee); font-weight: 700; }

@media (max-width: 1024px) {
  .rec-page { padding: 32px 28px; }
  .rec-grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
}
@media (max-width: 768px) {
  .rec-page { padding: 20px 16px; }
  .page-header { flex-direction: column; gap: 14px; }
  .page-header h1 { font-size: 24px; }
  .rec-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
}
@media (max-width: 420px) {
  .rec-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
