<template>
  <div class="vh-shell">
    <SidebarNav />

    <div class="vh-main-column">
      <TopBar />

      <main class="vh-main">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import SidebarNav from '@/components/vendorHubLayout/components/SidebarNav.vue'
import TopBar from '@/components/vendorHubLayout/components/TopBar.vue'
</script>

<style scoped>
.vh-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
}

.vh-main-column {
  min-width: 0;
}

.vh-main {
  padding: 1.3rem 1.5rem 2.1rem;
}

@media (max-width: 960px) {
  .vh-shell {
    grid-template-columns: 1fr;
  }
}
</style>
