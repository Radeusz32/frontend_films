<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth.store'
import { useMovieStore } from '@/stores/movie.store'
import { useToastStore } from '@/stores/toast.store'
import { UserAPI } from '@/api/modules/user.api'
import { MoviesAPI } from '@/api/modules/movies.api'
import MovieCard from '@/components/MovieCard.vue'
import StarRating from '@/components/ui/StarRating.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import { formatDate } from '@/utils/format'
import type { Movie } from '@/types/movie'

const { t, locale } = useI18n()
const authStore = useAuthStore()
const movieStore = useMovieStore()
const toastStore = useToastStore()

const editing = ref(false)
const editName = ref('')
const editLoading = ref(false)
const activeTab = ref<'watchlist' | 'ratings' | 'preferences'>('watchlist')

// ── Preferences state ────────────────────────────────────────────
const GENRES = [
  'Action', 'Drama', 'Comedy', 'Thriller', 'Sci-Fi',
  'Crime', 'Fantasy', 'Animation', 'Romance', 'Horror',
  'Adventure', 'Documentary',
]
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

const prefGenres    = ref<string[]>([])
const prefDecades   = ref<number[]>([])
const prefLanguages = ref<string[]>([])
const prefMovieIds  = ref<number[]>([])
const prefMovies    = ref<Movie[]>([])   // resolved movie objects for display
const prefLoading   = ref(false)
const prefSaving    = ref(false)
const prefDirty     = ref(false)

// Movie search inside preferences
const movieQuery   = ref('')
const movieResults = ref<Movie[]>([])
const searchLoading = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | null = null

function onMovieQueryInput(e: Event) {
  movieQuery.value = (e.target as HTMLInputElement).value
  if (searchTimer) clearTimeout(searchTimer)
  if (!movieQuery.value.trim()) { movieResults.value = []; return }
  searchTimer = setTimeout(async () => {
    searchLoading.value = true
    try {
      const res = await MoviesAPI.search(movieQuery.value)
      movieResults.value = (res.results ?? []).filter(m => !prefMovieIds.value.includes(m.id))
    } catch { movieResults.value = [] }
    finally { searchLoading.value = false }
  }, 350)
}

function addPrefMovie(movie: Movie) {
  if (prefMovieIds.value.includes(movie.id)) return
  prefMovieIds.value.push(movie.id)
  prefMovies.value.push(movie)
  movieResults.value = movieResults.value.filter(m => m.id !== movie.id)
  prefDirty.value = true
}

function removePrefMovie(id: number) {
  prefMovieIds.value = prefMovieIds.value.filter(x => x !== id)
  prefMovies.value   = prefMovies.value.filter(m => m.id !== id)
  prefDirty.value = true
}

function toggleGenre(g: string) {
  const i = prefGenres.value.indexOf(g)
  i === -1 ? prefGenres.value.push(g) : prefGenres.value.splice(i, 1)
  prefDirty.value = true
}
function toggleDecade(d: number) {
  const i = prefDecades.value.indexOf(d)
  i === -1 ? prefDecades.value.push(d) : prefDecades.value.splice(i, 1)
  prefDirty.value = true
}
function toggleLanguage(l: string) {
  const i = prefLanguages.value.indexOf(l)
  i === -1 ? prefLanguages.value.push(l) : prefLanguages.value.splice(i, 1)
  prefDirty.value = true
}

async function loadPreferences() {
  prefLoading.value = true
  try {
    const p = await UserAPI.getOnboarding()
    prefGenres.value    = [...(p.favoriteGenres    ?? [])]
    prefDecades.value   = [...(p.preferredDecades  ?? [])]
    prefLanguages.value = [...(p.preferredLanguages ?? [])]
    prefMovieIds.value  = [...(p.favoriteMovieIds  ?? [])]
    // resolve movie objects for display
    if (prefMovieIds.value.length) {
      const all = movieStore.movies.length
        ? movieStore.movies
        : (await MoviesAPI.getAll({ limit: 200 })).results
      prefMovies.value = all.filter(m => prefMovieIds.value.includes(m.id))
    }
    prefDirty.value = false
  } catch { /* silent */ }
  finally { prefLoading.value = false }
}

async function savePreferences() {
  prefSaving.value = true
  try {
    const updated = await UserAPI.saveOnboarding({
      favoriteGenres:    prefGenres.value,
      favoriteMovieIds:  prefMovieIds.value,
      preferredDecades:  prefDecades.value,
      preferredLanguages: prefLanguages.value,
    })
    authStore.user = updated
    prefDirty.value = false
    toastStore.success('Preferencje zapisane!')
  } catch {
    toastStore.error('Nie udało się zapisać preferencji.')
  } finally { prefSaving.value = false }
}
// ─────────────────────────────────────────────────────────────────

onMounted(async () => {
  await Promise.all([
    movieStore.fetchWatchlist(),
    movieStore.fetchUserRatings(),
    loadPreferences(),
  ])
})

function startEdit() { editName.value = authStore.user?.name ?? ''; editing.value = true }
async function saveEdit() {
  editLoading.value = true
  try {
    const updated = await UserAPI.updateProfile({ name: editName.value })
    if (authStore.user) authStore.user.name = updated.name
    editing.value = false
    toastStore.success(t('toast.profile_saved'))
  } catch {
    toastStore.error(t('toast.error_profile'))
  } finally { editLoading.value = false }
}
function getRatedMovie(movieId: number) { return movieStore.movies.find((m) => m.id === movieId) }
</script>

<template>
  <div class="profile-page">
    <div class="profile-header">
      <img :src="authStore.user?.avatar" :alt="authStore.user?.name" class="profile-avatar" />
      <div class="profile-meta">
        <template v-if="!editing">
          <div class="profile-name-row">
            <h1 class="profile-name">{{ authStore.user?.name }}</h1>
            <AppBadge :variant="authStore.isAdmin ? 'warning' : 'info'">{{ authStore.user?.role }}</AppBadge>
          </div>
          <p class="profile-email">{{ authStore.user?.email }}</p>
          <span class="member-since">{{ t('profile.member_since') }} {{ authStore.user?.createdAt ? formatDate(authStore.user.createdAt, locale) : '' }}</span>
          <AppButton size="sm" variant="secondary" @click="startEdit">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            {{ t('profile.edit') }}
          </AppButton>
        </template>
        <template v-else>
          <AppInput v-model="editName" :label="t('auth.name')" />
          <div class="edit-actions">
            <AppButton size="sm" :loading="editLoading" @click="saveEdit">{{ t('profile.save') }}</AppButton>
            <AppButton size="sm" variant="ghost" @click="editing = false">{{ t('profile.cancel') }}</AppButton>
          </div>
        </template>
      </div>
    </div>

    <div class="profile-stats">
      <div class="stat">
        <span class="stat-num">{{ movieStore.watchlist.length }}</span>
        <span class="stat-label">Watchlist</span>
      </div>
      <div class="stat">
        <span class="stat-num">{{ movieStore.userRatings.length }}</span>
        <span class="stat-label">{{ t('profile.rated_movies') }}</span>
      </div>
      <div class="stat">
        <span class="stat-num">{{ prefGenres.length }}</span>
        <span class="stat-label">Gatunki</span>
      </div>
    </div>

    <div class="tabs">
      <button :class="{ active: activeTab === 'watchlist' }" @click="activeTab = 'watchlist'">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        {{ t('profile.my_watchlist') }} ({{ movieStore.watchlist.length }})
      </button>
      <button :class="{ active: activeTab === 'ratings' }" @click="activeTab = 'ratings'">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        {{ t('profile.my_ratings') }} ({{ movieStore.userRatings.length }})
      </button>
      <button :class="{ active: activeTab === 'preferences' }" @click="activeTab = 'preferences'">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M8.46 8.46a5 5 0 0 0 0 7.07"/></svg>
        Moje preferencje
      </button>
    </div>

    <div v-if="activeTab === 'watchlist'">
      <div v-if="movieStore.watchlist.length === 0" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        <p>{{ t('profile.empty_watchlist') }}</p>
      </div>
      <div v-else class="movie-grid">
        <MovieCard v-for="movie in movieStore.watchlist" :key="movie.id" :movie="movie" />
      </div>
    </div>

    <div v-else-if="activeTab === 'ratings'">
      <div v-if="movieStore.userRatings.length === 0" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <p>{{ t('profile.empty_ratings') }}</p>
      </div>
      <div v-else class="ratings-list">
        <div v-for="rating in movieStore.userRatings" :key="rating.id" class="rating-item">
          <div class="rating-movie-info">
            <img v-if="getRatedMovie(rating.movieId)" :src="getRatedMovie(rating.movieId)?.posterUrl" :alt="getRatedMovie(rating.movieId)?.title" class="rating-poster" />
            <div>
              <h4>{{ getRatedMovie(rating.movieId)?.title ?? `Movie #${rating.movieId}` }}</h4>
              <p class="rating-date">{{ formatDate(rating.createdAt, locale) }}</p>
            </div>
          </div>
          <div class="rating-score">
            <StarRating :model-value="rating.value" :max="10" readonly :size="16" />
            <span class="rating-val">{{ rating.value }}/10</span>
            <p v-if="rating.review" class="rating-review">"{{ rating.review }}"</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ── PREFERENCES TAB ─────────────────────────────────────── -->
    <div v-else-if="activeTab === 'preferences'" class="pref-panel">
      <div v-if="prefLoading" class="empty-state">
        <p style="color:rgba(255,255,255,0.3)">Ładowanie preferencji...</p>
      </div>
      <template v-else>

        <!-- Genres -->
        <div class="pref-section">
          <div class="pref-section-header">
            <div>
              <h3 class="pref-title">Ulubione gatunki</h3>
              <p class="pref-desc">Filmy z tych gatunków dostają wyższy priorytet w rekomendacjach.</p>
            </div>
            <span v-if="prefGenres.length" class="pref-count">{{ prefGenres.length }} wybranych</span>
          </div>
          <div class="pref-chips">
            <button
              v-for="g in GENRES" :key="g"
              class="pref-chip"
              :class="{ selected: prefGenres.includes(g) }"
              @click="toggleGenre(g)"
            >
              <svg v-if="prefGenres.includes(g)" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              {{ g }}
            </button>
          </div>
        </div>

        <!-- Favourite movies -->
        <div class="pref-section">
          <div class="pref-section-header">
            <div>
              <h3 class="pref-title">Ulubione filmy</h3>
              <p class="pref-desc">Gatunki tych filmów wzmacniają Twój profil rekomendacji.</p>
            </div>
            <span v-if="prefMovies.length" class="pref-count">{{ prefMovies.length }} filmów</span>
          </div>

          <!-- Selected movies list -->
          <div v-if="prefMovies.length" class="pref-movie-list">
            <div v-for="movie in prefMovies" :key="movie.id" class="pref-movie-row">
              <img :src="movie.posterUrl" :alt="movie.title" class="pref-movie-poster" />
              <div class="pref-movie-info">
                <span class="pref-movie-title">{{ movie.title }}</span>
                <span class="pref-movie-meta">{{ movie.year }} · {{ movie.genre.slice(0,2).join(', ') }}</span>
              </div>
              <button class="pref-remove-btn" @click="removePrefMovie(movie.id)" title="Usuń">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>

          <!-- Movie search -->
          <div class="pref-search-wrap">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="pref-search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              class="pref-search-input"
              type="text"
              placeholder="Szukaj filmów do dodania..."
              :value="movieQuery"
              @input="onMovieQueryInput"
              autocomplete="off"
            />
            <span v-if="searchLoading" class="pref-spinner" />
          </div>
          <div v-if="movieResults.length" class="pref-search-results">
            <button
              v-for="movie in movieResults" :key="movie.id"
              class="pref-search-row"
              @click="addPrefMovie(movie)"
            >
              <img :src="movie.posterUrl" :alt="movie.title" class="pref-movie-poster" />
              <div class="pref-movie-info">
                <span class="pref-movie-title">{{ movie.title }}</span>
                <span class="pref-movie-meta">{{ movie.year }} · {{ movie.genre.slice(0,2).join(', ') }}</span>
              </div>
              <span class="pref-add-label">+ Dodaj</span>
            </button>
          </div>
        </div>

        <!-- Decades -->
        <div class="pref-section">
          <div class="pref-section-header">
            <div>
              <h3 class="pref-title">Preferowana era filmowa</h3>
              <p class="pref-desc">Filmy z wybranych dekad otrzymują bonus +1.0 pkt w scoringu rekomendacji.</p>
            </div>
            <span v-if="prefDecades.length" class="pref-count">{{ prefDecades.length }} wybranych</span>
          </div>
          <div class="pref-chips">
            <button
              v-for="dec in DECADES" :key="dec.value"
              class="pref-chip"
              :class="{ selected: prefDecades.includes(dec.value) }"
              @click="toggleDecade(dec.value)"
            >
              <svg v-if="prefDecades.includes(dec.value)" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              {{ dec.label }}
            </button>
          </div>
        </div>

        <!-- Languages -->
        <div class="pref-section">
          <div class="pref-section-header">
            <div>
              <h3 class="pref-title">Preferowany język</h3>
              <p class="pref-desc">Filmy w wybranych językach otrzymują bonus +0.5 pkt w scoringu rekomendacji.</p>
            </div>
            <span v-if="prefLanguages.length" class="pref-count">{{ prefLanguages.length }} wybranych</span>
          </div>
          <div class="pref-chips">
            <button
              v-for="lang in LANGUAGES" :key="lang.value"
              class="pref-chip"
              :class="{ selected: prefLanguages.includes(lang.value) }"
              @click="toggleLanguage(lang.value)"
            >
              <svg v-if="prefLanguages.includes(lang.value)" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              {{ lang.label }}
            </button>
          </div>
        </div>

        <!-- Save bar -->
        <div class="pref-save-bar" :class="{ visible: prefDirty }">
          <span class="pref-dirty-hint">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Masz niezapisane zmiany
          </span>
          <AppButton size="sm" :loading="prefSaving" @click="savePreferences">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Zapisz preferencje
          </AppButton>
        </div>

      </template>
    </div>
  </div>
</template>

<style scoped>
.profile-page { max-width: 1200px; margin: 0 auto; padding: 44px 52px; }
.profile-header { display: flex; gap: 28px; align-items: flex-start; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: var(--radius-xl, 20px); padding: 32px; margin-bottom: 20px; }
.profile-avatar { width: 96px; height: 96px; border-radius: 50%; border: 3px solid var(--blue, #4361ee); object-fit: cover; box-shadow: 0 0 0 4px rgba(67,97,238,0.2); }
.profile-meta { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.profile-name-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.profile-name { font-size: 24px; font-weight: 900; color: var(--text, #fff); margin: 0; letter-spacing: -0.04em; }
.profile-email { color: var(--text-muted); font-size: 14px; margin: 0; }
.member-since { font-size: 12px; color: var(--text-light); }
.edit-actions { display: flex; gap: 8px; }

.profile-stats { display: flex; gap: 14px; margin-bottom: 28px; }
.stat { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: var(--radius-md, 12px); padding: 20px 28px; text-align: center; flex: 1; }
.stat-num { display: block; font-size: 30px; font-weight: 900; color: var(--blue, #4361ee); line-height: 1; letter-spacing: -0.05em; }
.stat-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 700; }

.tabs { display: flex; gap: 4px; margin-bottom: 24px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: var(--radius-md, 12px); padding: 4px; width: fit-content; }
.tabs button { display: flex; align-items: center; gap: 7px; padding: 9px 18px; background: none; border: none; color: var(--text-muted); font-size: 13px; font-weight: 700; cursor: pointer; border-radius: var(--radius-sm, 8px); transition: all 0.18s; font-family: inherit; }
.tabs button.active { background: var(--blue, #4361ee); color: #fff; }

.empty-state { text-align: center; padding: 64px 20px; display: flex; flex-direction: column; align-items: center; gap: 12px; color: rgba(255,255,255,0.1); }
.empty-state p { font-size: 14px; color: var(--text-muted); margin: 0; }

.movie-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 16px; }

.ratings-list { display: flex; flex-direction: column; gap: 10px; }
.rating-item { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: var(--radius-md, 12px); padding: 16px; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; transition: border-color 0.2s; }
.rating-item:hover { border-color: rgba(67,97,238,0.3); }
.rating-movie-info { display: flex; gap: 12px; align-items: center; }
.rating-poster { width: 48px; height: 72px; object-fit: cover; border-radius: 6px; }
.rating-movie-info h4 { font-size: 14px; color: var(--text, #fff); margin: 0 0 4px; font-weight: 700; }
.rating-date { font-size: 12px; color: var(--text-muted); margin: 0; }
.rating-score { display: flex; flex-direction: column; gap: 4px; align-items: flex-end; }
.rating-val { color: var(--rating, #f59e0b); font-weight: 800; font-size: 15px; }
.rating-review { font-size: 13px; color: var(--text-muted); font-style: italic; margin: 0; }

/* ── Preferences panel ─────────────────────────────────────────── */
.pref-panel { display: flex; flex-direction: column; gap: 12px; }

.pref-section {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: var(--radius-md, 12px);
  padding: 24px;
  transition: border-color 0.2s;
}
.pref-section:focus-within { border-color: rgba(67,97,238,0.3); }

.pref-section-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 16px; }

.pref-title { font-size: 15px; font-weight: 800; color: var(--text, #fff); margin: 0 0 4px; letter-spacing: -0.02em; }
.pref-desc  { font-size: 12px; color: var(--text-muted); margin: 0; line-height: 1.5; }

.pref-count {
  flex-shrink: 0;
  font-size: 11px; font-weight: 700;
  color: #4361ee;
  background: rgba(67,97,238,0.12);
  border: 1px solid rgba(67,97,238,0.25);
  border-radius: 100px;
  padding: 3px 10px;
  white-space: nowrap;
}

/* Chips */
.pref-chips { display: flex; flex-wrap: wrap; gap: 8px; }

.pref-chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 7px 14px; border-radius: 100px;
  border: 1.5px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.03);
  color: rgba(255,255,255,0.65);
  font-size: 12.5px; font-weight: 500;
  cursor: pointer; transition: all 0.15s;
  white-space: nowrap;
}
.pref-chip:hover { border-color: rgba(67,97,238,0.45); background: rgba(67,97,238,0.08); color: #fff; }
.pref-chip.selected { border-color: #4361ee; background: rgba(67,97,238,0.18); color: #fff; font-weight: 600; }

/* Movie list */
.pref-movie-list { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }

.pref-movie-row {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px; border-radius: 9px;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.03);
}
.pref-movie-poster { width: 32px; height: 46px; object-fit: cover; border-radius: 4px; flex-shrink: 0; background: rgba(255,255,255,0.05); }
.pref-movie-info  { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.pref-movie-title { font-size: 13px; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pref-movie-meta  { font-size: 11px; color: rgba(255,255,255,0.4); }
.pref-remove-btn  {
  background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
  color: #f87171; border-radius: 6px; padding: 4px 6px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.15s; flex-shrink: 0;
}
.pref-remove-btn:hover { background: rgba(239,68,68,0.18); border-color: rgba(239,68,68,0.4); }

/* Movie search */
.pref-search-wrap { position: relative; display: flex; align-items: center; }
.pref-search-icon { position: absolute; left: 12px; color: rgba(255,255,255,0.3); pointer-events: none; }
.pref-search-input {
  width: 100%; padding: 9px 12px 9px 36px;
  background: rgba(255,255,255,0.04);
  border: 1.5px solid rgba(255,255,255,0.09);
  border-radius: 10px; color: #fff; font-size: 13px; outline: none;
  transition: border-color 0.15s;
}
.pref-search-input::placeholder { color: rgba(255,255,255,0.25); }
.pref-search-input:focus { border-color: rgba(67,97,238,0.5); background: rgba(67,97,238,0.05); }
.pref-spinner {
  position: absolute; right: 12px;
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.12); border-top-color: #4361ee;
  border-radius: 50%; animation: pref-spin 0.7s linear infinite;
}
@keyframes pref-spin { to { transform: rotate(360deg); } }

.pref-search-results {
  display: flex; flex-direction: column; gap: 3px;
  margin-top: 6px; max-height: 220px; overflow-y: auto;
  scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent;
}
.pref-search-row {
  display: flex; align-items: center; gap: 10px;
  padding: 7px 10px; border-radius: 8px;
  border: 1px solid transparent;
  background: rgba(255,255,255,0.03);
  cursor: pointer; text-align: left; width: 100%; transition: all 0.15s;
}
.pref-search-row:hover { background: rgba(67,97,238,0.08); border-color: rgba(67,97,238,0.2); }
.pref-add-label { font-size: 11px; font-weight: 700; color: #4361ee; white-space: nowrap; flex-shrink: 0; }

/* Save bar */
.pref-save-bar {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 14px 20px;
  background: rgba(67,97,238,0.08);
  border: 1px solid rgba(67,97,238,0.25);
  border-radius: var(--radius-md, 12px);
  opacity: 0; pointer-events: none;
  transform: translateY(6px);
  transition: opacity 0.2s, transform 0.2s;
}
.pref-save-bar.visible { opacity: 1; pointer-events: auto; transform: translateY(0); }
.pref-dirty-hint { display: flex; align-items: center; gap: 6px; font-size: 13px; color: rgba(255,255,255,0.6); }

@media (max-width: 1024px) { .profile-page { padding: 32px 28px; } }

@media (max-width: 768px) {
  .profile-page { padding: 20px 16px; }
  .profile-header { flex-direction: column; align-items: center; text-align: center; padding: 24px 20px; }
  .profile-name-row { justify-content: center; }
  .profile-stats { gap: 8px; }
  .stat { padding: 16px 12px; }
  .stat-num { font-size: 24px; }

  /* Scrollable tabs */
  .tabs {
    width: 100%;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }
  .tabs::-webkit-scrollbar { display: none; }
  .tabs button { padding: 9px 14px; font-size: 12px; white-space: nowrap; }

  .pref-section { padding: 16px; }
  .pref-section-header { flex-direction: column; gap: 8px; }

  /* Ratings list stacks */
  .rating-item { flex-direction: column; }
  .rating-score { align-items: flex-start; }

  /* Movie grid 2 cols min */
  .movie-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px; }
}

@media (max-width: 420px) {
  .profile-stats { flex-direction: column; }
  .stat { padding: 14px; }
}
</style>
