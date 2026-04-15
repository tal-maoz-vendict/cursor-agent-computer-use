<template>
  <section class="vendor-home">
    <VendorHeader />
    <VendorProfileCard />
    <VendorScoreGrid />
    <VendorDetailsGrid />
    <VendorProjectsSection />
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

import VendorDetailsGrid from '@/views/home/components/VendorDetailsGrid.vue'
import VendorHeader from '@/views/home/components/VendorHeader.vue'
import VendorProfileCard from '@/views/home/components/VendorProfileCard.vue'
import VendorProjectsSection from '@/views/home/components/VendorProjectsSection.vue'
import VendorScoreGrid from '@/views/home/components/VendorScoreGrid.vue'
import { reportMounted } from '@/utils/reportMounted'

onMounted(() => {
  reportMounted('HomeView')
})
</script>

<style scoped>
.vendor-home {
  display: grid;
  gap: 1rem;
}
</style>
