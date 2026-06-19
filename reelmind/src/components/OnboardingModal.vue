<script setup lang="ts">
import { ref, computed } from 'vue'
import { useOnboardingStore } from '@/stores/onboarding.store'
import { useToastStore } from '@/stores/toast.store'
import { MoviesAPI } from '@/api/modules/movies.api'
import type { Movie } from '@/types/movie'

const store = useOnboardingStore()
const toast = useToastStore()

// ---- Step 1: Genres ----
const GENRES = [
  'Action', 'Drama', 'Comedy', 'Thriller', 'Sci-Fi',
  'Crime', 'Fantasy', 'Animation', 'Romance', 'Horror',
  'Adventure', 'Documentary',
]

// ---- Step 2: Favourite movies (search) ----
const movieQuery = ref('')
const movieResults = ref<Movie[]>([])
const searchLoading = ref(false)

let searchTimer: ReturnType<typeof setTimeout> | null = null

function onQueryInput(e: Event) {
  movieQuery.value = (e.target as HTMLInputElement).value
  if (searchTimer) clearTimeout(searchTimer)
  if (!movieQuery.value.trim()) {
    movieResults.value = []
    return
  }
  searchTimer = setTimeout(async () => {
    searchLoading.value = true
    try {
      const res = await MoviesAPI.search(movieQuery.value)
      movieResults.value = res.results ?? []
    } catch {
      movieResults.value = []
    } finally {
      searchLoading.value = false
    }
  }, 350)
}

// ---- Step 3: Decades + Languages ----
const DECADES = [
  { value: 1970, label: 'lata 70.' },
  { value: 1980, label: 'lata 80.' },
  { value: 1990, label: 'lata 90.' },
  { value: 2000, label: 'lata 00.' },
  { value: 2010, label: 'lata 10.' },
  { value: 2020, label: 'lata 20.' },
]

const LANGUAGES = [
  { value: 'English',  label: 'Angielski' },
  { value: 'Polish',   label: 'Polski' },
  { value: 'French',   label: 'Francuski' },
  { value: 'Spanish',  label: 'Hiszpański' },
  { value: 'German',   label: 'Niemiecki' },
  { value: 'Italian',  label: 'Włoski' },
  { value: 'Korean',   label: 'Koreański' },
  { value: 'Japanese', label: 'Japoński' },
]

// ---- Step titles / descriptions ----
const STEPS = [
  { title: 'Jakie gatunki lubisz?', desc: 'Wybierz przynajmniej jeden gatunek, abyśmy mogli dopasować rekomendacje.' },
  { title: 'Ulubione filmy', desc: 'Znajdź filmy, które już kochasz. Pomożemy nam to w dobraniu kolejnych (opcjonalnie).' },
  { title: 'Era i język filmów', desc: 'Powiedz nam, z jakich dekad lubisz filmy i w jakim języku je oglądasz.' },
]

const currentStepInfo = computed(() => STEPS[store.step - 1])
const canProceedStep1 = computed(() => store.favoriteGenres.length > 0)

// ---- Actions ----
async function handleNext() {
  if (store.isLastStep) {
    await handleSave()
  } else {
    store.nextStep()
  }
}

async function handleSave() {
  try {
    await store.save()
    toast.success('Preferencje zapisane! Rekomendacje są gotowe.')
  } catch {
    toast.error('Nie udało się zapisać preferencji.')
  }
}

async function handleDismiss() {
  try {
    await store.dismiss()
  } catch {
    // dismiss silently - worst case modal stays until page reload
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="ob-backdrop" @click.self="handleDismiss">
      <div class="ob-modal" role="dialog" aria-modal="true" :aria-label="currentStepInfo.title">

        <!-- Header -->
        <div class="ob-header">
          <div class="ob-brand">
            <span class="ob-brand-rm">RM</span>
            <span class="ob-brand-name">ReelMind</span>
          </div>
          <button class="ob-close" @click="handleDismiss" title="Pomiń konfigurację">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <!-- Progress bar -->
        <div class="ob-progress-track">
          <div class="ob-progress-fill" :style="{ width: store.progress + '%' }" />
        </div>

        <!-- Step indicator -->
        <div class="ob-step-indicator">
          <span
            v-for="i in store.totalSteps" :key="i"
            class="ob-dot"
            :class="{ active: i === store.step, done: i < store.step }"
          />
        </div>

        <!-- Body -->
        <div class="ob-body">
          <p class="ob-step-label">Krok {{ store.step }} z {{ store.totalSteps }}</p>
          <h2 class="ob-title">{{ currentStepInfo.title }}</h2>
          <p class="ob-desc">{{ currentStepInfo.desc }}</p>

          <!-- STEP 1: Genres -->
          <div v-if="store.step === 1" class="ob-chips-grid">
            <button
              v-for="genre in GENRES" :key="genre"
              class="ob-chip"
              :class="{ selected: store.favoriteGenres.includes(genre) }"
              @click="store.toggleGenre(genre)"
            >
              <svg v-if="store.favoriteGenres.includes(genre)"
                xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {{ genre }}
            </button>
          </div>

          <!-- STEP 2: Favourite movies -->
          <div v-else-if="store.step === 2" class="ob-movies-step">
            <div class="ob-search-wrap">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" class="ob-search-icon">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                class="ob-search-input"
                type="text"
                placeholder="Szukaj filmów..."
                :value="movieQuery"
                @input="onQueryInput"
                autocomplete="off"
              />
              <span v-if="searchLoading" class="ob-search-spinner" />
            </div>

            <div v-if="movieResults.length > 0" class="ob-movie-list">
              <button
                v-for="movie in movieResults" :key="movie.id"
                class="ob-movie-row"
                :class="{ selected: store.favoriteMovieIds.includes(movie.id) }"
                @click="store.toggleFavoriteMovie(movie.id)"
              >
                <img :src="movie.posterUrl" :alt="movie.title" class="ob-movie-poster" />
                <div class="ob-movie-info">
                  <span class="ob-movie-title">{{ movie.title }}</span>
                  <span class="ob-movie-meta">{{ movie.year }} · {{ movie.genre.slice(0, 2).join(', ') }}</span>
                </div>
                <div class="ob-movie-check" :class="{ visible: store.favoriteMovieIds.includes(movie.id) }">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </button>
            </div>

            <p v-else-if="movieQuery && !searchLoading" class="ob-empty-hint">
              Nie znaleziono filmów. Spróbuj innej frazy.
            </p>
            <p v-else-if="!movieQuery" class="ob-empty-hint">
              Wpisz tytuł, by wyszukać film.
            </p>

            <div v-if="store.favoriteMovieIds.length > 0" class="ob-selected-count">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Wybrano {{ store.favoriteMovieIds.length }} {{ store.favoriteMovieIds.length === 1 ? 'film' : 'filmy/filmów' }}
            </div>
          </div>

          <!-- STEP 3: Decades + Languages -->
          <div v-else-if="store.step === 3" class="ob-step3">
            <div class="ob-section">
              <p class="ob-section-label">Era filmowa</p>
              <div class="ob-chips-grid">
                <button
                  v-for="dec in DECADES" :key="dec.value"
                  class="ob-chip"
                  :class="{ selected: store.preferredDecades.includes(dec.value) }"
                  @click="store.toggleDecade(dec.value)"
                >
                  <svg v-if="store.preferredDecades.includes(dec.value)"
                    xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {{ dec.label }}
                </button>
              </div>
            </div>

            <div class="ob-section">
              <p class="ob-section-label">Preferowany język</p>
              <div class="ob-chips-grid">
                <button
                  v-for="lang in LANGUAGES" :key="lang.value"
                  class="ob-chip"
                  :class="{ selected: store.preferredLanguages.includes(lang.value) }"
                  @click="store.toggleLanguage(lang.value)"
                >
                  <svg v-if="store.preferredLanguages.includes(lang.value)"
                    xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {{ lang.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="ob-footer">
          <button
            v-if="!store.isFirstStep"
            class="ob-btn ob-btn-ghost"
            @click="store.prevStep()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Wstecz
          </button>
          <button
            v-else
            class="ob-btn ob-btn-ghost"
            @click="handleDismiss"
          >
            Pomiń na razie
          </button>

          <button
            class="ob-btn ob-btn-primary"
            :disabled="(store.step === 1 && !canProceedStep1) || store.loading"
            @click="handleNext"
          >
            <span v-if="store.loading" class="ob-btn-spinner" />
            <template v-else>
              {{ store.isLastStep ? 'Gotowe!' : 'Dalej' }}
              <svg v-if="!store.isLastStep"
                xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <svg v-else
                xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </template>
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Backdrop */
.ob-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(7, 9, 26, 0.82);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: ob-fade-in 0.2s ease;
}

@keyframes ob-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* Modal card */
.ob-modal {
  background: #0d1030;
  border: 1px solid rgba(67, 97, 238, 0.25);
  border-radius: 20px;
  width: 100%;
  max-width: 540px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(67, 97, 238, 0.1);
  animation: ob-slide-up 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes ob-slide-up {
  from { transform: translateY(24px) scale(0.97); opacity: 0; }
  to   { transform: translateY(0) scale(1); opacity: 1; }
}

/* Header */
.ob-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;
}

.ob-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ob-brand-rm {
  background: #4361ee;
  color: #fff;
  font-size: 11px;
  font-weight: 900;
  padding: 4px 8px;
  border-radius: 7px;
  letter-spacing: 0.05em;
}

.ob-brand-name {
  font-size: 15px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
}

.ob-close {
  background: rgba(255, 255, 255, 0.06);
  border: none;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}

.ob-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.85);
}

/* Progress bar */
.ob-progress-track {
  height: 3px;
  background: rgba(255, 255, 255, 0.08);
  margin: 20px 24px 0;
  border-radius: 2px;
  overflow: hidden;
}

.ob-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4361ee, #6c82f5);
  border-radius: 2px;
  transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Step dots */
.ob-step-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 24px 0;
}

.ob-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  transition: background 0.25s, transform 0.25s;
}

.ob-dot.active {
  background: #4361ee;
  transform: scale(1.3);
}

.ob-dot.done {
  background: #10b981;
}

/* Body */
.ob-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px 8px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}

.ob-step-label {
  font-size: 11px;
  font-weight: 600;
  color: #4361ee;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 6px;
}

.ob-title {
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 8px;
  line-height: 1.2;
}

.ob-desc {
  font-size: 13.5px;
  color: rgba(255, 255, 255, 0.55);
  margin: 0 0 22px;
  line-height: 1.6;
}

/* Genre/decade/language chips */
.ob-chips-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
}

.ob-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 100px;
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.ob-chip:hover {
  border-color: rgba(67, 97, 238, 0.5);
  background: rgba(67, 97, 238, 0.08);
  color: #fff;
}

.ob-chip.selected {
  border-color: #4361ee;
  background: rgba(67, 97, 238, 0.2);
  color: #fff;
  font-weight: 600;
}

/* Movie search step */
.ob-movies-step {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ob-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.ob-search-icon {
  position: absolute;
  left: 14px;
  color: rgba(255, 255, 255, 0.35);
  pointer-events: none;
}

.ob-search-input {
  width: 100%;
  padding: 11px 14px 11px 40px;
  background: rgba(255, 255, 255, 0.05);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #fff;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;
}

.ob-search-input::placeholder { color: rgba(255, 255, 255, 0.3); }

.ob-search-input:focus {
  border-color: rgba(67, 97, 238, 0.6);
  background: rgba(67, 97, 238, 0.06);
}

.ob-search-spinner {
  position: absolute;
  right: 14px;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.15);
  border-top-color: #4361ee;
  border-radius: 50%;
  animation: ob-spin 0.7s linear infinite;
}

@keyframes ob-spin {
  to { transform: rotate(360deg); }
}

.ob-movie-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 240px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.08) transparent;
}

.ob-movie-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1.5px solid transparent;
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
  width: 100%;
}

.ob-movie-row:hover {
  background: rgba(67, 97, 238, 0.07);
  border-color: rgba(67, 97, 238, 0.2);
}

.ob-movie-row.selected {
  background: rgba(67, 97, 238, 0.12);
  border-color: rgba(67, 97, 238, 0.4);
}

.ob-movie-poster {
  width: 36px;
  height: 52px;
  object-fit: cover;
  border-radius: 5px;
  background: rgba(255,255,255,0.05);
  flex-shrink: 0;
}

.ob-movie-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.ob-movie-title {
  font-size: 13.5px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ob-movie-meta {
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.45);
}

.ob-movie-check {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: transparent;
  transition: all 0.15s;
}

.ob-movie-check.visible {
  background: #4361ee;
  border-color: #4361ee;
  color: #fff;
}

.ob-empty-hint {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.35);
  text-align: center;
  padding: 20px 0;
  margin: 0;
}

.ob-selected-count {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #10b981;
  padding: 6px 12px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 100px;
  border: 1px solid rgba(16, 185, 129, 0.2);
  align-self: flex-start;
}

/* Step 3 sections */
.ob-step3 {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.ob-section-label {
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 12px;
}

/* Footer */
.ob-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px 22px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  gap: 12px;
}

.ob-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  border: none;
}

.ob-btn-ghost {
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
}

.ob-btn-ghost:hover {
  color: rgba(255, 255, 255, 0.85);
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
}

.ob-btn-primary {
  background: #4361ee;
  color: #fff;
  padding: 10px 24px;
  margin-left: auto;
}

.ob-btn-primary:hover:not(:disabled) {
  background: #3451d1;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(67, 97, 238, 0.4);
}

.ob-btn-primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.ob-btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.25);
  border-top-color: #fff;
  border-radius: 50%;
  animation: ob-spin 0.7s linear infinite;
  display: inline-block;
}

@media (max-width: 540px) {
  .ob-modal { border-radius: 16px; }
  .ob-header, .ob-body, .ob-footer { padding-left: 18px; padding-right: 18px; }
  .ob-progress-track { margin-left: 18px; margin-right: 18px; }
  .ob-step-indicator { padding-left: 18px; }
  .ob-title { font-size: 19px; }
}
</style>
