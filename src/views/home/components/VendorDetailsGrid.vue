<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  console.log('onMounted VendorDetailsGrid')
})
</script>

<template>
  <section class="details-grid">
    <article class="details-card">
      <h3>Expertise</h3>
      <p>
        Specialized in advanced turbine supply services and optimization programs for mission-critical
        infrastructure.
      </p>
      <p><strong>Industry:</strong> Financial Services</p>
      <p>
        <strong>Location:</strong> Al Barsha Business Square, GHAITH SAEED KHALAF AL GHAITH Office no
        603 and 602, Dubai, Dubai AE
      </p>
    </article>
    <article class="details-card">
      <h3>About</h3>
      <p>
        Turbines Technologies supports enterprise scale operations with resilience-first delivery
        practices, strong compliance controls, and a long history of high uptime partnerships.
      </p>
    </article>
    <article class="details-card">
      <h3>Information &amp; Contact</h3>
      <p><strong>Website:</strong> www.turbines4ever.com</p>
      <p><strong>Tel:</strong> +971527401169</p>
      <p><strong>Company size:</strong> 51-200 employees</p>
    </article>
  </section>
</template>

<style scoped>
.details-grid {
  display: grid;
  gap: 0.8rem;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
}

.details-card {
  border: 1px solid #ebe9f7;
  background: #fff;
  border-radius: 0.7rem;
  padding: 0.9rem;
  display: grid;
  gap: 0.5rem;
}

.details-card h3 {
  font-size: 0.92rem;
  color: #22253a;
}

.details-card p {
  color: #635f86;
  font-size: 0.78rem;
  line-height: 1.45;
}
</style>
