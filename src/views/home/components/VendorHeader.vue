<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  console.log('onMounted VendorHeader')
})
</script>

<template>
  <div class="vendor-header-row">
    <p class="vendor-back-link">← All Vendors</p>
    <h1 class="vendor-title">Turbines Technologies Inc.</h1>
    <p class="vendor-subtitle">A.D. Turbines</p>
  </div>
</template>

<style scoped>
.vendor-header-row {
  display: grid;
  gap: 0.25rem;
}

.vendor-back-link {
  font-size: 0.78rem;
  color: #6b6692;
}

.vendor-title {
  font-size: 1.44rem;
  letter-spacing: -0.02em;
  color: #181a2a;
}

.vendor-subtitle {
  font-size: 0.86rem;
  color: #7b769f;
}
</style>
