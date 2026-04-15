<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  console.log('onMounted VendorProfileCard')
})
</script>

<template>
  <article class="vendor-card">
    <div class="vendor-card-main">
      <span class="vendor-logo" aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="21" fill="#d9fffa" />
          <path
            d="M24 8a16 16 0 0 1 7 30.4l1.4-5.6-8.4-1.8-3.3 8a16 16 0 0 1 3.3-31Zm0 9.2-4.4 10.7 8.8 1.8L24 17.2Z"
            fill="#12b7aa"
          />
        </svg>
      </span>

      <div class="vendor-info">
        <div class="vendor-name-row">
          <h2>Turbines Technologies Inc.</h2>
          <span class="pill approved">Approved</span>
        </div>
        <p class="vendor-address">123 Tech Plaza, Suite 500, San Francisco, CA 94105</p>
        <p class="vendor-site">turbines4ever.com</p>
      </div>
    </div>

    <dl class="vendor-metrics">
      <div>
        <dt>Sling Score</dt>
        <dd>78/100</dd>
      </div>
      <div>
        <dt>RiskRecon Score</dt>
        <dd>B 4.2/10.0</dd>
      </div>
      <div>
        <dt>Criticality</dt>
        <dd><span class="pill tier">Tier 2</span></dd>
      </div>
      <div>
        <dt>Risk Score</dt>
        <dd>45</dd>
      </div>
    </dl>
  </article>
</template>

<style scoped>
.vendor-card {
  background: #fff;
  border: 1px solid #ebe9f7;
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.vendor-card-main {
  display: flex;
  gap: 0.8rem;
  min-width: min(100%, 20rem);
}

.vendor-logo {
  width: 3rem;
  height: 3rem;
  display: inline-flex;
  flex-shrink: 0;
}

.vendor-logo svg {
  width: 100%;
  height: 100%;
}

.vendor-info {
  display: grid;
  gap: 0.3rem;
}

.vendor-name-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.vendor-name-row h2 {
  font-size: 1rem;
}

.vendor-address,
.vendor-site {
  color: #666288;
  font-size: 0.8rem;
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

.pill.approved {
  background: #d9f8e5;
  color: #167a3e;
}

.pill.tier {
  background: #ffe8cd;
  color: #ba6a08;
}

.vendor-metrics {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(8rem, 1fr));
  gap: 0.7rem 1rem;
}

.vendor-metrics div {
  display: grid;
  gap: 0.16rem;
}

.vendor-metrics dt {
  color: #7f7c9e;
  font-size: 0.72rem;
}

.vendor-metrics dd {
  margin: 0;
  color: #25253a;
  font-size: 0.88rem;
  font-weight: 600;
}
</style>
