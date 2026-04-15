<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const pageTitle = computed(() => route.meta.title || 'Page')

onMounted(() => {
  console.log(`Mounted ${pageTitle.value}`)
})
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
