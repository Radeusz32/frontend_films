import { defineStore } from 'pinia'
import { ref } from 'vue'
import { RecommendationsAPI } from '@/api/modules/recommendations.api'
import type { Recommendation } from '@/types/recommendation'

export const useRecommendationStore = defineStore('recommendations', () => {
  const recommendations = ref<Recommendation[]>([])
  const generatedAt = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchRecommendations(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const res = await RecommendationsAPI.get()
      recommendations.value = res.recommendations
      generatedAt.value = res.generatedAt
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load recommendations'
    } finally {
      loading.value = false
    }
  }

  return { recommendations, generatedAt, loading, error, fetchRecommendations }
})
