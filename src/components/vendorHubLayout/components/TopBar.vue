<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  console.log('onMounted TopBar')
})
</script>

<template>
  <header class="vh-topbar">
    <p class="vh-breadcrumb">TPRM &gt; Vendors &amp; Projects &gt; Turbines Technologies Inc.</p>
    <div class="vh-topbar-tools" aria-label="header tools">
      <span class="vh-topbar-tool" aria-hidden="true">⌕</span>
      <span class="vh-topbar-tool" aria-hidden="true">🔔</span>
      <span class="vh-topbar-user">John Rambo</span>
      <span class="vh-topbar-tool" aria-hidden="true">⚙</span>
    </div>
  </header>
</template>

<style scoped>
.vh-topbar {
  height: 4.2rem;
  padding: 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  background: #ece7ff;
  border-bottom: 1px solid #e1dbfc;
}

.vh-breadcrumb {
  color: #5d50a0;
  font-size: 0.78rem;
  font-weight: 500;
}

.vh-topbar-tools {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.vh-topbar-tool {
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 999px;
  background: #f8f6ff;
  color: #5b4ba7;
  font-size: 0.82rem;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.vh-topbar-user {
  color: #3e2f88;
  font-size: 0.83rem;
  font-weight: 600;
}

@media (max-width: 960px) {
  .vh-topbar {
    height: auto;
    padding-block: 0.8rem;
    flex-wrap: wrap;
  }
}
</style>
