<script setup lang="ts">
import { onMounted } from 'vue'

import { reportMounted } from '@/utils/reportMounted'

onMounted(() => {
  reportMounted('VendorScoreGrid')
})
</script>

<template>
  <section class="score-grid">
    <article class="score-card">
      <p class="score-label">External Risk Score</p>
      <p class="score-value">72</p>
      <span class="pill medium">Medium Risk</span>
    </article>
    <article class="score-card">
      <p class="score-label">Vendor Risk Score</p>
      <p class="score-value">45</p>
      <span class="pill low">Low Risk</span>
    </article>
    <article class="score-card">
      <p class="score-label">SOC2 Report</p>
      <p class="score-value small">SOC2 2025</p>
      <span class="report-chip">View SOC2 2025 Report</span>
    </article>
  </section>
</template>

<style scoped>
.score-grid {
  display: grid;
  gap: 0.8rem;
  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
}

.score-card {
  border: 1px solid #ebe9f7;
  background: #fff;
  border-radius: 0.7rem;
  padding: 0.9rem;
  display: grid;
  gap: 0.35rem;
}

.score-label {
  color: #7b769f;
  font-size: 0.76rem;
}

.score-value {
  font-size: 1.35rem;
  font-weight: 700;
  color: #1f2134;
}

.score-value.small {
  font-size: 1rem;
}

.pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.4rem;
  padding: 0.2rem 0.45rem;
  font-size: 0.72rem;
  font-weight: 600;
}

.pill.medium {
  background: #ffe8ce;
  color: #bc6e12;
}

.pill.low {
  background: #daf7e7;
  color: #177748;
}

.report-chip {
  display: inline-flex;
  width: fit-content;
  border-radius: 0.4rem;
  font-size: 0.73rem;
  font-weight: 600;
  color: #fff;
  background: #6f50f7;
  padding: 0.35rem 0.52rem;
}
</style>
