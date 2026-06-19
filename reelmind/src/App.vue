<script setup lang="ts">
import AppSidebar from '@/components/AppSidebar.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import AppToast from '@/components/AppToast.vue'
import BottomNav from '@/components/BottomNav.vue'
import OnboardingModal from '@/components/OnboardingModal.vue'
import RecommendationPopup from '@/components/RecommendationPopup.vue'
import ChatWidget from '@/components/ChatWidget.vue'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()
</script>

<template>
  <div class="app-shell">
    <AppSidebar />
    <div class="app-right">
      <AppNavbar />
      <main class="main-content">
        <RouterView />
      </main>
    </div>
  </div>
  <AppToast />
  <BottomNav />
  <OnboardingModal v-if="authStore.needsOnboarding" />
  <RecommendationPopup v-if="authStore.showRecPopup && !authStore.needsOnboarding" />
  <ChatWidget v-if="authStore.isAuthenticated" />
</template>

<style scoped>
.app-shell { display: flex; min-height: 100vh; }

.app-right {
  flex: 1;
  margin-left: var(--sidebar-w, 64px);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.main-content { flex: 1; }

@media (max-width: 768px) {
  .app-right {
    margin-left: 0;
    padding-bottom: calc(60px + env(safe-area-inset-bottom, 0px));
  }
}
</style>
