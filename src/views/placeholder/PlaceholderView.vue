<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const pageTitle = computed<string>(() => route.meta.title || 'Page')
</script>

<template>
  <section class="placeholder-view">
    <div class="placeholder-card">
      <p class="placeholder-kicker">Vendor Hub</p>
      <h1>{{ pageTitle }}</h1>
      <p>This tab is a static placeholder page in the demo.</p>
    </div>
  </section>
</template>

<style scoped>
.placeholder-view {
  min-height: 15rem;
  display: grid;
  place-items: center;
}

.placeholder-card {
  background: #fff;
  border: 1px dashed #d3cef2;
  border-radius: 0.7rem;
  padding: 2rem;
  display: grid;
  justify-items: center;
  gap: 0.4rem;
  text-align: center;
}

.placeholder-kicker {
  color: #6f50f7;
  font-size: 0.76rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-weight: 700;
}

.placeholder-card h1 {
  font-size: 1.4rem;
  color: #201f33;
}

.placeholder-card p {
  color: #635f86;
}
</style>
