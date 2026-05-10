<script setup lang="ts">
import AppSidebar from '@/components/AppSidebar.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import AppToast from '@/components/AppToast.vue'
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
</template>

<style scoped>
.app-shell { display: flex; min-height: 100vh; }
.app-right { flex: 1; margin-left: var(--sidebar-w, 64px); min-height: 100vh; display: flex; flex-direction: column; }
.main-content { flex: 1; }
</style>
