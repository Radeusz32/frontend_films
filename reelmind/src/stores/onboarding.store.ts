import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { UserAPI } from '@/api/modules/user.api'
import { useAuthStore } from './auth.store'

export const TOTAL_STEPS = 3

export const useOnboardingStore = defineStore('onboarding', () => {
  const step = ref(1)
  const loading = ref(false)

  const favoriteGenres = ref<string[]>([])
  const favoriteMovieIds = ref<number[]>([])
  const preferredDecades = ref<number[]>([])
  const preferredLanguages = ref<string[]>([])

  const isFirstStep = computed(() => step.value === 1)
  const isLastStep = computed(() => step.value === TOTAL_STEPS)
  const progress = computed(() => Math.round((step.value / TOTAL_STEPS) * 100))

  function nextStep() {
    if (step.value < TOTAL_STEPS) step.value++
  }

  function prevStep() {
    if (step.value > 1) step.value--
  }

  function toggleGenre(genre: string) {
    const idx = favoriteGenres.value.indexOf(genre)
    if (idx === -1) favoriteGenres.value.push(genre)
    else favoriteGenres.value.splice(idx, 1)
  }

  function toggleDecade(decade: number) {
    const idx = preferredDecades.value.indexOf(decade)
    if (idx === -1) preferredDecades.value.push(decade)
    else preferredDecades.value.splice(idx, 1)
  }

  function toggleLanguage(lang: string) {
    const idx = preferredLanguages.value.indexOf(lang)
    if (idx === -1) preferredLanguages.value.push(lang)
    else preferredLanguages.value.splice(idx, 1)
  }

  function toggleFavoriteMovie(id: number) {
    const idx = favoriteMovieIds.value.indexOf(id)
    if (idx === -1) favoriteMovieIds.value.push(id)
    else favoriteMovieIds.value.splice(idx, 1)
  }

  async function save() {
    loading.value = true
    try {
      const updatedUser = await UserAPI.saveOnboarding({
        favoriteGenres: favoriteGenres.value,
        favoriteMovieIds: favoriteMovieIds.value,
        preferredDecades: preferredDecades.value,
        preferredLanguages: preferredLanguages.value,
      })
      useAuthStore().user = updatedUser
    } finally {
      loading.value = false
    }
  }

  async function dismiss() {
    loading.value = true
    try {
      const updatedUser = await UserAPI.dismissOnboarding()
      useAuthStore().user = updatedUser
    } finally {
      loading.value = false
    }
  }

  function reset() {
    step.value = 1
    favoriteGenres.value = []
    favoriteMovieIds.value = []
    preferredDecades.value = []
    preferredLanguages.value = []
  }

  return {
    step, loading, totalSteps: TOTAL_STEPS,
    favoriteGenres, favoriteMovieIds, preferredDecades, preferredLanguages,
    isFirstStep, isLastStep, progress,
    nextStep, prevStep, reset,
    toggleGenre, toggleDecade, toggleLanguage, toggleFavoriteMovie,
    save, dismiss,
  }
})
