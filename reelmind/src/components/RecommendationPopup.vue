<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useMovieStore } from '@/stores/movie.store'
import { useToastStore } from '@/stores/toast.store'
import { RecommendationsAPI } from '@/api/modules/recommendations.api'
import { UserAPI } from '@/api/modules/user.api'
import type { Recommendation } from '@/types/recommendation'

const router     = useRouter()
const authStore  = useAuthStore()
const movieStore = useMovieStore()
const toast      = useToastStore()

const rec     = ref<Recommendation | null>(null)
const loading = ref(true)
const adding  = ref(false)
const inList  = ref(false)

onMounted(async () => {
  try {
    const res = await RecommendationsAPI.get()
    if (res.recommendations.length) {
      rec.value = res.recommendations[0]
      inList.value = movieStore.watchlist.some(m => m.id === rec.value?.movie.id)
    } else {
      authStore.closeRecPopup()
    }
  } catch {
    authStore.closeRecPopup()
  } finally {
    loading.value = false
  }
})

async function addToWatchlist() {
  if (!rec.value || inList.value) return
  adding.value = true
  try {
    await UserAPI.addToWatchlist(rec.value.movie.id)
    inList.value = true
    if (rec.value.movie) movieStore.watchlist.push(rec.value.movie)
    toast.success('Dodano do listy do obejrzenia!')
  } catch {
    toast.error('Nie udało się dodać do listy.')
  } finally {
    adding.value = false
  }
}

function goToMovie() {
  if (!rec.value) return
  authStore.closeRecPopup()
  router.push({ name: 'movie', params: { id: rec.value.movie.id } })
}

function close() {
  authStore.closeRecPopup()
}

function scoreColor(score: number): string {
  if (score >= 8) return '#10b981'
  if (score >= 6) return '#f59e0b'
  return '#ef4444'
}
</script>

<template>
  <Teleport to="body">
    <Transition name="rp">
      <div v-if="!loading && rec" class="rp-backdrop" @click.self="close">
        <div class="rp-card">

          <!-- Backdrop image -->
          <div
            class="rp-backdrop-img"
            :style="{ backgroundImage: `url(${rec.movie.backdropUrl})` }"
          >
            <div class="rp-backdrop-grad" />

            <!-- Close -->
            <button class="rp-close" @click="close">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <!-- Tag -->
            <div class="rp-tag">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Polecane dla Ciebie
            </div>
          </div>

          <!-- Content -->
          <div class="rp-body">
            <!-- Poster -->
            <img :src="rec.movie.posterUrl" :alt="rec.movie.title" class="rp-poster" />

            <!-- Info -->
            <div class="rp-info">
              <div class="rp-meta-row">
                <span class="rp-year">{{ rec.movie.year }}</span>
                <span class="rp-dot">·</span>
                <span class="rp-duration" v-if="rec.movie.duration">{{ rec.movie.duration }} min</span>
                <span v-if="rec.movie.genre.length" class="rp-genre-badge">{{ rec.movie.genre[0] }}</span>
              </div>

              <h2 class="rp-title">{{ rec.movie.title }}</h2>

              <!-- Score -->
              <div class="rp-score-row">
                <span class="rp-score-label">Dopasowanie</span>
                <span class="rp-score" :style="{ color: scoreColor(rec.score) }">
                  {{ rec.score.toFixed(1) }}
                  <span class="rp-score-max">/10</span>
                </span>
                <div class="rp-score-bar">
                  <div
                    class="rp-score-fill"
                    :style="{ width: (rec.score / 10 * 100) + '%', background: scoreColor(rec.score) }"
                  />
                </div>
              </div>

              <!-- Reason -->
              <div class="rp-reason">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                {{ rec.reason }}
              </div>

              <!-- Description -->
              <p class="rp-desc">
                {{ rec.movie.description?.slice(0, 140) }}{{ (rec.movie.description?.length ?? 0) > 140 ? '...' : '' }}
              </p>

              <!-- Actions -->
              <div class="rp-actions">
                <button class="rp-btn rp-btn-primary" @click="goToMovie">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                    fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Zobacz film
                </button>

                <button
                  class="rp-btn rp-btn-secondary"
                  :class="{ added: inList }"
                  :disabled="adding || inList"
                  @click="addToWatchlist"
                >
                  <svg v-if="inList" xmlns="http://www.w3.org/2000/svg" width="15" height="15"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                    stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <svg v-else-if="adding" xmlns="http://www.w3.org/2000/svg" width="15" height="15"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    class="spin"><circle cx="12" cy="12" r="10"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                    <line x1="12" y1="9" x2="12" y2="15"/><line x1="9" y1="12" x2="15" y2="12"/>
                  </svg>
                  {{ inList ? 'Na liście' : adding ? 'Dodawanie...' : 'Dodaj do listy' }}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ── Overlay ─────────────────────────────────────────────────── */
.rp-backdrop {
  position: fixed; inset: 0; z-index: 900;
  background: rgba(7, 9, 26, 0.78);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
}

/* ── Card ────────────────────────────────────────────────────── */
.rp-card {
  width: 100%; max-width: 620px;
  background: #0d1030;
  border: 1px solid rgba(67, 97, 238, 0.2);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 32px 100px rgba(0,0,0,0.7);
}

/* ── Backdrop strip ──────────────────────────────────────────── */
.rp-backdrop-img {
  position: relative;
  height: 190px;
  background-size: cover;
  background-position: center 25%;
}

.rp-backdrop-grad {
  position: absolute; inset: 0;
  background:
    linear-gradient(to bottom, rgba(7,9,26,0.15) 0%, rgba(13,16,48,0.98) 100%),
    linear-gradient(to right, rgba(7,9,26,0.6) 0%, transparent 60%);
}

.rp-close {
  position: absolute; top: 14px; right: 14px;
  background: rgba(0,0,0,0.45);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px; padding: 6px;
  color: rgba(255,255,255,0.7);
  cursor: pointer; display: flex; align-items: center;
  transition: all 0.15s;
}
.rp-close:hover { background: rgba(0,0,0,0.7); color: #fff; }

.rp-tag {
  position: absolute; top: 14px; left: 14px;
  display: inline-flex; align-items: center; gap: 5px;
  background: rgba(67,97,238,0.85);
  border-radius: 100px;
  padding: 5px 12px;
  font-size: 11px; font-weight: 700;
  color: #fff; letter-spacing: 0.03em;
  backdrop-filter: blur(4px);
}

/* ── Body row ────────────────────────────────────────────────── */
.rp-body {
  display: flex; gap: 20px;
  padding: 0 24px 24px;
  margin-top: -56px;
  position: relative; z-index: 1;
}

/* ── Poster ──────────────────────────────────────────────────── */
.rp-poster {
  width: 90px; height: 135px;
  object-fit: cover;
  border-radius: 10px;
  border: 2px solid rgba(67,97,238,0.35);
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  flex-shrink: 0;
  align-self: flex-start;
}

/* ── Info ────────────────────────────────────────────────────── */
.rp-info {
  flex: 1; min-width: 0;
  padding-top: 8px;
  display: flex; flex-direction: column; gap: 10px;
}

.rp-meta-row {
  display: flex; align-items: center; gap: 7px; flex-wrap: wrap;
}
.rp-year { font-size: 13px; color: rgba(255,255,255,0.5); font-weight: 600; }
.rp-dot  { color: rgba(255,255,255,0.2); }
.rp-duration { font-size: 13px; color: rgba(255,255,255,0.5); }
.rp-genre-badge {
  font-size: 11px; font-weight: 700;
  color: rgba(255,255,255,0.65);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 4px; padding: 2px 7px;
  letter-spacing: 0.04em;
}

.rp-title {
  font-size: 20px; font-weight: 900;
  color: #fff; margin: 0;
  line-height: 1.15; letter-spacing: -0.03em;
}

/* Score */
.rp-score-row {
  display: flex; align-items: center; gap: 8px;
}
.rp-score-label {
  font-size: 11px; font-weight: 700;
  color: rgba(255,255,255,0.35);
  text-transform: uppercase; letter-spacing: 0.07em;
}
.rp-score {
  font-size: 16px; font-weight: 900;
  letter-spacing: -0.04em;
}
.rp-score-max { font-size: 11px; font-weight: 600; opacity: 0.5; }
.rp-score-bar {
  flex: 1; height: 4px;
  background: rgba(255,255,255,0.08);
  border-radius: 2px; overflow: hidden;
}
.rp-score-fill {
  height: 100%; border-radius: 2px;
  transition: width 0.6s ease;
}

/* Reason */
.rp-reason {
  display: flex; align-items: flex-start; gap: 7px;
  font-size: 12px; color: rgba(255,255,255,0.45);
  line-height: 1.5;
}
.rp-reason svg { flex-shrink: 0; margin-top: 1px; }

/* Description */
.rp-desc {
  font-size: 13px; color: rgba(255,255,255,0.5);
  line-height: 1.65; margin: 0;
}

/* Actions */
.rp-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 2px; }

.rp-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 18px; border-radius: 10px;
  font-size: 13px; font-weight: 700;
  cursor: pointer; border: none;
  transition: all 0.15s; white-space: nowrap;
}

.rp-btn-primary {
  background: #4361ee; color: #fff;
}
.rp-btn-primary:hover {
  background: #3451d1;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(67,97,238,0.4);
}

.rp-btn-secondary {
  background: rgba(255,255,255,0.06);
  border: 1.5px solid rgba(255,255,255,0.12) !important;
  color: rgba(255,255,255,0.75);
}
.rp-btn-secondary:hover:not(:disabled) {
  background: rgba(255,255,255,0.1);
  color: #fff;
}
.rp-btn-secondary.added {
  background: rgba(16,185,129,0.12);
  border-color: rgba(16,185,129,0.3) !important;
  color: #10b981;
  cursor: default;
}
.rp-btn-secondary:disabled { opacity: 0.6; cursor: not-allowed; }

.spin { animation: rp-spin 0.8s linear infinite; }
@keyframes rp-spin { to { transform: rotate(360deg); } }

/* ── Transition ──────────────────────────────────────────────── */
.rp-enter-active { animation: rp-in 0.28s cubic-bezier(0.34,1.56,0.64,1); }
.rp-leave-active { animation: rp-out 0.2s ease forwards; }

@keyframes rp-in {
  from { opacity: 0; transform: scale(0.94) translateY(16px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes rp-out {
  to   { opacity: 0; transform: scale(0.96) translateY(8px); }
}

/* ── Responsive ──────────────────────────────────────────────── */
@media (max-width: 480px) {
  .rp-card { border-radius: 16px; }
  .rp-body { flex-direction: column; align-items: center; text-align: center; margin-top: -40px; }
  .rp-poster { width: 80px; height: 120px; }
  .rp-score-row { justify-content: center; }
  .rp-meta-row { justify-content: center; }
  .rp-actions { justify-content: center; }
  .rp-reason { justify-content: center; }
}
</style>
