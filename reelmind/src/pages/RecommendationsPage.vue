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

const formattedDate = computed(() =>
  recStore.generatedAt ? formatDate(recStore.generatedAt, locale.value) : '',
)

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
        ↻ {{ t('recommendations.refresh') }}
      </AppButton>
    </div>

    <div v-if="recStore.loading" class="skeleton-grid">
      <div v-for="i in 6" :key="i" class="skeleton-card">
        <AppSkeleton height="280px" />
        <div class="sk-body">
          <AppSkeleton height="18px" width="70%" />
          <AppSkeleton height="14px" width="40%" />
        </div>
      </div>
    </div>

    <div v-else-if="recStore.recommendations.length === 0" class="empty">
      <span class="empty-icon">🤖</span>
      <h3>{{ t('recommendations.empty') }}</h3>
      <p>{{ t('recommendations.empty_desc') }}</p>
      <AppButton @click="router.push({ name: 'movies' })">{{ t('home.hero_cta') }}</AppButton>
    </div>

    <div v-else class="rec-grid">
      <article
        v-for="rec in recStore.recommendations"
        :key="rec.movie.id"
        class="rec-card"
        @click="router.push({ name: 'movie', params: { id: rec.movie.id } })"
      >
        <div class="rec-poster">
          <img :src="rec.movie.posterUrl" :alt="rec.movie.title" loading="lazy" />
          <div class="score-badge" :style="{ background: getScoreColor(rec.score) }">
            {{ getScorePercent(rec.score) }}
          </div>
        </div>
        <div class="rec-body">
          <h3>{{ rec.movie.title }}</h3>
          <p class="rec-year">{{ rec.movie.year }}</p>
          <div class="rec-rating">
            <span class="star">★</span> {{ rec.movie.rating.toFixed(1) }}
          </div>
          <div class="rec-reason">
            <span class="reason-label">{{ t('recommendations.reason') }}</span>
            {{ rec.reason }}
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.rec-page { max-width: 1400px; margin: 0 auto; padding: 40px; }

.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; gap: 20px; flex-wrap: wrap; }
.page-header h1 { font-size: 32px; font-weight: 800; color: #e2e8f0; margin: 0 0 8px; }
.subtitle { color: #64748b; font-size: 15px; margin: 0 0 4px; }
.generated { color: #475569; font-size: 12px; margin: 0; }

.skeleton-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
.skeleton-card { background: #0f172a; border-radius: 12px; overflow: hidden; border: 1px solid #1e293b; }
.sk-body { padding: 12px; display: flex; flex-direction: column; gap: 8px; }

.empty { text-align: center; padding: 80px 20px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
.empty-icon { font-size: 64px; }
.empty h3 { color: #94a3b8; font-size: 20px; margin: 0; }
.empty p { color: #64748b; font-size: 14px; margin: 0; }

.rec-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
.rec-card {
  background: #0f172a; border-radius: 14px; overflow: hidden;
  border: 1px solid #1e293b; cursor: pointer;
  transition: transform 0.25s, box-shadow 0.25s;
}
.rec-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,0.5); }

.rec-poster { position: relative; aspect-ratio: 2/3; }
.rec-poster img { width: 100%; height: 100%; object-fit: cover; }
.score-badge {
  position: absolute; top: 10px; right: 10px;
  padding: 4px 10px; border-radius: 20px;
  font-size: 12px; font-weight: 800; color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.5);
}

.rec-body { padding: 14px 14px 16px; }
.rec-body h3 { font-size: 15px; font-weight: 700; color: #e2e8f0; margin: 0 0 4px; line-height: 1.3; }
.rec-year { color: #64748b; font-size: 12px; margin: 0 0 8px; }
.rec-rating { color: #f59e0b; font-weight: 700; font-size: 14px; margin-bottom: 10px; }
.star { font-size: 12px; }
.rec-reason { font-size: 12px; color: #64748b; line-height: 1.5; }
.reason-label { color: #e11d48; font-weight: 600; margin-right: 4px; }

@media (max-width: 768px) { .rec-page { padding: 20px; } }
</style>
